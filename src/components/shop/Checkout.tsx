"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, Coins, Download, Tag, X } from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import type { ShopProduct } from "@/lib/products";
import { track } from "@/lib/analytics";
import { INR_PER_USD } from "@/lib/boatPrices";
import { formatPhone, normalizePhone } from "@/lib/phone";
import { apiPost, useAuth } from "@/components/auth/useAuth";
import { useAccount } from "@/components/auth/useAccount";
import PhoneLogin from "@/components/auth/PhoneLogin";

type Dl = { label: string; url: string };

export default function Checkout({ product, region, onClose }: { product: ShopProduct; region: "inr" | "usd"; onClose: () => void }) {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [rate, setRate] = useState(0);
    const [codeMsg, setCodeMsg] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [downloads, setDownloads] = useState<Dl[] | null>(null);
    const [received, setReceived] = useState(false);
    const [phone, setPhone] = useState("");
    const [showLogin, setShowLogin] = useState(false);
    const [useCoins, setUseCoins] = useState(true);
    const auth = useAuth();
    const { account } = useAccount();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    // Every buyer's mobile number is saved with the order — refunds come back to it as KashiGo coins.
    const buyerPhone = auth.phone ?? normalizePhone(phone);
    const ready = emailOk && !!buyerPhone;
    const coupon = rate > 0 ? code : undefined;

    const codeInr = Math.round(product.inr * (1 - rate));
    const codeUsd = Number((product.usd * (1 - rate)).toFixed(2));
    // Coins (₹1 each) cover the order outright, or leave at least ₹1 / $0.01 for the payment provider. The server recomputes this.
    const balance = account?.credits ?? 0;
    const coinsOn = useCoins && balance > 0;
    const coversAll = coinsOn && balance >= codeInr;
    const coinsUsed = !coinsOn ? 0 : coversAll ? codeInr : region === "inr" ? Math.min(balance, codeInr - 1) : Math.max(0, Math.min(balance, Math.floor((codeUsd - 0.01) * INR_PER_USD)));
    const finalInr = codeInr - coinsUsed;
    const finalUsd = Number(Math.max(coversAll ? 0 : 0.01, codeUsd - coinsUsed / INR_PER_USD).toFixed(2));

    const applyCode = async () => {
        const c = code.trim().toUpperCase();
        try {
            if (!auth.loggedIn) { setShowLogin(true); setRate(0); setCodeMsg("Log in with your phone number to use a code."); return; }
            const { data } = await apiPost("/api/coupon", { product: product.id, code: c });
            if (data.valid) { setRate(data.rate); setCodeMsg(`${Math.round(data.rate * 100)}% off applied`); return; }
            if (data.message) { setRate(0); setCodeMsg(data.message); return; }
        } catch { }
        setRate(0); setCodeMsg("That code isn't valid.");
    };

    const deliver = async (payload: Record<string, string>) => {
        const { data } = await apiPost("/api/shop/deliver", { product: product.id, email, name, phone: buyerPhone, coupon, ...payload });
        if (payload.provider === "credits" && !data.success && data.message) { setError(data.message); return; }
        // Paid but files couldn't be released automatically: the owner has been alerted and sends them by email.
        if (!data.success) { setReceived(true); return; }
        setDownloads(data.downloads);
        track("purchase", { transaction_id: payload.razorpay_payment_id || payload.paypalOrderId, currency: region === "inr" ? "INR" : "USD", value: region === "inr" ? finalInr : finalUsd, item_id: product.id });
    };

    const payRazorpay = async () => {
        track("begin_checkout", { currency: "INR", value: finalInr, item_id: product.id, payment_type: "razorpay" });
        setBusy(true); setError("");
        try {
            const { data: o } = await apiPost("/api/razorpay", { product: product.id, coupon, useCredits: coinsOn });
            if (!o.success) throw new Error(o.message || "Could not start payment.");
            await new Promise<void>((resolve, reject) => {
                if ((window as any).Razorpay) return resolve();
                const s = document.createElement("script");
                s.src = "https://checkout.razorpay.com/v1/checkout.js";
                s.onload = () => resolve(); s.onerror = () => reject(new Error("Could not load Razorpay"));
                document.body.appendChild(s);
            });
            const rzp = new (window as any).Razorpay({
                key: o.keyId, amount: o.amount, currency: o.currency, order_id: o.orderId,
                name: "KashiGo", description: product.name, image: "/icon.png",
                prefill: { email, name, contact: buyerPhone || "" }, theme: { color: "#f97316" },
                handler: async (r: any) => {
                    try { await deliver({ provider: "razorpay", razorpay_order_id: r.razorpay_order_id, razorpay_payment_id: r.razorpay_payment_id, razorpay_signature: r.razorpay_signature }); }
                    catch { setReceived(true); }
                    finally { setBusy(false); }
                },
                modal: { ondismiss: () => setBusy(false) },
            });
            rzp.open();
        } catch (e: any) { setError(e.message); setBusy(false); }
    };

    const payWithCoins = async () => {
        setBusy(true); setError("");
        try { await deliver({ provider: "credits" }); }
        catch { setError("Couldn't complete that — please try again."); }
        finally { setBusy(false); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
            <motion.div initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} onClick={(e) => e.stopPropagation()}
                data-lenis-prevent className="bg-white text-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] max-h-[92vh] overflow-y-auto relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700" aria-label="Close"><X /></button>
                {received && !downloads ? (
                    <div className="space-y-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><Check /></div>
                        <h3 className="text-2xl font-bold text-slate-900">Payment received — thank you!</h3>
                        <p className="text-sm text-slate-600">
                            Your files are being prepared and will arrive at <b>{email}</b> shortly. If you don&apos;t see them within a few hours, check spam or write to <a href="mailto:support@kashigo.in" className="text-orange-600 font-semibold">support@kashigo.in</a>.
                        </p>
                    </div>
                ) : downloads ? (
                    <div className="space-y-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><Check /></div>
                        <h3 className="text-2xl font-bold text-slate-900">Thank you — you're all set!</h3>
                        <p className="text-sm text-slate-600">Download now. We've also emailed these links to <b>{email}</b>.</p>
                        <div className="space-y-2">
                            {downloads.map((d) => (
                                <a key={d.url} href={d.url} download className="flex items-center gap-3 bg-orange-50 hover:bg-orange-100 text-slate-900 font-semibold text-sm p-3 rounded-xl">
                                    <Download size={18} className="text-orange-500 shrink-0" />{d.label}
                                </a>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex gap-4 items-center">
                            <div className="relative w-16 h-22 aspect-[5/7] shrink-0 rounded-md overflow-hidden bg-slate-100"><Image src={product.cover} alt="" fill className="object-cover" sizes="64px" /></div>
                            <div>
                                <p className="font-bold text-slate-900 leading-tight">{product.name}</p>
                                <p className="text-xs text-slate-500">{product.format}</p>
                                <p className="text-xl font-extrabold mt-1">
                                    {region === "inr" ? `₹${finalInr.toLocaleString("en-IN")}` : `$${finalUsd.toFixed(2)}`}
                                    {(rate > 0 || coinsUsed > 0) && <span className="ml-2 text-sm text-slate-400 line-through">{region === "inr" ? `₹${product.inr}` : `$${product.usd}`}</span>}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" className="w-full border border-slate-200 rounded-2xl px-4 h-12 text-[16px] outline-none focus:border-orange-400 bg-white text-slate-900 placeholder:text-slate-400" />
                            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email (we send your download here)" className="w-full border border-slate-200 rounded-2xl px-4 h-12 text-[16px] outline-none focus:border-orange-400 bg-white text-slate-900 placeholder:text-slate-400" />
                            {auth.loggedIn ? (
                                <p className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 h-12 text-sm text-slate-600">
                                    <span>Mobile <b className="text-slate-900">{formatPhone(auth.phone)}</b></span>
                                    <button type="button" onClick={() => { auth.signOut(); setRate(0); setCodeMsg(""); }} className="text-slate-500 underline">Log out</button>
                                </p>
                            ) : (
                                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="Mobile number, with country code (+44…)" className="w-full border border-slate-200 rounded-2xl px-4 h-12 text-[16px] outline-none focus:border-orange-400 bg-white text-slate-900 placeholder:text-slate-400" />
                            )}
                        </div>
                        {auth.loggedIn ? (
                            balance > 0 && (
                                <label className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-3 cursor-pointer">
                                    <input type="checkbox" checked={useCoins} onChange={(e) => setUseCoins(e.target.checked)} className="h-5 w-5 accent-orange-500" />
                                    <Coins size={18} className="text-amber-500 shrink-0" />
                                    <span className="text-sm"><b>Use my KashiGo coins</b> <span className="text-slate-500">· {balance.toLocaleString("en-IN")} available{coinsOn ? `, using ${coinsUsed.toLocaleString("en-IN")}` : ""}</span></span>
                                </label>
                            )
                        ) : showLogin ? (
                            <div className="rounded-2xl border border-slate-200 p-4"><PhoneLogin defaultCode={region === "inr" ? "+91" : "+1"} subtitle="Unlocks discount codes and your KashiGo coins." onDone={() => { setShowLogin(false); setCodeMsg(""); }} /></div>
                        ) : (
                            <button type="button" onClick={() => setShowLogin(true)} className="flex w-full items-center gap-2 text-left text-sm text-slate-600">
                                <Coins size={16} className="text-amber-500" /> Have a code or KashiGo coins? <span className="font-semibold text-orange-600">Log in with your phone</span>
                            </button>
                        )}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeMsg(""); }} placeholder="Discount code" className="w-full border border-slate-200 rounded-2xl pl-8 pr-3 h-12 text-[16px] outline-none focus:border-orange-400 bg-white text-slate-900 placeholder:text-slate-400" />
                            </div>
                            <button onClick={applyCode} className="px-5 h-12 rounded-2xl bg-slate-100 font-semibold text-sm">Apply</button>
                        </div>
                        {codeMsg && <p className={`text-xs ${rate > 0 ? "text-green-600" : "text-red-500"}`}>{codeMsg}</p>}
                        {!ready && <p className="text-xs text-slate-500">{!emailOk ? "Enter your email to continue." : "Enter your mobile number (with country code) to continue."}</p>}
                        <div className={ready ? "" : "opacity-40 pointer-events-none"}>
                            {coversAll ? (
                                <button onClick={payWithCoins} disabled={busy} className="w-full bg-orange-500 hover:bg-orange-600 text-white h-14 rounded-full font-bold shadow-lg shadow-orange-500/30 disabled:opacity-60">
                                    {busy ? "Processing…" : `Get it with ${codeInr.toLocaleString("en-IN")} coins`}
                                </button>
                            ) : region === "inr" ? (
                                <button onClick={payRazorpay} disabled={busy} className="w-full bg-orange-500 hover:bg-orange-600 text-white h-14 rounded-full font-bold shadow-lg shadow-orange-500/30 disabled:opacity-60">
                                    {busy ? "Processing…" : `Pay ₹${finalInr.toLocaleString("en-IN")} — UPI / Card`}
                                </button>
                            ) : (
                                <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "AZH2zZoIp8p5E-_4wO5wPnBZL8r0OxYtNu1eX6pjl6xMN_GyIaInlW5frraQ8Tq7a2BhKfVavI1rpI5F", currency: "USD" }}>
                                    <PayPalButtons
                                        forceReRender={[finalUsd, product.id, coinsOn]}
                                        style={{ layout: "vertical", color: "gold", shape: "pill", label: "pay", height: 48 }}
                                        createOrder={async () => {
                                            const { data: o } = await apiPost("/api/paypal/create-order", { product: product.id, coupon, useCredits: coinsOn });
                                            if (!o.success) { if (o.message) setError(o.message); throw new Error("Could not create PayPal order"); }
                                            return o.orderId;
                                        }}
                                        onApprove={async (data) => {
                                            setBusy(true); setError("");
                                            // Approved by the buyer — the deliver route re-checks the order with PayPal.
                                            try {
                                                await fetch("/api/paypal/capture-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: data.orderID }) });
                                                await deliver({ provider: "paypal", paypalOrderId: data.orderID });
                                            } catch { setReceived(true); }
                                            finally { setBusy(false); }
                                        }}
                                        onError={() => setError("PayPal payment failed or was cancelled.")}
                                    />
                                </PayPalScriptProvider>
                            )}
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <p className="text-[11px] text-slate-400 text-center">Secure checkout · Instant download · 7-day money-back guarantee</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

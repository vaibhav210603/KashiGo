"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, Download, Tag, X } from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import type { ShopProduct } from "@/lib/products";
import { track } from "@/lib/analytics";

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
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const coupon = rate > 0 ? code : undefined;

    const finalInr = Math.round(product.inr * (1 - rate));
    const finalUsd = Number((product.usd * (1 - rate)).toFixed(2));

    const applyCode = async () => {
        const c = code.trim().toUpperCase();
        try {
            const data = await fetch("/api/coupon", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product: product.id, code: c }) }).then((r) => r.json());
            if (data.valid) { setRate(data.rate); setCodeMsg(`${Math.round(data.rate * 100)}% off applied`); return; }
            if (data.message) { setRate(0); setCodeMsg(data.message); return; }
        } catch { }
        setRate(0); setCodeMsg("That code isn't valid.");
    };

    const deliver = async (payload: Record<string, string>) => {
        const res = await fetch("/api/shop/deliver", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product: product.id, email, name, ...payload }),
        });
        const data = await res.json().catch(() => ({}));
        // Paid but files couldn't be released automatically: the owner has been alerted and sends them by email.
        if (!data.success) { setReceived(true); return; }
        setDownloads(data.downloads);
        track("purchase", { transaction_id: payload.razorpay_payment_id || payload.paypalOrderId, currency: region === "inr" ? "INR" : "USD", value: region === "inr" ? finalInr : finalUsd, item_id: product.id });
    };

    const payRazorpay = async () => {
        track("begin_checkout", { currency: "INR", value: finalInr, item_id: product.id, payment_type: "razorpay" });
        setBusy(true); setError("");
        try {
            const o = await fetch("/api/razorpay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product: product.id, coupon }) }).then((r) => r.json());
            if (!o.success) throw new Error("Could not start payment.");
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
                prefill: { email, name }, theme: { color: "#f97316" },
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

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
            <motion.div initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} onClick={(e) => e.stopPropagation()}
                className="bg-white text-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] max-h-[92vh] overflow-y-auto relative">
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
                                    {rate > 0 && <span className="ml-2 text-sm text-slate-400 line-through">{region === "inr" ? `₹${product.inr}` : `$${product.usd}`}</span>}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" className="w-full border border-slate-200 rounded-2xl px-4 h-12 text-[16px] outline-none focus:border-orange-400 bg-white text-slate-900 placeholder:text-slate-400" />
                            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email (we send your download here)" className="w-full border border-slate-200 rounded-2xl px-4 h-12 text-[16px] outline-none focus:border-orange-400 bg-white text-slate-900 placeholder:text-slate-400" />
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeMsg(""); }} placeholder="Discount code" className="w-full border border-slate-200 rounded-2xl pl-8 pr-3 h-12 text-[16px] outline-none focus:border-orange-400 bg-white text-slate-900 placeholder:text-slate-400" />
                            </div>
                            <button onClick={applyCode} className="px-5 h-12 rounded-2xl bg-slate-100 font-semibold text-sm">Apply</button>
                        </div>
                        {codeMsg && <p className={`text-xs ${rate > 0 ? "text-green-600" : "text-red-500"}`}>{codeMsg}</p>}
                        {!emailOk && <p className="text-xs text-slate-500">Enter your email to continue.</p>}
                        <div className={emailOk ? "" : "opacity-40 pointer-events-none"}>
                            {region === "inr" ? (
                                <button onClick={payRazorpay} disabled={busy} className="w-full bg-orange-500 hover:bg-orange-600 text-white h-14 rounded-full font-bold shadow-lg shadow-orange-500/30 disabled:opacity-60">
                                    {busy ? "Processing…" : `Pay ₹${finalInr.toLocaleString("en-IN")} — UPI / Card`}
                                </button>
                            ) : (
                                <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "AZH2zZoIp8p5E-_4wO5wPnBZL8r0OxYtNu1eX6pjl6xMN_GyIaInlW5frraQ8Tq7a2BhKfVavI1rpI5F", currency: "USD" }}>
                                    <PayPalButtons
                                        forceReRender={[finalUsd, product.id]}
                                        style={{ layout: "vertical", color: "gold", shape: "pill", label: "pay", height: 48 }}
                                        createOrder={async () => {
                                            const o = await fetch("/api/paypal/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product: product.id, coupon }) }).then((r) => r.json());
                                            if (!o.success) throw new Error("Could not create PayPal order");
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

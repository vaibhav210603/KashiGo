"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Download, ShieldCheck, Tag, X, Headphones, BookOpen, Mail } from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { SHOP_PRODUCTS, ShopProduct, LAUNCH_CODE } from "@/lib/products";

const SHOP_COUPONS: Record<string, number> = { LAUNCH40: 0.4, INSIDER20: 0.2, KASHISECRET: 0.5 };

type Dl = { label: string; url: string };

export default function ShopClient() {
    const [region, setRegion] = useState<"inr" | "usd">("usd");
    const [active, setActive] = useState<ShopProduct | null>(null);

    useEffect(() => {
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (tz === "Asia/Calcutta" || tz === "Asia/Kolkata") setRegion("inr");
        } catch { }
        const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
        const p = SHOP_PRODUCTS.find((x) => x.id === hash);
        if (p) document.getElementById(p.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, []);

    const price = (p: ShopProduct) => (region === "inr" ? `₹${p.inr.toLocaleString("en-IN")}` : `$${p.usd.toFixed(2)}`);
    const [bundle, ...rest] = SHOP_PRODUCTS;

    return (
        <>
            <section className="relative pt-32 pb-16 px-4 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 opacity-25 bg-[url('/sunrise.png')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/85 to-slate-900" />
                <div className="relative max-w-4xl mx-auto text-center space-y-5">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-300 font-bold text-xs tracking-widest uppercase border border-orange-500/30">
                        The KashiGo Shop · Instant download
                    </span>
                    <h1 className="text-3xl md:text-6xl font-bold font-heading text-white tracking-tight leading-tight">
                        Guides written by a local,<br /><span className="text-orange-400">read before you land.</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-300 leading-relaxed">
                        Ebooks and audio from someone born on the ghats of Varanasi — real prices, every scam, the meaning behind what you'll see, and a story at every step.
                    </p>
                    <div className="inline-flex rounded-xl bg-white/10 p-1 border border-white/15">
                        {(["usd", "inr"] as const).map((r) => (
                            <button key={r} onClick={() => setRegion(r)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${region === r ? "bg-white text-slate-900" : "text-slate-300"}`}>
                                {r === "usd" ? "🌍 USD" : "🇮🇳 INR"}
                            </button>
                        ))}
                    </div>
                    <p className="text-sm text-orange-200">Launch week: use code <span className="font-mono font-bold text-white">{LAUNCH_CODE}</span> for 40% off anything.</p>
                </div>
            </section>

            {/* Bundle */}
            <section id={bundle.id} className="px-4 -mt-2 bg-slate-900 pb-16">
                <div className="max-w-6xl mx-auto rounded-[2rem] bg-gradient-to-br from-orange-500 to-amber-500 p-[2px] shadow-2xl">
                    <div className="rounded-[calc(2rem-2px)] bg-slate-950 grid md:grid-cols-2 gap-8 p-6 md:p-10 items-center">
                        <div className="relative aspect-[3/2] w-full">
                            <Image src={bundle.cover} alt={bundle.name} fill className="object-contain rounded-2xl" sizes="(max-width:768px) 100vw, 50vw" priority />
                        </div>
                        <div className="space-y-4 text-white">
                            <span className="inline-block bg-orange-500 text-slate-950 text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">{bundle.badge}</span>
                            <h2 className="text-2xl md:text-4xl font-bold font-heading">{bundle.name}</h2>
                            <p className="text-slate-300">{bundle.tagline}</p>
                            <ul className="space-y-2">
                                {bundle.bullets.map((b) => (
                                    <li key={b} className="flex gap-2 text-sm text-slate-200"><Check size={18} className="text-orange-400 shrink-0" />{b}</li>
                                ))}
                            </ul>
                            <div className="flex items-end gap-3 pt-2">
                                <span className="text-4xl font-extrabold">{price(bundle)}</span>
                                {region === "usd" && bundle.compareUsd && <span className="text-slate-400 line-through text-lg">${bundle.compareUsd.toFixed(2)}</span>}
                            </div>
                            <button onClick={() => setActive(bundle)} className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-10 rounded-xl text-lg shadow-lg shadow-orange-500/30 transition">
                                Get the bundle
                            </button>
                            <p className="text-xs text-slate-400">{bundle.format}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Singles */}
            <section className="py-16 px-4 bg-white text-slate-900">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl md:text-4xl font-bold font-heading text-slate-900 text-center mb-12">Or pick exactly what you need</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* The existing Varanasi guide links to its own page */}
                        <a href="/guide" className="group rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition flex flex-col">
                            <div className="relative aspect-[5/7] bg-slate-100"><Image src="/VARANASi.png" alt="Varanasi Insider Guide 2026" fill className="object-cover" sizes="300px" /></div>
                            <div className="p-5 flex flex-col gap-2 flex-1">
                                <h3 className="font-bold text-slate-900">Varanasi Insider Guide 2026</h3>
                                <p className="text-sm text-slate-600 flex-1">The practical playbook: prices, 9 scams, ghats, food, itinerary.</p>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="font-extrabold text-lg text-slate-900">{region === "inr" ? "₹999" : "$14.99"}</span>
                                    <span className="text-orange-600 font-bold text-sm group-hover:underline">View →</span>
                                </div>
                            </div>
                        </a>
                        {rest.map((p) => (
                            <div id={p.id} key={p.id} className="rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition flex flex-col scroll-mt-28">
                                <div className="relative aspect-[5/7] bg-slate-100">
                                    <Image src={p.cover} alt={p.name} fill className="object-cover" sizes="300px" />
                                    {p.badge && <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">{p.badge}</span>}
                                </div>
                                <div className="p-5 flex flex-col gap-2 flex-1">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        {p.id.includes("audio") || p.id === "walk-the-ghats" ? <Headphones size={16} className="text-orange-500" /> : <BookOpen size={16} className="text-orange-500" />}
                                        {p.name}
                                    </h3>
                                    <p className="text-sm text-slate-600">{p.tagline}</p>
                                    <ul className="space-y-1 flex-1">
                                        {p.bullets.slice(0, 3).map((b) => <li key={b} className="text-xs text-slate-500 flex gap-1.5"><Check size={14} className="text-orange-500 shrink-0 mt-0.5" />{b}</li>)}
                                    </ul>
                                    <p className="text-[11px] text-slate-400">{p.format}</p>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="font-extrabold text-lg text-slate-900">{price(p)}</span>
                                        <button onClick={() => setActive(p)} className="bg-slate-900 hover:bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition">Buy</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 mt-16 text-center">
                        {[
                            [Download, "Instant download", "Links on screen and in your inbox the moment you pay."],
                            [ShieldCheck, "7-day money-back", "Not useful? Reply to your receipt email for a full refund."],
                            [Mail, "Real human support", "Every email is read by Vaibhav, in Varanasi."],
                        ].map(([Icon, t, d]: any) => (
                            <div key={t} className="p-6 rounded-2xl bg-orange-50">
                                <Icon className="mx-auto text-orange-500 mb-2" />
                                <p className="font-bold text-slate-900">{t}</p>
                                <p className="text-sm text-slate-600">{d}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-sm text-slate-500 mt-10">
                        Not ready to buy? Get the <a href="/Varanasi-Scam-Cheat-Sheet.pdf" className="text-orange-600 font-semibold underline">free Varanasi Scam Cheat Sheet</a>.
                    </p>
                </div>
            </section>

            <AnimatePresence>{active && <Checkout product={active} region={region} onClose={() => setActive(null)} />}</AnimatePresence>
        </>
    );
}

function Checkout({ product, region, onClose }: { product: ShopProduct; region: "inr" | "usd"; onClose: () => void }) {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [rate, setRate] = useState(0);
    const [codeMsg, setCodeMsg] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [downloads, setDownloads] = useState<Dl[] | null>(null);
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const coupon = rate > 0 ? code : undefined;

    const finalInr = Math.round(product.inr * (1 - rate));
    const finalUsd = Number((product.usd * (1 - rate)).toFixed(2));

    const applyCode = () => {
        const c = code.trim().toUpperCase();
        if (SHOP_COUPONS[c] !== undefined) { setRate(SHOP_COUPONS[c]); setCodeMsg(`${Math.round(SHOP_COUPONS[c] * 100)}% off applied`); }
        else { setRate(0); setCodeMsg("That code isn't valid."); }
    };

    const deliver = async (payload: Record<string, string>) => {
        const res = await fetch("/api/shop/deliver", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product: product.id, email, name, ...payload }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Delivery failed");
        setDownloads(data.downloads);
        try { (window as any).gtag?.("event", "purchase", { currency: region === "inr" ? "INR" : "USD", value: region === "inr" ? finalInr : finalUsd, items: [{ item_id: product.id }] }); } catch { }
    };

    const payRazorpay = async () => {
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
                    catch (e: any) { setError(e.message); }
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
                className="bg-white text-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700" aria-label="Close"><X /></button>
                {downloads ? (
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
                            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 bg-white text-slate-900 placeholder:text-slate-400" />
                            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email (we send your download here)" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 bg-white text-slate-900 placeholder:text-slate-400" />
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeMsg(""); }} placeholder="Discount code" className="w-full border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-white text-slate-900 placeholder:text-slate-400" />
                            </div>
                            <button onClick={applyCode} className="px-4 rounded-xl bg-slate-100 font-semibold text-sm">Apply</button>
                        </div>
                        {codeMsg && <p className={`text-xs ${rate > 0 ? "text-green-600" : "text-red-500"}`}>{codeMsg}</p>}
                        {!emailOk && <p className="text-xs text-slate-500">Enter your email to continue.</p>}
                        <div className={emailOk ? "" : "opacity-40 pointer-events-none"}>
                            {region === "inr" ? (
                                <button onClick={payRazorpay} disabled={busy} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold disabled:opacity-60">
                                    {busy ? "Processing…" : `Pay ₹${finalInr.toLocaleString("en-IN")} — UPI / Card`}
                                </button>
                            ) : (
                                <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "AZH2zZoIp8p5E-_4wO5wPnBZL8r0OxYtNu1eX6pjl6xMN_GyIaInlW5frraQ8Tq7a2BhKfVavI1rpI5F", currency: "USD" }}>
                                    <PayPalButtons
                                        forceReRender={[finalUsd, product.id]}
                                        style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay", height: 48 }}
                                        createOrder={async () => {
                                            const o = await fetch("/api/paypal/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product: product.id, coupon }) }).then((r) => r.json());
                                            if (!o.success) throw new Error("Could not create PayPal order");
                                            return o.orderId;
                                        }}
                                        onApprove={async (data) => {
                                            setBusy(true); setError("");
                                            try {
                                                const c = await fetch("/api/paypal/capture-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: data.orderID }) }).then((r) => r.json());
                                                if (!c.success) throw new Error("Payment capture failed.");
                                                await deliver({ provider: "paypal", paypalOrderId: data.orderID });
                                            } catch (e: any) { setError(e.message); }
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

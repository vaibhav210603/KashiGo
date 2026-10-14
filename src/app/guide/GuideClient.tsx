"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Check, Download, Star, Map, ShieldAlert, Utensils, 
    ThumbsUp, Phone, Wallet, Compass, Tag, ChevronRight 
} from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Image from "next/image";

export default function GuideClient() {
    const [paymentMode, setPaymentMode] = useState<"domestic" | "international">("international");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasPaid, setHasPaid] = useState(false);

    useEffect(() => {
        try {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (timeZone === 'Asia/Calcutta' || timeZone === 'Asia/Kolkata') {
                setPaymentMode('domestic');
            }
        } catch (e) {
            // Fallback to international if timezone detection fails
        }
    }, []);

    // Discount State
    const [couponCode, setCouponCode] = useState("");
    const [discountRate, setDiscountRate] = useState(0);
    const [couponError, setCouponError] = useState("");

    const BASE_PRICE_INR = 999;
    const BASE_PRICE_USD = 14.99;
    
    const FINAL_PRICE_INR = discountRate > 0 ? Math.round(BASE_PRICE_INR * (1 - discountRate)) : BASE_PRICE_INR;
    const FINAL_PRICE_USD = discountRate > 0 ? Number((BASE_PRICE_USD * (1 - discountRate)).toFixed(2)) : BASE_PRICE_USD;

    const applyCoupon = async () => {
        const code = couponCode.trim().toUpperCase();
        try {
            const res = await fetch("/api/coupon", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product: "guide", code }),
            });
            const data = await res.json();
            if (data.valid) {
                setDiscountRate(data.rate);
                setCouponError("");
                return;
            }
            if (data.message) {
                setDiscountRate(0);
                setCouponError(data.message);
                return;
            }
        } catch { }
        setDiscountRate(0);
        setCouponError("Invalid discount code.");
    };

    const handleRazorpay = async () => {
        setIsSubmitting(true);
        try {
            const orderRes = await fetch("/api/razorpay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product: "guide", coupon: discountRate > 0 ? couponCode : undefined }),
            });
            const orderData = await orderRes.json();
            if (!orderData.success) throw new Error("Could not create payment order.");

            await new Promise<void>((resolve, reject) => {
                if ((window as any).Razorpay) { resolve(); return; }
                const script = document.createElement("script");
                script.src = "https://checkout.razorpay.com/v1/checkout.js";
                script.onload = () => resolve();
                script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
                document.body.appendChild(script);
            });

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "KashiGo",
                description: "Varanasi Travel Guide 2026",
                image: "/icon.png",
                order_id: orderData.orderId,
                theme: { color: "#f97316" },
                handler: function (response: any) {
                    if (response.razorpay_payment_id) {
                        setHasPaid(true);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setIsSubmitting(false);
                    },
                },
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (error: any) {
            alert(error?.message || "An error occurred during payment.");
            setIsSubmitting(false);
        }
    };

    const features = [
        { icon: Wallet, title: "Before You Arrive", desc: "Visas, currency, and what to pack for the holy city.", tint: "bg-amber-100 text-amber-700" },
        { icon: Map, title: "The Ghats Decoded", desc: "All 84 ghats mapped out, focusing on the ones that matter most.", tint: "bg-teal-100 text-teal-700" },
        { icon: Compass, title: "Navigating the City", desc: "Transport, local apps, and tips for getting around easily.", tint: "bg-sky-100 text-sky-700" },
        { icon: Star, title: "Temples & Sacred Sites", desc: "Essential etiquette and what to expect during your visits.", tint: "bg-pink-100 text-pink-700" },
        { icon: ShieldAlert, title: "Scam Shield", desc: "9 common tourist scams and exactly how to beat them.", tint: "bg-orange-100 text-orange-700" },
        { icon: Utensils, title: "Food Guide", desc: "What to eat, where to find it, and how to eat safely.", tint: "bg-amber-100 text-amber-700" },
        { icon: ThumbsUp, title: "Dos & Don'ts", desc: "Cultural respect made simple so you blend right in.", tint: "bg-teal-100 text-teal-700" },
        { icon: Phone, title: "Emergency Info", desc: "Important contacts, reliable hospitals, and helplines.", tint: "bg-sky-100 text-sky-700" }
    ];

    const priceLabel = paymentMode === "international" ? `$${FINAL_PRICE_USD}` : `₹${FINAL_PRICE_INR}`;

    return (
        <>
            {/* 1. Hero — headline, cover and price above the fold */}
            <section className="pt-24 sm:pt-28 pb-12 px-4 bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8 md:gap-12 items-center">
                    <div className="text-center md:text-left">
                        <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-orange-100 text-orange-700">
                            Varanasi Travel Guide 2026 · PDF
                        </span>
                        <h1 className="mt-4 text-3xl sm:text-5xl font-bold font-heading text-slate-900 tracking-tight leading-tight">
                            India&apos;s best city for travellers — <span className="text-orange-500">if you do it right.</span>
                        </h1>
                        <p className="mt-4 text-[15px] sm:text-lg text-slate-600 leading-relaxed">
                            The complete Varanasi playbook, written by someone born on the ghats. Real prices, the 9 scams to dodge, temple etiquette, food you can trust, and a ready-to-use itinerary.
                        </p>

                        <div className="mt-6 flex items-center justify-center md:justify-start gap-3">
                            {discountRate > 0 && (
                                <span className="text-lg text-slate-400 line-through">
                                    {paymentMode === "international" ? `$${BASE_PRICE_USD}` : `₹${BASE_PRICE_INR}`}
                                </span>
                            )}
                            <span className="text-4xl font-bold font-heading text-slate-900">{priceLabel}</span>
                            <span className="rounded-full px-3 py-1 text-xs font-semibold bg-teal-100 text-teal-700">One-time · Lifetime access</span>
                        </div>

                        <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                            <a href="#buy" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors shadow-sm">
                                Get the guide — {priceLabel}
                                <ChevronRight size={18} />
                            </a>
                            <a href="#inside" className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-full border border-slate-300 bg-white text-slate-800 font-semibold hover:bg-slate-50 transition-colors">
                                See what&apos;s inside
                            </a>
                        </div>

                        <ul className="mt-5 flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-sm text-slate-600">
                            <li className="inline-flex items-center gap-1.5"><Download size={15} className="text-teal-600" /> Instant PDF download</li>
                            <li className="inline-flex items-center gap-1.5"><ShieldAlert size={15} className="text-teal-600" /> 7-day money-back guarantee</li>
                        </ul>
                    </div>

                    <div className="relative mx-auto w-full max-w-[280px] sm:max-w-sm">
                        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-slate-200/70 shadow-lg bg-white">
                            <Image
                                src="/VARANASi.png"
                                alt="Varanasi Travel Guide cover - KashiGo"
                                fill
                                priority
                                sizes="(max-width: 768px) 280px, 384px"
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. What's inside */}
            <section id="inside" className="scroll-mt-20 py-14 sm:py-20 px-4 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-8 sm:mb-12">
                        <h2 className="text-2xl sm:text-4xl font-bold font-heading text-slate-900 tracking-tight">What&apos;s inside</h2>
                        <p className="mt-2 text-[15px] sm:text-lg text-slate-600">Everything a local friend would tell you, in one place.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {features.map((feature, idx) => (
                            <div key={idx} className="flex sm:flex-col gap-4 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/70 shadow-sm">
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${feature.tint}`}>
                                    <feature.icon size={20} strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="font-semibold font-heading text-slate-900">{feature.title}</h3>
                                    <p className="mt-1 text-[15px] text-slate-600 leading-relaxed">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Buy */}
            <section id="buy" className="scroll-mt-20 py-14 sm:py-20 px-4 bg-orange-50/60">
                <div className="max-w-md mx-auto">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl sm:text-4xl font-bold font-heading text-slate-900 tracking-tight">Get yours now</h2>
                        <p className="mt-2 text-[15px] text-slate-600">Don&apos;t be the tourist who pays triple for everything.</p>
                    </div>

                    <div className="rounded-3xl bg-white border border-slate-200/70 shadow-sm overflow-hidden">
                        <div className="px-6 pt-6 pb-5 text-center border-b border-slate-100 bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
                            <p className="text-sm font-medium text-slate-500">Instant lifetime access</p>
                            <div className="mt-1 flex items-end justify-center gap-3">
                                {discountRate > 0 && (
                                    <span className="text-xl text-slate-400 line-through mb-1">
                                        {paymentMode === "international" ? `$${BASE_PRICE_USD}` : `₹${BASE_PRICE_INR}`}
                                    </span>
                                )}
                                <div className="text-5xl font-bold font-heading text-slate-900 tracking-tight">{priceLabel}</div>
                            </div>
                            {discountRate > 0 && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-green-100 text-green-700">
                                    <Check size={14} strokeWidth={3} /> {discountRate * 100}% discount applied
                                </motion.div>
                            )}
                        </div>

                        <div className="p-5 sm:p-6">
                            <AnimatePresence mode="wait">
                                {!hasPaid ? (
                                    <motion.div key="checkout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 mb-2">Where are you paying from?</p>
                                            <div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-slate-100">
                                                <button
                                                    onClick={() => setPaymentMode("domestic")}
                                                    className={`h-11 rounded-full text-sm font-semibold transition-colors ${paymentMode === "domestic" ? "bg-white text-orange-600 shadow-sm" : "text-slate-600"}`}
                                                >
                                                    🇮🇳 India · ₹
                                                </button>
                                                <button
                                                    onClick={() => setPaymentMode("international")}
                                                    className={`h-11 rounded-full text-sm font-semibold transition-colors ${paymentMode === "international" ? "bg-white text-sky-600 shadow-sm" : "text-slate-600"}`}
                                                >
                                                    🌍 Global · $
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            {paymentMode === "domestic" ? (
                                                <button
                                                    onClick={handleRazorpay}
                                                    disabled={isSubmitting}
                                                    className="w-full h-12 px-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors shadow-sm disabled:opacity-70 inline-flex items-center justify-center gap-2"
                                                >
                                                    {isSubmitting ? "Processing..." : `Pay ${priceLabel} with Razorpay`}
                                                    {!isSubmitting && <ChevronRight size={18} />}
                                                </button>
                                            ) : (
                                                <div className="w-full relative z-10">
                                                    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "AZH2zZoIp8p5E-_4wO5wPnBZL8r0OxYtNu1eX6pjl6xMN_GyIaInlW5frraQ8Tq7a2BhKfVavI1rpI5F", currency: "USD" }}>
                                                        <PayPalButtons
                                                            style={{ layout: "vertical", color: "blue", shape: "pill", label: "checkout", height: 48 }}
                                                            createOrder={async () => {
                                                                const res = await fetch("/api/paypal/create-order", {
                                                                    method: "POST",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify({ product: "guide", coupon: discountRate > 0 ? couponCode : undefined })
                                                                });
                                                                const orderData = await res.json();
                                                                if (!orderData.success) throw new Error("Could not create PayPal order");
                                                                return orderData.orderId;
                                                            }}
                                                            onApprove={async (data, actions) => {
                                                                try {
                                                                    setIsSubmitting(true);
                                                                    const res = await fetch("/api/paypal/capture-order", {
                                                                        method: "POST",
                                                                        headers: { "Content-Type": "application/json" },
                                                                        body: JSON.stringify({ orderId: data.orderID })
                                                                    });
                                                                    const captureData = await res.json();
                                                                    if (captureData.success) {
                                                                        setHasPaid(true);
                                                                    } else {
                                                                        throw new Error("Payment capture failed");
                                                                    }
                                                                } catch (error: any) {
                                                                    alert(error?.message || "An error occurred during payment.");
                                                                } finally {
                                                                    setIsSubmitting(false);
                                                                }
                                                            }}
                                                            onError={(err) => {
                                                                alert("PayPal payment failed or was cancelled.");
                                                                setIsSubmitting(false);
                                                            }}
                                                        />
                                                    </PayPalScriptProvider>
                                                </div>
                                            )}
                                        </div>

                                        {discountRate === 0 && (
                                            <div className="space-y-2">
                                                <label htmlFor="guide-coupon" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                    <Tag size={15} className="text-orange-500" /> Have a code from the video?
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        id="guide-coupon"
                                                        type="text"
                                                        value={couponCode}
                                                        onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                                                        placeholder="Enter code"
                                                        className="min-w-0 flex-1 h-11 rounded-full border border-slate-300 px-4 text-base text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none uppercase tracking-widest bg-white"
                                                    />
                                                    <button onClick={applyCoupon} className="h-11 px-5 rounded-full border border-slate-300 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 transition-colors whitespace-nowrap">
                                                        Apply
                                                    </button>
                                                </div>
                                                {couponError && <p className="text-red-600 text-xs font-medium ml-1">{couponError}</p>}
                                            </div>
                                        )}

                                        <div className="flex items-start gap-3 rounded-2xl bg-teal-50 border border-teal-100 p-4">
                                            <ShieldAlert size={18} className="text-teal-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                <span className="font-semibold text-slate-900">7-day money-back guarantee.</span> If the guide doesn&apos;t save you more than it cost, email us for a full refund — keep the PDF anyway.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
                                            <span className="inline-flex items-center gap-1.5"><Download size={14} className="text-orange-500" /> Instant download</span>
                                            <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-orange-500" /> Any device</span>
                                            <span className="inline-flex items-center gap-1.5"><Wallet size={14} className="text-orange-500" /> Secure checkout</span>
                                            <span className="inline-flex items-center gap-1.5"><Star size={14} className="text-orange-500" /> No account needed</span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                                            <Check size={40} className="text-green-600 stroke-[3]" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2 font-heading">Success!</h3>
                                        <p className="text-[15px] text-slate-600 mb-6">Thank you! Your travel guide is ready to download.</p>
                                        <a href="/Varanasi_Travel_Guide_2026.pdf" download="Varanasi_Travel_Guide_2026.pdf" target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors shadow-sm">
                                            <Download size={20} />
                                            Download now
                                        </a>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Video */}
            <section className="py-14 sm:py-20 px-4 bg-white">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-6 sm:mb-10">
                        <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-pink-100 text-pink-700">A must-watch for first-timers</span>
                        <h2 className="mt-3 text-2xl sm:text-4xl font-bold font-heading text-slate-900 tracking-tight">Watch a local&apos;s perspective</h2>
                    </div>
                    <div className="aspect-video rounded-3xl overflow-hidden border border-slate-200/70 shadow-sm bg-slate-100">
                        <video
                            className="w-full h-full object-cover"
                            autoPlay
                            loop
                            controls
                            playsInline
                            preload="metadata"
                            poster="https://images.unsplash.com/photo-1626014304899-735c0c976936?q=80&w=2070&auto=format&fit=crop"
                        >
                            <source src="/final_bsb.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            </section>

            {/* 5. FAQ + closing CTA */}
            <section className="py-14 sm:py-20 px-4 bg-amber-50">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-4xl font-bold font-heading text-slate-900 tracking-tight">Before you buy</h2>
                        <p className="mt-2 text-[15px] text-slate-600">The questions we get asked most.</p>
                    </div>

                    <div className="space-y-3">
                        {[
                            { q: "How do I get the guide after paying?", a: "Instantly. The moment your payment goes through, a download button appears and the PDF is yours — no waiting, no email delay, no account to create." },
                            { q: "What format is it, and will it work on my phone?", a: "It's a PDF. It opens on any phone, tablet, or laptop, works fully offline, and is easy to read on the go while you're actually in Varanasi." },
                            { q: "Is $14.99 really worth it?", a: "One inflated boat ride, one fake-guide commission, or one 'donation' scam usually costs more than the guide itself. Knowing the real prices before you land typically saves first-timers several thousand rupees on day one." },
                            { q: "What if it's not useful to me?", a: "You're covered by a 7-day money-back guarantee. If it doesn't help, email us within a week for a full refund and keep the guide anyway. No risk to you." },
                            { q: "Is this written by an actual local?", a: "Yes — it's written by someone born and raised on the ghats of Varanasi, not a travel agency reselling generic tips. Everything is based on what actually happens in the city day to day." },
                            { q: "Is it up to date for 2026?", a: "Yes. Prices, timings, and the scam tactics are current for 2026, including seasonal Ganga Aarti times and up-to-date fare benchmarks." },
                        ].map((item, idx) => (
                            <details key={idx} className="group rounded-3xl bg-white border border-slate-200/70 shadow-sm px-5 py-4 [&_svg]:open:rotate-90">
                                <summary className="flex items-center justify-between gap-4 min-h-[44px] cursor-pointer list-none font-semibold text-slate-900">
                                    {item.q}
                                    <ChevronRight className="text-orange-500 transition-transform flex-shrink-0" size={20} />
                                </summary>
                                <p className="text-[15px] text-slate-600 leading-relaxed mt-2">{item.a}</p>
                            </details>
                        ))}
                    </div>

                    <div className="mt-10 rounded-3xl bg-gradient-to-r from-orange-500 to-pink-500 p-6 sm:p-8 text-center text-white shadow-sm">
                        <h3 className="text-xl sm:text-2xl font-bold font-heading">Land in Varanasi knowing the real prices</h3>
                        <p className="mt-2 text-[15px] text-white/90">Instant download · 7-day money-back guarantee</p>
                        <a href="#buy" className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-white text-orange-600 font-semibold hover:bg-orange-50 transition-colors">
                            Get the guide — {priceLabel}
                            <ChevronRight size={18} />
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}

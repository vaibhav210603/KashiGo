"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Check, Download, Star, Map, ShieldAlert, Utensils, 
    ThumbsUp, Phone, Wallet, Compass, Play, Tag, ChevronRight 
} from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Image from "next/image";

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
};

export default function GuideClient() {
    const [paymentMode, setPaymentMode] = useState<"domestic" | "international">("international");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasPaid, setHasPaid] = useState(false);
    const [showAllFeatures, setShowAllFeatures] = useState(false);

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

    const applyCoupon = () => {
        const code = couponCode.trim().toUpperCase();
        if (code === "KASHISECRET") {
            setDiscountRate(0.5); // 50% discount
            setCouponError("");
        } else if (code === "EXCLUSIVE20") {
            setDiscountRate(0.2); // 20% discount
            setCouponError("");
        } else if (code === "TEST817") {
            setDiscountRate(0.99); // 99% discount
            setCouponError("");
        } else {
            setDiscountRate(0);
            setCouponError("Invalid discount code.");
        }
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
        { icon: Wallet, title: "Before You Arrive", desc: "Visas, currency, and what to pack for the holy city." },
        { icon: Map, title: "The Ghats Decoded", desc: "All 84 ghats mapped out, focusing on the ones that matter most." },
        { icon: Compass, title: "Navigating the City", desc: "Transport, local apps, and tips for getting around easily." },
        { icon: Star, title: "Temples & Sacred Sites", desc: "Essential etiquette and what to expect during your visits." },
        { icon: ShieldAlert, title: "SCAM SHIELD", desc: "9 common tourist scams and exactly how to beat them." },
        { icon: Utensils, title: "Food Guide", desc: "What to eat, where to find it, and how to eat safely." },
        { icon: ThumbsUp, title: "Dos & Don'ts", desc: "Cultural respect made simple so you blend right in." },
        { icon: Phone, title: "Emergency Info", desc: "Important contacts, reliable hospitals, and helplines." }
    ];

    return (
        <>
            {/* 1. Hero Section */}
            <section className="relative pt-32 pb-20 px-4 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('/VARANASi.png')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-900" />
                
                <div className="relative max-w-5xl mx-auto text-center">
                    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-6">
                        <motion.div variants={fadeIn} className="inline-block px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-400 font-bold text-xs md:text-sm tracking-widest uppercase border border-orange-500/30 backdrop-blur-sm">
                            Varanasi Travel Guide 2026
                        </motion.div>
                        <motion.h1 variants={fadeIn} className="text-3xl md:text-6xl font-bold font-heading text-white tracking-tight leading-[1.2]">
                            India's best city for Tourists, <br/>
                            <span className="text-xl md:text-4xl text-orange-400 mt-4 block font-medium tracking-normal">only if done right!</span>
                        </motion.h1>
                        <motion.p variants={fadeIn} className="max-w-2xl mx-auto text-base md:text-xl text-slate-300 leading-relaxed">
                            The complete Varanasi playbook — written by someone born on the ghats. Real prices, the 9 scams to dodge, temple etiquette, food you can trust, and a ready-to-use itinerary. Know exactly what everything should cost <span className="text-white font-semibold">before</span> you land.
                        </motion.p>
                        <motion.div variants={fadeIn} className="flex flex-col items-center gap-4 pt-2">
                            <a href="#buy" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-4 px-10 rounded-xl font-bold text-lg transition-all shadow-lg shadow-orange-500/30 group">
                                Get the guide — just $14.99
                                <ChevronRight className="transform group-hover:translate-x-1 transition-transform" size={20} />
                            </a>
                            <p className="text-sm text-slate-400 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                                <span className="inline-flex items-center gap-1.5"><Download size={14} className="text-orange-400" /> Instant PDF download</span>
                                <span className="inline-flex items-center gap-1.5"><ShieldAlert size={14} className="text-orange-400" /> Money-back guarantee</span>
                                <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-orange-400" /> One overpriced boat ride costs more</span>
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* 2. Video Section */}
            <section className="py-20 bg-white px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-2xl md:text-5xl font-bold font-heading text-slate-900 mb-4 tracking-tight">Watch a local's perspective</h2>
                        <p className="text-lg text-orange-600 font-semibold uppercase tracking-widest">A Must watch for Tourists</p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden relative group border-8 border-slate-50 shadow-2xl"
                    >
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
                    </motion.div>
                </div>
            </section>

            {/* 3. Exclusive Solution Section */}
            <section className="py-24 bg-slate-900 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold font-heading text-white mb-6 tracking-tight">The one stop exclusive solution</h2>
                        <div className="w-24 h-2 bg-orange-400 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative group"
                        >
                            <div className="absolute -inset-4 bg-orange-500/20 rounded-[3rem] blur-2xl group-hover:bg-orange-500/30 transition-all duration-500" />
                            <div className="relative aspect-[4/5] lg:aspect-auto lg:h-[500px]">
                                <Image 
                                    src="/VARANASi.png" 
                                    alt="Varanasi Travel Guide cover - KashiGo" 
                                    fill
                                    className="relative w-full rounded-[2.5rem] shadow-2xl border-4 border-white transform group-hover:scale-[1.02] transition-transform duration-500 object-cover"
                                />
                            </div>
                        </motion.div>

                        <div className="space-y-8">
                            <h3 className="text-2xl font-bold text-orange-400">What's Covered Inside:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {features.map((feature, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`flex gap-4 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all group ${idx >= 4 && !showAllFeatures ? 'hidden md:flex' : 'flex'}`}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-orange-400 flex items-center justify-center flex-shrink-0 text-white shadow-lg">
                                            <feature.icon size={20} strokeWidth={2} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm mb-1">{feature.title}</h4>
                                            <p className="text-xs text-blue-100 leading-relaxed">{feature.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            
                            {features.length > 4 && (
                                <button 
                                    onClick={() => setShowAllFeatures(!showAllFeatures)}
                                    className="w-full py-4 px-6 rounded-xl border border-white/20 text-white font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2 md:hidden"
                                >
                                    {showAllFeatures ? "Show Less" : "View More Features"}
                                    <ChevronRight className={`transform transition-transform ${showAllFeatures ? "-rotate-90" : "rotate-90"}`} size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Buy Now Section */}
            <section id="buy" className="scroll-mt-20 py-24 bg-slate-900 px-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4 tracking-tight">Get yours now!</h2>
                        <p className="text-slate-400 text-lg">Don't be another tourist who pays triple for everything.</p>
                    </div>

                    <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden max-w-6xl mx-auto border border-slate-100 flex flex-col lg:flex-row">
                        {/* Image Column */}
                        <div className="lg:w-1/2 relative bg-slate-100 aspect-[4/5] lg:aspect-auto lg:h-auto overflow-hidden">
                            <Image 
                                src="/VARANASi.png" 
                                alt="Premium Varanasi Travel Guide" 
                                fill
                                className="absolute inset-0 w-full h-full object-cover lg:object-center object-top"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 lg:hidden" />
                        </div>

                        {/* Checkout Column */}
                        <div className="lg:w-1/2 flex flex-col">
                            <div className="bg-slate-800 p-8 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full blur-[80px] opacity-30 translate-x-10 -translate-y-10" />
                                <p className="text-slate-400 font-medium mb-2 relative z-10">Instant Lifetime Access</p>
                                <div className="flex items-end justify-center gap-3 relative z-10">
                                    {discountRate > 0 && (
                                        <span className="text-2xl text-slate-500 line-through mb-1 font-medium">
                                            {paymentMode === "international" ? `$${BASE_PRICE_USD}` : `₹${BASE_PRICE_INR}`}
                                        </span>
                                    )}
                                    <div className="text-5xl font-bold text-white tracking-tight">
                                        {paymentMode === "international" ? `$${FINAL_PRICE_USD}` : `₹${FINAL_PRICE_INR}`}
                                    </div>
                                </div>
                                {discountRate > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 text-sm font-bold px-3 py-1 rounded-full border border-green-500/30">
                                        <Check size={14} strokeWidth={3} /> {discountRate * 100}% Discount Applied!
                                    </motion.div>
                                )}
                            </div>

                            <div className="p-8 flex-grow">
                                <AnimatePresence mode="wait">
                                    {!hasPaid ? (
                                        <motion.div key="checkout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                            {discountRate === 0 && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                        <Tag size={16} className="text-orange-500" /> Have the secret code?
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={couponCode}
                                                            onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                                                            placeholder="Enter code from video"
                                                            className="flex-1 border border-slate-300 rounded-xl py-3 px-4 text-base md:text-sm text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none uppercase tracking-widest font-mono shadow-sm bg-slate-50"
                                                        />
                                                        <button onClick={applyCoupon} className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap shadow-md">
                                                            Apply
                                                        </button>
                                                    </div>
                                                    {couponError && <p className="text-red-500 text-xs font-medium ml-1">{couponError}</p>}
                                                </div>
                                            )}

                                            <div className="bg-orange-50/50 rounded-2xl p-4 border-2 border-orange-100">
                                                <label className="block text-base font-bold text-slate-900 mb-3 text-center">Select Your Region</label>
                                                <div className="grid grid-cols-2 gap-3 relative">
                                                    <button
                                                        onClick={() => setPaymentMode("domestic")}
                                                        className={`relative flex flex-col items-center py-4 px-2 rounded-xl border-2 transition-all duration-300 ${paymentMode === "domestic" ? "border-orange-500 bg-white shadow-md transform scale-[1.02] z-10" : "border-transparent text-slate-500 hover:bg-white/60"}`}
                                                    >
                                                        <span className={`text-2xl mb-1 ${paymentMode === "domestic" ? "opacity-100" : "opacity-60"}`}>🇮🇳</span>
                                                        <span className={`font-extrabold text-sm ${paymentMode === "domestic" ? "text-orange-600" : "text-slate-600"}`}>India</span>
                                                        <span className={`text-xs font-semibold ${paymentMode === "domestic" ? "text-slate-500" : "text-slate-400"}`}>Pay in ₹</span>
                                                        {paymentMode === "domestic" && <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-sm"><Check size={12} strokeWidth={4} /></div>}
                                                    </button>
                                                    <button
                                                        onClick={() => setPaymentMode("international")}
                                                        className={`relative flex flex-col items-center py-4 px-2 rounded-xl border-2 transition-all duration-300 ${paymentMode === "international" ? "border-blue-500 bg-white shadow-md transform scale-[1.02] z-10" : "border-transparent text-slate-500 hover:bg-white/60"}`}
                                                    >
                                                        <span className={`text-2xl mb-1 ${paymentMode === "international" ? "opacity-100" : "opacity-60"}`}>🌍</span>
                                                        <span className={`font-extrabold text-sm ${paymentMode === "international" ? "text-blue-600" : "text-slate-600"}`}>Global</span>
                                                        <span className={`text-xs font-semibold ${paymentMode === "international" ? "text-slate-500" : "text-slate-400"}`}>Pay in $</span>
                                                        {paymentMode === "international" && <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-sm"><Check size={12} strokeWidth={4} /></div>}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                {paymentMode === "domestic" ? (
                                                    <button
                                                        onClick={handleRazorpay}
                                                        disabled={isSubmitting}
                                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg shadow-orange-500/30 disabled:opacity-70 flex justify-between items-center group"
                                                    >
                                                        <span>{isSubmitting ? "Processing..." : "Pay with Razorpay"}</span>
                                                        {!isSubmitting && <ChevronRight className="transform group-hover:translate-x-1 transition-transform" />}
                                                    </button>
                                                ) : (
                                                    <div className="w-full relative z-10">
                                                        <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "AZH2zZoIp8p5E-_4wO5wPnBZL8r0OxYtNu1eX6pjl6xMN_GyIaInlW5frraQ8Tq7a2BhKfVavI1rpI5F", currency: "USD" }}>
                                                            <PayPalButtons
                                                                style={{ layout: "vertical", color: "blue", shape: "rect", label: "checkout", height: 50 }}
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

                                            {/* Trust + risk reversal */}
                                            <div className="pt-2 space-y-4">
                                                <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-2xl p-4">
                                                    <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                                                        <ShieldAlert size={18} strokeWidth={2.5} />
                                                    </div>
                                                    <p className="text-sm text-slate-700 leading-relaxed">
                                                        <span className="font-bold text-slate-900">7-day money-back guarantee.</span> If the guide doesn't save you more than it cost, email us for a full refund — keep the PDF anyway.
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
                                                    <span className="inline-flex items-center gap-1.5"><Download size={14} className="text-orange-500" /> Instant download</span>
                                                    <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-orange-500" /> Works on any device</span>
                                                    <span className="inline-flex items-center gap-1.5"><Wallet size={14} className="text-orange-500" /> Secure checkout</span>
                                                    <span className="inline-flex items-center gap-1.5"><Star size={14} className="text-orange-500" /> No account needed</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                                <Check size={48} className="text-green-500 stroke-[3]" />
                                            </div>
                                            <h3 className="text-3xl font-bold text-slate-900 mb-3 font-heading">Success!</h3>
                                            <p className="text-slate-600 mb-8">Thank you! Your premium travel guide is ready for download.</p>
                                            <a href="/Varanasi_Travel_Guide_2026.pdf" download="Varanasi_Travel_Guide_2026.pdf" target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white py-5 px-8 rounded-xl font-bold text-lg transition-all shadow-lg shadow-orange-500/30 group">
                                                <Download size={24} className="group-hover:-translate-y-1 transition-transform" />
                                                Download Now
                                            </a>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. FAQ Section */}
            <section className="py-24 bg-white px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold font-heading text-slate-900 mb-4 tracking-tight">Before you buy</h2>
                        <p className="text-slate-500 text-lg">The questions we get asked most.</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { q: "How do I get the guide after paying?", a: "Instantly. The moment your payment goes through, a download button appears and the PDF is yours — no waiting, no email delay, no account to create." },
                            { q: "What format is it, and will it work on my phone?", a: "It's a PDF. It opens on any phone, tablet, or laptop, works fully offline, and is easy to read on the go while you're actually in Varanasi." },
                            { q: "Is $14.99 really worth it?", a: "One inflated boat ride, one fake-guide commission, or one 'donation' scam usually costs more than the guide itself. Knowing the real prices before you land typically saves first-timers several thousand rupees on day one." },
                            { q: "What if it's not useful to me?", a: "You're covered by a 7-day money-back guarantee. If it doesn't help, email us within a week for a full refund and keep the guide anyway. No risk to you." },
                            { q: "Is this written by an actual local?", a: "Yes — it's written by someone born and raised on the ghats of Varanasi, not a travel agency reselling generic tips. Everything is based on what actually happens in the city day to day." },
                            { q: "Is it up to date for 2026?", a: "Yes. Prices, timings, and the scam tactics are current for 2026, including seasonal Ganga Aarti times and up-to-date fare benchmarks." },
                        ].map((item, idx) => (
                            <details key={idx} className="group bg-slate-50 rounded-2xl border border-slate-100 p-6 [&_svg]:open:rotate-90">
                                <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-slate-900 text-lg">
                                    {item.q}
                                    <ChevronRight className="text-orange-500 transition-transform flex-shrink-0 ml-4" size={20} />
                                </summary>
                                <p className="text-slate-600 leading-relaxed mt-4">{item.a}</p>
                            </details>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <a href="#buy" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-4 px-10 rounded-xl font-bold text-lg transition-all shadow-lg group">
                            Get the guide — $14.99
                            <ChevronRight className="transform group-hover:translate-x-1 transition-transform" size={20} />
                        </a>
                        <p className="text-sm text-slate-400 mt-3">Instant download · 7-day money-back guarantee</p>
                    </div>
                </div>
            </section>
        </>
    );
}

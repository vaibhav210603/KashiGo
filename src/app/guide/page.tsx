"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Check, Download, Star, Map, ShieldAlert, Utensils, 
    ThumbsUp, Phone, Wallet, Compass, Play, Tag, ChevronRight 
} from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
};

export default function GuidePage() {
    const [paymentMode, setPaymentMode] = useState<"domestic" | "international">("domestic");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasPaid, setHasPaid] = useState(false);

    // Discount State
    const [couponCode, setCouponCode] = useState("");
    const [discountRate, setDiscountRate] = useState(0);
    const [couponError, setCouponError] = useState("");

    const BASE_PRICE_INR = 1080;
    const BASE_PRICE_USD = 12.99;
    
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
                body: JSON.stringify({ amount: FINAL_PRICE_INR }),
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
        <main className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
            <Navbar />
            
            {/* Hero Section */}
            <div className="relative bg-slate-900 pt-32 pb-24 px-4 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=2076&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
                
                <div className="relative max-w-5xl mx-auto text-center">
                    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-6">
                        <motion.div variants={fadeIn} className="inline-block px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-400 font-bold text-sm tracking-widest uppercase border border-orange-500/30 backdrop-blur-sm">
                            Digital PDF E-Book
                        </motion.div>
                        <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold font-heading text-white tracking-tight">
                            Varanasi <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">Travel Guide 2026</span>
                        </motion.h1>
                        <motion.p variants={fadeIn} className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
                            The one stop solution for planning your trip to Varanasi. All the information you need in one place for a safe, scam-free trip.
                        </motion.p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-10 relative z-10 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Video Section */}
                    <div className="lg:col-span-7 order-1">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100"
                        >
                            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-2">
                                <Play className="text-orange-500" /> A Must Watch for all travelers to Varanasi.
                            </h2>
                            <p className="text-slate-600 mb-6 text-center">Get an local's perspective on Varanasi and get a <strong className="text-slate-900">secret discount code</strong> in the video!</p>
                            
                            <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden relative group border border-slate-200 shadow-inner">
                                <video 
                                    className="w-full h-full object-cover" 
                                    autoPlay
                                    loop
                                    controls
                                    playsInline
                                    preload="metadata"
                                    poster="https://images.unsplash.com/photo-1626014304899-735c0c976936?q=80&w=2070&auto=format&fit=crop"
                                >
                                    <source src="/ebook_video_optimized.mp4" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Checkout Sticky Panel */}
                    <div className="lg:col-span-5 order-2 lg:order-2 lg:col-start-8 lg:row-span-2 relative z-20">
                        <div className="sticky top-24">
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
                            >

                                {/* Price Header */}
                                <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
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

                                <div className="p-8">
                                    <AnimatePresence mode="wait">
                                        {!hasPaid ? (
                                            <motion.div
                                                key="checkout"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="space-y-6"
                                            >
                                                {/* Discount Code Input */}
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
                                                                className="flex-1 border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none uppercase tracking-widest font-mono shadow-sm bg-slate-50"
                                                            />
                                                            <button
                                                                onClick={applyCoupon}
                                                                className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap shadow-md"
                                                            >
                                                                Apply
                                                            </button>
                                                        </div>
                                                        {couponError && <p className="text-red-500 text-xs font-medium ml-1">{couponError}</p>}
                                                    </div>
                                                )}

                                                <div className="h-px bg-slate-100 my-6" />

                                                {/* Payment Method Selector */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-3">Select Currency / Region</label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                            onClick={() => setPaymentMode("domestic")}
                                                            className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${paymentMode === "domestic" ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm" : "border-slate-200 text-slate-600 hover:border-orange-200 hover:bg-slate-50"}`}
                                                        >
                                                            India (INR)
                                                        </button>
                                                        <button
                                                            onClick={() => setPaymentMode("international")}
                                                            className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${paymentMode === "international" ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm" : "border-slate-200 text-slate-600 hover:border-orange-200 hover:bg-slate-50"}`}
                                                        >
                                                            Global (USD)
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Payment Buttons */}
                                                <div className="pt-4">
                                                    {paymentMode === "domestic" ? (
                                                        <button
                                                            onClick={handleRazorpay}
                                                            disabled={isSubmitting}
                                                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg shadow-orange-500/30 disabled:opacity-70 flex justify-between items-center group"
                                                        >
                                                            <span>{isSubmitting ? "Processing..." : "Pay securely with Razorpay"}</span>
                                                            {!isSubmitting && <ChevronRight className="transform group-hover:translate-x-1 transition-transform" />}
                                                        </button>
                                                    ) : (
                                                        <div className="w-full relative z-10">
                                                            <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "ATMGtSsoMxvX5hrhLzFYYuN1yNCAonxN-vV1xAtNKBRvL7cbgpMQ_EG1Nf7j-43XGcyyUlN6Eb4Our_0", currency: "USD" }}>
                                                                <PayPalButtons
                                                                    style={{ layout: "vertical", color: "blue", shape: "rect", label: "checkout", height: 50 }}
                                                                    createOrder={async () => {
                                                                        const res = await fetch("/api/paypal/create-order", {
                                                                            method: "POST",
                                                                            headers: { "Content-Type": "application/json" },
                                                                            body: JSON.stringify({ amount: FINAL_PRICE_INR })
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
                                                
                                                <p className="text-xs text-center text-slate-400 font-medium pt-2">
                                                    Secure encrypted checkout. No hidden fees.
                                                </p>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="success"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="text-center py-6"
                                            >
                                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                                    <Check size={48} className="text-green-500 stroke-[3]" />
                                                </div>
                                                <h3 className="text-3xl font-bold text-slate-900 mb-3">Payment Successful!</h3>
                                                <p className="text-slate-600 mb-8 text-lg">Thank you for your purchase. Your premium travel guide is ready.</p>
                                                
                                                <a 
                                                    href="/Varanasi_Travel_Guide_2026.pdf" 
                                                    download="Varanasi_Travel_Guide_2026.pdf"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white py-5 px-8 rounded-xl font-bold text-lg transition-all shadow-lg shadow-orange-500/30 group"
                                                >
                                                    <Download size={24} className="group-hover:-translate-y-1 transition-transform" />
                                                    Download Guide Now
                                                </a>
                                                <p className="text-sm text-slate-500 font-medium mt-6">File size: ~15MB PDF</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* What's Inside Grid */}
                    <div className="lg:col-span-7 order-3 lg:col-start-1 lg:order-3">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100"
                        >
                            <div className="mb-8">
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">What This Guide Includes</h2>
                                <div className="w-20 h-1.5 bg-orange-500 rounded-full"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {features.map((feature, idx) => (
                                    <motion.div 
                                        key={idx} 
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:border-orange-200 hover:bg-orange-50/50"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-orange-600 border border-slate-100">
                                            <feature.icon size={24} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-1">{feature.title}</h4>
                                            <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
            
            <Footer />
        </main>
    );
}

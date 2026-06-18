"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Check, ChevronRight, Compass, ShieldAlert, Star } from "lucide-react";

export default function IndiaTourClient() {
  const [region, setRegion] = useState<"global" | "domestic">("global");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const FINAL_PRICE_INR = 2374;
  const FINAL_PRICE_USD = 29;

  const handleRazorpay = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: FINAL_PRICE_INR }),
      });
      const orderData = await res.json();
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
        name: "KashiGo Premium",
        description: "India Tour VIP Pass",
        order_id: orderData.orderId,
        theme: { color: "#f97316" }, // Tailwind orange-500
        handler: function (response: any) {
          if (response.razorpay_payment_id) {
            setIsSuccess(true);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      alert(e.message || "An error occurred.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans pt-16">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/nano_banana_tour_hero.png"
            alt="India Tour Hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
             <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-400 font-bold text-xs md:text-sm tracking-widest uppercase border border-orange-500/30 backdrop-blur-sm mb-6">
                Premium Curated Experience
             </span>
             <h1 className="text-5xl md:text-7xl font-bold font-heading text-white mb-4 leading-tight">
                Don't Just Visit India. <br className="hidden md:block" />
                <span className="text-orange-500 font-cursive text-7xl md:text-9xl block mt-2">Experience It.</span>
             </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-200 mb-12 max-w-3xl mx-auto font-medium"
          >
            Skip the tourist traps. Our premium guided tour connects you with the real heartbeat of the country, curated by local experts.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <a
                href="#checkout"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-10 py-5 rounded-full text-xl font-bold font-heading transition-all shadow-xl hover:shadow-orange-500/30 transform hover:-translate-y-1"
            >
                Reserve Your Spot Now
            </a>
          </motion.div>
        </div>
      </section>

      {/* Checkout Section */}
      <section id="checkout" className="py-24 px-4 bg-slate-900 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold font-heading text-white mb-6">Get Your VIP Pass!</h2>
            <p className="text-xl text-slate-400">Instant Lifetime Access. Travel confidently with our luxury itinerary.</p>
          </motion.div>

          <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-slate-800">
            {/* Image Column */}
            <div className="lg:w-1/2 relative min-h-[400px] lg:min-h-auto">
              <Image
                src="/checkout_nanobanana.png"
                alt="VIP Pass Checkout"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 lg:hidden" />
            </div>

            {/* Payment Column */}
            <div className="lg:w-1/2 flex flex-col">
              <div className="bg-slate-800 p-10 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full blur-[80px] opacity-30 translate-x-10 -translate-y-10" />
                <p className="text-slate-400 font-semibold uppercase tracking-widest mb-4 text-sm relative z-10">Total Price</p>
                <div className="flex justify-center items-baseline gap-4 relative z-10">
                  <span className="text-3xl text-slate-500 line-through font-medium">
                    {region === "global" ? "$39" : "₹3250"}
                  </span>
                  <span className="text-7xl font-bold font-heading text-white tracking-tight">
                    {region === "global" ? `$${FINAL_PRICE_USD}` : `₹${FINAL_PRICE_INR}`}
                  </span>
                </div>
              </div>

              <div className="p-10 md:p-12 bg-slate-50 flex-grow">
                <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10"
                  >
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <Check size={48} className="text-green-500 stroke-[3]" />
                    </div>
                    <h3 className="text-4xl font-bold font-heading text-slate-900 mb-4">Success!</h3>
                    <p className="text-slate-600 text-xl">Your VIP premium pass is confirmed. Check your email!</p>
                  </motion.div>
                ) : (
                  <motion.div key="checkout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="bg-orange-50/50 rounded-2xl p-6 border-2 border-orange-100 mb-8">
                        <label className="block text-center font-bold text-slate-900 mb-4 text-lg">Select Your Region</label>
                        <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setRegion("global")}
                            className={`relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                            region === "global"
                                ? "border-blue-500 bg-white shadow-lg scale-[1.02] z-10"
                                : "border-transparent text-slate-500 hover:bg-white/60"
                            }`}
                        >
                            <span className={`block text-4xl mb-3 ${region !== "global" && "opacity-60"}`}>🌍</span>
                            <span className={`block font-extrabold text-lg ${region === "global" ? "text-blue-600" : "text-slate-600"}`}>Global</span>
                            <span className="block text-sm font-semibold text-slate-400 mt-1">Pay in $</span>
                            {region === "global" && <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full p-1 shadow-sm"><Check size={16} strokeWidth={4} /></div>}
                        </button>
                        
                        <button
                            onClick={() => setRegion("domestic")}
                            className={`relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                            region === "domestic"
                                ? "border-orange-500 bg-white shadow-lg scale-[1.02] z-10"
                                : "border-transparent text-slate-500 hover:bg-white/60"
                            }`}
                        >
                            <span className={`block text-4xl mb-3 ${region !== "domestic" && "opacity-60"}`}>🇮🇳</span>
                            <span className={`block font-extrabold text-lg ${region === "domestic" ? "text-orange-600" : "text-slate-600"}`}>India</span>
                            <span className="block text-sm font-semibold text-slate-400 mt-1">Pay in ₹</span>
                            {region === "domestic" && <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full p-1 shadow-sm"><Check size={16} strokeWidth={4} /></div>}
                        </button>
                        </div>
                    </div>

                    <div className="min-h-[150px]">
                      {region === "global" ? (
                        <div className="w-full relative z-0">
                          <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "AZH2zZoIp8p5E-_4wO5wPnBZL8r0OxYtNu1eX6pjl6xMN_GyIaInlW5frraQ8Tq7a2BhKfVavI1rpI5F", currency: "USD" }}>
                            <PayPalButtons
                                style={{ layout: "vertical", color: "blue", shape: "rect", label: "checkout", height: 50 }}
                                createOrder={async () => {
                                const res = await fetch("/api/paypal/create-order", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ amount: FINAL_PRICE_INR }),
                                });
                                const orderData = await res.json();
                                if (!orderData.success) throw new Error("Could not create PayPal order");
                                return orderData.orderId;
                                }}
                                onApprove={async (data, actions) => {
                                try {
                                    setIsProcessing(true);
                                    const res = await fetch("/api/paypal/capture-order", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ orderId: data.orderID }),
                                    });
                                    const captureData = await res.json();
                                    if (captureData.success) {
                                      setIsSuccess(true);
                                    } else {
                                      throw new Error("Payment capture failed");
                                    }
                                } catch (e: any) {
                                    alert(e.message);
                                } finally {
                                    setIsProcessing(false);
                                }
                                }}
                                onError={() => {
                                  alert("PayPal payment failed or was cancelled.");
                                  setIsProcessing(false);
                                }}
                            />
                          </PayPalScriptProvider>
                        </div>
                      ) : (
                        <button
                          onClick={handleRazorpay}
                          disabled={isProcessing}
                          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-heading text-xl font-bold py-5 px-8 rounded-2xl flex justify-between items-center transition-all duration-300 shadow-xl hover:shadow-orange-500/30 hover:-translate-y-1 group"
                        >
                          <span>{isProcessing ? "Processing..." : "Pay with Razorpay"}</span>
                          {!isProcessing && <ChevronRight className="transform group-hover:translate-x-2 transition-transform" size={24} />}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

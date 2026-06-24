"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Check, ChevronRight, Phone, Lock, Clock, ArrowRight } from "lucide-react";

const WHATSAPP_NUMBER = "919999999999";
const PHONE_NUMBER = "+919999999999";

const checklist = [
  {
    emoji: "🍛",
    title: "Eat well, don't get sick",
    desc: "Best dhabas, street food safe-zones & what to avoid",
  },
  {
    emoji: "🛡️",
    title: "Spot every scam",
    desc: "Tuk-tuk traps, fake guides, gem shops — all covered",
  },
  {
    emoji: "🗺️",
    title: "Routes that actually work",
    desc: "Day-by-day city flow with real timing & transport",
  },
];

const previewDays = [
  {
    day: "Day 1",
    route: "Delhi: Red Fort → Chandni Chowk → Jama Masjid",
    entries: [
      { type: "note", text: "Morning: Arrive, check in, chai at the local stall" },
      { type: "time", time: "10:00 AM", text: "Red Fort — skip the tourist entrance, use Gate 3" },
      { type: "time", time: "12:30 PM", text: "Chandni Chowk street food walk (safe picks inside)" },
      { type: "tip", text: "Parathewali Gali: order the aloo-methi, avoid the lassi stalls" },
      { type: "tip", text: "Karim's: sit upstairs, not the ground floor" },
      { type: "time", time: "3:00 PM", text: "Jama Masjid — dress code tip, best rooftop view" },
      { type: "note", text: "Evening: Connaught Place → night market" },
    ],
  },
  {
    day: "Day 2",
    route: "Agra: Taj Mahal → Agra Fort → Fatehpur Sikri",
    entries: [
      { type: "time", time: "05:30 AM", text: "Leave Delhi — train SHT 12002 (book 2A class)" },
      { type: "time", time: "07:45 AM", text: "Arrive Agra Cantt — share auto to East Gate" },
      { type: "time", time: "08:00 AM", text: "Taj Mahal — arrive before 9 AM to beat crowds" },
      { type: "tip", text: "Photography spot: bench left of the central pool" },
      { type: "tip", text: "Don't buy the 'official' guide at gate — it's a scam" },
    ],
  },
];

export default function IndiaTourClient() {
  const [region, setRegion] = useState<"global" | "domestic">("global");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const FINAL_PRICE_INR = 2374;
  const FINAL_PRICE_USD = 29;

  const handlePaymentSuccess = () => {
    setIsSuccess(true);
    localStorage.setItem("hasPaidIndiaGuide", "true");
    setTimeout(() => {
      window.location.href = "/india-guide";
    }, 2000);
  };

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
        description: "India Tour Guide 2026",
        order_id: orderData.orderId,
        theme: { color: "#f97316" },
        handler: function (response: any) {
          if (response.razorpay_payment_id) handlePaymentSuccess();
        },
        modal: { ondismiss: function () { setIsProcessing(false); } },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      alert(e.message || "An error occurred.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans pt-16">

      {/* ── Hero ── */}
      <section className="relative h-[92vh] min-h-[620px] w-full flex items-end justify-center overflow-hidden pb-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="/agra_cover.jpg"
            alt="All India Tour"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/50 to-[#0c0c0e]/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c0e]/60 to-transparent h-32" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <p className="text-orange-400/80 text-xs md:text-sm tracking-[0.3em] uppercase font-semibold mb-5">
              KashiGo Presents
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-heading text-white leading-[0.95] tracking-tight mb-6">
              All India Tour<br />
              <span className="text-orange-500">Guide 2026</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide">
              Incredible.&nbsp;&nbsp;Intense.&nbsp;&nbsp;Absolutely worth it.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── What's inside ── */}
      <section className="relative py-24 px-4 bg-[#FFFDF8]" style={{
        backgroundImage: "radial-gradient(circle, #f97316 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        backgroundPosition: "0 0",
      }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(255,253,248,0.92) 0%, rgba(255,253,248,0.98) 100%)" }}
        />
        <div className="max-w-3xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <p className="font-mono text-xs tracking-[0.2em] text-orange-500 uppercase mb-3">What's Inside</p>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mb-3">
              Everything a local would tell you
            </h2>
            <p className="text-slate-500 text-base">And nothing else.</p>
          </motion.div>

          <div className="flex flex-col gap-4">
            {checklist.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group flex items-start gap-5 bg-white hover:bg-orange-50/50 border border-stone-200 hover:border-orange-200 rounded-2xl px-6 py-5 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-2xl">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-slate-900 font-semibold text-base">{item.title}</span>
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                      <Check size={11} strokeWidth={3} className="text-white" />
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Guide Preview ── */}
      <section className="px-4 py-16 bg-white relative overflow-hidden">
        {/* decorative bg element */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-50 opacity-60 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-amber-50 opacity-80 blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <p className="font-mono text-xs tracking-[0.2em] text-orange-500 uppercase mb-2">Preview — First Few Pages</p>
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-900">
              See what's waiting for you
            </h2>
          </motion.div>

          {/* Document-styled preview card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-xl bg-white"
          >
            {/* Card header bar */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
              </div>
              <p className="text-white/90 text-xs font-mono tracking-widest uppercase">All India Tour Guide 2026</p>
              <div className="w-16" />
            </div>

            {/* Page-like content */}
            <div className="px-6 md:px-10 pt-8 pb-0">
              {previewDays.map((day, di) => (
                <div key={di} className={di > 0 ? "mt-8" : ""}>
                  {/* Day header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0 bg-orange-500 text-white text-xs font-bold font-mono px-3 py-1 rounded-full tracking-wider">
                      {day.day}
                    </div>
                    <h3 className="text-slate-900 font-bold font-heading text-base md:text-lg flex items-center gap-1.5">
                      {day.route.split(" → ").map((city, ci, arr) => (
                        <span key={ci} className="flex items-center gap-1.5">
                          {city}
                          {ci < arr.length - 1 && (
                            <ArrowRight size={14} className="text-orange-400 flex-shrink-0" />
                          )}
                        </span>
                      ))}
                    </h3>
                  </div>

                  <div className="space-y-2.5 pl-2 border-l-2 border-orange-100 ml-1">
                    {day.entries.map((entry, ei) => (
                      <div key={ei}>
                        {entry.type === "time" && (
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-mono font-semibold px-2 py-0.5 rounded-md mt-0.5">
                              <Clock size={10} />
                              {entry.time}
                            </span>
                            <p className="text-slate-700 text-sm leading-relaxed">{entry.text}</p>
                          </div>
                        )}
                        {entry.type === "tip" && (
                          <div className="flex items-start gap-2 pl-6">
                            <span className="flex-shrink-0 w-4 h-4 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center mt-0.5">
                              <ArrowRight size={8} className="text-orange-500" />
                            </span>
                            <p className="text-slate-500 text-sm leading-relaxed">{entry.text}</p>
                          </div>
                        )}
                        {entry.type === "note" && (
                          <p className="text-slate-400 text-sm italic pl-2">{entry.text}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {di < previewDays.length - 1 && (
                    <div className="mt-6 border-t border-dashed border-stone-200" />
                  )}
                </div>
              ))}

              {/* Blurred locked content */}
              <div className="relative mt-6">
                <div className="select-none pointer-events-none opacity-70">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0 bg-orange-500 text-white text-xs font-bold font-mono px-3 py-1 rounded-full tracking-wider">
                      Day 3
                    </div>
                    <h3 className="text-slate-900 font-bold font-heading text-base">
                      Jaipur: Amber Fort → City Palace → Hawa Mahal
                    </h3>
                  </div>
                  <div className="space-y-2 pl-2 border-l-2 border-orange-100 ml-1">
                    {["06:00 AM · Depart for Jaipur — 5 hr drive or train", "Scam alert: Gem shops near Hawa Mahal will approach you...", "City Palace ticket includes audio guide — worth it", "Amber Fort: hire an elephant or walk the ramp"].map((text, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 inline-flex items-center bg-amber-50 border border-amber-200 text-amber-700 text-xs font-mono px-2 py-0.5 rounded-md mt-0.5">
                          <Clock size={10} className="mr-1" />
                          —
                        </span>
                        <p className="text-slate-700 text-sm">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Gradient lock overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0.97) 75%, #fff 100%)",
                  }}
                />
                <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center">
                    <Lock size={18} className="text-orange-500" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Days 3–14 + all destination chapters unlocked below</p>
                </div>
              </div>
              <div className="h-24" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Download CTA ── */}
      <section id="checkout" className="py-20 px-4 bg-[#FFFDF8] relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
        </div>

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl overflow-hidden border border-stone-200 bg-white shadow-2xl"
          >
            {/* Price header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-orange-100 text-xs uppercase tracking-widest mb-1.5 font-mono">Instant PDF · Lifetime access</p>
                <p className="text-white font-bold text-2xl font-heading">Download Full Guide</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-baseline gap-2 justify-end">
                  <span className="text-orange-200 line-through text-base">
                    {region === "global" ? "$39" : "₹3,250"}
                  </span>
                  <span className="text-white font-bold text-4xl font-heading">
                    {region === "global" ? `$${FINAL_PRICE_USD}` : `₹${FINAL_PRICE_INR}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-8 py-8 space-y-6">
              {/* Support info */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center justify-center gap-3 bg-[#25D366]/[0.08] border border-[#25D366]/30 text-[#1a9e4e] font-semibold rounded-xl py-3.5 px-5 text-sm">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp support
                </div>
                <div className="flex-1 flex items-center justify-center gap-3 bg-slate-50 border border-slate-200 text-slate-600 font-semibold rounded-xl py-3.5 px-5 text-sm">
                  <Phone size={18} className="flex-shrink-0" />
                  24 × 7 call / text
                </div>
              </div>

              {/* Region selector */}
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-3 text-center font-mono">Select your region</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setRegion("global")}
                    className={`relative flex flex-col items-center py-4 rounded-2xl border-2 transition-all duration-200 ${
                      region === "global"
                        ? "border-blue-500 bg-blue-50"
                        : "border-stone-200 hover:border-stone-300 bg-white"
                    }`}
                  >
                    <span className="text-3xl mb-1">🌍</span>
                    <span className={`font-bold text-sm ${region === "global" ? "text-blue-600" : "text-slate-600"}`}>Global</span>
                    <span className="text-slate-400 text-xs">Pay in $</span>
                    {region === "global" && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check size={10} strokeWidth={3} className="text-white" />
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => setRegion("domestic")}
                    className={`relative flex flex-col items-center py-4 rounded-2xl border-2 transition-all duration-200 ${
                      region === "domestic"
                        ? "border-orange-500 bg-orange-50"
                        : "border-stone-200 hover:border-stone-300 bg-white"
                    }`}
                  >
                    <span className="text-3xl mb-1">🇮🇳</span>
                    <span className={`font-bold text-sm ${region === "domestic" ? "text-orange-600" : "text-slate-600"}`}>India</span>
                    <span className="text-slate-400 text-xs">Pay in ₹</span>
                    {region === "domestic" && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                        <Check size={10} strokeWidth={3} className="text-white" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Payment */}
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check size={32} className="text-green-500 stroke-[2.5]" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">You&apos;re in!</h3>
                    <p className="text-slate-500">Redirecting to your guide...</p>
                  </motion.div>
                ) : (
                  <motion.div key="pay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {region === "global" ? (
                      <div className="w-full">
                        <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "AZH2zZoIp8p5E-_4wO5wPnBZL8r0OxYtNu1eX6pjl6xMN_GyIaInlW5frraQ8Tq7a2BhKfVavI1rpI5F", currency: "USD" }}>
                          <PayPalButtons
                            style={{ layout: "vertical", color: "gold", shape: "rect", label: "checkout", height: 50 }}
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
                            onApprove={async (data) => {
                              try {
                                setIsProcessing(true);
                                const res = await fetch("/api/paypal/capture-order", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ orderId: data.orderID }),
                                });
                                const captureData = await res.json();
                                if (captureData.success) handlePaymentSuccess();
                                else throw new Error("Payment capture failed");
                              } catch (e: any) {
                                alert(e.message);
                              } finally {
                                setIsProcessing(false);
                              }
                            }}
                            onError={() => { alert("PayPal payment failed or was cancelled."); setIsProcessing(false); }}
                          />
                        </PayPalScriptProvider>
                      </div>
                    ) : (
                      <button
                        onClick={handleRazorpay}
                        disabled={isProcessing}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-heading text-lg font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 shadow-lg shadow-orange-200 hover:-translate-y-0.5 group"
                      >
                        {isProcessing ? "Processing…" : (
                          <>
                            Download Full Guide
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-center text-slate-400 text-xs">
                Instant PDF download · Secure payment · 24 × 7 support on WhatsApp & call
              </p>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Check, ChevronRight, Phone } from "lucide-react";

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

const guidePreviewLines = [
  "Day 1 — Delhi: Red Fort → Chandni Chowk → Jama Masjid",
  "Morning: Arrive, check in, chai at the local stall",
  "10:00 AM  Red Fort — skip the tourist entrance, use Gate 3",
  "12:30 PM  Chandni Chowk street food walk (safe picks inside)",
  "→  Parathewali Gali: order the aloo-methi, avoid the lassi stalls",
  "→  Karim's: sit upstairs, not the ground floor",
  "3:00 PM  Jama Masjid — dress code tip, best rooftop view",
  "Evening: Connaught Place → night market",
  "",
  "Day 2 — Agra: Taj Mahal → Agra Fort → Fatehpur Sikri",
  "05:30 AM  Leave Delhi — train SHT 12002 (book 2A class)",
  "07:45 AM  Arrive Agra Cantt — share auto to East Gate",
  "08:00 AM  Taj Mahal — arrive before 9 AM to beat crowds",
  "→  Photography spot: bench left of the central pool",
  "→  Don't buy the 'official' guide at gate — it's a scam",
  "11:00 AM  Agra Fort — 1.5 hrs enough",
  "2:00 PM  Fatehpur Sikri — 45 min drive, absolutely worth it",
  "",
  "Day 3 — Jaipur: Amber Fort → City Palace → Hawa Mahal",
  "Scam alert: Gem shops near Hawa Mahal will approach you...",
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
    <div className="min-h-screen bg-[#0c0c0e] font-sans pt-16">

      {/* ── Hero ── */}
      <section className="relative h-[92vh] min-h-[620px] w-full flex items-end justify-center overflow-hidden pb-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="/agra_cover.png"
            alt="All India Tour"
            fill
            className="object-cover"
            priority
          />
          {/* layered gradient: dark bottom heavy, slight top */}
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

      {/* ── Checklist ── */}
      <section className="py-20 px-4 bg-[#0c0c0e]">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">What's inside</h2>
            <p className="text-slate-500 text-sm">Everything a local would tell you — and nothing else.</p>
          </motion.div>

          <div className="flex flex-col gap-4">
            {checklist.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group flex items-start gap-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] rounded-2xl px-6 py-5 transition-all duration-300"
              >
                {/* emoji badge */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-2xl">
                  {item.emoji}
                </div>
                {/* text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-semibold text-base">{item.title}</span>
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

      {/* ── Guide Preview + Blur Gate ── */}
      <section className="px-4 pb-0 bg-[#0c0c0e]">
        <div className="max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-slate-500 text-xs tracking-widest uppercase mb-4"
          >
            Preview — first few pages
          </motion.p>

          {/* guide content card */}
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#13131a]">
            {/* visible top portion */}
            <div className="px-6 pt-6 pb-0 font-mono text-sm leading-relaxed">
              {guidePreviewLines.slice(0, 8).map((line, i) => (
                <p
                  key={i}
                  className={`py-0.5 ${
                    line === ""
                      ? "h-3"
                      : line.startsWith("Day")
                      ? "text-orange-400 font-bold mt-2"
                      : line.startsWith("→")
                      ? "text-slate-400 pl-4"
                      : line.match(/^\d/)
                      ? "text-slate-300"
                      : "text-slate-500"
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>

            {/* blurred / locked rest */}
            <div className="relative">
              <div className="px-6 pt-0 pb-6 font-mono text-sm leading-relaxed select-none pointer-events-none">
                {guidePreviewLines.slice(8).map((line, i) => (
                  <p
                    key={i}
                    className={`py-0.5 ${
                      line === ""
                        ? "h-3"
                        : line.startsWith("Day")
                        ? "text-orange-400 font-bold mt-2"
                        : line.startsWith("→")
                        ? "text-slate-400 pl-4"
                        : line.match(/^\d/)
                        ? "text-slate-300"
                        : "text-slate-500"
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>
              {/* blur overlay — fades from transparent at top to solid at bottom */}
              <div className="absolute inset-0 backdrop-blur-[6px] bg-[#13131a]/40"
                style={{ maskImage: "linear-gradient(to bottom, transparent 0%, #000 35%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 35%)" }}
              />
            </div>

            {/* top-to-blur gradient bridge inside the card */}
            <div className="absolute left-0 right-0 h-28 pointer-events-none"
              style={{ top: "calc(8 * 1.75rem + 1.5rem)" }}
            >
              <div className="h-full bg-gradient-to-b from-transparent to-[#13131a]/80" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Download CTA ── */}
      <section id="checkout" className="pt-0 pb-24 px-4 bg-[#0c0c0e]">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-8 rounded-3xl overflow-hidden border border-white/[0.08] bg-[#13131a] shadow-2xl"
          >
            {/* price header */}
            <div className="bg-gradient-to-r from-orange-600/20 to-orange-500/10 border-b border-white/[0.07] px-8 py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Instant PDF · Lifetime access</p>
                <p className="text-white font-bold text-2xl font-heading">
                  Download Full Guide
                </p>
              </div>
              <div className="text-right">
                <span className="text-slate-500 line-through text-lg mr-2">
                  {region === "global" ? "$39" : "₹3,250"}
                </span>
                <span className="text-white font-bold text-4xl font-heading">
                  {region === "global" ? `$${FINAL_PRICE_USD}` : `₹${FINAL_PRICE_INR}`}
                </span>
              </div>
            </div>

            <div className="px-8 py-8 space-y-6">
              {/* support callout */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] font-semibold rounded-xl py-3.5 px-5 transition-all duration-200 text-sm"
                >
                  {/* WhatsApp icon */}
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp support
                </a>
                <a
                  href={`tel:${PHONE_NUMBER}`}
                  className="flex-1 flex items-center justify-center gap-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 font-semibold rounded-xl py-3.5 px-5 transition-all duration-200 text-sm"
                >
                  <Phone size={18} className="flex-shrink-0" />
                  24 × 7 call / text
                </a>
              </div>

              {/* region selector */}
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-widest mb-3 text-center">Select your region</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setRegion("global")}
                    className={`relative flex flex-col items-center py-4 rounded-2xl border-2 transition-all duration-200 ${
                      region === "global"
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <span className="text-3xl mb-1">🌍</span>
                    <span className={`font-bold text-sm ${region === "global" ? "text-blue-400" : "text-slate-400"}`}>Global</span>
                    <span className="text-slate-600 text-xs">Pay in $</span>
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
                        ? "border-orange-500 bg-orange-500/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <span className="text-3xl mb-1">🇮🇳</span>
                    <span className={`font-bold text-sm ${region === "domestic" ? "text-orange-400" : "text-slate-400"}`}>India</span>
                    <span className="text-slate-600 text-xs">Pay in ₹</span>
                    {region === "domestic" && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                        <Check size={10} strokeWidth={3} className="text-white" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* payment */}
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check size={32} className="text-green-400 stroke-[2.5]" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">You&apos;re in!</h3>
                    <p className="text-slate-400">Redirecting to your guide...</p>
                  </motion.div>
                ) : (
                  <motion.div key="pay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {region === "global" ? (
                      <div className="w-full">
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
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-heading text-lg font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 group"
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

              <p className="text-center text-slate-600 text-xs">
                Instant PDF download · Secure payment · 24 × 7 support on WhatsApp & call
              </p>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

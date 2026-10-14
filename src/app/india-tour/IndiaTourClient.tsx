"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Check, ChevronRight, Phone, Lock, Clock, ArrowRight } from "lucide-react";

const WHATSAPP_NUMBER = "918175966910";
const PHONE_NUMBER = "+918175966910";

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
        body: JSON.stringify({ product: "india-tour" }),
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

  const priceLabel = region === "global" ? `$${FINAL_PRICE_USD}` : `₹${FINAL_PRICE_INR}`;
  const compareLabel = region === "global" ? "$39" : "₹3,250";

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Hero: headline, price and buy button above the fold ── */}
      <section className="pt-24 sm:pt-28 pb-12 px-4 bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-8 md:gap-12 items-center">
          <div
            className="text-center md:text-left"
          >
            <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-orange-100 text-orange-700">
              The India Field Guide · 2026 edition
            </span>
            <h1 className="mt-4 text-3xl sm:text-5xl font-bold font-heading text-slate-900 tracking-tight leading-tight">
              All India Tour Guide <span className="text-orange-500">2026</span>
            </h1>
            <p className="mt-3 text-[15px] sm:text-lg text-slate-600 leading-relaxed">
              Incredible. Intense. Absolutely worth it. Delhi, Agra, Jaipur, Udaipur, Varanasi and more — the food, scams and routes a local would brief you on.
            </p>

            <div className="mt-6 flex items-center justify-center md:justify-start gap-3">
              <span className="text-lg text-slate-400 line-through">{compareLabel}</span>
              <span className="text-4xl font-bold font-heading text-slate-900">{priceLabel}</span>
              <span className="rounded-full px-3 py-1 text-xs font-semibold bg-teal-100 text-teal-700">Lifetime access</span>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <a href="#checkout" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors shadow-sm">
                Get the guide — {priceLabel}
                <ChevronRight size={18} />
              </a>
              <a href="#preview" className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-full border border-slate-300 bg-white text-slate-800 font-semibold hover:bg-slate-50 transition-colors">
                Preview the first pages
              </a>
            </div>
          </div>

          <div
            className="relative w-full aspect-[4/3] md:aspect-[4/5] rounded-3xl overflow-hidden border border-slate-200/70 shadow-lg bg-white"
          >
            <Image
              src="/agra_cover.jpg"
              alt="Taj Mahal, Agra — All India Tour Guide"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 420px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── What's inside ── */}
      <section className="py-14 sm:py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-4xl font-bold font-heading text-slate-900 tracking-tight">
              Everything a local would tell you
            </h2>
            <p className="mt-2 text-[15px] text-slate-600">And nothing else.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {checklist.map((item, i) => (
              <div
                key={i}
                className="flex sm:flex-col items-start gap-4 rounded-3xl bg-white border border-slate-200/70 shadow-sm p-4 sm:p-5"
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${["bg-amber-100", "bg-pink-100", "bg-teal-100"][i % 3]}`}>
                  {item.emoji}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold font-heading text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-[15px] text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Guide Preview ── */}
      <section id="preview" className="scroll-mt-20 px-4 py-14 sm:py-20 bg-amber-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-sky-100 text-sky-700">Preview — first few pages</span>
            <h2 className="mt-3 text-2xl sm:text-4xl font-bold font-heading text-slate-900 tracking-tight">
              See what&apos;s waiting for you
            </h2>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-slate-200/70 shadow-sm bg-white">
            <div className="px-5 sm:px-8 py-3 border-b border-slate-100 bg-orange-50/60">
              <p className="text-xs font-semibold text-orange-700">All India Tour Guide 2026</p>
            </div>

            <div className="px-5 sm:px-8 pt-6 pb-0">
              {previewDays.map((day, di) => (
                <div key={di} className={di > 0 ? "mt-8" : ""}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
                    <span className="self-start rounded-full px-3 py-1 text-xs font-semibold bg-orange-500 text-white">
                      {day.day}
                    </span>
                    <h3 className="text-slate-900 font-semibold font-heading text-base sm:text-lg flex flex-wrap items-center gap-x-1.5 gap-y-1">
                      {day.route.split(" → ").map((city, ci, arr) => (
                        <span key={ci} className="inline-flex items-center gap-1.5">
                          {city}
                          {ci < arr.length - 1 && (
                            <ArrowRight size={14} className="text-orange-400 flex-shrink-0" />
                          )}
                        </span>
                      ))}
                    </h3>
                  </div>

                  <div className="space-y-3 pl-3 border-l-2 border-orange-100">
                    {day.entries.map((entry, ei) => (
                      <div key={ei}>
                        {entry.type === "time" && (
                          <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                            <span className="self-start flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5">
                              <Clock size={11} />
                              {entry.time}
                            </span>
                            <p className="text-slate-700 text-[15px] leading-relaxed">{entry.text}</p>
                          </div>
                        )}
                        {entry.type === "tip" && (
                          <div className="flex items-start gap-2">
                            <ArrowRight size={14} className="text-teal-600 flex-shrink-0 mt-1" />
                            <p className="text-slate-600 text-[15px] leading-relaxed">{entry.text}</p>
                          </div>
                        )}
                        {entry.type === "note" && (
                          <p className="text-slate-500 text-[15px] italic">{entry.text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Faded locked content */}
              <div className="relative mt-8">
                <div className="select-none pointer-events-none opacity-70" aria-hidden="true">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
                    <span className="self-start rounded-full px-3 py-1 text-xs font-semibold bg-orange-500 text-white">Day 3</span>
                    <h3 className="text-slate-900 font-semibold font-heading text-base">
                      Jaipur: Amber Fort → City Palace → Hawa Mahal
                    </h3>
                  </div>
                  <div className="space-y-2 pl-3 border-l-2 border-orange-100">
                    {["06:00 AM · Depart for Jaipur — 5 hr drive or train", "Scam alert: Gem shops near Hawa Mahal will approach you...", "City Palace ticket includes audio guide — worth it", "Amber Fort: hire an elephant or walk the ramp"].map((text, i) => (
                      <p key={i} className="text-slate-700 text-[15px]">{text}</p>
                    ))}
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/80 to-white" />
                <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center gap-2 px-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Lock size={18} className="text-orange-600" />
                  </div>
                  <p className="text-slate-600 text-sm font-medium">The rest of the routes + every destination chapter unlock with the full guide</p>
                </div>
              </div>
              <div className="h-20" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Checkout ── */}
      <section id="checkout" className="scroll-mt-20 py-14 sm:py-20 px-4 bg-orange-50/60">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-4xl font-bold font-heading text-slate-900 tracking-tight">Get the full guide</h2>
            <p className="mt-2 text-[15px] text-slate-600">Instant access right after payment</p>
          </div>

          <div className="rounded-3xl overflow-hidden border border-slate-200/70 bg-white shadow-sm">
            <div className="px-6 pt-6 pb-5 text-center border-b border-slate-100 bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
              <p className="text-sm font-medium text-slate-500">All India Tour Guide 2026</p>
              <div className="mt-1 flex items-baseline justify-center gap-3">
                <span className="text-xl text-slate-400 line-through">{compareLabel}</span>
                <span className="text-5xl font-bold font-heading text-slate-900">{priceLabel}</span>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* Region selector */}
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-2">Where are you paying from?</p>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-slate-100">
                  <button
                    onClick={() => setRegion("global")}
                    className={`h-11 rounded-full text-sm font-semibold transition-colors ${region === "global" ? "bg-white text-sky-600 shadow-sm" : "text-slate-600"}`}
                  >
                    🌍 Global · $
                  </button>
                  <button
                    onClick={() => setRegion("domestic")}
                    className={`h-11 rounded-full text-sm font-semibold transition-colors ${region === "domestic" ? "bg-white text-orange-600 shadow-sm" : "text-slate-600"}`}
                  >
                    🇮🇳 India · ₹
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
                    className="text-center py-6"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check size={32} className="text-green-600 stroke-[2.5]" />
                    </div>
                    <h3 className="text-2xl font-bold font-heading text-slate-900 mb-2">You&apos;re in!</h3>
                    <p className="text-[15px] text-slate-600">Redirecting to your guide...</p>
                  </motion.div>
                ) : (
                  <motion.div key="pay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {region === "global" ? (
                      <div className="w-full">
                        <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "AZH2zZoIp8p5E-_4wO5wPnBZL8r0OxYtNu1eX6pjl6xMN_GyIaInlW5frraQ8Tq7a2BhKfVavI1rpI5F", currency: "USD" }}>
                          <PayPalButtons
                            style={{ layout: "vertical", color: "gold", shape: "pill", label: "checkout", height: 48 }}
                            createOrder={async () => {
                              const res = await fetch("/api/paypal/create-order", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ product: "india-tour" }),
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
                        className="w-full h-12 px-6 rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold inline-flex items-center justify-center gap-2 transition-colors shadow-sm"
                      >
                        {isProcessing ? "Processing…" : (
                          <>
                            Pay {priceLabel} &amp; get the guide
                            <ChevronRight size={18} />
                          </>
                        )}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Support */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 inline-flex items-center justify-center gap-2 rounded-full bg-green-50 border border-green-200 text-green-700 text-sm font-semibold hover:bg-green-100 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
                <a
                  href={`tel:${PHONE_NUMBER}`}
                  className="h-11 inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  <Phone size={16} className="flex-shrink-0" />
                  Call / text
                </a>
              </div>

              <p className="text-center text-slate-500 text-xs">
                Instant access · Secure payment · Support on WhatsApp &amp; call: +91 81759 66910
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

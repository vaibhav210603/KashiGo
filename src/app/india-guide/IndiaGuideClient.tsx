"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Check, Phone, X, ChevronRight, ArrowLeft } from "lucide-react";
import GuideHero from "./components/GuideHero";
import ProgressBar from "./components/ProgressBar";
import TableOfContents from "./components/TableOfContents";
import WelcomeSection from "./components/WelcomeSection";
import EssentialsSection from "./components/EssentialsSection";
import HealthSafetySection from "./components/HealthSafetySection";
import ScamShield from "./components/ScamShield";
import RoutePlanner from "./components/RoutePlanner";
import Destinations from "./components/Destinations";

const WHATSAPP_NUMBER = "919999999999";
const PHONE_NUMBER = "+919999999999";
const FINAL_PRICE_INR = 2374;
const FINAL_PRICE_USD = 29;

type ModalStep = "info" | "pay";

interface UserInfo {
  name: string;
  email: string;
  phone: string;
}

export default function IndiaGuideClient() {
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>("info");
  const [region, setRegion] = useState<"global" | "domestic">("global");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Partial<UserInfo>>({});

  const openModal = () => {
    setModalStep("info");
    setIsSuccess(false);
    setShowModal(true);
  };

  const validateInfo = () => {
    const e: Partial<UserInfo> = {};
    if (!userInfo.name.trim()) e.name = "Required";
    if (!userInfo.email.trim() || !/\S+@\S+\.\S+/.test(userInfo.email)) e.email = "Valid email required";
    if (!userInfo.phone.trim()) e.phone = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleInfoNext = () => {
    if (validateInfo()) setModalStep("pay");
  };

  const sendGuideEmail = async (paymentId: string) => {
    try {
      await fetch("/api/india-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userInfo, paymentId, region, amount: region === "global" ? FINAL_PRICE_USD : FINAL_PRICE_INR }),
      });
    } catch (e) {
      console.error("Email send failed:", e);
    }
  };

  const handleSuccess = async (paymentId: string) => {
    await sendGuideEmail(paymentId);
    setIsSuccess(true);
    setTimeout(() => {
      setShowModal(false);
      setHasPaid(true);
    }, 2200);
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
        name: "KashiGo",
        description: "India Tour Guide 2026",
        order_id: orderData.orderId,
        prefill: { name: userInfo.name, email: userInfo.email, contact: userInfo.phone },
        theme: { color: "#f97316" },
        handler: async function (response: any) {
          if (response.razorpay_payment_id) {
            await handleSuccess(response.razorpay_payment_id);
          }
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

  if (hasPaid) {
    return (
      <div className="bg-white min-h-screen font-sans">
        <ProgressBar />
        <div className="fixed bottom-8 right-6 md:top-24 md:bottom-auto z-[90]">
          <button
            onClick={() => setIsTocOpen(true)}
            className="bg-slate-900 text-white font-bold font-heading px-6 py-3 rounded-full shadow-2xl hover:bg-orange-500 hover:scale-105 transition-all flex items-center gap-2"
          >
            <span>📑</span> Contents
          </button>
        </div>
        <TableOfContents isOpen={isTocOpen} onClose={() => setIsTocOpen(false)} />
        <GuideHero onBuy={() => {}} />
        <WelcomeSection />
        <EssentialsSection />
        <HealthSafetySection />
        <ScamShield />
        <RoutePlanner />
        <Destinations />
        <section className="bg-slate-900 text-center py-24 border-t border-slate-800">
          <div className="max-w-2xl mx-auto px-6">
            <p className="font-mono text-xs tracking-[0.2em] text-orange-500 uppercase mb-4">One Last Thing</p>
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-white mb-6">Go. Seriously — go.</h2>
            <p className="text-lg text-slate-300 mb-8 font-sans">
              No guide can fully prepare you for India, and that's the magic of it. You'll be overwhelmed, then enchanted, then changed.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-[#0c0c0e] min-h-screen font-sans">
      {/* Hero — always visible */}
      <GuideHero onBuy={openModal} />

      {/* Blurred guide preview */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none select-none opacity-60 blur-[3px] scale-[0.98]">
          <WelcomeSection />
        </div>
        {/* paywall overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c0c0e]/70 to-[#0c0c0e]" />
      </section>

      {/* Paywall CTA */}
      <section className="py-20 px-4 bg-[#0c0c0e]">
        <div className="max-w-xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-3xl">
              🔒
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 font-heading">
            The rest is locked
          </h2>
          <p className="text-slate-500 text-base mb-8 leading-relaxed">
            Scam shields, safe food zones, city routes, health essentials — all inside. One payment, lifetime access. Guide sent instantly to your email.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-6">
            <span className="text-slate-600 line-through text-lg">
              {region === "global" ? "$39" : "₹3,250"}
            </span>
            <span className="text-white font-bold text-4xl font-heading">
              {region === "global" ? `$${FINAL_PRICE_USD}` : `₹${FINAL_PRICE_INR}`}
            </span>
          </div>

          <button
            onClick={openModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-bold font-heading px-10 py-5 rounded-full transition-all shadow-xl shadow-orange-500/20 text-lg hover:-translate-y-0.5"
          >
            Unlock Full Guide
            <ChevronRight size={20} />
          </button>

          <div className="mt-6 flex justify-center gap-5">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#25D366] text-sm hover:underline"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp support
            </a>
            <a href={`tel:${PHONE_NUMBER}`} className="flex items-center gap-2 text-slate-400 text-sm hover:text-white transition-colors">
              <Phone size={14} />
              24×7 call / text
            </a>
          </div>
        </div>
      </section>

      {/* ── Payment modal ── */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setShowModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            />

            {/* sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[101] bg-[#13131a] border-t border-white/[0.08] rounded-t-3xl max-h-[92vh] overflow-y-auto"
            >
              {/* handle */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              <div className="px-6 pb-10 pt-2 max-w-lg mx-auto">

                {/* close */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    {modalStep === "pay" && (
                      <button onClick={() => setModalStep("info")} className="text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={18} />
                      </button>
                    )}
                    <h3 className="text-white font-bold text-lg font-heading">
                      {modalStep === "info" ? "Your details" : "Complete purchase"}
                    </h3>
                  </div>
                  <button onClick={() => !isProcessing && setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <AnimatePresence mode="wait">

                  {/* ── Step 1: Info ── */}
                  {modalStep === "info" && (
                    <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <p className="text-slate-500 text-sm mb-5">We'll send the guide to your email right after payment.</p>

                      {/* Name */}
                      <div>
                        <label className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1.5">Full name</label>
                        <input
                          type="text"
                          value={userInfo.name}
                          onChange={e => { setUserInfo(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: "" })); }}
                          placeholder="Jane Smith"
                          className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3.5 text-white placeholder-slate-600 text-sm outline-none focus:border-orange-500 transition-colors ${errors.name ? "border-red-500/60" : "border-white/10"}`}
                        />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1.5">Email address</label>
                        <input
                          type="email"
                          value={userInfo.email}
                          onChange={e => { setUserInfo(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: "" })); }}
                          placeholder="jane@example.com"
                          className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3.5 text-white placeholder-slate-600 text-sm outline-none focus:border-orange-500 transition-colors ${errors.email ? "border-red-500/60" : "border-white/10"}`}
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1.5">Phone / WhatsApp</label>
                        <input
                          type="tel"
                          value={userInfo.phone}
                          onChange={e => { setUserInfo(p => ({ ...p, phone: e.target.value })); setErrors(p => ({ ...p, phone: "" })); }}
                          placeholder="+1 555 000 0000"
                          className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3.5 text-white placeholder-slate-600 text-sm outline-none focus:border-orange-500 transition-colors ${errors.phone ? "border-red-500/60" : "border-white/10"}`}
                        />
                        {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                      </div>

                      <button
                        onClick={handleInfoNext}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold font-heading py-4 rounded-2xl flex items-center justify-center gap-2 transition-all mt-2 shadow-lg shadow-orange-500/20"
                      >
                        Continue to payment <ChevronRight size={18} />
                      </button>
                    </motion.div>
                  )}

                  {/* ── Step 2: Payment ── */}
                  {modalStep === "pay" && (
                    <motion.div key="pay" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">

                      {isSuccess ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check size={32} className="text-green-400 stroke-[2.5]" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2 font-heading">You're in!</h3>
                          <p className="text-slate-400 text-sm">Guide sent to <span className="text-white font-medium">{userInfo.email}</span>. Unlocking now…</p>
                        </motion.div>
                      ) : (
                        <>
                          {/* price summary */}
                          <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl px-5 py-4 flex items-center justify-between">
                            <div>
                              <p className="text-slate-500 text-xs uppercase tracking-widest">All India Tour Guide 2026</p>
                              <p className="text-white font-bold text-xl font-heading mt-0.5">
                                {region === "global" ? `$${FINAL_PRICE_USD}` : `₹${FINAL_PRICE_INR}`}
                              </p>
                            </div>
                            <span className="text-slate-500 line-through text-sm">
                              {region === "global" ? "$39" : "₹3,250"}
                            </span>
                          </div>

                          {/* region */}
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => setRegion("global")}
                              className={`relative flex flex-col items-center py-3.5 rounded-2xl border-2 transition-all ${region === "global" ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/20"}`}
                            >
                              <span className="text-2xl mb-1">🌍</span>
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
                              className={`relative flex flex-col items-center py-3.5 rounded-2xl border-2 transition-all ${region === "domestic" ? "border-orange-500 bg-orange-500/10" : "border-white/10 hover:border-white/20"}`}
                            >
                              <span className="text-2xl mb-1">🇮🇳</span>
                              <span className={`font-bold text-sm ${region === "domestic" ? "text-orange-400" : "text-slate-400"}`}>India</span>
                              <span className="text-slate-600 text-xs">Pay in ₹</span>
                              {region === "domestic" && (
                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                  <Check size={10} strokeWidth={3} className="text-white" />
                                </div>
                              )}
                            </button>
                          </div>

                          {/* payment button */}
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
                                      if (captureData.success) await handleSuccess(data.orderID);
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
                              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-heading text-lg font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 group"
                            >
                              {isProcessing ? "Processing…" : (
                                <>Pay with Razorpay <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                              )}
                            </button>
                          )}

                          <p className="text-center text-slate-600 text-xs">
                            Secure payment · Instant PDF to your email · 24×7 support
                          </p>
                        </>
                      )}
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

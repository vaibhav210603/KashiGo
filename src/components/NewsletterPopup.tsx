"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, MapPin, Loader2, Sparkles } from "lucide-react";

const STORAGE_KEY = "kashigo_newsletter_dismissed";

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/email-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setStatus("success");
      localStorage.setItem(STORAGE_KEY, "1");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to subscribe. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={dismiss}
            aria-hidden
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="newsletter-title"
          >
            <div className="relative w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl shadow-black/70 border border-white/10 overflow-hidden">

              {/* Glow accents */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/8 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none" />

              {/* Close */}
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={15} />
              </button>

              {status === "success" ? (
                <div className="relative z-10 text-center px-8 py-12">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={30} className="text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 font-heading">You&apos;re protected!</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Your 5 Scam Shields + top Varanasi spots are headed to your inbox. Travel smart.
                  </p>
                  <button
                    onClick={dismiss}
                    className="mt-6 text-slate-500 hover:text-slate-400 text-xs transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="relative z-10 px-7 py-7">

                  {/* Badge */}
                  <div className="inline-flex items-center gap-1.5 bg-orange-500/15 border border-orange-500/25 text-orange-400 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                    <Sparkles size={10} />
                    Free · No credit card
                  </div>

                  <h2 id="newsletter-title" className="text-white font-heading font-bold text-2xl leading-tight mb-2">
                    Travel Varanasi<br />
                    <span className="text-orange-400">without getting scammed.</span>
                  </h2>

                  <p className="text-slate-400 text-sm mb-5 leading-relaxed">
                    Free from a local born in Varanasi: the scams, the real prices and the moves that beat them — before you land.
                  </p>

                  {/* Benefits */}
                  <ul className="space-y-2.5 mb-6">
                    {[
                      { icon: ShieldCheck, text: "5 mini scam shields every traveler needs" },
                      { icon: MapPin,      text: "Top hidden & must-see places in Varanasi" },
                      { icon: ShieldCheck, text: "Boat ride secrets locals won't tell you" },
                    ].map(({ icon: Icon, text }) => (
                      <li key={text} className="flex items-center gap-2.5 text-slate-300 text-sm">
                        <Icon size={14} className="text-orange-400 shrink-0" />
                        {text}
                      </li>
                    ))}
                  </ul>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="Your first name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    />
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    />

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                    >
                      {status === "loading" ? (
                        <><Loader2 size={16} className="animate-spin" /> Sending...</>
                      ) : (
                        "Send me the Scam Shields →"
                      )}
                    </button>
                  </form>

                  {status === "error" && (
                    <p className="text-red-400 text-xs mt-2 text-center">{errorMsg}</p>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <p className="text-slate-600 text-[11px]">No spam. Unsubscribe anytime.</p>
                    <button
                      onClick={dismiss}
                      className="text-slate-600 hover:text-slate-400 text-[11px] transition-colors"
                    >
                      Not now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

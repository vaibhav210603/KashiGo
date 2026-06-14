"use client";

import { useState, useEffect } from "react";
import { X, Mail, ShieldCheck, Loader2 } from "lucide-react";

const STORAGE_KEY = "kashigo_popup_dismissed";

export default function BlogEmailPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) return;

    let triggered = false;

    const trigger = () => {
      if (!triggered) {
        triggered = true;
        setVisible(true);
      }
    };

    // Trigger on scroll past 50% of page
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (scrolled / total > 0.5) trigger();
    };

    // Trigger after 35 seconds regardless
    const timer = setTimeout(trigger, 35000);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Something went wrong");
      }

      setStatus("success");
      localStorage.setItem(STORAGE_KEY, "1");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Failed to subscribe. Please try again.");
    }
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Popup */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] w-[calc(100%-2rem)] max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-700 relative overflow-hidden">
          {/* Glow accents */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] -ml-16 -mb-16 pointer-events-none" />

          {/* Close */}
          <button
            onClick={dismiss}
            aria-label="Close"
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-700"
          >
            <X size={18} />
          </button>

          {status === "success" ? (
            <div className="text-center py-4 relative z-10">
              <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={28} className="text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-heading">You're in!</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Check your inbox — your free Varanasi Safety Checklist is on its way.
              </p>
            </div>
          ) : (
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <Mail size={20} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-orange-400 text-[10px] font-bold uppercase tracking-[0.2em]">Free for readers</p>
                  <h2 id="popup-title" className="text-white font-bold font-heading text-lg leading-tight">
                    Get the Varanasi Safety Checklist
                  </h2>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {[
                  "9 scam tactics locals use — and how to dodge them",
                  "The ghats you must visit (and ones to avoid at night)",
                  "A ready-to-use 2-day Varanasi itinerary",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-slate-300 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-[0.45rem] shrink-0 shadow-[0_0_6px_rgba(249,115,22,0.5)]" />
                    {item}
                  </li>
                ))}
              </ul>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-orange-500/20"
                >
                  {status === "loading" ? (
                    <><Loader2 size={16} className="animate-spin" /> Sending...</>
                  ) : (
                    "Send it free"
                  )}
                </button>
              </form>

              {status === "error" && (
                <p className="text-red-400 text-xs mt-2">{errorMsg}</p>
              )}

              <p className="text-slate-600 text-[11px] mt-3 text-center">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

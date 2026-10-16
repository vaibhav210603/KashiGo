"use client";

import { useState, useEffect } from "react";
import { X, Mail, ShieldCheck, Loader2 } from "lucide-react";
import { track } from "@/lib/analytics";

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

      track("generate_lead", { lead_source: "blog_newsletter" });
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
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[60]"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Popup */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-[70] w-[calc(100%-2rem)] max-w-lg max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/70 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-pink-500" aria-hidden="true" />

          {/* Close */}
          <button
            onClick={dismiss}
            aria-label="Close"
            className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100"
          >
            <X size={20} />
          </button>

          {status === "success" ? (
            <div className="text-center py-4 relative z-10">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={28} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-heading">You're in!</h3>
              <p className="text-slate-600 text-[15px] leading-relaxed">
                Check your inbox — your free Varanasi Safety Checklist is on its way.
              </p>
            </div>
          ) : (
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5 pr-10">
                <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
                  <Mail size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-orange-600 text-xs font-semibold">Free for readers</p>
                  <h2 id="popup-title" className="text-slate-900 font-bold font-heading text-lg leading-tight">
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
                  <li key={item} className="flex items-start gap-2.5 text-slate-600 text-[15px] leading-snug">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-[0.5rem] shrink-0" />
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
                  className="flex-1 min-w-0 h-12 bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-full px-4 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
                >
                  {status === "loading" ? (
                    <><Loader2 size={16} className="animate-spin" /> Sending...</>
                  ) : (
                    "Send it free"
                  )}
                </button>
              </form>

              {status === "error" && (
                <p className="text-red-600 text-xs mt-2">{errorMsg}</p>
              )}

              <p className="text-slate-500 text-xs mt-3 text-center">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

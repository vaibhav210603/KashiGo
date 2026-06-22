"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, ShieldCheck, Map, Compass, ChevronRight } from "lucide-react";

const STORAGE_KEY = "kashigo_guide_popup_dismissed";

export default function GuidePopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[9998]"
            onClick={dismiss}
            aria-hidden
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl shadow-black/70 border border-white/10 overflow-hidden">

              {/* Close */}
              <button
                onClick={dismiss}
                className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={14} />
              </button>

              {/* Content row */}
              <div className="flex gap-0">

                {/* Left: cover image */}
                <div className="relative w-32 flex-shrink-0">
                  <Image
                    src="/og-guide.jpg"
                    alt="Varanasi Travel Guide 2026"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/60" />
                </div>

                {/* Right: content */}
                <div className="flex-1 px-5 py-5">
                  <span className="inline-block text-orange-400 text-xs font-semibold tracking-wide uppercase mb-2">
                    Local&apos;s insider guide · 2026
                  </span>
                  <h2 className="text-white font-heading font-bold text-lg leading-snug mb-3">
                    Don&apos;t get scammed<br />
                    <span className="text-orange-400">in Varanasi.</span>
                  </h2>

                  <ul className="space-y-1.5 mb-4">
                    {[
                      { icon: ShieldCheck, text: "9 scam shields" },
                      { icon: Map,         text: "All 84 Ghats decoded" },
                      { icon: Compass,     text: "2-day local itinerary" },
                    ].map(({ icon: Icon, text }) => (
                      <li key={text} className="flex items-center gap-2 text-slate-300 text-xs">
                        <Icon size={12} className="text-orange-400 flex-shrink-0" />
                        {text}
                      </li>
                    ))}
                  </ul>

                  <Link href="/guide" onClick={dismiss}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
                    >
                      Get the Guide · $13.51
                      <ChevronRight size={14} />
                    </motion.button>
                  </Link>

                  <button
                    onClick={dismiss}
                    className="mt-2.5 w-full text-center text-slate-500 hover:text-slate-400 text-xs transition-colors"
                  >
                    No thanks
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

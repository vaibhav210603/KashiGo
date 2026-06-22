"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const checklist = [
  { emoji: "🍛", label: "Eat well, don't get sick" },
  { emoji: "🛡️", label: "Spot every scam" },
  { emoji: "🗺️", label: "Routes that actually work" },
];

export default function GuideHero() {
  return (
    <section className="relative min-h-[92vh] flex flex-col justify-end items-center bg-slate-900 text-white pb-20 pt-24 overflow-hidden" id="top">
      <div className="absolute inset-0 z-0">
        <Image
          src="/agra_cover.jpg"
          alt="India travel"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/55 to-[#0c0c0e]/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c0e]/50 to-transparent h-32" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-xs md:text-sm tracking-[0.25em] text-orange-400/80 uppercase mb-5"
        >
          The India Field Guide · 2026 Edition · For First-Time Visitors
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold font-heading leading-[0.95] tracking-tight mb-5"
        >
          All India Tour<br />
          <span className="text-orange-500">Guide 2026</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="text-slate-400 text-lg md:text-xl font-light tracking-wide mb-10"
        >
          Incredible.&nbsp;&nbsp;Intense.&nbsp;&nbsp;Absolutely worth it.
        </motion.p>

        {/* aesthetic checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="flex flex-col sm:flex-row justify-center gap-3 mb-12"
        >
          {checklist.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white/[0.06] border border-white/[0.1] backdrop-blur-sm rounded-2xl px-5 py-3.5"
            >
              <span className="w-9 h-9 flex-shrink-0 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-lg">
                {item.emoji}
              </span>
              <span className="text-slate-200 text-sm font-medium">{item.label}</span>
              <span className="ml-auto w-4 h-4 rounded-full bg-orange-500/80 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 10 8" fill="none" className="w-2.5 h-2.5">
                  <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

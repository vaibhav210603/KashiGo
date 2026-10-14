"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const checklist = [
  { emoji: "🍛", label: "Eat well, don't get sick", tint: "bg-amber-100" },
  { emoji: "🛡️", label: "Spot every scam", tint: "bg-pink-100" },
  { emoji: "🗺️", label: "Routes that actually work", tint: "bg-teal-100" },
];

export default function GuideHero() {
  return (
    <section className="pt-24 sm:pt-28 pb-12 px-4 bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50" id="top">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-orange-100 text-orange-700">
            The India Field Guide · 2026 Edition · For first-time visitors
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-bold font-heading text-slate-900 tracking-tight leading-tight">
            All India Tour Guide <span className="text-orange-500">2026</span>
          </h1>
          <p className="mt-3 text-[17px] text-slate-600">
            Incredible. Intense. Absolutely worth it.
          </p>
        </motion.div>

        <div className="relative mt-8 w-full aspect-[16/9] rounded-3xl overflow-hidden border border-slate-200/70 shadow-sm bg-white">
          <Image src="/agra_cover.jpg" alt="India travel" fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {checklist.map((item, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200/70 shadow-sm px-4 py-3 text-left">
              <span className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center text-lg ${item.tint}`}>{item.emoji}</span>
              <span className="text-slate-800 text-[15px] font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

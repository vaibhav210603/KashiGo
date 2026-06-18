"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck, Map, Compass, BookOpen, ChevronRight, Star, Clock } from "lucide-react";

const features = [
  { icon: ShieldCheck, text: "9 scam shields with exact scripts to use" },
  { icon: Map, text: "All 84 Ghats decoded — what to see, what to skip" },
  { icon: Compass, text: "2-day local's itinerary, hour by hour" },
  { icon: BookOpen, text: "Temple etiquette, food safety & dos & don'ts" },
];

const stats = [
  { value: "84", label: "Ghats covered" },
  { value: "9", label: "Scam shields" },
  { value: "2", label: "Day itinerary" },
];

export default function GuideFeatureSection() {
  return (
    <section className="relative py-24 bg-slate-900 overflow-hidden">

      {/* Background image with dark overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src="/sunrise_bg.png"
          alt=""
          fill
          className="object-cover opacity-[0.07]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/40" />
        {/* Decorative glow */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-orange-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 text-orange-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Star size={13} fill="currentColor" />
              Written by a local born in Varanasi
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold font-heading text-white mb-5 leading-[1.1]">
              Navigate Varanasi<br />
              <span className="text-orange-400">Like You Were Born Here</span>
            </h2>

            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              The only Varanasi guide written from the inside. No generic tourism fluff — just street-level knowledge that keeps you safe, saves you money, and makes every moment richer.
            </p>

            {/* Feature list */}
            <ul className="space-y-4 mb-10">
              {features.map(({ icon: Icon, text }, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.09 }}
                  className="flex items-center gap-3 text-slate-200"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <Icon size={15} />
                  </span>
                  <span>{text}</span>
                </motion.li>
              ))}
            </ul>

            {/* Stats row */}
            <div className="flex gap-8 mb-10 pb-10 border-b border-slate-700/60">
              {stats.map(({ value, label }) => (
                <div key={label}>
                  <p className="text-3xl font-bold font-heading text-orange-400">{value}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-5 flex-wrap">
              <Link href="/guide">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-7 py-4 rounded-xl transition-colors text-base shadow-lg shadow-orange-900/30"
                >
                  Get the Guide · $17.56
                  <ChevronRight size={18} />
                </motion.button>
              </Link>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Clock size={14} />
                Instant PDF download
              </div>
            </div>
          </motion.div>

          {/* Right: Book visual */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            {/* Outer glow ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-80 h-80 bg-orange-500/10 rounded-full blur-2xl" />
            </div>

            {/* Book wrapper with tilt */}
            <motion.div
              whileHover={{ rotate: 0, scale: 1.03 }}
              initial={{ rotate: -2 }}
              transition={{ duration: 0.4 }}
              className="relative w-full max-w-sm"
            >
              {/* Shadow book (depth effect) */}
              <div className="absolute top-4 left-4 right-0 bottom-0 bg-orange-900/30 rounded-2xl" />

              {/* Main book cover */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-600/50 shadow-2xl shadow-black/60">
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src="/og-guide.jpg"
                    alt="Varanasi Travel Guide for Foreigners 2026 — by KashiGo"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 90vw, 420px"
                  />
                  {/* Sheen overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none" />
                </div>

                {/* Price badge */}
                <div className="absolute top-4 right-4 bg-orange-500 text-white font-bold text-base px-4 py-1.5 rounded-xl shadow-lg">
                  $13.51
                </div>

                {/* "Instant download" ribbon */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent px-5 py-5">
                  <p className="text-white font-heading font-semibold text-sm">Varanasi Travel Guide 2026</p>
                  <p className="text-slate-300 text-xs mt-0.5">For foreigners · written by a local</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

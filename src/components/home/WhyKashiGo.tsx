"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Counter, Eyebrow, Reveal, SplitWords } from "@/components/motion/primitives";

const EASE = [0.16, 1, 0.3, 1] as const;

const ROWS = [
    { label: "Pricing", without: "Price settled on the spot", with: "Fixed rates, shown before you book" },
    { label: "Payment", without: "Cash handed over on the ghat", with: "All payments online — ₹0 extra on the ground" },
    { label: "Your boat", without: "Whichever boat is free", with: "A clean, private boat just for your group" },
    { label: "Guide", without: "Find your own way around", with: "Professional local guides" },
    { label: "Support", without: "On your own once you board", with: "24/7 support — on the ground and on call" },
    { label: "Booking", without: "Arrange everything in person", with: "Everything online, in a few taps" },
    { label: "Value", without: "Private boats feel out of budget", with: "Affordable prices for private boating" },
];

const STATS = [
    { value: <Counter to={55} duration={2} format={(n) => `${Math.round(n)}+`} />, label: "Rides completed" },
    { value: "24/7", label: "Support, ground & call" },
    { value: "₹0", label: "Extra cash on the ground" },
    { value: "100%", label: "Payments online" },
];

// A side-by-side of booking a boat on your own versus with KashiGo, ticks and crosses landing as it scrolls in.
export default function WhyKashiGo() {
    const reduce = useReducedMotion();
    return (
        <section className="relative bg-parchment pt-24 pb-20 md:pt-36 md:pb-28 overflow-hidden">
            {/* faint mandala-ish rings */}
            <svg aria-hidden viewBox="0 0 400 400" className="pointer-events-none absolute -right-40 -top-20 h-[640px] w-[640px] text-sandstone/25 spin-slow [animation-duration:120s]">
                {Array.from({ length: 8 }, (_, i) => <circle key={i} cx="200" cy="200" r={40 + i * 20} fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray={i % 2 ? "2 6" : "none"} />)}
                {Array.from({ length: 24 }, (_, i) => <line key={i} x1="200" y1="200" x2={200 + 190 * Math.cos((i * Math.PI) / 12)} y2={200 + 190 * Math.sin((i * Math.PI) / 12)} stroke="currentColor" strokeWidth="0.4" />)}
            </svg>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
                <Eyebrow className="text-fire">Why KashiGo</Eyebrow>
                <h2 className="mt-4 max-w-4xl font-display font-light text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.03em] text-night">
                    <SplitWords text="Pay a genuine price" />{" "}
                    <SplitWords text="for comfort." delay={0.2} className="italic" wordClassName={() => "text-fire-deep pr-[0.05em]"} />
                </h2>
                <Reveal delay={0.2}>
                    <p className="mt-6 max-w-xl text-lg text-night/65">Riders loved it — here&apos;s what changes when you book your boat with KashiGo.</p>
                </Reveal>

                {/* Proof strip */}
                <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-3xl bg-night/10">
                    {STATS.map((s, i) => (
                        <motion.div key={s.label} className="bg-parchment px-5 py-6 sm:px-7 sm:py-7"
                            initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                            transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}>
                            <p className="font-display text-4xl sm:text-5xl tracking-tight text-fire-deep">{s.value}</p>
                            <p className="mt-1 text-sm text-night/60">{s.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Comparison */}
                <Reveal y={50} className="mt-10">
                    <div className="relative overflow-hidden rounded-[2rem] bg-white/60 ring-1 ring-night/10 shadow-[0_40px_90px_-40px_rgba(60,30,0,0.35)]">
                        {/* the KashiGo column, lit up */}
                        <div aria-hidden className="absolute inset-y-0 right-0 hidden md:block w-[42%] bg-night grain">
                            <div className="flicker absolute -right-16 -top-20 h-60 w-60 rounded-full bg-fire/35 blur-[80px]" />
                        </div>

                        <div className="relative hidden md:grid grid-cols-[0.7fr_1fr_1.25fr] items-end px-8 pt-8 pb-5">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-night/40">&nbsp;</span>
                            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-night/45">Without KashiGo</span>
                            <span className="pl-8 text-[11px] font-semibold uppercase tracking-[0.3em] text-marigold">With KashiGo</span>
                        </div>

                        <ul className="relative">
                            {ROWS.map((r, i) => (
                                <motion.li key={r.label}
                                    className="grid md:grid-cols-[0.7fr_1fr_1.25fr] items-center gap-3 md:gap-0 border-t border-night/10 md:border-night/[0.07] px-5 py-5 sm:px-8"
                                    initial={reduce ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -12% 0px" }}
                                    transition={{ duration: 0.7, ease: EASE, delay: 0.05 * i }}>
                                    <span className="font-display text-xl text-night">{r.label}</span>

                                    <span className="flex items-start gap-3 text-night/50">
                                        <motion.span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-night/[0.06] text-night/40"
                                            initial={reduce ? false : { scale: 0, rotate: -90 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true, margin: "0px 0px -12% 0px" }}
                                            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.25 + 0.05 * i }}>
                                            <X size={13} strokeWidth={2.5} />
                                        </motion.span>
                                        <span className="text-[15px]">{r.without}</span>
                                    </span>

                                    <span className="flex items-start gap-3 rounded-2xl bg-night md:bg-transparent px-4 py-3 md:px-0 md:py-0 md:pl-8 text-white">
                                        <motion.span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ganga text-night"
                                            initial={reduce ? false : { scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true, margin: "0px 0px -12% 0px" }}
                                            transition={{ type: "spring", stiffness: 380, damping: 14, delay: 0.45 + 0.05 * i }}>
                                            <Check size={14} strokeWidth={3} />
                                        </motion.span>
                                        <span className="text-[15px] font-medium">{r.with}</span>
                                    </span>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

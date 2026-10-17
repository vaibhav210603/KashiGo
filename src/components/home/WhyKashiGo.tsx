"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, X } from "lucide-react";
import { BOAT_PRICES_INR, INR_PER_USD } from "@/lib/boatPrices";
import { money, useCurrency } from "@/lib/currency";
import { Counter, Eyebrow, Reveal, SplitWords } from "@/components/motion/primitives";

const EASE = [0.16, 1, 0.3, 1] as const;

// Price anchoring: show what the ghat-steps experience really costs next to ours.
export default function WhyKashiGo() {
    const reduce = useReducedMotion();
    const [currency] = useCurrency();
    const ghat = [
        `First quote to foreigners: ${currency === "inr" ? "₹3,000–5,000" : `$${Math.round(3000 / INR_PER_USD)}–${Math.round(5000 / INR_PER_USD)}`}`,
        "Price \"changes\" halfway down the river",
        "Life jackets are rare",
        "Middlemen take a 30–50% cut",
    ];
    const us = [
        `Evening Aarti boat: ${money(BOAT_PRICES_INR.p5, currency)} — fixed, shown up front`,
        "Price agreed before you step in",
        "Life jackets on board",
        "Booked directly with a local",
    ];
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
                    <p className="mt-6 max-w-xl text-lg text-night/65">You could bargain on the ghat steps. Here&apos;s what that usually looks like for a first-time visitor.</p>
                </Reveal>

                <div className="mt-14 grid gap-10 md:gap-8 lg:grid-cols-[1fr_1.15fr] items-center">
                    {/* The haggle: a scrappy receipt, slightly askew, the price creeping up */}
                    <Reveal y={50}>
                        <div className="relative mx-auto max-w-md -rotate-2 bg-[#fffaf0] px-7 pt-8 pb-10 shadow-[0_30px_60px_-30px_rgba(60,30,0,0.45)] [clip-path:polygon(0_0,100%_0,100%_96%,95%_100%,90%_96%,85%_100%,80%_96%,75%_100%,70%_96%,65%_100%,60%_96%,55%_100%,50%_96%,45%_100%,40%_96%,35%_100%,30%_96%,25%_100%,20%_96%,15%_100%,10%_96%,5%_100%,0_96%)]">
                            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-night/40">Haggling at the ghat</p>
                            <p className="mt-3 font-mono text-sm text-night/50">Quoted price</p>
                            <p className="font-display text-6xl tracking-tight text-ember">
                                {currency === "inr"
                                    ? <>₹<Counter key="inr" from={1500} to={5000} duration={2.6} /></>
                                    : <>$<Counter key="usd" from={1500 / INR_PER_USD} to={5000 / INR_PER_USD} duration={2.6} format={(n) => String(Math.round(n))} /></>}
                                <span className="ml-1 align-top text-2xl">*</span>
                            </p>
                            <p className="font-mono text-[11px] text-night/40">*subject to change mid-river</p>
                            <ul className="mt-6 space-y-3 border-t border-dashed border-night/20 pt-5">
                                {ghat.map((t, i) => (
                                    <li key={t} className="relative flex gap-3 font-mono text-[13px] text-night/70">
                                        <X size={16} className="mt-0.5 shrink-0 text-ember" />
                                        <span className="relative">
                                            {t}
                                            <motion.span aria-hidden className="absolute left-0 top-1/2 h-[1.5px] w-full origin-left bg-ember/70"
                                                initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, margin: "0px 0px -20% 0px" }}
                                                transition={{ duration: 0.6, ease: EASE, delay: 0.8 + i * 0.25 }} />
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Reveal>

                    {/* KashiGo: a clean boarding pass for the boat */}
                    <Reveal y={50} delay={0.15}>
                        <div className="relative mx-auto max-w-xl rotate-1 overflow-hidden rounded-[2rem] bg-night text-white shadow-[0_40px_90px_-30px_rgba(7,11,24,0.7)] grain">
                            <div aria-hidden className="flicker absolute -right-16 -top-20 h-60 w-60 rounded-full bg-fire/40 blur-[80px]" />
                            <div className="relative grid sm:grid-cols-[1fr_auto]">
                                <div className="p-7 sm:p-8">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-marigold">Booking with KashiGo</p>
                                        <p className="font-mono text-[11px] text-white/40">BOARDING PASS</p>
                                    </div>
                                    <div className="mt-6 flex items-end gap-4">
                                        <div>
                                            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">From</p>
                                            <p className="font-display text-2xl">Your ghat</p>
                                        </div>
                                        <svg viewBox="0 0 120 20" className="mb-2 h-4 flex-1 text-marigold/70" aria-hidden><path d="M0 10 q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" /></svg>
                                        <div className="text-right">
                                            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">To</p>
                                            <p className="font-display text-2xl italic text-fire">The Aarti</p>
                                        </div>
                                    </div>
                                    <ul className="mt-7 space-y-3">
                                        {us.map((t, i) => (
                                            <motion.li key={t} className="flex gap-3 text-white/85"
                                                initial={reduce ? false : { opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                                                transition={{ duration: 0.7, ease: EASE, delay: 0.5 + i * 0.12 }}>
                                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ganga/20 text-ganga"><Check size={13} strokeWidth={3} /></span>
                                                {t}
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                                {/* stub, separated by a perforation */}
                                <div className="relative flex sm:flex-col items-center justify-between gap-4 border-t sm:border-t-0 sm:border-l border-dashed border-white/20 p-7 sm:p-8 sm:w-44">
                                    <span aria-hidden className="absolute -left-3 -top-3 hidden sm:block h-6 w-6 rounded-full bg-parchment" />
                                    <span aria-hidden className="absolute -left-3 -bottom-3 hidden sm:block h-6 w-6 rounded-full bg-parchment" />
                                    <div className="sm:text-center">
                                        <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Fixed fare</p>
                                        <p className="font-display text-4xl text-marigold">{money(BOAT_PRICES_INR.p5, currency)}</p>
                                        <p className="text-[11px] text-white/50">whole boat</p>
                                    </div>
                                    {/* faux barcode */}
                                    <div aria-hidden className="flex h-12 items-end gap-[2px]">
                                        {[3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3, 1].map((wd, i) => <span key={i} className="h-full bg-white/70" style={{ width: wd }} />)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useSpring, useMotionValueEvent, useTransform, useReducedMotion } from "framer-motion";
import { MousePointerClick, Wallet, Sailboat } from "lucide-react";
import { Eyebrow, SplitWords } from "@/components/motion/primitives";

const STEPS = [
    { icon: MousePointerClick, title: "Pick ride & date", text: "Takes about a minute. Today or up to a week ahead." },
    { icon: Wallet, title: "Pay how you like", text: "UPI, card or PayPal now — or pay at the ghat." },
    { icon: Sailboat, title: "Meet your boatman", text: "Your ride number and booking details arrive instantly by email." },
];

// One meander of the river across the section (desktop). Steps sit at 1/6, 1/2 and 5/6 of its length.
const RIVER = "M0 110 C 120 30, 240 30, 360 100 S 600 180, 720 100 S 960 20, 1080 90 S 1260 150, 1400 80";

function Boat() {
    return (
        <g>
            <ellipse cx="0" cy="10" rx="34" ry="6" fill="#ff7a1a" opacity="0.25" />
            <path d="M-30 0 Q0 16 30 0 L24 -4 L-24 -4 Z" fill="#070b18" />
            <path d="M-24 -4 L24 -4" stroke="#ffb627" strokeWidth="2" />
            <rect x="-3" y="-30" width="2" height="26" fill="#070b18" />
            <path d="M-1 -30 L18 -10 L-1 -10 Z" fill="#ff7a1a" />
            <circle cx="-16" cy="-8" r="3" fill="#ffb627" className="flicker" />
        </g>
    );
}

export default function HowItWorks() {
    const ref = useRef<HTMLElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
    const p = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: 0.6 });
    const [boat, setBoat] = useState({ x: 0, y: 110, a: 0 });
    const [reached, setReached] = useState(reduce ? 3 : 0);
    const lineScale = useTransform(p, [0, 1], [0, 1]);

    useMotionValueEvent(p, "change", (v) => {
        const path = pathRef.current;
        const t = Math.min(Math.max(v, 0), 1);
        setReached(reduce ? 3 : [1 / 6, 1 / 2, 5 / 6].filter((s) => t >= s - 0.04).length);
        if (!path) return;
        const len = path.getTotalLength();
        const pt = path.getPointAtLength(t * len);
        const ahead = path.getPointAtLength(Math.min(t * len + 4, len));
        setBoat({ x: pt.x, y: pt.y, a: (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI });
    });

    return (
        <section ref={ref} className="relative bg-parchment py-20 md:py-28 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <Eyebrow className="text-fire">How it works</Eyebrow>
                        <h2 className="mt-4 font-display font-light text-5xl sm:text-6xl leading-[0.95] tracking-[-0.03em] text-night">
                            <SplitWords text="Booked in" /> <SplitWords text="three strokes." delay={0.15} className="italic" wordClassName={() => "text-fire-deep pr-[0.05em]"} />
                        </h2>
                    </div>
                    <p className="max-w-xs text-night/60">Of the oar, that is. No queue at the ghat, no &ldquo;my friend&rdquo; middlemen.</p>
                </div>

                {/* Desktop: the river with a boat that sails as you scroll */}
                <div className="relative mt-14 hidden md:block">
                    <svg viewBox="0 0 1400 200" className="w-full h-auto overflow-visible" aria-hidden>
                        <defs>
                            <linearGradient id="river-g" x1="0" x2="1">
                                <stop offset="0" stopColor="#2bb3a7" />
                                <stop offset="0.5" stopColor="#ffb627" />
                                <stop offset="1" stopColor="#ff4d2e" />
                            </linearGradient>
                        </defs>
                        <path d={RIVER} fill="none" stroke="#070b18" strokeOpacity="0.12" strokeWidth="18" strokeLinecap="round" />
                        <path d={RIVER} fill="none" stroke="#070b18" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="2 10" strokeLinecap="round" />
                        <motion.path ref={pathRef} d={RIVER} fill="none" stroke="url(#river-g)" strokeWidth="4" strokeLinecap="round" style={{ pathLength: reduce ? 1 : p }} />
                        <g transform={`translate(${boat.x} ${boat.y}) rotate(${boat.a * 0.6})`}><Boat /></g>
                    </svg>
                </div>

                <div className="relative mt-10 md:mt-6">
                    {/* Mobile: a vertical rope that fills as you scroll */}
                    <div aria-hidden className="md:hidden absolute left-[27px] top-2 bottom-2 w-px bg-night/15">
                        <motion.div className="h-full w-full origin-top bg-gradient-to-b from-ganga via-marigold to-ember" style={{ scaleY: reduce ? 1 : lineScale }} />
                    </div>
                    <ol className="relative grid gap-8 md:grid-cols-3 md:gap-10">
                        {STEPS.map(({ icon: Icon, title, text }, i) => {
                            const on = reached > i;
                            return (
                                <li key={title} className="flex md:flex-col gap-5">
                                    <span className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border transition-all duration-700 ${on ? "border-transparent bg-night text-marigold shadow-[0_10px_30px_-8px_rgba(255,122,26,0.7)] scale-100" : "border-night/20 bg-parchment text-night/40 scale-90"}`}>
                                        <Icon size={22} />
                                    </span>
                                    <div>
                                        <p className={`font-display italic text-5xl leading-none transition-colors duration-700 ${on ? "text-fire-deep" : "text-night/15"}`}>0{i + 1}</p>
                                        <h3 className="mt-3 font-display text-2xl text-night">{title}</h3>
                                        <p className="mt-1 text-night/60 text-[15px] max-w-xs">{text}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </div>
        </section>
    );
}

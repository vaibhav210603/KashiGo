"use client";

import { useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity, useReducedMotion, wrap } from "framer-motion";

const WORDS = ["Dashashwamedh", "Sunrise", "Assi Ghat", "Ganga Aarti", "Manikarnika", "Sunset", "Panchganga", "Subah-e-Banaras"];

// A ribbon of words that drifts on its own and speeds up / reverses with how fast you scroll.
function Ribbon({ base, className, textClass }: { base: number; className: string; textClass: string }) {
    const reduce = useReducedMotion();
    const x = useMotionValue(0);
    const { scrollY } = useScroll();
    const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
    const boost = useTransform(velocity, [-1500, 0, 1500], [-4, 0, 4], { clamp: false });
    const dir = useRef(1);

    useAnimationFrame((_, delta) => {
        if (reduce) return;
        let move = dir.current * base * (delta / 1000);
        const b = boost.get();
        if (b < 0) dir.current = -1; else if (b > 0) dir.current = 1;
        move += dir.current * move * Math.abs(b);
        x.set(wrap(-50, 0, x.get() + move));
    });

    const row = (
        <span className="flex shrink-0 items-center">
            {WORDS.map((w) => (
                <span key={w} className="flex items-center">
                    <span className={textClass}>{w}</span>
                    {/* tiny diya flame as the separator */}
                    <svg viewBox="0 0 24 32" className="mx-6 md:mx-10 h-6 w-5 md:h-9 md:w-7 shrink-0" aria-hidden>
                        <path d="M12 2c3 6 7 9 7 15a7 7 0 0 1-14 0c0-6 4-9 7-15z" fill="currentColor" className="flicker" />
                        <path d="M12 12c1.3 2.6 3 4 3 6.5a3 3 0 0 1-6 0c0-2.5 1.7-3.9 3-6.5z" fill="#fff6d6" opacity="0.85" />
                    </svg>
                </span>
            ))}
        </span>
    );

    return (
        <div className={`overflow-hidden whitespace-nowrap py-4 md:py-6 ${className}`}>
            <motion.div className="flex w-max" style={{ x: useTransform(x, (v) => `${v}%`) }}>
                {row}{row}
            </motion.div>
        </div>
    );
}

export default function GhatMarquee() {
    return (
        <section aria-hidden className="relative z-10 -my-10 md:-my-14 overflow-hidden py-14 md:py-20 bg-gradient-to-b from-night from-50% to-parchment to-50%">
            <div className="-rotate-[3deg] scale-[1.06] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
                <Ribbon base={2.2} className="bg-gradient-to-r from-marigold via-fire to-ember text-night"
                    textClass="font-display italic text-4xl md:text-7xl font-light tracking-tight leading-[1.25] pr-2" />
            </div>
            <div className="rotate-[2deg] scale-[1.06] -mt-4 md:-mt-6">
                <Ribbon base={-1.4} className="bg-night text-marigold border-y border-white/10"
                    textClass="font-sans text-sm md:text-lg font-semibold uppercase tracking-[0.35em] text-white/85" />
            </div>
        </section>
    );
}

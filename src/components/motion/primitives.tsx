"use client";

import { useEffect, useRef, useState, type ReactNode, type ElementType } from "react";
import { motion, useInView, useMotionValue, useSpring, animate, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

// Fades + lifts its children in the first time they scroll into view.
export function Reveal({ children, delay = 0, y = 28, className, as = "div" }: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "li" | "section" | "p" }) {
    const reduce = useReducedMotion();
    const M = motion[as];
    return (
        <M className={className}
            initial={reduce ? false : { opacity: 0, y, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "0px 0px -12% 0px" }}
            transition={{ duration: 0.9, ease: EASE, delay }}>
            {children}
        </M>
    );
}

// Headline whose words rise out of a mask one after another. Text stays real text for SEO/a11y.
// `wordClass` styles every word and can be passed from server components; `wordClassName` (a function) is client-only.
export function SplitWords({ text, className, delay = 0, stagger = 0.06, as: Tag = "span", wordClassName, wordClass, inView = true }: { text: string; className?: string; delay?: number; stagger?: number; as?: ElementType; wordClassName?: (word: string, i: number) => string | undefined; wordClass?: string; inView?: boolean }) {
    const ref = useRef<HTMLElement>(null);
    const seen = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
    const reduce = useReducedMotion();
    const show = reduce || !inView || seen;
    const words = text.split(" ");
    return (
        <Tag ref={ref} className={className} aria-label={text}>
            {words.map((w, i) => (
                <span key={i} aria-hidden className="inline-block overflow-hidden align-bottom pb-[0.3em] -mb-[0.3em] pr-[0.04em] -mr-[0.04em]">
                    <motion.span className={`inline-block will-change-transform ${wordClassName?.(w, i) ?? wordClass ?? ""}`}
                        initial={reduce ? false : { y: "110%", rotate: 4 }}
                        animate={show ? { y: "0%", rotate: 0 } : undefined}
                        transition={{ duration: 1, ease: EASE, delay: delay + i * stagger }}>
                        {w}
                    </motion.span>
                    {i < words.length - 1 && " "}
                </span>
            ))}
        </Tag>
    );
}

// Counts up (or between two values) once visible. `format` turns the number into display text.
export function Counter({ from = 0, to, duration = 1.6, format = (n) => Math.round(n).toLocaleString("en-IN"), className }: { from?: number; to: number; duration?: number; format?: (n: number) => string; className?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const seen = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
    const [val, setVal] = useState(from);
    useEffect(() => {
        if (!seen) return;
        const c = animate(from, to, { duration, ease: EASE, onUpdate: setVal });
        return () => c.stop();
    }, [seen, from, to, duration]);
    return <span ref={ref} className={className}>{format(val)}</span>;
}

// Pulls toward the cursor a little while hovered — for primary CTAs.
export function Magnetic({ children, strength = 0.25, className }: { children: ReactNode; strength?: number; className?: string }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 220, damping: 18 });
    const sy = useSpring(y, { stiffness: 220, damping: 18 });
    return (
        <motion.div className={className} style={{ x: sx, y: sy }}
            onPointerMove={(e) => {
                if (e.pointerType !== "mouse") return;
                const r = e.currentTarget.getBoundingClientRect();
                x.set((e.clientX - r.left - r.width / 2) * strength);
                y.set((e.clientY - r.top - r.height / 2) * strength);
            }}
            onPointerLeave={() => { x.set(0); y.set(0); }}>
            {children}
        </motion.div>
    );
}

// Small eyebrow label used above section headlines: "── LABEL ──" style.
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
    return <p className={`ornament text-[11px] font-semibold uppercase tracking-[0.28em] ${className}`}>{children}</p>;
}

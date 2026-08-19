"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Compass, Landmark, Sailboat, ArrowRight } from "lucide-react";
import HeroBackground from "@/components/HeroBackground";

type Choice = {
    href: string;
    eyebrow: string;
    title: string;
    blurb: string;
    icon: typeof Compass;
};

const choices: Choice[] = [
    {
        href: "/india-tour",
        eyebrow: "The all-India journey",
        title: "Explore India",
        blurb: "Delhi, Agra, Jaipur, Udaipur & Varanasi — a scam-free, day-by-day field guide.",
        icon: Compass,
    },
    {
        href: "/guide",
        eyebrow: "The sacred city, decoded",
        title: "Explore Varanasi",
        blurb: "All 84 ghats, 9 scam shields and a local's 2-day itinerary. Written by someone born here.",
        icon: Landmark,
    },
    {
        href: "/book",
        eyebrow: "On the river Ganges",
        title: "Book a Boat Ride",
        blurb: "Sunrise, Ganga Aarti and sunset rides. Fair prices, trusted boatmen, instant confirmation.",
        icon: Sailboat,
    },
];

// Apple-restrained easing — soft, confident, no bounce.
const ease = [0.22, 1, 0.36, 1] as const;

export default function ChooserScreen() {
    const reduce = useReducedMotion();

    const container = {
        hidden: {},
        show: {
            transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: reduce ? 0 : 0.15 },
        },
    };
    const item = {
        hidden: { opacity: 0, y: reduce ? 0 : 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
    };

    return (
        <section className="relative min-h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden bg-slate-950">

            {/* Animated premium background — pure CSS aurora, no video */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Deep base gradient — stays dark so the embers glow */}
                <div className="absolute inset-0 bg-[radial-gradient(130%_130%_at_50%_-10%,#0e1a30_0%,#070d1c_50%,#02040c_100%)]" />

                {/* Drifting aurora orbs — accent color at the edges, not a wash */}
                <div
                    className="aurora-orb w-[40rem] h-[40rem] -top-52 -left-52 bg-orange-500/25"
                    style={{ animation: "aurora-drift-a 20s infinite" }}
                />
                <div
                    className="aurora-orb w-[36rem] h-[36rem] top-10 -right-56 bg-amber-400/20"
                    style={{ animation: "aurora-drift-b 24s infinite" }}
                />
                <div
                    className="aurora-orb w-[38rem] h-[38rem] -bottom-56 -left-24 bg-fuchsia-600/18"
                    style={{ animation: "aurora-drift-c 28s infinite" }}
                />

                {/* Floating embers — the animated graphic layer */}
                <HeroBackground />

                {/* Breathing central spotlight */}
                <div
                    className="absolute inset-0 [background:radial-gradient(55%_45%_at_50%_40%,rgba(251,146,60,0.18),transparent_70%)]"
                    style={{ animation: reduce ? undefined : "hero-breathe 8s ease-in-out infinite" }}
                />

                {/* Fine grid — subtle structure */}
                <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(70%_60%_at_50%_40%,#000,transparent)]" />

                {/* Film grain for depth */}
                <div
                    className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                    }}
                />

                {/* Bottom vignette for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/80" />
            </div>

            {/* Content */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="relative z-20 w-full max-w-6xl px-5 sm:px-8 py-24 flex flex-col items-center text-center"
            >
                {/* Wordmark */}
                <motion.div variants={item} className="mb-8 select-none">
                    <span className="tracking-tighter">
                        <span className="font-cursive text-5xl text-orange-500 font-bold pr-1">Kashi</span>
                        <span className="font-heading font-bold text-3xl text-white">Go</span>
                    </span>
                </motion.div>

                <motion.h1
                    variants={item}
                    className="font-heading font-bold text-white text-3xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] tracking-tight max-w-3xl"
                >
                    What brings you to India?
                </motion.h1>

                <motion.p
                    variants={item}
                    className="mt-5 text-slate-300 text-base sm:text-lg max-w-xl"
                >
                    Tell us what you came for — we&apos;ll take you straight there.
                </motion.p>

                {/* Choice cards */}
                <div className="mt-12 grid w-full gap-4 sm:gap-5 grid-cols-1 md:grid-cols-3">
                    {choices.map(({ href, eyebrow, title, blurb, icon: Icon }) => (
                        <motion.div key={href} variants={item}>
                            <Link href={href} className="group block h-full focus:outline-none">
                                <motion.div
                                    whileHover={reduce ? undefined : { y: -6 }}
                                    whileTap={{ scale: 0.99 }}
                                    transition={{ duration: 0.4, ease }}
                                    className="relative h-full text-left rounded-3xl p-6 sm:p-7
                                        bg-slate-900/60 backdrop-blur-2xl
                                        border border-white/15
                                        shadow-[0_8px_40px_-12px_rgba(0,0,0,0.7)]
                                        transition-colors duration-500
                                        group-hover:bg-slate-900/70 group-hover:border-white/30
                                        group-focus-visible:ring-2 group-focus-visible:ring-orange-400/80"
                                >
                                    {/* Top sheen */}
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl
                                        bg-orange-500/15 border border-orange-400/25 text-orange-300
                                        transition-colors duration-500 group-hover:bg-orange-500/25 group-hover:text-orange-200">
                                        <Icon size={22} strokeWidth={1.75} />
                                    </span>

                                    <p className="mt-6 text-[0.7rem] uppercase tracking-[0.18em] text-orange-300/90 font-medium">
                                        {eyebrow}
                                    </p>
                                    <h2 className="mt-1 font-heading font-semibold text-white text-xl sm:text-2xl">
                                        {title}
                                    </h2>
                                    <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                                        {blurb}
                                    </p>

                                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-white/90">
                                        Continue
                                        <ArrowRight
                                            size={16}
                                            className="transition-transform duration-300 group-hover:translate-x-1"
                                        />
                                    </span>
                                </motion.div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Secondary links */}
                <motion.div
                    variants={item}
                    className="mt-10 flex items-center gap-6 text-sm text-slate-400"
                >
                    <Link href="/about" className="hover:text-white transition-colors underline-offset-4 hover:underline">
                        About KashiGo
                    </Link>
                    <span className="w-px h-4 bg-white/20" />
                    <Link href="/blog" className="hover:text-white transition-colors underline-offset-4 hover:underline">
                        Read the blog
                    </Link>
                </motion.div>
            </motion.div>
        </section>
    );
}

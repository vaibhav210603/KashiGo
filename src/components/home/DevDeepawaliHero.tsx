"use client";

import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import DiyaRiver from "@/components/motion/DiyaRiver";
import { GuaranteeStamp } from "@/components/home/Hero";
import { InviteCard } from "@/components/home/DevDeepawali";

// The home hero for the festival season. Three things only: book a boat ride comfortably, the 100% money-back
// guarantee, and the Dev Deepawali invitation. Text never animates; the background moves with cheap GPU
// animations (a CSS zoom on the photo and one 30fps canvas). Swap back to <Hero /> in app/page.tsx after the festival.
export default function DevDeepawaliHero() {
    const reduce = !!useReducedMotion();

    return (
        <section className="relative isolate overflow-hidden bg-night min-h-[100svh] flex flex-col justify-end pt-24 pb-10 md:pt-32">
            {/* The ghats on Kartik Purnima under the full moon */}
            <div aria-hidden className="absolute inset-0 -z-30 overflow-hidden">
                <div className="slow-zoom relative h-full w-full">
                    {/* Laptops and desktops: a 2560px night view of the lit ghats (Pexels, free licence), so it stays sharp
                        full screen. Phones and tablets keep the moonlit ghats, which is plenty at that size. */}
                    <picture>
                        <source media="(min-width: 1024px)" srcSet="/dev-deepawali/ghats-night-desktop.jpg" />
                        <img src="/dev-deepawali/ghats-full-moon.jpg" alt="" fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover object-[35%_60%] lg:object-[50%_55%]" />
                    </picture>
                </div>
            </div>
            <div aria-hidden className="absolute inset-0 -z-20 bg-gradient-to-t from-night via-night/55 to-night/40" />
            <DiyaRiver className="-z-10" />

            <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                <div>
                    <h1 className="font-display font-light text-white text-[2.9rem] leading-[0.98] sm:text-7xl lg:text-[6.5rem] tracking-[-0.03em] [font-variation-settings:'SOFT'_100,'opsz'_144]">
                        Book boat rides in Varanasi,{" "}
                        <em className="text-fire pr-[0.06em]">comfortably.</em>
                    </h1>
                    <div className="mt-6 flex items-center gap-4">
                        <Link href="/book" className="group h-14 flex-1 sm:flex-none px-5 sm:px-7 inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-full bg-gradient-to-r from-marigold via-fire to-ember text-night text-base sm:text-lg font-semibold shadow-[0_10px_40px_-10px_rgba(255,122,26,0.8)]">
                            Book a boat ride
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-night text-marigold"><ArrowRight size={16} /></span>
                        </Link>
                        {/* 100% money-back guarantee, at eye level with the button */}
                        <GuaranteeStamp reduce={reduce} className="relative h-[5.5rem] w-[5.5rem] shrink-0 sm:h-28 sm:w-28" />
                    </div>
                    <a href="tel:+918175966910" className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-white/30 bg-night/40 px-6 font-semibold text-white backdrop-blur-sm transition-colors hover:border-marigold sm:w-auto">
                        <Phone size={17} className="text-marigold" /> Call us · +91 81759 66910
                    </a>
                </div>

                <InviteCard />
            </div>
        </section>
    );
}

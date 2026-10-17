"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Eyebrow, Reveal, SplitWords } from "@/components/motion/primitives";
import Embers from "@/components/motion/Embers";
import RiverWave from "@/components/motion/RiverWave";

type Props = {
    eyebrow?: ReactNode;
    title: string;
    // Rendered on its own line in italic fire.
    highlight?: string;
    intro?: ReactNode;
    // Faint Devanagari word behind the headline (decorative).
    deva?: string;
    breadcrumb?: ReactNode;
    // CTAs, chips, toggles — anything under the intro.
    children?: ReactNode;
    // Right-hand column on large screens (e.g. a photo).
    aside?: ReactNode;
    // Colour of the section below, which the river wave flows into.
    into?: string;
    // Smaller, flowing headline for long titles (blog posts, ride pages).
    compact?: boolean;
};

// Night hero shared by the inner pages: display serif headline with an italic fire phrase, embers, and a river edge.
export default function PageHero({ eyebrow, title, highlight, intro, deva = "काशी", breadcrumb, children, aside, into = "#f6eedf", compact = false }: Props) {
    return (
        <section className="grain relative isolate overflow-hidden bg-night pt-28 pb-24 text-white md:pt-36 md:pb-32">
            <div aria-hidden className="flicker absolute -bottom-40 left-1/2 -z-10 h-80 w-[110%] -translate-x-1/2 rounded-[100%] bg-fire/20 blur-[110px]" />
            <div aria-hidden className="absolute -top-32 right-0 -z-10 h-80 w-80 rounded-full bg-ganga/10 blur-[110px]" />
            <Embers density={0.45} className="-z-10" />
            <p aria-hidden className="pointer-events-none absolute -right-[6vw] top-16 -z-10 select-none font-deva text-[42vw] leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,182,39,0.16)] md:text-[22vw]">
                {deva}
            </p>

            <div className={`relative mx-auto max-w-7xl px-4 sm:px-6 ${aside ? "grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center" : ""}`}>
                <div className="min-w-0">
                    {breadcrumb}
                    {eyebrow && <Eyebrow className="text-marigold">{eyebrow}</Eyebrow>}
                    <h1 className={`mt-5 max-w-4xl font-display font-light tracking-[-0.03em] [font-variation-settings:'SOFT'_100,'opsz'_144] ${compact ? "text-[2.15rem] leading-[1.05] sm:text-5xl lg:text-[3.75rem]" : "text-[2.6rem] leading-[0.98] sm:text-6xl lg:text-[5rem]"}`}>
                        <SplitWords text={title} delay={0.1} stagger={compact ? 0.03 : 0.06} inView={false} className={highlight && !compact ? "block" : undefined} />{highlight && " "}
                        {highlight && <SplitWords text={highlight} delay={compact ? 0.2 : 0.3} inView={false} className={`italic ${compact ? "" : "block"}`} wordClassName={() => "text-fire pr-[0.06em]"} />}
                    </h1>
                    {intro && (
                        <Reveal delay={0.45} y={18}>
                            <div className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl">{intro}</div>
                        </Reveal>
                    )}
                    {children && <Reveal delay={0.6} y={18} className="mt-8">{children}</Reveal>}
                </div>
                {aside && <Reveal delay={0.4} y={40}>{aside}</Reveal>}
            </div>

            <RiverWave fill={into} className="absolute bottom-0 left-0" />
        </section>
    );
}

// "Home / Blog" trail on night heroes.
export function Crumbs({ items }: { items: { href?: string; label: string }[] }) {
    return (
        <nav aria-label="Breadcrumb" className="mb-6 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/50">
            {items.map((it, i) => (
                <span key={it.label} className="inline-flex min-w-0 items-center gap-2">
                    {i > 0 && <span aria-hidden className="text-marigold/60">/</span>}
                    {it.href ? <Link href={it.href} className="transition-colors hover:text-marigold">{it.label}</Link> : <span className="truncate text-white/75">{it.label}</span>}
                </span>
            ))}
        </nav>
    );
}

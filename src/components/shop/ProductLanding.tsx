"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Plus, Play, Pause, ListMusic } from "lucide-react";
import { SHOP_PRODUCTS, ShopProduct, ShopProductId, LAUNCH_CODE } from "@/lib/products";
import Checkout from "@/components/shop/Checkout";
import { useRegion } from "@/components/shop/useRegion";
import { RegionToggle, TrustRow } from "@/components/shop/ui";
import PageHero from "@/components/layout/PageHero";
import Embers from "@/components/motion/Embers";
import { Eyebrow, Reveal } from "@/components/motion/primitives";
import { FIRE_BTN, H2_LIGHT, PAPER_CARD } from "@/components/ui/styles";

type Faq = { q: string; a: string };

type Props = {
    eyebrow: string;
    title: string;
    highlight: string;
    intro: string;
    productIds: ShopProductId[];
    // A product sold on its own page (the Varanasi Insider Guide lives at /guide).
    linkedProduct?: { name: string; tagline: string; cover: string; href: string; inr: number; usd: number; bullets: string[]; format: string };
    video?: { src: string; poster: string; heading: string };
    faqs: Faq[];
    otherPage: { href: string; label: string };
    // Faint Devanagari word behind the hero headline.
    deva?: string;
    // A page-specific section between the trust row and the FAQ.
    extra?: ReactNode;
};

type Row = { key: string; name: string; tagline: string; cover: string; inr: number; usd: number; bullets: string[]; format: string; badge?: string; product?: ShopProduct; href?: string };

// Listen-before-you-buy: a free sample and the full track list for an audio product.
function AudioSample({ audio, name }: { audio: NonNullable<ShopProduct["audio"]>; name: string }) {
    const ref = useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showTracks, setShowTracks] = useState(false);
    const toggle = () => {
        const el = ref.current;
        if (!el) return;
        if (el.paused) {
            // Only one sample plays at a time.
            document.querySelectorAll("audio").forEach((a) => a !== el && a.pause());
            el.play();
        } else el.pause();
    };
    return (
        <div className="mt-5 rounded-2xl bg-night/[0.04] ring-1 ring-night/10 p-3 sm:p-4">
            <audio ref={ref} src={audio.preview} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
                onEnded={() => { setPlaying(false); setProgress(0); }}
                onTimeUpdate={(e) => { const a = e.currentTarget; setProgress(a.duration ? a.currentTime / a.duration : 0); }} />
            <div className="flex items-center gap-3">
                <button onClick={toggle} aria-label={`${playing ? "Pause" : "Play"} ${name} sample`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-night text-marigold transition-transform hover:scale-105">
                    {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                </button>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-night">{audio.previewLabel}</p>
                    <div className="mt-1.5 h-1 rounded-full bg-night/10 overflow-hidden">
                        <div className="h-full bg-fire transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
                    </div>
                </div>
                <button onClick={() => setShowTracks(!showTracks)} aria-expanded={showTracks}
                    className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-night/60 hover:text-night">
                    <ListMusic size={16} />{audio.tracks.length} tracks · {audio.minutes} min
                </button>
            </div>
            <button onClick={() => setShowTracks(!showTracks)} aria-expanded={showTracks}
                className="sm:hidden mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-night/60">
                <ListMusic size={16} />{showTracks ? "Hide" : "See all"} {audio.tracks.length} tracks · {audio.minutes} min
            </button>
            {/* Always in the HTML (just collapsed) so crawlers can read the track list */}
            <div className="accordion" data-open={showTracks} aria-hidden={!showTracks}>
                <div>
                    <ol className="mt-3 grid sm:grid-cols-2 gap-x-6 border-t border-night/10 pt-3">
                        {audio.tracks.map(([t, d], i) => (
                            <li key={t} className="flex items-baseline gap-3 py-1 text-[13px] text-night/70">
                                <span className="w-5 shrink-0 font-mono text-[11px] text-night/35">{String(i + (audio.tracks[0][0] === "Trailer" ? 0 : 1)).padStart(2, "0")}</span>
                                <span className="flex-1 min-w-0 truncate" title={t}>{t}</span>
                                <span className="font-mono text-[11px] text-night/40">{d}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
}

export default function ProductLanding({ eyebrow, title, highlight, intro, productIds, linkedProduct, video, faqs, otherPage, deva, extra }: Props) {
    const [region, setRegion] = useRegion();
    const [active, setActive] = useState<ShopProduct | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const bundle = SHOP_PRODUCTS.find((p) => p.id === "complete-bundle")!;
    const fmt = (inr: number, usd: number) => (region === "inr" ? `₹${inr.toLocaleString("en-IN")}` : `$${usd.toFixed(2)}`);

    const rows: Row[] = [
        ...productIds.map((id) => {
            const p = SHOP_PRODUCTS.find((x) => x.id === id)!;
            return { key: p.id, name: p.name, tagline: p.tagline, cover: p.cover, inr: p.inr, usd: p.usd, bullets: p.bullets, format: p.format, badge: p.badge, product: p };
        }),
        ...(linkedProduct ? [{ key: "linked", ...linkedProduct }] : []),
    ];

    return (
        <>
            <PageHero eyebrow={eyebrow} title={title} highlight={highlight} intro={<p>{intro}</p>} deva={deva}>
                <div className="flex flex-wrap items-center gap-4">
                    <RegionToggle region={region} setRegion={setRegion} dark />
                    <p className="text-sm text-white/60">Code <b className="rounded border border-marigold/50 px-1.5 py-0.5 font-mono tracking-wider text-marigold">{LAUNCH_CODE}</b> = 40% off</p>
                </div>
            </PageHero>

            <section className="px-4 sm:px-6 pb-20 -mt-4">
                <div className="max-w-5xl mx-auto">
                    <div className="space-y-5">
                        {rows.map((r, i) => (
                            <Reveal key={r.key} y={40} delay={i * 0.06}>
                                <article id={r.key} className={`${PAPER_CARD} scroll-mt-28 p-4 sm:p-7`}>
                                    <div className="flex gap-4 sm:gap-7">
                                        <div className="relative w-28 sm:w-44 shrink-0 aspect-[5/7] rounded-xl overflow-hidden bg-night-3 shadow-[0_20px_40px_-15px_rgba(7,11,24,0.6)] ring-1 ring-night/10">
                                            <Image src={r.cover} alt={`${r.name} cover`} fill className="object-cover" sizes="180px" />
                                            <span aria-hidden className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/40 to-transparent" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col">
                                            {r.badge && <span className="self-start rounded-full bg-marigold px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-night mb-2">{r.badge}</span>}
                                            <h2 className="font-display text-2xl sm:text-[2rem] text-night leading-[1.05] tracking-tight">{r.name}</h2>
                                            <p className="mt-2 text-sm sm:text-base text-night/65 line-clamp-3 sm:line-clamp-none">{r.tagline}</p>
                                            <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-night/40">{r.format}</p>
                                            <div className="mt-auto pt-4 flex flex-wrap items-center gap-3">
                                                <span className="font-display text-3xl text-night">{fmt(r.inr, r.usd)}</span>
                                                {r.product ? (
                                                    <button onClick={() => setActive(r.product!)} className={`${FIRE_BTN} h-11 px-6`}>Buy now</button>
                                                ) : (
                                                    <Link href={r.href!} className="h-11 px-6 inline-flex items-center gap-1.5 rounded-full bg-night text-white font-semibold transition-colors hover:text-marigold">See the guide <ArrowRight size={16} /></Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {r.product?.audio && <AudioSample audio={r.product.audio} name={r.name} />}
                                    <ul className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-2 border-t border-dashed border-night/15 pt-5">
                                        {r.bullets.map((b) => <li key={b} className="flex gap-2.5 text-[15px] text-night/75"><Check size={17} className="text-[#1d7f76] shrink-0 mt-0.5" />{b}</li>)}
                                    </ul>
                                </article>
                            </Reveal>
                        ))}

                        {/* Upsell: the bundle includes everything on this page */}
                        <Reveal y={40}>
                            <div className="grain relative overflow-hidden rounded-[2rem] bg-night p-6 sm:p-10 text-white shadow-[0_40px_90px_-30px_rgba(7,11,24,0.7)]">
                                <Embers density={0.4} />
                                <div aria-hidden className="flicker absolute -right-16 -top-20 h-60 w-60 rounded-full bg-fire/35 blur-[80px]" />
                                <p className="relative text-[11px] font-semibold uppercase tracking-[0.28em] text-marigold">{bundle.badge} · includes everything above</p>
                                <h2 className="relative mt-3 font-display font-light text-3xl sm:text-5xl tracking-tight">{bundle.name}</h2>
                                <p className="relative mt-2 text-white/60 text-[15px]">{bundle.format}</p>
                                <div className="relative mt-6 flex flex-wrap items-center gap-4">
                                    <span className="font-display text-4xl">{fmt(bundle.inr, bundle.usd)}</span>
                                    {region === "usd" && bundle.compareUsd && <span className="text-white/35 line-through">${bundle.compareUsd.toFixed(2)}</span>}
                                    <button onClick={() => setActive(bundle)} className={`${FIRE_BTN} w-full sm:w-auto h-12 px-8`}>Get the bundle</button>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    {video && (
                        <Reveal y={40} className="pt-16">
                            <Eyebrow className="text-fire">Preview</Eyebrow>
                            <h2 className={`${H2_LIGHT} mt-3 text-4xl md:text-5xl`}>{video.heading}</h2>
                            <div className="mt-6 aspect-video bg-night rounded-[1.75rem] overflow-hidden ring-1 ring-night/10 shadow-[0_40px_80px_-40px_rgba(7,11,24,0.7)]">
                                <video className="w-full h-full object-cover" controls playsInline preload="none" poster={video.poster}>
                                    <source src={video.src} type="video/mp4" />
                                </video>
                            </div>
                        </Reveal>
                    )}

                    <div className="pt-16"><TrustRow /></div>

                    {extra}

                    <div className="pt-16 grid gap-8 md:grid-cols-[0.7fr_1.3fr]">
                        <div>
                            <Eyebrow className="text-fire">FAQ</Eyebrow>
                            <h2 className={`${H2_LIGHT} mt-3 text-4xl md:text-5xl`}><em className="text-fire-deep pr-1">Questions</em></h2>
                        </div>
                        <div className="border-t border-night/15">
                            {faqs.map((f, i) => {
                                const isOpen = openFaq === i;
                                return (
                                    <div key={f.q} className="border-b border-night/15">
                                        <button onClick={() => setOpenFaq(isOpen ? null : i)} aria-expanded={isOpen}
                                            className="group w-full flex items-start justify-between gap-4 text-left py-5">
                                            <span className={`font-display text-lg sm:text-xl leading-snug transition-colors ${isOpen ? "text-night" : "text-night/80 group-hover:text-night"}`}>{f.q}</span>
                                            <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${isOpen ? "rotate-45 border-transparent bg-night text-marigold" : "border-night/20 text-night group-hover:border-night"}`}><Plus size={16} /></span>
                                        </button>
                                        {/* Always in the HTML (just collapsed) so crawlers can read every answer */}
                                        <div className="accordion" data-open={isOpen} aria-hidden={!isOpen}>
                                            <div><p className="pb-6 pr-12 text-night/65 leading-relaxed">{f.a}</p></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center pt-14 text-sm">
                        <Link href={otherPage.href} className="group inline-flex items-center gap-1.5 font-semibold text-night hover:text-fire">{otherPage.label} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link>
                        <Link href="/shop" className="text-night/50 hover:text-night">Browse the whole shop</Link>
                    </div>
                </div>
            </section>

            <AnimatePresence>{active && <Checkout product={active} region={region} onClose={() => setActive(null)} />}</AnimatePresence>
        </>
    );
}

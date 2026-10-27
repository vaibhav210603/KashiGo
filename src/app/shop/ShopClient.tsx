"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Check, ArrowUpRight } from "lucide-react";
import { SHOP_PRODUCTS, ShopProduct, LAUNCH_CODE } from "@/lib/products";
import { CATALOG, KIND_STYLE } from "@/lib/catalog";
import Checkout from "@/components/shop/Checkout";
import { useRegion } from "@/components/shop/useRegion";
import { RegionToggle, TrustRow } from "@/components/shop/ui";
import PageHero from "@/components/layout/PageHero";
import Embers from "@/components/motion/Embers";
import { Eyebrow, Reveal } from "@/components/motion/primitives";
import { FIRE_BTN, H2_LIGHT, PAPER_CARD, LINK_LIGHT } from "@/components/ui/styles";

export default function ShopClient() {
    const [region, setRegion] = useRegion();
    const [active, setActive] = useState<ShopProduct | null>(null);
    const bundle = SHOP_PRODUCTS.find((p) => p.id === "complete-bundle")!;
    const fmt = (inr: number, usd: number) => (region === "inr" ? `₹${inr.toLocaleString("en-IN")}` : `$${usd.toFixed(2)}`);

    useEffect(() => {
        const id = window.location.hash.slice(1);
        if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, []);

    return (
        <div className="bg-parchment">
            <PageHero eyebrow="The KashiGo shop · instant download" title="Guides by a local." highlight="Read them before you land." deva="ग्रन्थ">
                <div className="flex flex-wrap items-center gap-4">
                    <RegionToggle region={region} setRegion={setRegion} dark />
                    <p className="text-sm text-white/60">Code <b className="rounded border border-marigold/50 px-1.5 py-0.5 font-mono tracking-wider text-marigold">{LAUNCH_CODE}</b> = 40% off</p>
                </div>
            </PageHero>

            <section id={bundle.id} className="relative px-4 sm:px-6 -mt-4 scroll-mt-24">
                <Reveal y={50} className="max-w-7xl mx-auto">
                    <div className="grain relative overflow-hidden rounded-[2rem] bg-night text-white grid md:grid-cols-[1.1fr_1fr] gap-6 md:gap-10 items-center p-5 sm:p-7 md:p-10 shadow-[0_40px_90px_-30px_rgba(7,11,24,0.7)]">
                        <Embers density={0.4} />
                        <div aria-hidden className="flicker absolute -left-20 -bottom-24 h-72 w-72 rounded-full bg-marigold/20 blur-[90px]" />
                        <div className="relative aspect-[3/2] w-full">
                            <Image src={bundle.cover} alt={bundle.name} fill className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]" sizes="(max-width:768px) 100vw, 50vw" priority />
                        </div>
                        <div className="relative">
                            <span className="inline-flex rounded-full border border-marigold/40 bg-marigold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-marigold">{bundle.badge} · everything we make</span>
                            <h2 className="mt-4 font-display text-3xl md:text-[2.75rem] leading-[1.05] tracking-tight">{bundle.name}</h2>
                            <ul className="mt-5 space-y-2">
                                {bundle.bullets.map((b) => <li key={b} className="flex gap-2.5 text-[15px] text-white/80"><Check size={17} className="text-ganga shrink-0 mt-0.5" />{b}</li>)}
                            </ul>
                            <div className="mt-6 flex items-end gap-3">
                                <span className="font-display text-5xl text-white">{fmt(bundle.inr, bundle.usd)}</span>
                                {region === "usd" && bundle.compareUsd && <span className="text-white/35 line-through text-lg mb-1.5">${bundle.compareUsd.toFixed(2)}</span>}
                            </div>
                            <button onClick={() => setActive(bundle)} className={`${FIRE_BTN} mt-5 w-full md:w-auto h-14 px-10 text-lg`}>
                                Get the bundle
                            </button>
                            <p className="mt-3 text-xs text-white/45">{bundle.format}</p>
                        </div>
                    </div>
                </Reveal>
            </section>

            <section className="pt-20 md:pt-28 pb-20 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <Eyebrow className="text-fire">The shelf</Eyebrow>
                    <h2 className={`${H2_LIGHT} mt-3 text-4xl md:text-6xl`}>Or pick exactly <em className="text-fire-deep pr-1">what you need</em></h2>
                    <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                        {CATALOG.filter((c) => c.kind !== "Bundle").map((c, i) => {
                            const p = c.shopId && SHOP_PRODUCTS.find((x) => x.id === c.shopId);
                            return (
                                <Reveal key={c.key} delay={(i % 3) * 0.08} y={40}>
                                    <article id={c.shopId || c.key} className={`${PAPER_CARD} group scroll-mt-28 h-full overflow-hidden flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5`}>
                                        <Link href={c.href} className="relative aspect-[5/7] bg-night-3 block overflow-hidden">
                                            <Image src={c.cover} alt={c.name} fill className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" sizes="(max-width:1024px) 50vw, 33vw" />
                                            <span aria-hidden className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/40 to-transparent" />
                                            <span className={`absolute top-2 left-4 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${KIND_STYLE[c.kind]}`}>{c.kind}</span>
                                        </Link>
                                        <div className="p-3 sm:p-5 flex flex-col gap-1 flex-1">
                                            <h3 className="font-display text-[17px] sm:text-xl leading-snug text-night">{c.name}</h3>
                                            <p className="hidden sm:block text-sm text-night/60 flex-1">{c.blurb}</p>
                                            <div className="mt-auto pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <span className="font-display text-2xl text-night">{fmt(c.inr, c.usd)}</span>
                                                {p ? (
                                                    <button onClick={() => setActive(p)} className={`${FIRE_BTN} h-10 px-6 text-sm`}>Buy</button>
                                                ) : (
                                                    <Link href={c.href} className="h-10 px-5 inline-flex items-center justify-center gap-1 rounded-full bg-night text-white text-sm font-semibold transition-colors hover:text-marigold">View <ArrowUpRight size={15} /></Link>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                </Reveal>
                            );
                        })}
                    </div>

                    <div className="mt-16"><TrustRow /></div>
                    <p className="text-center text-sm text-night/55 mt-10">
                        Not ready yet? Get the <a href="/scam-cheat-sheet" className={LINK_LIGHT}>free Varanasi Scam Cheat Sheet</a>.
                    </p>
                </div>
            </section>

            <AnimatePresence>{active && <Checkout product={active} region={region} onClose={() => setActive(null)} />}</AnimatePresence>
        </div>
    );
}

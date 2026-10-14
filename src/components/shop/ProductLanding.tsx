"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Check, ArrowRight, ChevronDown } from "lucide-react";
import { SHOP_PRODUCTS, ShopProduct, ShopProductId, LAUNCH_CODE } from "@/lib/products";
import Checkout from "@/components/shop/Checkout";
import { useRegion } from "@/components/shop/useRegion";
import { RegionToggle, TRUST } from "@/components/shop/ui";

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
};

type Row = { key: string; name: string; tagline: string; cover: string; inr: number; usd: number; bullets: string[]; format: string; badge?: string; product?: ShopProduct; href?: string };

export default function ProductLanding({ eyebrow, title, highlight, intro, productIds, linkedProduct, video, faqs, otherPage }: Props) {
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
            <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 pt-24 pb-8 px-4">
                <div className="max-w-5xl mx-auto">
                    <p className="text-sm font-semibold text-pink-600">{eyebrow}</p>
                    <h1 className="mt-1 font-heading font-bold text-3xl sm:text-5xl text-slate-900 tracking-tight">
                        {title} <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">{highlight}</span>
                    </h1>
                    <p className="mt-3 text-slate-700 max-w-2xl">{intro}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        <RegionToggle region={region} setRegion={setRegion} />
                        <p className="text-sm text-slate-600">Code <b className="font-mono text-slate-900">{LAUNCH_CODE}</b> = 40% off</p>
                    </div>
                </div>
            </section>

            <section className="py-8 px-4">
                <div className="max-w-5xl mx-auto space-y-4">
                    {rows.map((r) => (
                        <article id={r.key} key={r.key} className="scroll-mt-24 rounded-3xl bg-white border border-slate-200/70 p-4 sm:p-6">
                            <div className="flex gap-4 sm:gap-6">
                                <div className="relative w-28 sm:w-44 shrink-0 aspect-[5/7] rounded-xl overflow-hidden bg-slate-100 shadow-md">
                                    <Image src={r.cover} alt={`${r.name} cover`} fill className="object-cover" sizes="180px" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col">
                                    {r.badge && <span className="self-start rounded-full bg-orange-100 text-orange-700 px-2 py-0.5 text-[11px] font-bold mb-1">{r.badge}</span>}
                                    <h2 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 leading-tight">{r.name}</h2>
                                    <p className="mt-1 text-sm sm:text-base text-slate-600 line-clamp-3 sm:line-clamp-none">{r.tagline}</p>
                                    <p className="mt-1 text-xs text-slate-500">{r.format}</p>
                                    <div className="mt-auto pt-3 flex flex-wrap items-center gap-3">
                                        <span className="font-heading font-bold text-2xl text-slate-900">{fmt(r.inr, r.usd)}</span>
                                        {r.product ? (
                                            <button onClick={() => setActive(r.product!)} className="h-11 px-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-md shadow-orange-500/30">Buy now</button>
                                        ) : (
                                            <Link href={r.href!} className="h-11 px-6 inline-flex items-center rounded-full bg-slate-900 hover:bg-orange-500 text-white font-semibold">See the guide</Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <ul className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-2">
                                {r.bullets.map((b) => <li key={b} className="flex gap-2 text-[15px] text-slate-700"><Check size={18} className="text-teal-600 shrink-0 mt-0.5" />{b}</li>)}
                            </ul>
                        </article>
                    ))}

                    {/* Upsell: the bundle includes everything on this page */}
                    <div className="rounded-[2rem] bg-gradient-to-br from-orange-500 via-pink-500 to-fuchsia-500 p-6 sm:p-8 text-white shadow-xl shadow-pink-500/20">
                        <p className="text-sm font-bold text-white/90">{bundle.badge} · includes everything above</p>
                        <h2 className="mt-1 font-heading font-bold text-2xl sm:text-3xl">{bundle.name}</h2>
                        <p className="mt-1 text-white/90 text-[15px]">{bundle.format}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-4">
                            <span className="font-heading font-bold text-3xl">{fmt(bundle.inr, bundle.usd)}</span>
                            {region === "usd" && bundle.compareUsd && <span className="text-white/70 line-through">${bundle.compareUsd.toFixed(2)}</span>}
                            <button onClick={() => setActive(bundle)} className="w-full sm:w-auto h-12 px-8 rounded-full bg-white text-orange-600 font-bold">Get the bundle</button>
                        </div>
                    </div>

                    {video && (
                        <div className="pt-6">
                            <h2 className="font-heading font-bold text-2xl text-slate-900">{video.heading}</h2>
                            <div className="mt-3 aspect-video bg-slate-100 rounded-3xl overflow-hidden">
                                <video className="w-full h-full object-cover" controls playsInline preload="none" poster={video.poster}>
                                    <source src={video.src} type="video/mp4" />
                                </video>
                            </div>
                        </div>
                    )}

                    <div className="grid sm:grid-cols-3 gap-3 pt-6">
                        {TRUST.map(([Icon, t, d]) => (
                            <div key={t} className="flex sm:flex-col gap-3 p-5 rounded-3xl bg-amber-50">
                                <Icon className="text-orange-500 shrink-0" />
                                <div><p className="font-semibold text-slate-900">{t}</p><p className="text-sm text-slate-600">{d}</p></div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6">
                        <h2 className="font-heading font-bold text-2xl text-slate-900">Questions</h2>
                        <div className="mt-3 divide-y divide-slate-200 rounded-3xl border border-slate-200/70 bg-white overflow-hidden">
                            {faqs.map((f, i) => (
                                <div key={f.q}>
                                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}
                                        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 font-semibold text-slate-900">
                                        {f.q}<ChevronDown size={20} className={`shrink-0 text-orange-500 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                                    </button>
                                    <p hidden={openFaq !== i} className="px-5 pb-5 -mt-1 text-slate-600 leading-relaxed">{f.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4 text-sm">
                        <Link href={otherPage.href} className="inline-flex items-center gap-1 font-semibold text-orange-600">{otherPage.label} <ArrowRight size={16} /></Link>
                        <Link href="/shop" className="text-slate-500 hover:text-slate-900">Browse the whole shop</Link>
                    </div>
                </div>
            </section>

            <AnimatePresence>{active && <Checkout product={active} region={region} onClose={() => setActive(null)} />}</AnimatePresence>
        </>
    );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Check, Download, ShieldCheck, Mail, ArrowRight } from "lucide-react";
import { SHOP_PRODUCTS, ShopProduct, ShopProductId, LAUNCH_CODE } from "@/lib/products";
import Checkout from "@/components/shop/Checkout";
import { useRegion } from "@/components/shop/useRegion";

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

export default function ProductLanding({ eyebrow, title, highlight, intro, productIds, linkedProduct, video, faqs, otherPage }: Props) {
    const [region, setRegion] = useRegion();
    const [active, setActive] = useState<ShopProduct | null>(null);
    const products = productIds.map((id) => SHOP_PRODUCTS.find((p) => p.id === id)!);
    const bundle = SHOP_PRODUCTS.find((p) => p.id === "complete-bundle")!;
    const fmt = (inr: number, usd: number) => (region === "inr" ? `₹${inr.toLocaleString("en-IN")}` : `$${usd.toFixed(2)}`);
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    return (
        <>
            <section className="relative pt-32 pb-16 px-4 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 opacity-25 bg-[url('/sunrise.png')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/85 to-slate-900" />
                <div className="relative max-w-4xl mx-auto text-center space-y-5">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-300 font-bold text-xs tracking-widest uppercase border border-orange-500/30">
                        {eyebrow}
                    </span>
                    <h1 className="text-3xl md:text-6xl font-bold font-heading text-white tracking-tight leading-tight">
                        {title}<br /><span className="text-orange-400">{highlight}</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-300 leading-relaxed">{intro}</p>
                    <div className="inline-flex rounded-xl bg-white/10 p-1 border border-white/15">
                        {(["usd", "inr"] as const).map((r) => (
                            <button key={r} onClick={() => setRegion(r)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${region === r ? "bg-white text-slate-900" : "text-slate-300"}`}>
                                {r === "usd" ? "🌍 USD" : "🇮🇳 INR"}
                            </button>
                        ))}
                    </div>
                    <p className="text-sm text-orange-200">Use code <span className="font-mono font-bold text-white">{LAUNCH_CODE}</span> at checkout for 40% off.</p>
                </div>
            </section>

            <section className="py-16 px-4 bg-white text-slate-900">
                <div className="max-w-5xl mx-auto space-y-10">
                    {products.map((p) => (
                        <article id={p.id} key={p.id} className="scroll-mt-28 grid md:grid-cols-[260px_1fr] gap-6 md:gap-10 items-start rounded-3xl border border-slate-200 p-5 md:p-8">
                            <div className="relative aspect-[5/7] w-full max-w-[260px] mx-auto rounded-xl overflow-hidden bg-slate-100 shadow-lg">
                                <Image src={p.cover} alt={`${p.name} cover`} fill className="object-cover" sizes="260px" />
                                {p.badge && <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">{p.badge}</span>}
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-2xl md:text-3xl font-bold font-heading">{p.name}</h2>
                                <p className="text-slate-600 text-lg">{p.tagline}</p>
                                <ul className="space-y-2">
                                    {p.bullets.map((b) => <li key={b} className="flex gap-2 text-slate-700"><Check size={18} className="text-orange-500 shrink-0 mt-0.5" />{b}</li>)}
                                </ul>
                                <p className="text-sm text-slate-500">{p.format}</p>
                                <div className="flex items-center gap-4 pt-2">
                                    <span className="text-3xl font-extrabold">{fmt(p.inr, p.usd)}</span>
                                    <button onClick={() => setActive(p)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-orange-500/20 transition">
                                        Buy now
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}

                    {linkedProduct && (
                        <article className="grid md:grid-cols-[260px_1fr] gap-6 md:gap-10 items-start rounded-3xl border border-slate-200 p-5 md:p-8">
                            <div className="relative aspect-[5/7] w-full max-w-[260px] mx-auto rounded-xl overflow-hidden bg-slate-100 shadow-lg">
                                <Image src={linkedProduct.cover} alt={`${linkedProduct.name} cover`} fill className="object-cover" sizes="260px" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-2xl md:text-3xl font-bold font-heading">{linkedProduct.name}</h2>
                                <p className="text-slate-600 text-lg">{linkedProduct.tagline}</p>
                                <ul className="space-y-2">
                                    {linkedProduct.bullets.map((b) => <li key={b} className="flex gap-2 text-slate-700"><Check size={18} className="text-orange-500 shrink-0 mt-0.5" />{b}</li>)}
                                </ul>
                                <p className="text-sm text-slate-500">{linkedProduct.format}</p>
                                <div className="flex items-center gap-4 pt-2">
                                    <span className="text-3xl font-extrabold">{fmt(linkedProduct.inr, linkedProduct.usd)}</span>
                                    <Link href={linkedProduct.href} className="bg-slate-900 hover:bg-orange-500 text-white font-bold px-8 py-3 rounded-xl transition">
                                        See the guide
                                    </Link>
                                </div>
                            </div>
                        </article>
                    )}

                    {/* Bundle upsell */}
                    <div className="rounded-[2rem] bg-gradient-to-br from-orange-500 to-amber-500 p-[2px]">
                        <div className="rounded-[calc(2rem-2px)] bg-slate-950 text-white p-6 md:p-10 grid md:grid-cols-[1fr_auto] gap-6 items-center">
                            <div className="space-y-2">
                                <span className="inline-block bg-orange-500 text-slate-950 text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">{bundle.badge}</span>
                                <h2 className="text-2xl md:text-3xl font-bold font-heading">{bundle.name}</h2>
                                <p className="text-slate-300">{bundle.format}</p>
                                <p className="text-slate-400 text-sm">{bundle.tagline}</p>
                            </div>
                            <div className="flex md:flex-col items-center gap-4">
                                <div className="text-right md:text-center">
                                    <span className="text-3xl font-extrabold">{fmt(bundle.inr, bundle.usd)}</span>
                                    {region === "usd" && bundle.compareUsd && <span className="block text-slate-400 line-through">${bundle.compareUsd.toFixed(2)}</span>}
                                </div>
                                <button onClick={() => setActive(bundle)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition">
                                    Get the bundle
                                </button>
                            </div>
                        </div>
                    </div>

                    {video && (
                        <div className="space-y-4">
                            <h2 className="text-2xl md:text-3xl font-bold font-heading text-center">{video.heading}</h2>
                            <div className="aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-xl">
                                <video className="w-full h-full object-cover" controls playsInline preload="none" poster={video.poster}>
                                    <source src={video.src} type="video/mp4" />
                                </video>
                            </div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        {[
                            [Download, "Instant download", "Links on screen and in your inbox the moment you pay."],
                            [ShieldCheck, "7-day money-back", "Not useful? Reply to your receipt email for a full refund."],
                            [Mail, "Real human support", "Every email is read by Vaibhav, in Varanasi."],
                        ].map(([Icon, t, d]: any) => (
                            <div key={t} className="p-6 rounded-2xl bg-orange-50">
                                <Icon className="mx-auto text-orange-500 mb-2" />
                                <p className="font-bold text-slate-900">{t}</p>
                                <p className="text-sm text-slate-600">{d}</p>
                            </div>
                        ))}
                    </div>

                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold font-heading text-center mb-6">Questions</h2>
                        <div className="space-y-3 max-w-3xl mx-auto">
                            {faqs.map((f, i) => (
                                <div key={f.q} className="rounded-2xl border border-slate-200">
                                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}
                                        className="w-full text-left px-5 py-4 font-semibold text-slate-900">{f.q}</button>
                                    <p hidden={openFaq !== i} className="px-5 pb-5 text-slate-600 leading-relaxed">{f.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
                        <Link href={otherPage.href} className="inline-flex items-center gap-1 font-semibold text-orange-600 hover:underline">{otherPage.label} <ArrowRight size={16} /></Link>
                        <Link href="/shop" className="text-slate-500 hover:text-slate-900">Browse the whole shop</Link>
                    </div>
                </div>
            </section>

            <AnimatePresence>{active && <Checkout product={active} region={region} onClose={() => setActive(null)} />}</AnimatePresence>
        </>
    );
}

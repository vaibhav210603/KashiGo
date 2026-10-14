"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { Check, Download, ShieldCheck, Headphones, BookOpen, Mail } from "lucide-react";
import { SHOP_PRODUCTS, ShopProduct, LAUNCH_CODE } from "@/lib/products";
import Checkout from "@/components/shop/Checkout";
import { useRegion } from "@/components/shop/useRegion";

export default function ShopClient() {
    const [region, setRegion] = useRegion();
    const [active, setActive] = useState<ShopProduct | null>(null);

    useEffect(() => {
        const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
        const p = SHOP_PRODUCTS.find((x) => x.id === hash);
        if (p) document.getElementById(p.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, []);

    const price = (p: ShopProduct) => (region === "inr" ? `₹${p.inr.toLocaleString("en-IN")}` : `$${p.usd.toFixed(2)}`);
    const [bundle, ...rest] = SHOP_PRODUCTS;

    return (
        <>
            <section className="relative pt-32 pb-16 px-4 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 opacity-25 bg-[url('/sunrise.png')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/85 to-slate-900" />
                <div className="relative max-w-4xl mx-auto text-center space-y-5">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-300 font-bold text-xs tracking-widest uppercase border border-orange-500/30">
                        The KashiGo Shop · Instant download
                    </span>
                    <h1 className="text-3xl md:text-6xl font-bold font-heading text-white tracking-tight leading-tight">
                        Guides written by a local,<br /><span className="text-orange-400">read before you land.</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-300 leading-relaxed">
                        Ebooks and audio from someone born on the ghats of Varanasi — real prices, every scam, the meaning behind what you'll see, and a story at every step.
                    </p>
                    <div className="inline-flex rounded-xl bg-white/10 p-1 border border-white/15">
                        {(["usd", "inr"] as const).map((r) => (
                            <button key={r} onClick={() => setRegion(r)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${region === r ? "bg-white text-slate-900" : "text-slate-300"}`}>
                                {r === "usd" ? "🌍 USD" : "🇮🇳 INR"}
                            </button>
                        ))}
                    </div>
                    <p className="text-sm text-orange-200">Launch week: use code <span className="font-mono font-bold text-white">{LAUNCH_CODE}</span> for 40% off anything.</p>
                </div>
            </section>

            {/* Bundle */}
            <section id={bundle.id} className="px-4 -mt-2 bg-slate-900 pb-16">
                <div className="max-w-6xl mx-auto rounded-[2rem] bg-gradient-to-br from-orange-500 to-amber-500 p-[2px] shadow-2xl">
                    <div className="rounded-[calc(2rem-2px)] bg-slate-950 grid md:grid-cols-2 gap-8 p-6 md:p-10 items-center">
                        <div className="relative aspect-[3/2] w-full">
                            <Image src={bundle.cover} alt={bundle.name} fill className="object-contain rounded-2xl" sizes="(max-width:768px) 100vw, 50vw" priority />
                        </div>
                        <div className="space-y-4 text-white">
                            <span className="inline-block bg-orange-500 text-slate-950 text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">{bundle.badge}</span>
                            <h2 className="text-2xl md:text-4xl font-bold font-heading">{bundle.name}</h2>
                            <p className="text-slate-300">{bundle.tagline}</p>
                            <ul className="space-y-2">
                                {bundle.bullets.map((b) => (
                                    <li key={b} className="flex gap-2 text-sm text-slate-200"><Check size={18} className="text-orange-400 shrink-0" />{b}</li>
                                ))}
                            </ul>
                            <div className="flex items-end gap-3 pt-2">
                                <span className="text-4xl font-extrabold">{price(bundle)}</span>
                                {region === "usd" && bundle.compareUsd && <span className="text-slate-400 line-through text-lg">${bundle.compareUsd.toFixed(2)}</span>}
                            </div>
                            <button onClick={() => setActive(bundle)} className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-10 rounded-xl text-lg shadow-lg shadow-orange-500/30 transition">
                                Get the bundle
                            </button>
                            <p className="text-xs text-slate-400">{bundle.format}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Singles */}
            <section className="py-16 px-4 bg-white text-slate-900">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl md:text-4xl font-bold font-heading text-slate-900 text-center mb-12">Or pick exactly what you need</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* The existing Varanasi guide links to its own page */}
                        <a href="/guide" className="group rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition flex flex-col">
                            <div className="relative aspect-[5/7] bg-slate-100"><Image src="/VARANASi.png" alt="Varanasi Insider Guide 2026" fill className="object-cover" sizes="300px" /></div>
                            <div className="p-5 flex flex-col gap-2 flex-1">
                                <h3 className="font-bold text-slate-900">Varanasi Insider Guide 2026</h3>
                                <p className="text-sm text-slate-600 flex-1">The practical playbook: prices, 9 scams, ghats, food, itinerary.</p>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="font-extrabold text-lg text-slate-900">{region === "inr" ? "₹999" : "$14.99"}</span>
                                    <span className="text-orange-600 font-bold text-sm group-hover:underline">View →</span>
                                </div>
                            </div>
                        </a>
                        {rest.map((p) => (
                            <div id={p.id} key={p.id} className="rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition flex flex-col scroll-mt-28">
                                <div className="relative aspect-[5/7] bg-slate-100">
                                    <Image src={p.cover} alt={p.name} fill className="object-cover" sizes="300px" />
                                    {p.badge && <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">{p.badge}</span>}
                                </div>
                                <div className="p-5 flex flex-col gap-2 flex-1">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        {p.id.includes("audio") || p.id === "walk-the-ghats" ? <Headphones size={16} className="text-orange-500" /> : <BookOpen size={16} className="text-orange-500" />}
                                        {p.name}
                                    </h3>
                                    <p className="text-sm text-slate-600">{p.tagline}</p>
                                    <ul className="space-y-1 flex-1">
                                        {p.bullets.slice(0, 3).map((b) => <li key={b} className="text-xs text-slate-500 flex gap-1.5"><Check size={14} className="text-orange-500 shrink-0 mt-0.5" />{b}</li>)}
                                    </ul>
                                    <p className="text-[11px] text-slate-400">{p.format}</p>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="font-extrabold text-lg text-slate-900">{price(p)}</span>
                                        <button onClick={() => setActive(p)} className="bg-slate-900 hover:bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition">Buy</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 mt-16 text-center">
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
                    <p className="text-center text-sm text-slate-500 mt-10">
                        Not ready to buy? Get the <a href="/Varanasi-Scam-Cheat-Sheet.pdf" className="text-orange-600 font-semibold underline">free Varanasi Scam Cheat Sheet</a>.
                    </p>
                </div>
            </section>

            <AnimatePresence>{active && <Checkout product={active} region={region} onClose={() => setActive(null)} />}</AnimatePresence>
        </>
    );
}

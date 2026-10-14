"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { SHOP_PRODUCTS, ShopProduct, LAUNCH_CODE } from "@/lib/products";
import { CATALOG, KIND_STYLE } from "@/lib/catalog";
import Checkout from "@/components/shop/Checkout";
import { useRegion } from "@/components/shop/useRegion";
import { RegionToggle, TRUST } from "@/components/shop/ui";

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
        <>
            <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 pt-24 pb-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <p className="text-sm font-semibold text-pink-600">The KashiGo shop · instant download</p>
                    <h1 className="mt-1 font-heading font-bold text-3xl sm:text-5xl text-slate-900 max-w-2xl">Guides by a local. Read them before you land.</h1>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        <RegionToggle region={region} setRegion={setRegion} />
                        <p className="text-sm text-slate-600">Code <b className="font-mono text-slate-900">{LAUNCH_CODE}</b> = 40% off</p>
                    </div>
                </div>
            </section>

            <section id={bundle.id} className="px-4 pb-4 bg-gradient-to-b from-pink-50/40 to-white scroll-mt-20">
                <div className="max-w-6xl mx-auto rounded-[2rem] bg-gradient-to-br from-orange-500 via-pink-500 to-fuchsia-500 p-[2px] shadow-xl shadow-pink-500/20">
                    <div className="rounded-[calc(2rem-2px)] bg-white grid md:grid-cols-2 gap-6 p-5 md:p-10 items-center">
                        <div className="relative aspect-[3/2] w-full">
                            <Image src={bundle.cover} alt={bundle.name} fill className="object-contain" sizes="(max-width:768px) 100vw, 50vw" priority />
                        </div>
                        <div>
                            <span className="rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-bold">{bundle.badge} · everything we make</span>
                            <h2 className="mt-3 font-heading font-bold text-2xl md:text-4xl text-slate-900">{bundle.name}</h2>
                            <ul className="mt-4 space-y-2">
                                {bundle.bullets.map((b) => <li key={b} className="flex gap-2 text-[15px] text-slate-700"><Check size={18} className="text-teal-600 shrink-0 mt-0.5" />{b}</li>)}
                            </ul>
                            <div className="mt-5 flex items-end gap-3">
                                <span className="font-heading font-bold text-4xl text-slate-900">{fmt(bundle.inr, bundle.usd)}</span>
                                {region === "usd" && bundle.compareUsd && <span className="text-slate-400 line-through text-lg mb-1">${bundle.compareUsd.toFixed(2)}</span>}
                            </div>
                            <button onClick={() => setActive(bundle)} className="mt-4 w-full md:w-auto h-14 px-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold shadow-lg shadow-orange-500/30">
                                Get the bundle
                            </button>
                            <p className="mt-2 text-xs text-slate-500">{bundle.format}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-10 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="font-heading font-bold text-2xl md:text-3xl text-slate-900">Or pick exactly what you need</h2>
                    <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                        {CATALOG.filter((c) => c.kind !== "Bundle").map((c) => {
                            const p = c.shopId && SHOP_PRODUCTS.find((x) => x.id === c.shopId);
                            return (
                                <article id={c.shopId || c.key} key={c.key} className="scroll-mt-24 rounded-3xl bg-white border border-slate-200/70 overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                                    <Link href={c.href} className="relative aspect-[5/7] bg-slate-100 block">
                                        <Image src={c.cover} alt={c.name} fill className="object-cover" sizes="(max-width:1024px) 50vw, 33vw" />
                                        <span className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[11px] font-bold ${KIND_STYLE[c.kind]}`}>{c.kind}</span>
                                    </Link>
                                    <div className="p-3 sm:p-5 flex flex-col gap-1 flex-1">
                                        <h3 className="font-heading font-semibold text-[15px] sm:text-lg leading-snug text-slate-900">{c.name}</h3>
                                        <p className="hidden sm:block text-sm text-slate-600 flex-1">{c.blurb}</p>
                                        <div className="mt-auto pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <span className="font-heading font-bold text-lg text-slate-900">{fmt(c.inr, c.usd)}</span>
                                            {p ? (
                                                <button onClick={() => setActive(p)} className="h-10 px-5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold">Buy</button>
                                            ) : (
                                                <Link href={c.href} className="h-10 px-5 inline-flex items-center justify-center rounded-full bg-slate-900 hover:bg-orange-500 text-white text-sm font-semibold">View</Link>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3 mt-10">
                        {TRUST.map(([Icon, t, d]) => (
                            <div key={t} className="flex sm:flex-col gap-3 p-5 rounded-3xl bg-amber-50">
                                <Icon className="text-orange-500 shrink-0" />
                                <div><p className="font-semibold text-slate-900">{t}</p><p className="text-sm text-slate-600">{d}</p></div>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-sm text-slate-500 mt-8">
                        Not ready yet? Get the <a href="/Varanasi-Scam-Cheat-Sheet.pdf" className="text-orange-600 font-semibold underline">free Varanasi Scam Cheat Sheet</a>.
                    </p>
                </div>
            </section>

            <AnimatePresence>{active && <Checkout product={active} region={region} onClose={() => setActive(null)} />}</AnimatePresence>
        </>
    );
}

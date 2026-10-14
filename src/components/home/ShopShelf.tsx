"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { SHOP_PRODUCTS, ShopProduct } from "@/lib/products";
import { CATALOG, KIND_STYLE } from "@/lib/catalog";
import Checkout from "@/components/shop/Checkout";
import { useRegion } from "@/components/shop/useRegion";

export default function ShopShelf() {
    const [region] = useRegion();
    const [active, setActive] = useState<ShopProduct | null>(null);
    const bundle = SHOP_PRODUCTS.find((p) => p.id === "complete-bundle")!;
    const fmt = (inr: number, usd: number) => (region === "inr" ? `₹${inr.toLocaleString("en-IN")}` : `$${usd.toFixed(2)}`);
    const singles = CATALOG.filter((c) => c.kind !== "Bundle");

    return (
        <section className="py-12 md:py-16 bg-gradient-to-b from-amber-50 to-white">
            <div className="max-w-6xl mx-auto px-4">
                <p className="text-sm font-semibold text-pink-600">Before you land</p>
                <h2 className="mt-1 font-heading font-bold text-3xl sm:text-4xl text-slate-900">Guides written by a local</h2>

                {/* Highest-value product first */}
                <div className="mt-6 rounded-[2rem] bg-gradient-to-br from-orange-500 via-pink-500 to-fuchsia-500 p-[2px] shadow-xl shadow-pink-500/20">
                    <div className="rounded-[calc(2rem-2px)] bg-white grid md:grid-cols-[1.1fr_1fr] gap-5 p-5 md:p-8 items-center">
                        <div className="relative aspect-[3/2] w-full">
                            <Image src={bundle.cover} alt={bundle.name} fill className="object-contain" sizes="(max-width:768px) 90vw, 45vw" />
                        </div>
                        <div>
                            <span className="rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-bold">{bundle.badge} · save over 50%</span>
                            <h3 className="mt-3 font-heading font-bold text-2xl sm:text-3xl text-slate-900">{bundle.name}</h3>
                            <p className="mt-1 text-slate-600 text-[15px]">{bundle.format}</p>
                            <ul className="mt-3 space-y-1.5">
                                {bundle.bullets.slice(0, 4).map((b) => <li key={b} className="flex gap-2 text-sm text-slate-700"><Check size={16} className="text-teal-600 shrink-0 mt-0.5" />{b}</li>)}
                            </ul>
                            <div className="mt-5 flex items-center gap-4">
                                <p className="font-heading font-bold text-3xl text-slate-900">
                                    {fmt(bundle.inr, bundle.usd)}
                                    {region === "usd" && bundle.compareUsd && <span className="ml-2 text-base font-medium text-slate-400 line-through">${bundle.compareUsd.toFixed(2)}</span>}
                                </p>
                            </div>
                            <button onClick={() => setActive(bundle)} className="mt-4 w-full sm:w-auto h-12 px-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg shadow-orange-500/30">
                                Get the bundle — instant download
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex items-end justify-between">
                    <h3 className="font-heading font-semibold text-xl text-slate-900">Or pick one</h3>
                    <Link href="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600">See all <ArrowRight size={16} /></Link>
                </div>
            </div>

            <div className="rail mt-4 md:max-w-6xl md:mx-auto">
                {singles.map((c) => (
                    <Link key={c.key} href={c.href} className="w-40 sm:w-48 group">
                        <div className="relative aspect-[5/7] rounded-2xl overflow-hidden bg-slate-100 shadow-md group-hover:shadow-xl transition-shadow">
                            <Image src={c.cover} alt={c.name} fill className="object-cover" sizes="200px" />
                            <span className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[11px] font-bold ${KIND_STYLE[c.kind]}`}>{c.kind}</span>
                        </div>
                        <p className="mt-2 font-semibold text-slate-900 text-sm leading-snug line-clamp-2">{c.name}</p>
                        <p className="text-sm font-bold text-orange-600">{fmt(c.inr, c.usd)}</p>
                    </Link>
                ))}
            </div>

            <AnimatePresence>{active && <Checkout product={active} region={region} onClose={() => setActive(null)} />}</AnimatePresence>
        </section>
    );
}

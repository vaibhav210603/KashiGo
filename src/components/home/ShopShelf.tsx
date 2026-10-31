"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, useSpring } from "framer-motion";
import { Eyebrow, Reveal, SplitWords } from "@/components/motion/primitives";
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
    const reduce = useReducedMotion();

    return (
        <section className="grain relative bg-night py-14 md:py-28 overflow-hidden">
            <div aria-hidden className="absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-fire/15 blur-[140px]" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
                <Eyebrow className="text-marigold">Before you land</Eyebrow>
                <h2 className="mt-4 font-display font-light text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.03em] text-white">
                    <SplitWords text="Guides written" /> <SplitWords text="by a local." delay={0.15} className="italic" wordClassName={() => "text-fire pr-[0.05em]"} />
                </h2>

                {/* Highest-value product first */}
                <Reveal y={60} className="mt-8 sm:mt-12">
                    <TiltCard>
                        <div className="relative grid md:grid-cols-[1.1fr_1fr] gap-4 md:gap-10 items-center rounded-[2rem] border border-white/10 bg-gradient-to-br from-night-3 to-night-2 p-5 md:p-10 overflow-hidden">
                            <div aria-hidden className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-marigold/20 blur-[90px]" />
                            <div className="relative aspect-[2/1] w-full sm:aspect-[3/2] [transform:translateZ(40px)]">
                                <Image src={bundle.cover} alt={bundle.name} fill className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]" sizes="(max-width:768px) 90vw, 45vw" />
                            </div>
                            <div className="relative [transform:translateZ(25px)]">
                                <span className="inline-flex rounded-full border border-marigold/40 bg-marigold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-marigold">{bundle.badge} · save over 50%</span>
                                <h3 className="mt-3 font-display text-2xl sm:mt-4 sm:text-4xl leading-tight text-white">{bundle.name}</h3>
                                <p className="mt-2 text-white/55 text-[15px]">{bundle.format}</p>
                                <ul className="mt-5 hidden space-y-2 sm:block">
                                    {bundle.bullets.slice(0, 4).map((b) => <li key={b} className="flex gap-2.5 text-sm text-white/80"><Check size={16} className="text-ganga shrink-0 mt-0.5" />{b}</li>)}
                                </ul>
                                <div className="mt-5 flex flex-col xl:flex-row xl:items-center gap-3 sm:mt-7 sm:gap-4">
                                    <p className="font-display text-3xl sm:text-4xl text-white">
                                        {fmt(bundle.inr, bundle.usd)}
                                        {region === "usd" && bundle.compareUsd && <span className="ml-2 text-lg text-white/35 line-through">${bundle.compareUsd.toFixed(2)}</span>}
                                    </p>
                                    <button onClick={() => setActive(bundle)} className="btn-sheen w-full xl:w-auto py-4 px-7 leading-tight rounded-full bg-gradient-to-r from-marigold via-fire to-ember text-night font-semibold shadow-[0_10px_40px_-10px_rgba(255,122,26,0.8)]">
                                        Get the bundle — instant download
                                    </button>
                                </div>
                            </div>
                        </div>
                    </TiltCard>
                </Reveal>

                <div className="mt-10 flex items-end justify-between sm:mt-16">
                    <h3 className="font-display italic text-2xl text-white/90">Or pick one</h3>
                    <Link href="/shop" className="group inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-marigold">See all <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link>
                </div>
            </div>

            <div className="rail relative mt-6 pb-6 pt-4 md:max-w-7xl md:mx-auto md:px-6 [perspective:1200px]">
                {singles.map((c, i) => (
                    <motion.div key={c.key} initial={reduce ? false : { opacity: 0, y: 60, rotate: (i % 2 ? 6 : -6) }} whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                        viewport={{ once: true, margin: "0px 0px -10% 0px" }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 }}>
                        <Link href={c.href} className="group block w-40 sm:w-48">
                            <div className="relative aspect-[5/7] rounded-xl overflow-hidden bg-night-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/10 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:[transform:translateY(-12px)_rotateY(-12deg)] origin-left">
                                <Image src={c.cover} alt={c.name} fill className="object-cover" sizes="200px" />
                                {/* book spine shading */}
                                <span aria-hidden className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/40 to-transparent" />
                                <span className={`absolute top-2 left-4 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${KIND_STYLE[c.kind]}`}>{c.kind}</span>
                            </div>
                            <p className="mt-3 font-medium text-white text-sm leading-snug line-clamp-2 group-hover:text-marigold transition-colors">{c.name}</p>
                            <p className="mt-0.5 font-display text-lg text-marigold">{fmt(c.inr, c.usd)}</p>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>{active && <Checkout product={active} region={region} onClose={() => setActive(null)} />}</AnimatePresence>
        </section>
    );
}

// Card that tilts toward the cursor in 3D (children can use translateZ for depth).
function TiltCard({ children }: { children: React.ReactNode }) {
    const rx = useSpring(0, { stiffness: 150, damping: 18 });
    const ry = useSpring(0, { stiffness: 150, damping: 18 });
    return (
        <div className="[perspective:1400px]">
            <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
                onPointerMove={(e) => {
                    if (e.pointerType !== "mouse") return;
                    const r = e.currentTarget.getBoundingClientRect();
                    ry.set(((e.clientX - r.left) / r.width - 0.5) * 8);
                    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 8);
                }}
                onPointerLeave={() => { rx.set(0); ry.set(0); }}>
                {children}
            </motion.div>
        </div>
    );
}

"use client";

import { useRef, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowRight, ArrowUpRight, Crown, MapPin, MessageCircle, PhoneCall, ShieldAlert, Star, Store } from "lucide-react";
import { Eyebrow, Reveal, SplitWords } from "@/components/motion/primitives";
import { FIRE_BTN } from "@/components/ui/styles";
import { SERVICES, type Service } from "@/lib/services";

const svc = (id: string) => SERVICES.find((s) => s.id === id)!;

// The carousel's three experiences, with the Hindi name shown large on each card.
const CARDS: { s: Service; label: string; href: string; flagship?: boolean }[] = [
    { s: svc("puja-yajna"), label: "यज्ञ और पूजा", href: "/puja" },
    { s: svc("vip-darshan"), label: "VIP दर्शन", href: "/services#vip-darshan" },
    { s: svc("trip-planner"), label: "यात्रा योजना", href: "#trip-planner", flagship: true },
];
const TRIP = svc("trip-planner");
const TRIP_ICONS = [Store, PhoneCall, MapPin, ShieldAlert, Crown];
const MORE = ["kashi-in-a-day", "quiet-kashi", "hidden-kashi"].map(svc);
const WA = `https://wa.me/918175966910?text=${encodeURIComponent("Namaste! I'd like KashiGo to plan my Varanasi trip.")}`;

// Tilts toward the pointer, like a card held up to the light.
function Card({ c, inert }: { c: (typeof CARDS)[number]; inert: boolean }) {
    const rx = useSpring(0, { stiffness: 180, damping: 18 });
    const ry = useSpring(0, { stiffness: 180, damping: 18 });
    const move = (e: PointerEvent<HTMLDivElement>) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 12);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 12);
    };
    const reset = () => { rx.set(0); ry.set(0); };
    return (
        <motion.div onPointerMove={move} onPointerLeave={reset} style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
            className="w-[17.5rem] shrink-0 sm:w-[23rem]">
            <Link href={c.href} tabIndex={inert ? -1 : undefined} draggable={false}
                className={`group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[1.75rem] border p-6 sm:p-7 ${c.flagship ? "border-marigold/70 shadow-[0_0_0_1px_rgba(255,182,39,0.4),0_30px_80px_-20px_rgba(255,122,26,0.7)]" : "border-white/10"}`}>
                <Image src={c.s.image} alt="" fill sizes="(max-width:640px) 18rem, 23rem" draggable={false}
                    className="-z-20 object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110" />
                <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/70 to-night/5" />
                <span className={`absolute left-6 top-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-night ${c.flagship ? "bg-gradient-to-r from-marigold to-fire" : "bg-white/85"}`}>
                    {c.flagship && <Star size={11} className="fill-night" />}{c.flagship ? "Flagship" : c.s.badge ?? "Premium"}
                </span>
                <p className="font-deva text-4xl leading-tight text-marigold sm:text-5xl">{c.label}</p>
                <h3 className="mt-1 font-display text-xl text-white">{c.s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{c.s.tagline}</p>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/15 pt-4 text-sm font-semibold">
                    {c.flagship ? "See what's included" : "Explore"}
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors group-hover:bg-marigold group-hover:text-night"><ArrowUpRight size={17} /></span>
                </div>
            </Link>
        </motion.div>
    );
}

// Drifts on its own, pauses under the pointer, and can be dragged or swiped. Three copies so the loop never shows a gap.
function Carousel() {
    const reduce = useReducedMotion();
    const set = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const hold = useRef(false);
    const dragged = useRef(false);
    useAnimationFrame((_, dt) => {
        const w = (set.current?.offsetWidth ?? 0) + 20; // + the gap between copies
        if (w <= 20) return;
        if (!reduce && !hold.current) x.set(x.get() - 38 * (dt / 1000));
        const v = x.get();
        if (v <= -w) x.set(v + w); else if (v > 0) x.set(v - w);
    });
    const row = (copy: number) => (
        <div ref={copy === 0 ? set : undefined} aria-hidden={copy > 0 || undefined} className="flex shrink-0 gap-5">
            {CARDS.map((c) => <Card key={c.s.id} c={c} inert={copy > 0} />)}
        </div>
    );
    return (
        <div className="relative -mx-4 overflow-hidden py-6 [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)] sm:mx-0"
            onPointerEnter={(e) => { if (e.pointerType === "mouse") hold.current = true; }}
            onPointerLeave={() => { hold.current = false; }}>
            <motion.div style={{ x }} drag="x" dragMomentum={false} dragElastic={0}
                onDragStart={() => { hold.current = true; dragged.current = true; }}
                onDragEnd={() => { hold.current = false; setTimeout(() => { dragged.current = false; }, 0); }}
                onClickCapture={(e) => { if (dragged.current) { e.preventDefault(); e.stopPropagation(); } }}
                className="flex w-max cursor-grab gap-5 px-4 active:cursor-grabbing sm:px-0">
                {row(0)}{row(1)}{row(2)}
            </motion.div>
        </div>
    );
}

// The services beyond the boat, presented as a premium, curated Kashi — with trip planning as the flagship.
export default function BeyondTheBoat() {
    return (
        <section id="services" className="grain relative scroll-mt-16 overflow-hidden bg-night py-20 text-white md:py-28">
            <div aria-hidden className="aurora absolute -left-40 top-10 h-[28rem] w-[28rem] rounded-full bg-fire/25 blur-[130px]" />
            <div aria-hidden className="aurora aurora-slow absolute -right-32 bottom-0 h-[26rem] w-[26rem] rounded-full bg-marigold/15 blur-[130px]" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
                <div className="glow-frame rounded-[2.5rem] bg-gradient-to-b from-night-2/90 to-night/90 px-4 py-12 sm:px-10 md:py-16">
                    <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
                        <div>
                            <Eyebrow className="text-marigold">Premium experiences</Eyebrow>
                            <h2 className="mt-4 font-display text-5xl font-light leading-[0.95] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
                                <SplitWords text="Curate your premium" className="block" />
                                <SplitWords text="Varanasi experience." delay={0.2} className="block italic" wordClass="text-fire pr-[0.05em]" />
                            </h2>
                        </div>
                        <Reveal delay={0.15}>
                            <p className="text-lg leading-relaxed text-white/65">Rites by learned acharyas, darshan without the queue, and a trip planned end to end by a local who answers the phone at any hour. One honest price, in writing, before anything is paid.</p>
                            <a href="#trip-planner" className={`${FIRE_BTN} mt-6 h-13`}>
                                Plan my trip <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                            </a>
                        </Reveal>
                    </div>

                    <Reveal delay={0.1} className="mt-10">
                        <Carousel />
                    </Reveal>

                    {/* The flagship, spelled out. */}
                    <div id="trip-planner" className="mt-10 grid scroll-mt-28 gap-8 rounded-[2rem] border border-marigold/30 bg-white/[0.03] p-5 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                        <Reveal className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] lg:aspect-auto lg:h-full lg:min-h-[24rem]">
                            <Image src={TRIP.image} alt="A traveller looking out at the ghats from a private boat" fill sizes="(max-width:1024px) 100vw, 40vw" className="object-cover" />
                            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/70 to-transparent" />
                            <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-marigold to-fire px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-night">
                                <Star size={11} className="fill-night" /> Our flagship
                            </span>
                            <p className="absolute bottom-5 left-5 font-deva text-4xl text-marigold">{TRIP.deva}</p>
                        </Reveal>
                        <div>
                            <Reveal>
                                <Eyebrow className="text-marigold">Flagship · Trip Planning</Eyebrow>
                                <h3 className="mt-3 font-display text-3xl font-light leading-tight sm:text-4xl">Your whole Varanasi, <em className="text-fire">planned by a local.</em></h3>
                            </Reveal>
                            <ul className="mt-7 grid gap-3">
                                {TRIP.includes.map((t, i) => {
                                    const Icon = TRIP_ICONS[i] ?? Star;
                                    return (
                                        <Reveal as="li" key={t} delay={0.08 * i} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-marigold/40 hover:bg-white/[0.06]">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-marigold to-ember text-night"><Icon size={18} /></span>
                                            <span className="pt-2 text-[15px] leading-snug text-white/85">{t}</span>
                                        </Reveal>
                                    );
                                })}
                            </ul>
                            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <Link href="/services#plan" className={`${FIRE_BTN} h-13 w-full px-7 sm:w-auto`}>
                                    Plan my trip <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                </Link>
                                <a href={WA} target="_blank" rel="noopener" className="inline-flex items-center justify-center gap-2 text-sm text-white/65 hover:text-marigold"><MessageCircle size={16} /> or WhatsApp us</a>
                            </div>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-sm text-white/55">
                        Also curated by KashiGo:{" "}
                        {MORE.map((s, i) => (
                            <span key={s.id}>{i > 0 && " · "}<Link href={`/services#${s.id}`} className="text-white/80 underline decoration-marigold/60 underline-offset-4 hover:text-marigold">{s.name}</Link></span>
                        ))}
                    </p>
                </div>
            </div>
        </section>
    );
}

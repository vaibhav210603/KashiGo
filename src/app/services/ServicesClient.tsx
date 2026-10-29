"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Clock, FileSignature, MessageCircle, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import PageHero from "@/components/layout/PageHero";
import { Eyebrow, Reveal } from "@/components/motion/primitives";
import { FIRE_BTN, GHOST_BTN_DARK, GHOST_BTN_LIGHT, H2_LIGHT } from "@/components/ui/styles";
import { SERVICES } from "@/lib/services";

const WHATSAPP = "918175966910";
const goToPlan = () => document.getElementById("plan")?.scrollIntoView({ behavior: "smooth", block: "start" });

const PROMISES = [
    { icon: Clock, t: "Crowd-free by design", d: "We plan around the rush — the hour, the gate, the ghat — so Kashi feels like yours." },
    { icon: ShieldCheck, t: "Official routes only", d: "Darshan through the temple's own Sugam slots. No ‘VIP pass’ touts, ever." },
    { icon: FileSignature, t: "One price, in writing", d: "A written quote on WhatsApp before you pay. Nothing extra on the ground." },
    { icon: UserRound, t: "A local beside you", d: "Someone born in these lanes walks with you, from your hotel door to the last aarti." },
];

export default function ServicesClient() {
    const [chosen, setChosen] = useState(SERVICES[0].id);
    const choose = (id: string) => { setChosen(id); goToPlan(); };
    return (
        <div className="w-full bg-parchment">
            <PageHero
                eyebrow="Other services · Kashi"
                deva="शांति"
                title="Kashi beyond the boat,"
                highlight="and beyond the crowds."
                intro={<p>Assured darshan at the great temples, rites by learned acharyas, the city&apos;s hidden gems, and the peaceful Kashi that wakes before the crowds do — arranged end to end by the people who already row you down the Ganga.</p>}
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button onClick={goToPlan} className={`${FIRE_BTN} h-14 w-full px-8 text-lg sm:w-auto`}>
                        Plan my Kashi <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </button>
                    <Link href="/book" className={`${GHOST_BTN_DARK} h-14 w-full px-8 sm:w-auto`}>Book a boat ride</Link>
                </div>
            </PageHero>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
                <div className="grid gap-px overflow-hidden rounded-3xl bg-night/10 sm:grid-cols-2 lg:grid-cols-4">
                    {PROMISES.map(({ icon: Icon, t, d }, i) => (
                        <Reveal key={t} delay={i * 0.06} className="bg-parchment p-6 sm:p-7">
                            <Icon size={22} className="text-fire" />
                            <p className="mt-4 font-display text-xl text-night">{t}</p>
                            <p className="mt-1 text-sm leading-relaxed text-night/60">{d}</p>
                        </Reveal>
                    ))}
                </div>
            </section>

            <section className="pb-20 md:pb-28">
                <div className="mx-auto grid max-w-7xl gap-16 px-4 sm:px-6 md:gap-24">
                    {SERVICES.map((s, i) => (
                        <article id={s.id} key={s.id} className="grid scroll-mt-28 items-center gap-8 md:grid-cols-2 md:gap-14">
                            <Reveal className={`relative aspect-[4/3] overflow-hidden rounded-[2rem] ${i % 2 ? "md:order-2" : ""}`}>
                                <Image src={s.image} alt={s.name} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
                                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/60 to-transparent" />
                                <span aria-hidden className="absolute bottom-4 right-6 font-deva text-7xl text-white/30">{s.deva}</span>
                                {s.badge && <span className="absolute left-5 top-5 rounded-full bg-marigold px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-night">{s.badge}</span>}
                            </Reveal>
                            <Reveal delay={0.1}>
                                <p className="font-display text-sm italic text-fire">0{i + 1}</p>
                                <h2 className={`${H2_LIGHT} mt-2 text-4xl sm:text-5xl`}>{s.name}</h2>
                                <p className="mt-3 text-xl leading-snug text-night/80">{s.tagline}</p>
                                <p className="mt-4 leading-relaxed text-night/60">{s.detail}</p>
                                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                                    {s.includes.map((x) => <li key={x} className="flex gap-2 text-sm text-night/75"><Check size={16} className="mt-0.5 shrink-0 text-fire" />{x}</li>)}
                                </ul>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    {s.href ? (
                                        <Link href={s.href} className={`${FIRE_BTN} h-12`}>See the rites <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link>
                                    ) : (
                                        <button onClick={() => choose(s.id)} className={`${FIRE_BTN} h-12`}>Request {s.name} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></button>
                                    )}
                                    <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Namaste! I'd like to know more about ${s.name}.`)}`} target="_blank" rel="noopener" className={`${GHOST_BTN_LIGHT} h-12`}><MessageCircle size={16} /> Ask on WhatsApp</a>
                                </div>
                            </Reveal>
                        </article>
                    ))}
                </div>
            </section>

            <Plan chosen={chosen} setChosen={setChosen} />

            <section className="py-16 md:py-20">
                <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center">
                    <p className="max-w-2xl font-display text-3xl font-light text-night sm:text-4xl">Every plan starts on the water. <em className="text-fire-deep">Add a boat ride</em> to any of these.</p>
                    <Link href="/book" className={`${FIRE_BTN} h-14 px-8`}>Book a boat ride <ArrowRight size={18} /></Link>
                </div>
            </section>
        </div>
    );
}

const INPUT = "h-12 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 text-white placeholder:text-white/35 outline-none transition-colors focus:border-marigold";
const LABEL = "mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55";
const BOOKABLE = SERVICES.filter((s) => !s.href);

function Plan({ chosen, setChosen }: { chosen: string; setChosen: (id: string) => void }) {
    const [f, setF] = useState({ date: "", guests: "2", name: "", phone: "", email: "", note: "" });
    const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
    const [error, setError] = useState("");
    const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
    const service = BOOKABLE.find((s) => s.id === chosen) ?? BOOKABLE[0];

    async function submit(e: FormEvent) {
        e.preventDefault();
        setState("sending"); setError("");
        try {
            const r = await fetch("/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, service: service.id }) });
            const j = await r.json();
            if (!j.success) throw new Error(j.message);
            setState("sent");
        } catch (err) {
            setError(err instanceof Error && err.message ? err.message : "Something went wrong — please WhatsApp us.");
            setState("idle");
        }
    }

    return (
        <section id="plan" className="grain relative scroll-mt-24 overflow-clip bg-night py-20 text-white md:py-28">
            <div aria-hidden className="flicker absolute -bottom-40 left-1/2 h-80 w-[110%] -translate-x-1/2 rounded-[100%] bg-fire/20 blur-[110px]" />
            <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
                <Reveal>
                    <Eyebrow className="text-marigold">Plan my Kashi</Eyebrow>
                    <h2 className="mt-4 font-display text-4xl font-light leading-[1.02] tracking-[-0.02em] sm:text-6xl">Tell us the day. <em className="text-fire">We&apos;ll shape it.</em></h2>
                    <p className="mt-5 max-w-md text-white/60">We reply on WhatsApp with a plan and one price in writing — usually within a few hours. Nothing is paid until you say yes.</p>
                    <ul className="mt-8 grid gap-3 text-white/75">
                        {["Combine services — darshan in the morning, a quiet boat at dusk", "Elders, children and wheelchairs planned for", "Pickup from your hotel, station or airport on request"].map((x) => (
                            <li key={x} className="flex gap-3"><Sparkles size={18} className="mt-0.5 shrink-0 text-marigold" />{x}</li>
                        ))}
                    </ul>
                    <p className="mt-8 text-sm text-white/50">Looking for a puja or yajna? <Link href="/puja" className="font-semibold text-marigold underline underline-offset-4">Send a sankalp to the acharyas</Link>.</p>
                </Reveal>

                {state === "sent" ? (
                    <div className="rounded-[2rem] border border-marigold/30 bg-white/[0.03] p-8 sm:p-10">
                        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-marigold to-ember text-night"><Check size={26} /></span>
                        <h3 className="mt-6 font-display text-3xl">Request received.</h3>
                        <p className="mt-3 max-w-lg text-white/65">We&apos;ll WhatsApp {f.phone} with a plan and a written price for {service.name}.{f.email && " A copy is on its way to your inbox."}</p>
                        <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Namaste! I just requested ${service.name}${f.name ? ` — ${f.name}` : ""}.`)}`} target="_blank" rel="noopener" className={`${GHOST_BTN_DARK} mt-8 h-12`}><MessageCircle size={18} /> Continue on WhatsApp</a>
                    </div>
                ) : (
                    <form onSubmit={submit} className="grid gap-5 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
                        <fieldset>
                            <legend className={LABEL}>What would you like?</legend>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {BOOKABLE.map((s) => (
                                    <button type="button" key={s.id} onClick={() => setChosen(s.id)} aria-pressed={service.id === s.id}
                                        className={`rounded-xl border p-3 text-left transition-colors ${service.id === s.id ? "border-marigold bg-marigold/10" : "border-white/15 hover:border-white/35"}`}>
                                        <p className="text-sm font-semibold">{s.name}</p>
                                        <p className="mt-0.5 line-clamp-1 text-xs text-white/50">{s.includes.slice(0, 2).join(" · ")}</p>
                                    </button>
                                ))}
                            </div>
                        </fieldset>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="sv-date" className={LABEL}>Date</label>
                                <input id="sv-date" type="date" value={f.date} onChange={set("date")} className={`${INPUT} [color-scheme:dark]`} />
                            </div>
                            <div>
                                <label htmlFor="sv-guests" className={LABEL}>Guests</label>
                                <input id="sv-guests" type="number" min={1} max={50} value={f.guests} onChange={set("guests")} className={INPUT} />
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="sv-name" className={LABEL}>Your name</label>
                                <input id="sv-name" required value={f.name} onChange={set("name")} autoComplete="name" placeholder="Full name" className={INPUT} />
                            </div>
                            <div>
                                <label htmlFor="sv-phone" className={LABEL}>WhatsApp number</label>
                                <input id="sv-phone" required type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" placeholder="+91 98765 43210" className={INPUT} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="sv-email" className={LABEL}>Email <span className="normal-case tracking-normal text-white/35">— optional</span></label>
                            <input id="sv-email" type="email" value={f.email} onChange={set("email")} autoComplete="email" placeholder="you@example.com" className={INPUT} />
                        </div>
                        <div>
                            <label htmlFor="sv-note" className={LABEL}>Anything we should know?</label>
                            <textarea id="sv-note" rows={3} value={f.note} onChange={set("note")} maxLength={600} placeholder="Travelling with my parents, we'd love a quiet morning darshan…" className={`${INPUT} h-auto py-3`} />
                        </div>
                        {error && <p role="alert" className="rounded-xl border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-white">{error}</p>}
                        <button disabled={state === "sending"} className={`${FIRE_BTN} h-14 w-full px-8 text-lg sm:w-auto sm:justify-self-start`}>
                            {state === "sending" ? "Sending…" : `Request ${service.name}`} <ArrowRight size={18} />
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}

"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { ArrowRight, Check, Clock, Flame, MapPin, MessageCircle, Phone, Plus, ScrollText, ShieldCheck, Users, Video } from "lucide-react";
import PageHero from "@/components/layout/PageHero";
import { Eyebrow, Reveal } from "@/components/motion/primitives";
import { FIRE_BTN, GHOST_BTN_DARK, H2_LIGHT, PAPER_CARD } from "@/components/ui/styles";
import { money, useCurrency } from "@/lib/currency";
import { ACHARYA_BYTES, ACHARYA_WORD, INTENTS, MODES, PUJAS, type Intent, type Mode, type Puja } from "@/lib/pujas";

const WHATSAPP = "918175966910";
const DAY = 86400000;
const noop = () => () => { };

// Whole days from today (IST) until an IST date; null while server-rendering.
function useDaysUntil(iso?: string) {
    return useSyncExternalStore(noop, () => {
        if (!iso) return null;
        const today = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }));
        return Math.round((new Date(iso).getTime() - today.getTime()) / DAY);
    }, () => null);
}

const longDate = (iso: string) => new Date(`${iso}T00:00:00+05:30`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" });
const goToSankalp = () => document.getElementById("sankalp")?.scrollIntoView({ behavior: "smooth", block: "start" });

const MODE_ICON: Record<Mode, typeof Users> = { kashi: MapPin, live: Video, behalf: ScrollText };

export default function PujaClient() {
    const [chosen, setChosen] = useState(PUJAS[0].id);
    const choose = (id: string) => { setChosen(id); goToSankalp(); };

    return (
        <div className="w-full bg-parchment">
            <Hero onChoose={choose} />
            <AcharyaWord />
            <Modes />
            <Rites onChoose={choose} />
            <Unfolds />
            {ACHARYA_BYTES.length > 0 && <Bytes />}
            <Sankalp chosen={chosen} setChosen={setChosen} />
            <Faq />
        </div>
    );
}

function Hero({ onChoose }: { onChoose: (id: string) => void }) {
    const featured = PUJAS.find((p) => p.seasonal);
    const days = useDaysUntil(featured?.seasonal?.date);
    const live = featured && (days === null || days >= 0);
    return (
        <PageHero
            eyebrow="Puja & Yajna · Kashi"
            deva="यज्ञ"
            title="The oldest city's rites,"
            highlight="performed as they should be."
            intro={<p>Learned acharyas, a sankalp spoken in your family&apos;s name, samagri from Kashi&apos;s own bazaars — and a dakshina agreed in writing before anything begins. Sit beside the fire yourself, or join from anywhere in the world.</p>}
            aside={live && featured ? <SeasonCard puja={featured} days={days} onChoose={onChoose} /> : undefined}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button onClick={goToSankalp} className={`${FIRE_BTN} h-14 w-full px-8 text-lg sm:w-auto`}>
                    Begin your sankalp <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
                <a href="#rites" className={`${GHOST_BTN_DARK} h-14 w-full px-8 sm:w-auto`}>See the rites</a>
            </div>
        </PageHero>
    );
}

function SeasonCard({ puja, days, onChoose }: { puja: Puja; days: number | null; onChoose: (id: string) => void }) {
    const [currency] = useCurrency();
    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-marigold/30 bg-gradient-to-br from-night-2 via-night-3 to-night p-7 shadow-[0_40px_120px_-40px_rgba(255,122,26,0.55)] sm:p-9">
            <div aria-hidden className="flicker absolute -right-10 -top-10 h-48 w-48 rounded-full bg-fire/30 blur-[70px]" />
            <div className="relative">
                <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-marigold/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-marigold">
                        <Flame size={13} className="flicker" /> {puja.seasonal!.label}
                    </span>
                    {days !== null && <span className="text-sm text-white/60">{days === 0 ? "Tonight" : days === 1 ? "Tomorrow" : `In ${days} days`}</span>}
                </div>
                <p className="mt-6 font-deva text-4xl text-marigold/90">{puja.deva}</p>
                <h2 className="mt-2 font-display text-3xl font-light leading-tight tracking-tight">{puja.name}</h2>
                <p className="mt-1 text-white/60">{longDate(puja.seasonal!.date)} · Kalratri muhurat</p>
                <p className="mt-5 text-[15px] leading-relaxed text-white/70">{puja.purpose}</p>
                <div className="mt-7 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Dakshina from</p>
                        <p className="font-display text-3xl">{money(puja.dakshina, currency)}</p>
                    </div>
                    <button onClick={() => onChoose(puja.id)} className={`${FIRE_BTN} h-12 px-5 text-sm`}>Reserve the muhurat</button>
                </div>
            </div>
        </div>
    );
}

function AcharyaWord() {
    const w = ACHARYA_WORD;
    return (
        <section className="relative overflow-hidden py-20 md:py-28">
            <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
                <Reveal className="mx-auto w-full max-w-sm">
                    <div className="relative">
                        <div aria-hidden className="absolute -inset-4 rounded-[2.5rem] border border-fire/25" />
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gradient-to-b from-night-3 to-night">
                            {w.photo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={w.photo} alt={w.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center text-center">
                                    <span aria-hidden className="flicker h-16 w-8 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-gradient-to-t from-ember via-fire to-marigold blur-[1px]" />
                                    <span className="mt-6 font-deva text-7xl text-marigold/80">ॐ</span>
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-5 left-1/2 w-[85%] -translate-x-1/2 rounded-2xl bg-night px-5 py-3 text-center text-white shadow-xl">
                            <p className="font-deva text-lg text-marigold">{w.nameDeva}</p>
                            <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">Senior Acharya · KashiGo Anushthan</p>
                        </div>
                    </div>
                </Reveal>
                <Reveal delay={0.1}>
                    <Eyebrow className="text-fire">A word from the Acharya</Eyebrow>
                    <p className="mt-6 font-deva text-4xl leading-snug text-night sm:text-5xl">“{w.chaupai}”</p>
                    <p className="mt-2 text-sm text-night/50">{w.source}</p>
                    <p lang="hi" className="mt-8 font-deva text-lg leading-[1.9] text-night/80">{w.hindi}</p>
                    <p className="mt-5 border-l-2 border-marigold pl-5 leading-relaxed text-night/60 italic">{w.english}</p>
                    <p className="mt-8 font-deva text-xl text-fire-deep">{w.closing}</p>
                    <p className="mt-1 font-display text-lg text-night">— {w.name}</p>
                </Reveal>
            </div>
        </section>
    );
}

function Modes() {
    return (
        <section className="grain relative bg-night py-20 text-white md:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <Reveal>
                    <Eyebrow className="text-marigold">Three ways to take part</Eyebrow>
                    <h2 className="mt-4 max-w-3xl font-display text-4xl font-light leading-[1.02] tracking-[-0.02em] sm:text-6xl">
                        Wherever you are, <em className="text-fire">the fire is lit in Kashi.</em>
                    </h2>
                </Reveal>
                <div className="mt-12 grid gap-4 md:grid-cols-3">
                    {MODES.map((m, i) => {
                        const Icon = MODE_ICON[m.id];
                        return (
                            <Reveal key={m.id} delay={i * 0.08} className="group rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-7 transition-colors hover:border-marigold/40 hover:bg-white/[0.05]">
                                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-marigold to-ember text-night"><Icon size={20} /></span>
                                <p className="mt-6 font-display text-sm italic text-marigold/70">0{i + 1}</p>
                                <h3 className="mt-1 font-display text-2xl">{m.title}</h3>
                                <p className="mt-1 text-sm font-medium text-white/80">{m.line}</p>
                                <p className="mt-4 text-[15px] leading-relaxed text-white/60">{m.detail}</p>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function Rites({ onChoose }: { onChoose: (id: string) => void }) {
    const [intent, setIntent] = useState<Intent | "all">("all");
    const list = intent === "all" ? PUJAS : PUJAS.filter((p) => p.intents.includes(intent));
    return (
        <section id="rites" className="scroll-mt-24 py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <Eyebrow className="text-fire">The rites</Eyebrow>
                        <h2 className={`${H2_LIGHT} mt-4 text-4xl sm:text-6xl`}>What is your <em className="text-fire-deep">prayer for?</em></h2>
                    </div>
                    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:justify-end lg:px-0">
                        {[{ id: "all" as const, label: "All rites" }, ...INTENTS].map((t) => (
                            <button key={t.id} onClick={() => setIntent(t.id)} aria-pressed={intent === t.id}
                                className={`h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${intent === t.id ? "border-night bg-night text-parchment" : "border-night/15 text-night/70 hover:border-night/40"}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </Reveal>
                <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {list.map((p) => <RiteCard key={p.id} puja={p} onChoose={onChoose} />)}
                </div>
                <p className="mt-8 text-center text-sm text-night/55">Don&apos;t see your rite? Griha pravesh, mundan, a jaap for exams — <button onClick={goToSankalp} className="font-semibold text-night underline decoration-marigold decoration-2 underline-offset-4 hover:text-fire">tell the acharya what you need</button>.</p>
            </div>
        </section>
    );
}

function RiteCard({ puja: p, onChoose }: { puja: Puja; onChoose: (id: string) => void }) {
    const [currency] = useCurrency();
    const [open, setOpen] = useState(false);
    return (
        <article className={`${PAPER_CARD} flex flex-col p-6 sm:p-7`}>
            <div className="flex items-start justify-between gap-4">
                <p className="font-deva text-2xl text-fire-deep">{p.deva}</p>
                {p.seasonal && <span className="rounded-full bg-night px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-marigold">{p.seasonal.label}</span>}
            </div>
            <h3 className="mt-2 font-display text-2xl leading-tight text-night">{p.name}</h3>
            <p className="mt-1 text-sm text-night/50">{p.deity}</p>
            <p className="mt-4 flex-1 text-[15px] leading-relaxed text-night/70">{p.purpose}</p>
            <ul className="mt-5 grid gap-2 text-sm text-night/65">
                <li className="flex gap-2"><Clock size={16} className="mt-0.5 shrink-0 text-fire" />{p.duration}</li>
                <li className="flex gap-2"><Users size={16} className="mt-0.5 shrink-0 text-fire" />{p.acharyas === 1 ? "1 acharya" : `${p.acharyas} acharyas`} · {p.where}</li>
                <li className="flex gap-2"><Video size={16} className="mt-0.5 shrink-0 text-fire" />{p.modes.map((m) => MODES.find((x) => x.id === m)!.title).join(" · ")}</li>
            </ul>
            <button onClick={() => setOpen(!open)} aria-expanded={open} className="mt-5 flex items-center justify-between border-t border-night/10 pt-4 text-left text-sm font-semibold text-night">
                What happens in the rite
                <Plus size={18} className={`text-fire transition-transform duration-500 ${open ? "rotate-45" : ""}`} />
            </button>
            <div className="accordion" data-open={open}>
                <div>
                    <ol className="mt-3 grid gap-2 text-sm text-night/65">
                        {p.steps.map((s, i) => <li key={s} className="flex gap-3"><span className="font-display italic text-fire">{i + 1}</span>{s}</li>)}
                    </ol>
                </div>
            </div>
            <div className="mt-6 flex items-end justify-between gap-3">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-night/45">Dakshina from</p>
                    <p className="font-display text-2xl text-night">{money(p.dakshina, currency)}</p>
                </div>
                <button onClick={() => onChoose(p.id)} className={`${FIRE_BTN} h-11 px-5 text-sm`}>Choose <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></button>
            </div>
        </article>
    );
}

const UNFOLDS = [
    { t: "You send a sankalp", d: "The rite, your family's names and what you're praying for. Two minutes, nothing to pay." },
    { t: "The acharya calls you", d: "Within a day — to fix the muhurat from the panchang, take your gotra, and agree the dakshina in writing." },
    { t: "Kashi prepares", d: "Samagri bought fresh from Vishwanath Gali; the chowki, kalash and fire laid out at the ghat or temple." },
    { t: "The rite is performed", d: "Your name is spoken into the sankalp. You sit beside the fire, or watch every moment live." },
    { t: "Prasad comes home", d: "Raksha sutra, prasad and Ganga jal — handed to you, or posted anywhere in the world — with the full recording." },
];

function Unfolds() {
    return (
        <section className="bg-parchment-2/60 py-20 md:py-28">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
                <Reveal className="text-center">
                    <Eyebrow className="center text-fire">How a rite unfolds</Eyebrow>
                    <h2 className={`${H2_LIGHT} mt-4 text-4xl sm:text-5xl`}>From your words <em className="text-fire-deep">to the sacred fire.</em></h2>
                </Reveal>
                <ol className="relative mt-14 grid gap-8 before:absolute before:bottom-2 before:left-[1.2rem] before:top-2 before:w-px before:bg-gradient-to-b before:from-marigold before:via-fire before:to-ember md:before:left-1/2">
                    {UNFOLDS.map((u, i) => (
                        <Reveal as="li" key={u.t} delay={i * 0.05} className={`relative grid pl-14 md:w-1/2 md:pl-0 ${i % 2 ? "md:ml-auto md:pl-14" : "md:pr-14 md:text-right"}`}>
                            <span className={`absolute left-0 top-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-night font-display italic text-marigold shadow-lg ${i % 2 ? "md:-left-5" : "md:left-auto md:-right-5"}`}>{i + 1}</span>
                            <h3 className="font-display text-2xl text-night">{u.t}</h3>
                            <p className="mt-1 text-night/65">{u.d}</p>
                        </Reveal>
                    ))}
                </ol>
                <div className="mt-16 grid gap-3 sm:grid-cols-3">
                    {[
                        ["Dakshina in writing", "Agreed on the call, sent to you on WhatsApp. No ‘extra for the pandit’ at the ghat."],
                        ["Every rite recorded", "Whether you're there or not, you keep the full video."],
                        ["No promises we can't keep", "We perform the rite with care and correctness. Outcomes belong to the divine."],
                    ].map(([t, d]) => (
                        <div key={t} className="rounded-2xl border border-night/10 bg-[#fffaf0] p-5">
                            <ShieldCheck size={20} className="text-fire" />
                            <p className="mt-3 font-semibold text-night">{t}</p>
                            <p className="mt-1 text-sm text-night/60">{d}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Bytes() {
    return (
        <section className="grain relative bg-night py-20 text-white md:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <Reveal>
                    <Eyebrow className="text-marigold">Meet the acharyas</Eyebrow>
                    <h2 className="mt-4 font-display text-4xl font-light tracking-[-0.02em] sm:text-5xl">In their <em className="text-fire">own words.</em></h2>
                </Reveal>
                <div className="rail -mx-4 mt-10 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-3">
                    {ACHARYA_BYTES.map((b) => (
                        <figure key={b.video} className="w-[78vw] overflow-hidden rounded-[1.75rem] border border-white/10 bg-night-2 sm:w-auto">
                            <video src={b.video} poster={b.poster} controls playsInline preload="metadata" className="aspect-[9/16] w-full bg-black object-cover" />
                            <figcaption className="p-5">
                                <p className="font-display text-xl">{b.name}</p>
                                <p className="text-sm text-white/55">{b.role}</p>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}

const INPUT = "h-12 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 text-white placeholder:text-white/35 outline-none transition-colors focus:border-marigold";
const LABEL = "mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55";

function Sankalp({ chosen, setChosen }: { chosen: string; setChosen: (id: string) => void }) {
    const [currency] = useCurrency();
    const puja = PUJAS.find((p) => p.id === chosen)!;
    const [modePick, setMode] = useState<Mode>("kashi");
    const mode = puja.modes.includes(modePick) ? modePick : puja.modes[0];
    const [f, setF] = useState({ name: "", family: "", gotra: "", noGotra: false, sankalp: "", date: "", phone: "", email: "" });
    const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
    const [error, setError] = useState("");
    const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
    const [minDate] = useState(() => new Date(Date.now() + DAY).toISOString().slice(0, 10));
    const gotra = f.noGotra ? "Kashyap" : f.gotra;

    async function submit(e: FormEvent) {
        e.preventDefault();
        setState("sending"); setError("");
        try {
            const r = await fetch("/api/puja", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, gotra, puja: puja.id, mode }) });
            const j = await r.json();
            if (!j.success) throw new Error(j.message);
            setState("sent");
        } catch (err) {
            setError(err instanceof Error && err.message ? err.message : "Something went wrong — please WhatsApp us.");
            setState("idle");
        }
    }

    const waText = `Pranam! I'd like to arrange ${puja.name} (${MODES.find((m) => m.id === mode)!.title}).${f.date ? ` Preferred date: ${longDate(f.date)}.` : ""}${f.name ? ` — ${f.name}` : ""}`;

    return (
        <section id="sankalp" className="grain relative scroll-mt-24 overflow-clip bg-night py-20 text-white md:py-28">
            <div aria-hidden className="flicker absolute -bottom-40 left-1/2 h-80 w-[110%] -translate-x-1/2 rounded-[100%] bg-fire/20 blur-[110px]" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
                <Reveal>
                    <Eyebrow className="text-marigold">Your sankalp</Eyebrow>
                    <h2 className="mt-4 max-w-3xl font-display text-4xl font-light leading-[1.02] tracking-[-0.02em] sm:text-6xl">Every rite begins <em className="text-fire">with an intention.</em></h2>
                    <p className="mt-4 max-w-xl text-white/60">Tell us whom it is for and what you pray for. Nothing is paid now — the acharya calls you first.</p>
                </Reveal>

                <div className="mt-12 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                    {state === "sent" ? (
                        <div className="rounded-[2rem] border border-marigold/30 bg-white/[0.03] p-8 sm:p-10">
                            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-marigold to-ember text-night"><Check size={26} /></span>
                            <h3 className="mt-6 font-display text-3xl">Your sankalp has reached Kashi.</h3>
                            <p className="mt-3 max-w-lg text-white/65">An acharya will call you on {f.phone} within a day to fix the muhurat and the dakshina.{f.email && " We've emailed you a copy."} If it&apos;s urgent, message us now.</p>
                            <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener" className={`${GHOST_BTN_DARK} mt-8 h-12`}><MessageCircle size={18} /> Continue on WhatsApp</a>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
                            <div>
                                <label htmlFor="pj-rite" className={LABEL}>The rite</label>
                                <select id="pj-rite" value={puja.id} onChange={(e) => setChosen(e.target.value)} className={`${INPUT} appearance-none`}>
                                    {PUJAS.map((p) => <option key={p.id} value={p.id} className="bg-night">{p.name} — from {money(p.dakshina, currency)}</option>)}
                                </select>
                            </div>
                            <fieldset>
                                <legend className={LABEL}>How you&apos;ll take part</legend>
                                <div className="grid gap-2 sm:grid-cols-3">
                                    {MODES.map((m) => {
                                        const ok = puja.modes.includes(m.id);
                                        const Icon = MODE_ICON[m.id];
                                        return (
                                            <button type="button" key={m.id} disabled={!ok} onClick={() => setMode(m.id)} aria-pressed={mode === m.id}
                                                className={`rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${mode === m.id ? "border-marigold bg-marigold/10" : "border-white/15 hover:border-white/35"}`}>
                                                <Icon size={18} className="text-marigold" />
                                                <p className="mt-2 text-sm font-semibold">{m.title}</p>
                                                <p className="text-xs text-white/50">{ok ? m.line : "Not offered for this rite"}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </fieldset>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="pj-name" className={LABEL}>Your name (yajmaan)</label>
                                    <input id="pj-name" required value={f.name} onChange={set("name")} autoComplete="name" placeholder="Full name" className={INPUT} />
                                </div>
                                <div>
                                    <label htmlFor="pj-date" className={LABEL}>Preferred date</label>
                                    <input id="pj-date" type="date" min={minDate} value={f.date} onChange={set("date")} className={`${INPUT} [color-scheme:dark]`} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="pj-family" className={LABEL}>Others in the sankalp <span className="normal-case tracking-normal text-white/35">— optional</span></label>
                                <input id="pj-family" value={f.family} onChange={set("family")} placeholder="Spouse, children, parents…" className={INPUT} />
                            </div>
                            <div>
                                <label htmlFor="pj-gotra" className={LABEL}>Gotra</label>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <input id="pj-gotra" value={f.noGotra ? "" : f.gotra} onChange={set("gotra")} disabled={f.noGotra} placeholder={f.noGotra ? "Kashyap gotra will be used" : "e.g. Bharadwaj"} className={`${INPUT} disabled:opacity-50`} />
                                    <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm text-white/70">
                                        <input type="checkbox" checked={f.noGotra} onChange={(e) => setF({ ...f, noGotra: e.target.checked })} className="h-4 w-4 accent-[#ffb627]" />
                                        I don&apos;t know mine
                                    </label>
                                </div>
                                {f.noGotra && <p className="mt-2 text-xs text-white/45">By tradition, anyone who doesn&apos;t know their gotra takes Kashyap — the rishi from whom all are said to descend.</p>}
                            </div>
                            <div>
                                <label htmlFor="pj-sankalp" className={LABEL}>What do you pray for?</label>
                                <textarea id="pj-sankalp" rows={3} value={f.sankalp} onChange={set("sankalp")} maxLength={600} placeholder="Health for my mother, a new business, peace for my late father…" className={`${INPUT} h-auto py-3`} />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="pj-phone" className={LABEL}>WhatsApp number</label>
                                    <input id="pj-phone" required type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" placeholder="+91 98765 43210" className={INPUT} />
                                </div>
                                <div>
                                    <label htmlFor="pj-email" className={LABEL}>Email <span className="normal-case tracking-normal text-white/35">— optional</span></label>
                                    <input id="pj-email" type="email" value={f.email} onChange={set("email")} autoComplete="email" placeholder="you@example.com" className={INPUT} />
                                </div>
                            </div>
                            {error && <p role="alert" className="rounded-xl border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-white">{error}</p>}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <button disabled={state === "sending"} className={`${FIRE_BTN} h-14 w-full px-8 text-lg sm:w-auto`}>
                                    {state === "sending" ? "Sending to Kashi…" : "Send my sankalp"} <Flame size={18} />
                                </button>
                                <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener" className="inline-flex items-center justify-center gap-2 text-sm text-white/60 hover:text-marigold"><MessageCircle size={16} /> or ask on WhatsApp</a>
                            </div>
                        </form>
                    )}

                    <SankalpPatra puja={puja} mode={mode} name={f.name} family={f.family} gotra={gotra} sankalp={f.sankalp} date={f.date} />
                </div>
            </div>
        </section>
    );
}

// The sankalp as the acharya will speak it, filling in live as the form is typed.
function SankalpPatra({ puja, mode, name, family, gotra, sankalp, date }: { puja: Puja; mode: Mode; name: string; family: string; gotra: string; sankalp: string; date: string }) {
    const [currency] = useCurrency();
    const blank = (v: string, ph: string) => v ? <span className="text-night">{v}</span> : <span className="text-night/35">{ph}</span>;
    return (
        <aside className="lg:sticky lg:top-28">
            <div className="relative rounded-[1.5rem] bg-[#f8eed8] p-7 text-night shadow-[0_40px_100px_-30px_rgba(255,122,26,0.5)] sm:p-9">
                <div aria-hidden className="pointer-events-none absolute inset-3 rounded-[1.1rem] border border-fire/30" />
                <p className="text-center font-deva text-3xl text-fire-deep">॥ संकल्प ॥</p>
                <p className="mt-1 text-center text-[11px] uppercase tracking-[0.25em] text-night/45">As it will be spoken in Kashi</p>
                <p className="mt-7 font-display text-[1.15rem] leading-[1.75] text-night/75">
                    In the sacred city of Kashi, on the banks of Maa Ganga, on {blank(date ? longDate(date) : "", "the day of the muhurat")}, I, {blank(name, "your name")}
                    {gotra ? <>, of <span className="text-night">{gotra}</span> gotra</> : ""}
                    {family ? <>, together with <span className="text-night">{family}</span></> : ""}, offer the <span className="text-night font-medium">{puja.name}</span> to {puja.deity}
                    {sankalp ? <>, praying for <span className="text-night">{sankalp}</span></> : ""}.
                </p>
                <div className="mt-7 grid gap-2 border-t border-night/10 pt-5 text-sm">
                    <div className="flex justify-between gap-4"><span className="text-night/50">Taking part</span><span className="text-right font-medium">{MODES.find((m) => m.id === mode)!.title}</span></div>
                    <div className="flex justify-between gap-4"><span className="text-night/50">Duration</span><span className="text-right font-medium">{puja.duration}</span></div>
                    <div className="flex justify-between gap-4"><span className="text-night/50">Dakshina from</span><span className="font-display text-xl">{money(puja.dakshina, currency)}</span></div>
                </div>
                <p className="mt-5 flex items-center justify-center gap-2 text-xs text-night/45"><Phone size={13} /> Final dakshina agreed with the acharya on the call</p>
            </div>
        </aside>
    );
}

const FAQS = [
    { q: "Who performs the rites?", a: "Acharyas trained in the Vedic and Karmakand traditions of Kashi, guided by our senior acharya, Ramanuj Das Badri Narayan Upadhyay. Larger anushthans like a 1.25 lakh Maha Mrityunjaya jaap are done by a team." },
    { q: "What does the dakshina cover?", a: "The acharyas' dakshina, all samagri, the chowki and setup, the video recording and, for live and on-your-behalf rites, prasad posted to you. If the rite asks for the river, the boat is arranged too. The exact figure is agreed on the call and sent to you in writing before anything is paid." },
    { q: "I'm not Hindu — can I have a puja done?", a: "Yes. Many guests from abroad sit for a Ganga Puja or Rudrabhishek out of gratitude or curiosity. The acharya explains each step in English as it happens; you only need to come with an open heart." },
    { q: "How does a live puja work across time zones?", a: "The muhurat is fixed in Indian time, and we tell you exactly what that is where you live. You get a private video link; the acharya speaks your sankalp and pauses for you to offer flowers or water at home. If the hour is impossible, choose 'on your behalf' and receive the recording." },
    { q: "Can you guarantee the result?", a: "No honest acharya sells outcomes. What we promise is a rite performed correctly, at the right muhurat, with your sankalp spoken sincerely in Kashi. The rest is faith." },
    { q: "Can I pair a rite with a boat ride?", a: "Yes — a Ganga Puja at dusk followed by the evening aarti from your own boat is one of the most beautiful ways to spend an evening in Varanasi. Mention it in your sankalp and we'll arrange both." },
];

function Faq() {
    const [open, setOpen] = useState<number | null>(0);
    return (
        <section className="py-20 md:py-28">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="self-start lg:sticky lg:top-32">
                    <Eyebrow className="text-fire">Before you begin</Eyebrow>
                    <h2 className={`${H2_LIGHT} mt-4 text-5xl sm:text-6xl`}>Questions, <em className="text-fire-deep">answered.</em></h2>
                    <p className="mt-6 max-w-sm text-night/60">Or speak to us directly: <a href="tel:+918175966910" className="font-semibold text-night underline decoration-marigold decoration-2 underline-offset-4 hover:text-fire">+91 81759 66910</a>.</p>
                </div>
                <div className="divide-y divide-night/10 border-y border-night/10">
                    {FAQS.map((f, i) => (
                        <div key={f.q}>
                            <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                                <span className="font-display text-xl text-night sm:text-2xl">{f.q}</span>
                                <Plus size={20} className={`shrink-0 text-fire transition-transform duration-500 ${open === i ? "rotate-45" : ""}`} />
                            </button>
                            <div className="accordion" data-open={open === i}><div><p className="pb-6 leading-relaxed text-night/65">{f.a}</p></div></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

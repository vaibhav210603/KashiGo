import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Award, BookOpen, Briefcase, CalendarCheck, Check, Clock, Gem, Hash, Heart, HeartPulse, House, Orbit, Phone, ScrollText, ShieldCheck, Sparkles, Users } from "lucide-react";
import { FIRE_BTN } from "@/components/ui/styles";
import { JsonLd } from "@/components/JsonLd";
import { EXPERTS, consultHref, expertBySlug, expertPath, type Expert, type ExpertiseIcon } from "@/lib/experts";
import { CONSULT_PER_MINUTE_INR } from "@/lib/pujas";

const BASE = "https://kashigo.in";

export function generateStaticParams() {
    return EXPERTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const e = expertBySlug((await params).slug);
    if (!e) return {};
    const description = `${e.name} — ${e.role}. ${e.expertise.map((x) => x.title).join(", ")}. Book a call or an appointment through KashiGo.`;
    return {
        title: `${e.name} · ${e.title}`,
        description,
        alternates: { canonical: `${BASE}${expertPath(e)}` },
        openGraph: { title: `${e.name} · ${e.title} | KashiGo`, description, url: `${BASE}${expertPath(e)}`, images: [{ url: e.portrait }] },
    };
}

const EXPERTISE_ICONS: Record<ExpertiseIcon, typeof Heart> = {
    vastu: House, kundli: Orbit, dharma: ScrollText, relationships: Heart, marriage: Gem,
    career: Briefcase, health: HeartPulse, family: Users, numerology: Hash,
};

const TERMS = [
    { Icon: Clock, text: `Calls are charged ₹${CONSULT_PER_MINUTE_INR} per minute` },
    { Icon: ShieldCheck, text: "Pay only if satisfied" },
    { Icon: Sparkles, text: "Remedies start working according to the scale of the problem — from 2 months to 1 year" },
];

// Section heading: small gold label over a light display title.
function Heading({ label, children, dark = false }: { label: string; children: React.ReactNode; dark?: boolean }) {
    return (
        <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-fire">
                <span aria-hidden className="h-px w-8 bg-gradient-to-r from-transparent to-marigold" />{label}
            </p>
            <h2 className={`mt-3 font-display text-4xl font-light leading-[1.05] tracking-[-0.02em] sm:text-5xl ${dark ? "text-white" : "text-night"}`}>{children}</h2>
        </div>
    );
}

function Ctas({ e, center = false }: { e: Expert; center?: boolean }) {
    return (
        <div className={`flex flex-col gap-3 sm:flex-row ${center ? "sm:justify-center" : ""}`}>
            <Link href={consultHref(e, "call")} className={`${FIRE_BTN} h-14 w-full px-8 text-lg sm:w-auto`}><Phone size={18} /> Book a call</Link>
            <Link href={consultHref(e, "appointment")}
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border border-marigold/60 px-8 font-semibold text-white transition-colors hover:bg-marigold hover:text-night sm:w-auto">
                <CalendarCheck size={18} className="text-marigold" /> Book an appointment
            </Link>
        </div>
    );
}

export default async function ExpertPage({ params }: { params: Promise<{ slug: string }> }) {
    const e = expertBySlug((await params).slug);
    if (!e) notFound();
    const others = EXPERTS.filter((x) => x.slug !== e.slug);

    return (
        <div className="w-full bg-parchment">
            <JsonLd data={{
                "@context": "https://schema.org",
                "@type": "Person",
                name: e.name,
                jobTitle: e.role,
                image: `${BASE}${e.portrait}`,
                url: `${BASE}${expertPath(e)}`,
                knowsAbout: e.expertise.map((x) => x.title),
                ...(e.website ? { sameAs: [e.website] } : {}),
                worksFor: { "@type": "Organization", name: "KashiGo", url: BASE },
            }} />

            {/* ── Hero: arched portrait, name, their words, booking ── */}
            <section className="grain relative isolate overflow-hidden bg-night pt-28 pb-16 text-white md:pt-36 md:pb-24">
                <div aria-hidden className="absolute -top-40 left-1/2 -z-10 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,182,39,0.18),transparent_65%)]" />
                <p aria-hidden className="pointer-events-none absolute -right-6 top-24 -z-10 select-none font-deva text-[22vw] leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,182,39,0.12)] lg:text-[13rem]">
                    {e.nameDeva.split(" ").slice(-2).join(" ")}
                </p>
                <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
                    <div className="mx-auto w-full max-w-[19rem] sm:max-w-sm">
                        <div className="relative">
                            <div aria-hidden className="absolute -inset-3 rounded-t-full rounded-b-[2rem] border border-marigold/40" />
                            <div className="relative overflow-hidden rounded-t-full rounded-b-[1.75rem] bg-gradient-to-b from-[#f7dc8c] via-marigold to-[#9c6d1e] p-[3px] shadow-[0_40px_90px_-30px_rgba(255,182,39,0.55)]">
                                {/* eslint-disable-next-line @next/next/no-img-element -- portrait in /public */}
                                <img src={e.portrait} alt={e.name} className="aspect-[4/5] w-full rounded-t-full rounded-b-[1.6rem] object-cover object-top" />
                            </div>
                            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-marigold via-fire to-ember px-5 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-night shadow-lg">{e.title}</span>
                        </div>
                    </div>

                    <div className="text-center lg:text-left">
                        <p className="font-deva text-2xl text-marigold sm:text-3xl">{e.nameDeva}</p>
                        <h1 className="mt-2 font-display text-[2.6rem] font-light leading-[1.02] tracking-[-0.02em] sm:text-6xl">{e.name}</h1>
                        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/55">{e.role}</p>
                        {e.quote && <p className="mx-auto mt-6 max-w-xl border-l-2 border-marigold pl-5 text-left font-display text-xl italic leading-snug text-white/85 lg:mx-0">“{e.quote}”</p>}
                        <ul className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
                            {e.expertise.map((x) => {
                                const Icon = EXPERTISE_ICONS[x.icon];
                                return (
                                    <li key={x.title} className="inline-flex items-center gap-1.5 rounded-full border border-marigold/40 bg-white/5 px-3.5 py-1.5 text-sm text-white/90">
                                        <Icon size={14} className="text-marigold" />{x.title}
                                    </li>
                                );
                            })}
                        </ul>
                        {e.stats && (
                            <dl className="mx-auto mt-8 grid max-w-md grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03] lg:mx-0">
                                {e.stats.map((s) => (
                                    <div key={s.label} className="px-3 py-4 text-center">
                                        <dt className="sr-only">{s.label}</dt>
                                        <dd className="font-display text-3xl text-marigold">{s.value}</dd>
                                        <dd className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/55">{s.label}</dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                        <div className="mt-8"><Ctas e={e} /></div>
                        {e.website && (
                            <a href={e.website} target="_blank" rel="noopener" className="group mt-5 inline-flex items-center gap-1.5 font-semibold text-marigold underline decoration-marigold/50 underline-offset-4 hover:decoration-marigold">
                                Know more on her website <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                            </a>
                        )}
                    </div>
                </div>
            </section>

            {/* ── About + their video ── */}
            <section className="py-16 md:py-24">
                <div className={`mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 ${e.video ? "lg:grid-cols-[1.1fr_0.9fr] lg:items-center" : ""}`}>
                    <div className={e.video ? "" : "max-w-3xl"}>
                        <Heading label="About">A life <em className="text-fire-deep">of practice.</em></Heading>
                        <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-night/75">{e.about.map((p) => <p key={p}>{p}</p>)}</div>
                        {e.credentials && (
                            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
                                {e.credentials.map((c) => (
                                    <li key={c.title} className="rounded-2xl border border-night/10 bg-[#fffaf0] p-4 shadow-[0_20px_40px_-30px_rgba(60,30,0,0.5)]">
                                        <Award size={20} className="text-fire" />
                                        <p className="mt-2 font-semibold leading-snug text-night">{c.title}</p>
                                        <p className="mt-1 text-sm text-night/60">{c.detail}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {e.video && (
                        <figure className="mx-auto w-full max-w-[20rem]">
                            <div className="relative overflow-hidden rounded-[2rem] bg-night p-[3px] shadow-[0_40px_80px_-30px_rgba(60,30,0,0.6)] ring-1 ring-marigold/50">
                                <video src={e.video.src} poster={e.video.poster} controls playsInline preload="metadata" className="aspect-[9/16] w-full rounded-[1.8rem] bg-black object-cover">
                                    {e.video.captions && <track kind="captions" src={e.video.captions} srcLang="en" label="English" />}
                                </video>
                            </div>
                            <figcaption className="mt-3 text-center text-sm text-night/55">A message from {e.name}</figcaption>
                        </figure>
                    )}
                </div>
            </section>

            {/* ── Expertise ── */}
            <section className="grain relative bg-night py-16 text-white md:py-24">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    {e.expertiseHeading
                        ? <Heading label="Expertise" dark>{e.expertiseHeading.replace(/ with$/, "")} <em className="text-fire">with</em></Heading>
                        : <Heading label="Expertise" dark>What to <em className="text-fire">ask about.</em></Heading>}
                    {e.expertise.every((x) => x.detail) ? (
                        <ol className="mt-10 grid gap-4 md:grid-cols-3">
                            {e.expertise.map((x, i) => {
                                const Icon = EXPERTISE_ICONS[x.icon];
                                return (
                                    <li key={x.title} className="relative overflow-hidden rounded-[1.75rem] border border-marigold/25 bg-gradient-to-b from-white/[0.06] to-transparent p-6">
                                        <span aria-hidden className="absolute -right-2 -top-4 font-display text-8xl italic text-marigold/10">0{i + 1}</span>
                                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-marigold to-ember text-night"><Icon size={20} /></span>
                                        {x.deva && <p className="mt-4 font-deva text-2xl text-marigold">{x.deva}</p>}
                                        <h3 className={`font-display text-2xl ${x.deva ? "mt-1 text-white/90" : "mt-4 text-marigold"}`}>{x.title}</h3>
                                        <p className="mt-3 text-white/70">{x.detail}</p>
                                    </li>
                                );
                            })}
                        </ol>
                    ) : (
                        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {e.expertise.map((x) => {
                                const Icon = EXPERTISE_ICONS[x.icon];
                                return (
                                    <li key={x.title} className="flex items-center gap-2.5 rounded-2xl border border-marigold/30 bg-gradient-to-b from-white/[0.07] to-transparent px-3 py-3 sm:gap-3 sm:px-3.5">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-marigold to-ember text-night shadow-[0_8px_24px_-10px_rgba(255,122,26,0.9)] sm:h-10 sm:w-10"><Icon size={18} /></span>
                                        <span className="min-w-0 leading-tight">
                                            <span className="block text-[15px] font-semibold text-white sm:text-base">{x.title}</span>
                                            {x.deva && <span className="block font-deva text-sm text-marigold/90">{x.deva}</span>}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    {e.services && (
                        <div className="mt-10">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/55">All readings</p>
                            <ul className="mt-4 flex flex-wrap gap-2">
                                {e.services.map((s) => <li key={s} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 text-sm text-white/85"><Check size={14} className="text-marigold" />{s}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Her book ── */}
            {e.book && (
                <section className="py-16 md:py-24">
                    <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 sm:px-6 md:grid-cols-[0.7fr_1.3fr]">
                        {/* eslint-disable-next-line @next/next/no-img-element -- book cover in /public */}
                        <img src={e.book.cover} alt={`${e.book.title}: ${e.book.subtitle} — book cover`} loading="lazy" className="mx-auto w-48 rotate-[-3deg] rounded-md shadow-[20px_30px_60px_-20px_rgba(60,30,0,0.6)] sm:w-60" />
                        <div>
                            <Heading label="Her book">{e.book.title}: <em className="text-fire-deep">{e.book.subtitle}</em></Heading>
                            <p className="mt-5 text-[17px] leading-relaxed text-night/70">The method she uses in her readings — how to find your numbers, what each one means, and how they work together in a life.</p>
                            {e.website && <a href={e.website} target="_blank" rel="noopener" className="mt-5 inline-flex items-center gap-1.5 font-semibold text-fire-deep underline underline-offset-4"><BookOpen size={16} /> See it on her website</a>}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Gallery ── */}
            {e.gallery && e.gallery.length > 2 && (
                <section className={`${e.book ? "bg-parchment-2/60" : ""} py-16 md:py-24`}>
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <Heading label="Gallery">Milestones <em className="text-fire-deep">and moments.</em></Heading>
                        <div className="mt-10 columns-2 gap-3 sm:columns-3 sm:gap-4">
                            {e.gallery.map((g) => (
                                <figure key={g.src} className="group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl bg-night sm:mb-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element -- compressed photos in /public */}
                                    <img src={g.src} alt={g.caption} loading="lazy" decoding="async" className="w-full transition-transform duration-700 group-hover:scale-[1.03]" />
                                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2.5 pt-8 text-xs text-white/90 sm:text-sm">{g.caption}</figcaption>
                                </figure>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Book: terms and the two buttons ── */}
            <section className="grain relative overflow-hidden bg-gradient-to-b from-night via-[#22100c] to-night py-16 text-white md:py-24">
                <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
                    <p className="font-deva text-2xl text-marigold">{e.nameDeva}</p>
                    <h2 className="mt-2 font-display text-4xl font-light leading-tight sm:text-5xl">Know more <em className="text-fire">about yourself.</em></h2>
                    <ul className="mx-auto mt-8 grid max-w-xl gap-3 text-left text-white/80">
                        {TERMS.map(({ Icon, text }) => <li key={text} className="flex items-start gap-3"><Icon size={18} className="mt-0.5 shrink-0 text-marigold" />{text}</li>)}
                    </ul>
                    <div className="mt-9"><Ctas e={e} center /></div>
                </div>
            </section>

            {/* ── The other experts ── */}
            <section className="py-14 md:py-20">
                <div className="mx-auto max-w-5xl px-4 sm:px-6">
                    <p className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-fire">Also consult</p>
                    <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                        {others.map((o) => (
                            <li key={o.slug}>
                                <Link href={expertPath(o)} className="group flex items-center gap-4 rounded-[1.5rem] border border-night/10 bg-[#fffaf0] p-4 transition-shadow hover:shadow-[0_24px_50px_-30px_rgba(60,30,0,0.6)]">
                                    {/* eslint-disable-next-line @next/next/no-img-element -- square portrait in /public */}
                                    <img src={o.icon} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-marigold" />
                                    <span className="min-w-0 flex-1">
                                        <span className="block font-deva text-lg leading-tight text-fire-deep">{o.nameDeva}</span>
                                        <span className="block truncate font-semibold text-night">{o.name}</span>
                                        <span className="block text-xs uppercase tracking-[0.16em] text-night/50">{o.title}</span>
                                    </span>
                                    <ArrowRight size={18} className="shrink-0 text-night/40 transition-transform group-hover:translate-x-1 group-hover:text-fire" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
}

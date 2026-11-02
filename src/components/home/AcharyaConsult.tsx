import Link from "next/link";
import { ArrowRight, CalendarCheck, Clock, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { FIRE_BTN } from "@/components/ui/styles";
import { EXPERTS, consultHref, expertPath, ratePerMinute } from "@/lib/experts";

const NOTES = [
    { Icon: Clock, text: "Calls are charged by the minute — the rate is under each expert" },
    { Icon: ShieldCheck, text: "Pay only if satisfied" },
    { Icon: Sparkles, text: "Remedies start working according to the scale of the problem — from 2 months to 1 year" },
];

// Consultations with KashiGo's gurus and experts: portraits that open their profiles (no video here), two ways to book, and the terms.
// On the home page it sits right after the ride packages and links on to /puja, where the acharyas' videos play.
export default function AcharyaConsult({ id = "consult", knowMore = false }: { id?: string; knowMore?: boolean }) {
    return (
        <section id={id} className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-night via-[#22100c] to-night py-16 text-white md:py-24">
            <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-marigold/50 to-transparent" />
            <div aria-hidden className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,122,26,0.22),transparent_70%)]" />

            <div className="relative mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-marigold">Explore our other services · <span className="font-deva normal-case tracking-normal">यज्ञ और पूजा</span></p>
                    <h2 className="mt-4 font-display text-4xl font-light leading-[1.02] tracking-[-0.02em] sm:text-5xl">
                        A solution to all your problems — <em className="text-fire">mental, physical and financial.</em>
                    </h2>
                    <p className="mt-4 text-lg text-white/75">Know more about yourself — with Kashi&apos;s Vedic gurus and a numerologist.</p>
                    {/* Phones: after the heading, before the buttons */}
                    <Portraits className="mt-7 grid lg:hidden" />

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <Link href={consultHref(null, "call")} className={`${FIRE_BTN} h-14 w-full px-7 text-lg sm:w-auto`}>
                            <Phone size={18} /> Book a call
                        </Link>
                        <Link href={consultHref(null, "appointment")} className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border border-marigold/50 px-7 font-semibold text-white transition-colors hover:bg-marigold hover:text-night sm:w-auto">
                            <CalendarCheck size={18} className="text-marigold" /> Book an appointment
                        </Link>
                    </div>

                    <ul className="mt-7 grid gap-2.5 text-sm text-white/80">
                        {NOTES.map(({ Icon, text }) => (
                            <li key={text} className="flex items-start gap-2.5"><Icon size={17} className="mt-0.5 shrink-0 text-marigold" />{text}</li>
                        ))}
                    </ul>

                    {knowMore && (
                        <Link href="/puja" className="group mt-7 inline-flex items-center gap-1.5 font-semibold text-marigold underline decoration-marigold/50 underline-offset-4 hover:decoration-marigold">
                            Know more <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                    )}
                </div>

                {/* Large screens: the portraits beside the text */}
                <Portraits className="hidden lg:grid" />
            </div>
        </section>
    );
}

// The gurus and experts, as portraits — each opens their profile.
function Portraits({ className }: { className: string }) {
    return (
        <ul className={`grid-cols-3 gap-2 sm:gap-6 ${className}`}>
            {EXPERTS.map((a) => (
                <li key={a.slug}>
                    <Link href={expertPath(a)} className="group flex flex-col items-center text-center">
                        <span className="relative block rounded-full bg-gradient-to-b from-[#f7dc8c] via-marigold to-[#b8862a] p-[3px] shadow-[0_0_40px_-6px_rgba(255,182,39,0.55)] transition-transform duration-500 group-hover:-translate-y-1">
                            {/* eslint-disable-next-line @next/next/no-img-element -- small square portrait in /public */}
                            <img src={a.icon} alt={a.name} width={144} height={144} loading="lazy" className="h-[5.5rem] w-[5.5rem] rounded-full border-2 border-night object-cover sm:h-32 sm:w-32" />
                        </span>
                        <span className="mt-2 text-sm font-bold text-emerald-400 sm:text-base">{ratePerMinute(a)}</span>
                        <span className="mt-1.5 rounded-full bg-marigold/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-marigold">{a.title}</span>
                        <span className="mt-1.5 font-deva text-[15px] leading-tight text-white sm:text-lg">{a.nameDeva.replace(/^रामानुज दास /, "")}</span>
                        <span className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-semibold text-marigold/90 group-hover:underline">View profile <ArrowRight size={11} /></span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

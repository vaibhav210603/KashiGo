import Link from "next/link";
import { ArrowRight, CalendarCheck, Clock, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { FIRE_BTN } from "@/components/ui/styles";
import { ACHARYAS, CONSULT_PER_MINUTE_INR, CONSULT_WHATSAPP } from "@/lib/pujas";
import { inr } from "@/lib/boatRides";

const NOTES = [
    { Icon: Clock, text: `Calls are charged ${inr(CONSULT_PER_MINUTE_INR)} per minute` },
    { Icon: ShieldCheck, text: "Pay only if satisfied" },
    { Icon: Sparkles, text: "Remedies start working according to the scale of the problem — from 2 months to 1 year" },
];

// Yajna & puja consultations with the acharyas: portraits (no video here), two ways to book, and the terms.
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
                    <p className="mt-4 text-lg text-white/75">Know more about yourself, with the acharyas of Kashi.</p>

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <a href={CONSULT_WHATSAPP} target="_blank" rel="noopener" className={`${FIRE_BTN} h-14 w-full px-7 text-lg sm:w-auto`}>
                            <Phone size={18} /> Book a call
                        </a>
                        <Link href="/puja#sankalp" className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border border-marigold/50 px-7 font-semibold text-white transition-colors hover:bg-marigold hover:text-night sm:w-auto">
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

                {/* The acharyas, as portraits */}
                <ul className="order-first flex justify-center gap-6 sm:gap-10 lg:order-none">
                    {ACHARYAS.map((a) => (
                        <li key={a.name} className="flex w-36 flex-col items-center text-center sm:w-44">
                            <span className="relative block rounded-full bg-gradient-to-b from-[#f7dc8c] via-marigold to-[#b8862a] p-[3px] shadow-[0_0_40px_-6px_rgba(255,182,39,0.55)]">
                                {/* eslint-disable-next-line @next/next/no-img-element -- small square portrait in /public */}
                                <img src={a.icon} alt={a.name} width={160} height={160} loading="lazy" className="h-28 w-28 rounded-full border-2 border-night object-cover sm:h-36 sm:w-36" />
                            </span>
                            <span className="mt-3 font-deva text-lg leading-tight text-marigold">{a.nameDeva}</span>
                            <span className="mt-0.5 text-xs leading-snug text-white/70">{a.name}</span>
                            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">{a.role}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

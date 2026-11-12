import Link from "next/link";
import { ArrowRight, Check, Ship, Video } from "lucide-react";
import { inr } from "@/lib/boatRides";
import { CONSULT_ONLY_INR, CONSULT_ONLY_MINUTES, COMBO_FROM_INR, COMBO_WORTH_INR, FREE_CALL_MINUTES, LONGER_MEET_INR, RIDE_FROM_INR } from "@/lib/combo";

const GOLD = "#e8c158";

// Three offers side by side (lib/combo.ts): the ride, a session alone, and both together for barely more than the
// session. The session alone is the decoy — it makes the combo the obvious pick.
export default function RideConsultOffer() {
    return (
        <section id="ride-and-consult" className="relative scroll-mt-16 overflow-hidden bg-night py-14 text-white md:py-20">
            <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-marigold/40 to-transparent" />
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <p className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-marigold">Pick your plan</p>
                <h2 className="mt-3 text-center font-display text-4xl font-light leading-[1.05] tracking-[-0.02em] sm:text-5xl">Ride the Ganga. <em className="text-fire">Ask a guru.</em></h2>

                <div className="mt-10 grid items-stretch gap-4 md:grid-cols-3">
                    {/* A — the boat ride */}
                    <div className="flex flex-col rounded-[1.75rem] border border-white/12 bg-white/[0.04] p-5">
                        <p className="inline-flex items-center gap-2 font-semibold"><Ship size={18} className="text-marigold" /> Boat ride</p>
                        <p className="mt-3 font-display text-4xl" style={{ color: GOLD }}><span className="mr-1 font-sans text-sm font-medium text-white/60">from</span>{inr(RIDE_FROM_INR)}</p>
                        <p className="mt-1 text-[11px] leading-snug text-white/50">Price per boat for 2 people. Adding more passengers raises the price.</p>
                        <ul className="mb-6 mt-4 grid flex-1 content-start gap-2 text-sm text-white/75">
                            {["A private boat for your group", "Life jackets for everyone", "Trusted local boatman"].map((t) => <li key={t} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-marigold" />{t}</li>)}
                        </ul>
                        <Link href="/book" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/25 font-semibold transition-colors hover:border-marigold">Book a ride <ArrowRight size={16} /></Link>
                    </div>

                    {/* B — a session on its own */}
                    <div className="flex flex-col rounded-[1.75rem] border border-white/12 bg-white/[0.04] p-5">
                        <p className="inline-flex items-center gap-2 font-semibold"><Video size={18} className="text-marigold" /> 1-on-1 with a Kashi guru</p>
                        <p className="mt-3 font-display text-4xl" style={{ color: GOLD }}>{inr(CONSULT_ONLY_INR)}</p>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-white/60">
                            {/* eslint-disable-next-line @next/next/no-img-element -- small product icon */}
                            <img src="/consult/google-meet.svg" alt="" width={16} height={16} className="h-4 w-4" /> {CONSULT_ONLY_MINUTES}-minute live Google Meet
                        </p>
                        <ul className="mb-6 mt-4 grid flex-1 content-start gap-2 text-sm text-white/75">
                            {["A Vedic guru or a numerologist", "Kundli, Lo Shu grid and remedies", "From anywhere — phone or laptop"].map((t) => <li key={t} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-marigold" />{t}</li>)}
                        </ul>
                        <Link href="/ride-and-consult?plan=consult" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/25 font-semibold transition-colors hover:border-marigold">Book a session <ArrowRight size={16} /></Link>
                    </div>

                    {/* C — both, for a little more than B */}
                    <div className="shine-loop relative flex flex-col overflow-hidden rounded-[1.75rem] border-2 border-[#e8c158] bg-gradient-to-b from-[#2a1d0c] via-[#1a1230] to-night p-5 shadow-[0_30px_80px_-30px_rgba(232,193,88,0.6)]">
                        <span className="absolute right-4 top-4 rounded-full bg-[#7ee0c9] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-night">Best value</span>
                        <p className="inline-flex items-center gap-2 font-semibold"><Ship size={18} className="text-marigold" /> + <Video size={18} className="text-marigold" /> Ride + guru combo</p>
                        <p className="mt-3 font-display text-4xl" style={{ color: GOLD }}><span className="mr-1 font-sans text-sm font-medium text-white/60">starting at</span>{inr(COMBO_FROM_INR)}</p>
                        <p className="mt-1 text-xs text-white/55">Worth <s>{inr(COMBO_WORTH_INR)}</s> · just {inr(COMBO_FROM_INR - CONSULT_ONLY_INR)} more than a session alone</p>
                        {/* eslint-disable-next-line @next/next/no-img-element -- animated GIF */}
                        <img src="/consult/meet-guru.gif" alt="A guru on Google Meet, a Lo Shu grid and a kundali" width={720} height={480} loading="lazy" className="mt-4 w-full rounded-xl" />
                        <ul className="mb-6 mt-4 grid flex-1 content-start gap-2 text-sm text-white/85">
                            {["Your private boat ride on the Ganga", `A 30-minute Google Meet with a guru (45 min for +${inr(LONGER_MEET_INR)})`, `A free ${FREE_CALL_MINUTES}-minute call first`].map((t) => <li key={t} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[#7ee0c9]" />{t}</li>)}
                        </ul>
                        <Link href="/ride-and-consult" className="btn-sheen inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-marigold via-fire to-ember text-lg font-extrabold text-night shadow-[0_14px_40px_-12px_rgba(255,122,26,0.9)]">Build my combo <ArrowRight size={18} /></Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

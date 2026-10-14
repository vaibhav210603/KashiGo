import Link from "next/link";
import { ShieldCheck, LifeBuoy, BadgeIndianRupee, ArrowRight } from "lucide-react";
import { BOAT_RIDES, boatPrice, inr, BOOKING_PHONE } from "@/lib/boatRides";

// Server-rendered so the boat ride offer, prices and tagline are in the homepage HTML
// that search engines and AI assistants read.
const featured = ["p1", "p5", "p6"];

export default function BoatRidesHome() {
    const rides = BOAT_RIDES.filter((r) => featured.includes(r.id));
    return (
        <section id="boat-rides" className="bg-slate-950 text-white px-5 sm:px-8 py-20 border-t border-white/10">
            <div className="max-w-6xl mx-auto">
                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-orange-300/90 font-medium text-center">
                    Varanasi boat rides · Now operating
                </p>
                <h2 className="mt-3 font-heading font-bold text-3xl sm:text-5xl text-center tracking-tight">
                    Pay a genuine price for comfort
                </h2>
                <p className="mt-5 text-slate-300 text-base sm:text-lg max-w-3xl mx-auto text-center leading-relaxed">
                    On the ghats, the first boat quote a foreigner hears is often several times the going rate — and the cheapest boat can mean
                    no life jacket and a price that changes mid-river. KashiGo private boats on the Ganges have one fixed, honest price,
                    a vetted local boatman and life jackets on board, agreed before you step in.
                </p>

                <div className="mt-12 grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-3">
                    {rides.map((r) => (
                        <div key={r.id} className="rounded-3xl p-6 bg-slate-900/70 border border-white/15 flex flex-col">
                            <p className="text-xs text-orange-300 font-medium">{r.time}</p>
                            <h3 className="mt-1 font-heading font-semibold text-xl">{r.name}</h3>
                            <p className="mt-2 text-sm text-slate-300 leading-relaxed flex-1">{r.summary}</p>
                            <p className="mt-5 text-2xl font-bold">
                                {inr(boatPrice(r.id))} <span className="text-sm font-normal text-slate-400">per private boat</span>
                            </p>
                        </div>
                    ))}
                </div>

                <ul className="mt-10 grid gap-4 sm:grid-cols-3 text-sm text-slate-300">
                    <li className="flex gap-3 items-start"><BadgeIndianRupee className="text-orange-400 shrink-0" size={20} />Fixed price shown up front — no haggling on the ghat steps.</li>
                    <li className="flex gap-3 items-start"><LifeBuoy className="text-orange-400 shrink-0" size={20} />Life jackets on board and an experienced local boatman.</li>
                    <li className="flex gap-3 items-start"><ShieldCheck className="text-orange-400 shrink-0" size={20} />Pay online (UPI, cards, PayPal) or pay at the ghat.</li>
                </ul>

                <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/book" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl transition-colors">
                        Book a boat ride <ArrowRight size={18} />
                    </Link>
                    <Link href="/book#prices" className="text-slate-300 hover:text-white underline underline-offset-4 text-sm">
                        All rides &amp; prices
                    </Link>
                </div>
                <p className="mt-6 text-center text-xs text-slate-500">Questions before you book? Call us on {BOOKING_PHONE}.</p>
            </div>
        </section>
    );
}

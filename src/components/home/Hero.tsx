import Link from "next/link";
import { LifeBuoy, BadgeIndianRupee, Wallet, Star } from "lucide-react";
import { BOAT_PRICE_RANGE, inr } from "@/lib/boatRides";

export default function Hero() {
    return (
        <section className="relative isolate overflow-hidden bg-slate-950 min-h-[88svh] md:min-h-[92vh] flex items-end md:items-center pt-24 md:pt-28 pb-12 md:pb-20">
            {/* Ganges footage behind everything; the poster shows until it plays (and on data-saver). */}
            <video
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                poster="/sunrise.png"
                aria-hidden
                className="absolute inset-0 -z-20 w-full h-full object-cover"
            >
                <source src="/back_video.mp4" type="video/mp4" />
            </video>
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/30" />
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/70 via-transparent to-transparent" />

            <div className="relative w-full max-w-6xl mx-auto px-4">
                <div className="max-w-2xl">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur border border-white/20 px-3 py-1 text-xs font-semibold text-white">
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" /> Booking now · Varanasi
                    </span>
                    <h1 className="mt-5 font-heading font-bold text-[2.4rem] leading-[1.05] sm:text-6xl lg:text-7xl text-white tracking-tight drop-shadow-lg">
                        Varanasi boat rides, <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-pink-400 bg-clip-text text-transparent">without the haggling.</span>
                    </h1>
                    <p className="mt-5 text-lg md:text-xl text-slate-200 max-w-xl">
                        <strong className="font-semibold text-white">Pay a genuine price for comfort</strong> — a private boat, a trusted local boatman and life jackets, at one fixed price from {inr(BOAT_PRICE_RANGE.low)}.
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                        <Link href="/book" className="h-14 px-8 inline-flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold shadow-xl shadow-orange-500/30 transition-all hover:-translate-y-0.5">
                            Book a boat ride
                        </Link>
                        <Link href="#rides" className="h-14 px-8 inline-flex items-center justify-center rounded-full bg-white/10 backdrop-blur border border-white/30 text-white font-semibold hover:bg-white/20 transition-colors">
                            See rides &amp; prices
                        </Link>
                    </div>

                    <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-100">
                        <li className="flex items-center gap-2"><BadgeIndianRupee size={18} className="text-orange-400" />Fixed price</li>
                        <li className="flex items-center gap-2"><LifeBuoy size={18} className="text-teal-300" />Life jackets</li>
                        <li className="flex items-center gap-2"><Wallet size={18} className="text-pink-300" />Pay at ghat or online</li>
                        <li className="flex items-center gap-2"><Star size={18} className="text-amber-300" />Run by a Varanasi local</li>
                    </ul>
                </div>
            </div>
        </section>
    );
}

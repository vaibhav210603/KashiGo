import { X, Check } from "lucide-react";
import { BOAT_PRICES_INR } from "@/lib/boatPrices";
import { inr } from "@/lib/boatRides";

// Price anchoring: show what the ghat-steps experience really costs next to ours.
export default function WhyKashiGo() {
    const ghat = [
        "First quote to foreigners: ₹3,000–5,000",
        "Price \"changes\" halfway down the river",
        "Life jackets are rare",
        "Middlemen take a 30–50% cut",
    ];
    const us = [
        `Evening Aarti boat: ${inr(BOAT_PRICES_INR.p5)} — fixed, shown up front`,
        "Price agreed before you step in",
        "Life jackets on board",
        "Booked directly with a local",
    ];
    return (
        <section className="py-12 md:py-16 bg-gradient-to-b from-white to-teal-50/60">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 max-w-xl">Pay a genuine price for comfort</h2>
                <p className="mt-3 text-slate-600 max-w-2xl">You could bargain on the ghat steps. Here&apos;s what that usually looks like for a first-time visitor.</p>
                <div className="mt-8 grid md:grid-cols-2 gap-4">
                    <div className="rounded-3xl bg-white border border-rose-100 p-6">
                        <p className="font-heading font-semibold text-lg text-rose-600">Haggling at the ghat</p>
                        <ul className="mt-4 space-y-3">
                            {ghat.map((t) => <li key={t} className="flex gap-3 text-slate-700"><X size={20} className="shrink-0 text-rose-500 mt-0.5" />{t}</li>)}
                        </ul>
                    </div>
                    <div className="rounded-3xl bg-white border-2 border-teal-400 p-6 shadow-lg shadow-teal-900/5">
                        <p className="font-heading font-semibold text-lg text-teal-700">Booking with KashiGo</p>
                        <ul className="mt-4 space-y-3">
                            {us.map((t) => <li key={t} className="flex gap-3 text-slate-800"><Check size={20} className="shrink-0 text-teal-600 mt-0.5" />{t}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

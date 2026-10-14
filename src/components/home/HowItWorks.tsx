import { MousePointerClick, Wallet, Sailboat } from "lucide-react";

const STEPS = [
    { icon: MousePointerClick, color: "bg-orange-100 text-orange-600", title: "Pick ride & date", text: "Takes about a minute. Today or up to a week ahead." },
    { icon: Wallet, color: "bg-pink-100 text-pink-600", title: "Pay how you like", text: "UPI, card or PayPal now — or pay at the ghat." },
    { icon: Sailboat, color: "bg-teal-100 text-teal-700", title: "Meet your boatman", text: "Your ride number and booking details arrive instantly by email." },
];

export default function HowItWorks() {
    return (
        <section className="py-12 md:py-16">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900">Booked in three steps</h2>
                <ol className="mt-8 grid gap-4 md:grid-cols-3">
                    {STEPS.map(({ icon: Icon, color, title, text }, i) => (
                        <li key={title} className="flex md:flex-col gap-4 rounded-3xl bg-white border border-slate-200/70 p-5">
                            <span className={`w-12 h-12 shrink-0 rounded-2xl inline-flex items-center justify-center ${color}`}><Icon size={22} /></span>
                            <div>
                                <p className="text-xs font-bold text-slate-400">STEP {i + 1}</p>
                                <h3 className="font-heading font-semibold text-lg text-slate-900">{title}</h3>
                                <p className="text-slate-600 text-[15px]">{text}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

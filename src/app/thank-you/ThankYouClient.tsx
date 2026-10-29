"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, Check, Download, Headphones, Phone } from "lucide-react";
import { readThankYou, type ThankYou } from "@/lib/thankYou";

const FALLBACK: ThankYou = {
    title: "Thank you!",
    message: "Your order is confirmed. Your confirmation and any files are on their way to your email.",
};

const noop = () => () => {};

export default function ThankYouClient() {
    // sessionStorage only exists in the browser; the server renders the generic confirmation.
    const s = useSyncExternalStore(noop, () => readThankYou() ?? FALLBACK, () => FALLBACK);

    return (
        <main className="min-h-screen px-4 pt-28 pb-20 sm:pt-36">
            <div className="grain relative mx-auto max-w-xl overflow-hidden rounded-[2rem] bg-night p-6 sm:p-10 text-center text-white shadow-[0_40px_90px_-30px_rgba(7,11,24,0.7)]">
                <div aria-hidden className="flicker absolute -right-16 -top-20 h-60 w-60 rounded-full bg-fire/35 blur-[80px]" />
                <div className="relative w-20 h-20 mx-auto rounded-full bg-ganga/15 text-ganga ring-1 ring-ganga/40 flex items-center justify-center"><Check size={40} /></div>
                <h1 className="relative mt-5 font-display font-light text-4xl sm:text-5xl tracking-tight">{s.title}</h1>
                <p className="relative mt-3 text-white/65">{s.message}</p>

                {s.ref && (
                    <div className="relative mt-6 mx-auto max-w-sm rounded-2xl border border-dashed border-marigold/50 bg-white/5 p-5">
                        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/45">{s.ref.label}</p>
                        <p className="mt-1 font-mono font-bold text-2xl text-marigold break-all">{s.ref.value}</p>
                    </div>
                )}

                {s.rows && s.rows.length > 0 && (
                    <dl className="relative mt-6 mx-auto max-w-sm text-left text-[15px] divide-y divide-white/10">
                        {s.rows.map(([k, v]) => (
                            <div key={k} className="flex justify-between gap-4 py-2"><dt className="text-white/50">{k}</dt><dd className="font-semibold text-white text-right">{v}</dd></div>
                        ))}
                    </dl>
                )}

                {s.downloads && s.downloads.length > 0 && (
                    <div className="relative mt-6 mx-auto max-w-sm space-y-2 text-left">
                        {s.downloads.map((d) => (
                            <a key={d.url} href={d.url} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl bg-white/10 p-3 text-sm font-semibold text-white transition-colors hover:bg-white/15">
                                <Download size={18} className="text-marigold shrink-0" />{d.label}
                            </a>
                        ))}
                    </div>
                )}

                {s.cta && (
                    <Link href={s.cta.href} className="relative mt-6 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-gradient-to-r from-fire to-marigold font-semibold text-night">
                        {s.cta.label} <ArrowRight size={18} />
                    </Link>
                )}

                <div className="relative mt-6">
                    <a href="tel:+918175966910" className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-white/20 font-semibold text-white transition-colors hover:border-marigold">
                        <Phone size={18} className="text-marigold" /> Questions? +91 81759 66910
                    </a>
                </div>

                <Link href="/audiobooks#walk-the-ghats" className="relative mt-8 block rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-colors hover:border-marigold/50">
                    <p className="flex items-center gap-2 font-semibold text-white"><Headphones size={18} className="text-marigold" /> Before or after your ride</p>
                    <p className="text-sm text-white/60">Walk the Ghats — a local&apos;s 90-minute audio tour from Assi to Manikarnika. →</p>
                </Link>
            </div>
        </main>
    );
}

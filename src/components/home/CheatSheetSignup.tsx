"use client";

import { useState } from "react";
import { ArrowRight, Check, Gift } from "lucide-react";
import { Reveal } from "@/components/motion/primitives";
import Embers from "@/components/motion/Embers";
import { track } from "@/lib/analytics";

// Inline lead capture — replaces the old auto-popups.
export default function CheatSheetSignup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setState("busy");
        try {
            const res = await fetch("/api/email-leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email }) });
            const json = await res.json();
            const ok = res.ok && json.success;
            if (ok) track("generate_lead", { lead_source: "cheat_sheet" });
            setState(ok ? "done" : "error");
        } catch { setState("error"); }
    };

    return (
        <section className="bg-parchment pb-20 md:pb-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <Reveal y={50}>
                    <div className="grain relative overflow-hidden rounded-[2.5rem] bg-night px-6 py-12 sm:px-12 md:py-16 text-white">
                        <Embers density={0.6} />
                        <div aria-hidden className="flicker absolute -bottom-32 left-1/2 h-72 w-[80%] -translate-x-1/2 rounded-full bg-fire/35 blur-[100px]" />
                        <p aria-hidden className="pointer-events-none absolute -right-6 -top-10 select-none font-deva text-[11rem] md:text-[16rem] leading-none text-white/[0.04]">दीया</p>
                        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
                            <div>
                                <span className="inline-flex items-center gap-2 rounded-full border border-marigold/40 bg-marigold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-marigold"><Gift size={14} /> Free · one page</span>
                                <h2 className="mt-5 font-display font-light text-4xl sm:text-6xl leading-[0.95] tracking-[-0.03em]">The Varanasi <em className="text-fire">Scam Cheat Sheet.</em></h2>
                                <p className="mt-4 text-white/65 max-w-md text-lg">The real prices for boats, autos and temples — one page, in your inbox now.</p>
                            </div>
                            <div>
                                {state === "done" ? (
                                    <p className="flex items-center gap-3 rounded-2xl border border-ganga/40 bg-ganga/10 p-5 font-semibold text-white"><Check className="text-ganga" /> Sent! Check your inbox.</p>
                                ) : (
                                    <form onSubmit={submit} className="grid gap-3">
                                        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" autoComplete="given-name"
                                            className="h-14 rounded-full border border-white/15 bg-white/5 px-6 text-white placeholder:text-white/40 outline-none transition focus:border-marigold focus:bg-white/10" />
                                        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email"
                                            className="h-14 rounded-full border border-white/15 bg-white/5 px-6 text-white placeholder:text-white/40 outline-none transition focus:border-marigold focus:bg-white/10" />
                                        <button disabled={state === "busy"} className="btn-sheen group h-14 px-6 inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-marigold via-fire to-ember text-night font-semibold disabled:opacity-60">
                                            {state === "busy" ? "Sending…" : "Send it to me"}
                                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </form>
                                )}
                                {state === "error" && <p className="mt-3 text-sm text-ember">Couldn&apos;t send just now — please try again.</p>}
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

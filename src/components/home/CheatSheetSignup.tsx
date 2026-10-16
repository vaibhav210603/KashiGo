"use client";

import { useState } from "react";
import { Check, Gift } from "lucide-react";
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
        <section className="py-12 md:py-16">
            <div className="max-w-3xl mx-auto px-4">
                <div className="rounded-[2rem] bg-gradient-to-br from-teal-500 to-sky-500 p-6 sm:p-10 text-white shadow-xl shadow-teal-600/20">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold"><Gift size={14} /> Free</span>
                    <h2 className="mt-3 font-heading font-bold text-2xl sm:text-3xl">The Varanasi Scam Cheat Sheet</h2>
                    <p className="mt-2 text-white/90">The real prices for boats, autos and temples — one page, in your inbox now.</p>
                    {state === "done" ? (
                        <p className="mt-5 flex items-center gap-2 rounded-2xl bg-white/20 p-4 font-semibold"><Check /> Sent! Check your inbox.</p>
                    ) : (
                        <form onSubmit={submit} className="mt-5 grid sm:grid-cols-[1fr_1.4fr_auto] gap-2">
                            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" autoComplete="given-name"
                                className="h-12 rounded-full px-5 bg-white text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-white/40" />
                            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email"
                                className="h-12 rounded-full px-5 bg-white text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-white/40" />
                            <button disabled={state === "busy"} className="h-12 px-6 rounded-full bg-slate-900 hover:bg-slate-800 font-semibold disabled:opacity-60">
                                {state === "busy" ? "Sending…" : "Send it"}
                            </button>
                        </form>
                    )}
                    {state === "error" && <p className="mt-2 text-sm text-white">Couldn&apos;t send just now — please try again.</p>}
                </div>
            </div>
        </section>
    );
}

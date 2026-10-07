"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Bell, BookOpen } from "lucide-react";

// Shown instead of the booking wizard while on-ground tours are not yet operating.
export default function TourWaitlist() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
    const [msg, setMsg] = useState("");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setState("busy");
        try {
            const res = await fetch("/api/email-leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Could not join. Please try again.");
            setState("done");
        } catch (err: any) {
            setMsg(err.message); setState("error");
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 md:p-10">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                <Bell size={14} /> Boat rides opening soon
            </span>
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mt-4">
                We&apos;re not taking bookings just yet
            </h1>
            <p className="text-slate-600 mt-3 leading-relaxed">
                KashiGo&apos;s fixed-price sunrise, Ganga Aarti and sunset boat rides with trusted local boatmen are being set up on the ghats right now.
                Join the waitlist and you&apos;ll be the first to know when they open — plus you get our free Varanasi Scam Cheat Sheet today.
            </p>

            {state === "done" ? (
                <div className="mt-6 flex gap-3 items-start bg-green-50 text-green-800 p-4 rounded-2xl">
                    <Check className="shrink-0 mt-0.5" />
                    <p>You&apos;re on the list! Check your inbox for the free cheat sheet.</p>
                </div>
            ) : (
                <form onSubmit={submit} className="mt-6 grid sm:grid-cols-[1fr_1.4fr_auto] gap-3">
                    <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="First name"
                        className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400 bg-white text-slate-900 placeholder:text-slate-400" />
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
                        className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400 bg-white text-slate-900 placeholder:text-slate-400" />
                    <button disabled={state === "busy"} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-60">
                        {state === "busy" ? "Joining…" : "Join waitlist"}
                    </button>
                </form>
            )}
            {state === "error" && <p className="text-sm text-red-600 mt-2">{msg}</p>}

            <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                <p className="text-slate-600 text-sm flex items-center gap-2">
                    <BookOpen size={18} className="text-orange-500" />
                    Visiting before we open? Our local guides and the self-guided ghat audio tour are available now.
                </p>
                <Link href="/shop" className="shrink-0 text-center bg-slate-900 hover:bg-orange-500 text-white font-semibold px-5 py-3 rounded-xl transition-colors">
                    Browse guides
                </Link>
            </div>
        </div>
    );
}

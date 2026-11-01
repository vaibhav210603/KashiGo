"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarCheck, Camera, Check, Clock, Hand, Loader2, Lock, Phone, ShieldCheck, Sparkles, X } from "lucide-react";
import { EXPERTS } from "@/lib/experts";
import { CONSULT_PER_MINUTE_INR } from "@/lib/pujas";
import { goToThankYou } from "@/lib/thankYou";
import { track } from "@/lib/analytics";

type Kind = "call" | "appointment";

// Phones take huge photos: scale the palm down to 1600px on the long side as a JPEG before upload.
async function shrink(file: File): Promise<Blob> {
    try {
        const bmp = await createImageBitmap(file);
        const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(bmp.width * k);
        canvas.height = Math.round(bmp.height * k);
        canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
        return blob ?? file;
    } catch {
        return file; // e.g. HEIC the browser can't decode: send as is and let the server check it
    }
}

export default function ConsultClient() {
    const [expert, setExpert] = useState(EXPERTS[0].slug);
    const [kind, setKind] = useState<Kind>("appointment");
    const [form, setForm] = useState({ name: "", dob: "", birthPlace: "", birthTime: "", phone: "", email: "", question: "" });
    const [palm, setPalm] = useState<{ blob: Blob; url: string } | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    // Arrive with the expert and the kind already chosen (/consult?expert=vibha-upadhyay&type=call).
    useEffect(() => {
        const q = new URLSearchParams(window.location.search);
        const e = q.get("expert"), t = q.get("type");
        const timer = setTimeout(() => {
            if (e && EXPERTS.some((x) => x.slug === e)) setExpert(e);
            if (t === "call" || t === "appointment") setKind(t);
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const chosen = EXPERTS.find((x) => x.slug === expert)!;
    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
    const pickPalm = async (file?: File) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) return setError("Please choose a photo of your right palm.");
        setError("");
        const blob = await shrink(file);
        setPalm((p) => { if (p) URL.revokeObjectURL(p.url); return { blob, url: URL.createObjectURL(blob) }; });
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const f = form;
        const problem =
            f.name.trim().length < 2 ? "Add your full name." :
            !f.dob ? "Add your date of birth." :
            f.birthPlace.trim().length < 2 ? "Add your place of birth." :
            f.phone.replace(/\D/g, "").length < 8 ? "Add a phone number we can call." :
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()) ? "Add your email." :
            !palm ? "Add a photo of your right palm." : null;
        if (problem) return setError(problem);
        setBusy(true);
        try {
            const body = new FormData();
            body.set("expert", expert);
            body.set("kind", kind);
            for (const [k, v] of Object.entries(f)) body.set(k, v.trim());
            body.set("palm", palm!.blob, "right-palm.jpg");
            const r = await fetch("/api/consult", { method: "POST", body }).then((x) => x.json()).catch(() => ({ success: false, message: "Couldn't send — check your connection and try again." }));
            if (!r.success) throw new Error(r.message);
            track("generate_lead", { lead_source: `consult_${kind}`, item_id: expert });
            goToThankYou({
                title: "Request received",
                message: `We'll call you on ${f.phone} to fix a time with ${chosen.name}.${kind === "call" ? ` Calls are ₹${CONSULT_PER_MINUTE_INR} per minute — pay only if satisfied.` : " Pay only if satisfied."}`,
                ref: { label: "Reference", value: r.id },
                rows: [["With", chosen.name], ["Type", kind === "call" ? "Call" : "Appointment"], ["Email", f.email]],
                cta: { label: "Back to KashiGo", href: "/" },
            });
        } catch (err: any) {
            setError(err?.message || "Something went wrong — please try again.");
            setBusy(false);
        }
    };

    const input = "h-12 w-full rounded-xl border border-white/15 bg-white/[0.05] px-4 text-base text-white placeholder:text-white/35 outline-none transition-colors focus:border-marigold [color-scheme:dark]";
    const label = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60";

    return (
        <div className="grain relative w-full overflow-hidden bg-night pb-20 pt-28 text-white md:pt-36">
            <div aria-hidden className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,182,39,0.16),transparent_65%)]" />
            <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
                <div className="text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-marigold">Consultation · <span className="font-deva normal-case tracking-normal">परामर्श</span></p>
                    <h1 className="mt-4 font-display text-[2.6rem] font-light leading-[1.02] tracking-[-0.02em] sm:text-6xl">Know more <em className="text-fire">about yourself.</em></h1>
                    <p className="mx-auto mt-4 max-w-xl text-white/70">Share your birth details and a photo of your right palm. We call you to fix a time — and you pay only if satisfied.</p>
                </div>

                <form onSubmit={submit} className="relative mt-10 rounded-[2rem] border-2 border-[#e8c158] bg-gradient-to-b from-[#1a1230] via-[#120d24] to-night p-5 shadow-[0_40px_100px_-30px_rgba(255,182,39,0.35)] sm:p-8">
                    {/* Who */}
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-marigold">1 · Who would you like to consult?</p>
                    <ul className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
                        {EXPERTS.map((x) => {
                            const on = x.slug === expert;
                            return (
                                <li key={x.slug}>
                                    <button type="button" onClick={() => setExpert(x.slug)} aria-pressed={on}
                                        className={`flex w-full flex-col items-center rounded-2xl border-2 p-2.5 text-center transition-colors sm:p-4 ${on ? "border-[#e8c158] bg-[#e8c158]/10" : "border-white/10 bg-white/[0.03] hover:border-white/30"}`}>
                                        <span className={`relative block rounded-full p-[2px] ${on ? "bg-gradient-to-b from-[#f7dc8c] via-marigold to-[#9c6d1e]" : "bg-white/15"}`}>
                                            {/* eslint-disable-next-line @next/next/no-img-element -- square portrait in /public */}
                                            <img src={x.icon} alt="" className="h-16 w-16 rounded-full border-2 border-night object-cover sm:h-20 sm:w-20" />
                                            {on && <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-marigold text-night"><Check size={14} strokeWidth={3} /></span>}
                                        </span>
                                        <span className="mt-2 font-deva text-sm leading-tight text-white sm:text-base">{x.nameDeva.replace(/^रामानुज दास /, "")}</span>
                                        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-marigold">{x.title}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    {/* What */}
                    <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3">
                        {([["call", Phone, "Book a call", `₹${CONSULT_PER_MINUTE_INR} per minute`], ["appointment", CalendarCheck, "Book an appointment", "In person or online"]] as const).map(([id, Icon, title, sub]) => (
                            <button key={id} type="button" onClick={() => setKind(id)} aria-pressed={kind === id}
                                className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-colors sm:p-4 ${kind === id ? "border-[#e8c158] bg-[#e8c158]/10" : "border-white/10 bg-white/[0.03] hover:border-white/30"}`}>
                                <Icon size={20} className="shrink-0 text-marigold" />
                                <span><span className="block text-sm font-semibold sm:text-base">{title}</span><span className="block text-xs text-white/55">{sub}</span></span>
                            </button>
                        ))}
                    </div>

                    {/* Details */}
                    <p className="mt-8 text-sm font-bold uppercase tracking-[0.18em] text-marigold">2 · Your details</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <label className="sm:col-span-2"><span className={label}>Full name *</span><input value={form.name} onChange={set("name")} autoComplete="name" placeholder="As on your birth record" className={input} /></label>
                        <label><span className={label}>Date of birth *</span><input type="date" value={form.dob} onChange={set("dob")} max={new Date().toISOString().slice(0, 10)} className={input} /></label>
                        <label><span className={label}>Time of birth <span className="normal-case tracking-normal text-white/40">(if known)</span></span><input type="time" value={form.birthTime} onChange={set("birthTime")} className={input} /></label>
                        <label className="sm:col-span-2"><span className={label}>Place of birth *</span><input value={form.birthPlace} onChange={set("birthPlace")} placeholder="City, state, country" className={input} /></label>
                        <label><span className={label}>Phone *</span><input type="tel" inputMode="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" placeholder="With country code if outside India" className={input} /></label>
                        <label><span className={label}>Email *</span><input type="email" value={form.email} onChange={set("email")} autoComplete="email" placeholder="For your confirmation" className={input} /></label>
                        <label className="sm:col-span-2"><span className={label}>What would you like to ask? <span className="normal-case tracking-normal text-white/40">(optional)</span></span>
                            <textarea value={form.question} onChange={set("question")} rows={3} placeholder="Career, marriage, health, money, a name, a date…" className={`${input} h-auto py-3`} />
                        </label>
                    </div>

                    {/* Palm */}
                    <p className="mt-8 text-sm font-bold uppercase tracking-[0.18em] text-marigold">3 · A photo of your right palm *</p>
                    <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => pickPalm(e.target.files?.[0])} />
                    {palm ? (
                        <div className="mt-4 flex items-center gap-4 rounded-2xl border border-[#e8c158]/50 bg-[#e8c158]/5 p-3">
                            {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
                            <img src={palm.url} alt="Your right palm" className="h-28 w-24 rounded-xl object-cover" />
                            <div className="flex-1 text-sm">
                                <p className="flex items-center gap-1.5 font-semibold text-[#7ee0c9]"><Check size={16} /> Palm photo added</p>
                                <button type="button" onClick={() => fileRef.current?.click()} className="mt-2 font-semibold text-marigold underline underline-offset-4">Retake / choose another</button>
                            </div>
                            <button type="button" onClick={() => { URL.revokeObjectURL(palm.url); setPalm(null); }} aria-label="Remove photo" className="self-start text-white/50 hover:text-white"><X size={18} /></button>
                        </div>
                    ) : (
                        <button type="button" onClick={() => fileRef.current?.click()}
                            className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#e8c158]/60 bg-white/[0.03] px-4 py-8 text-center transition-colors hover:bg-[#e8c158]/5">
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-marigold to-ember text-night"><Hand size={26} /></span>
                            <span className="font-semibold">Take or upload a photo of your <span className="text-marigold">right</span> palm</span>
                            <span className="inline-flex items-center gap-1.5 text-xs text-white/55"><Camera size={13} /> Open hand, fingers together, in good light</span>
                        </button>
                    )}

                    <ul className="mt-8 grid gap-2 rounded-2xl bg-white/[0.04] p-4 text-sm text-white/75">
                        <li className="flex items-start gap-2"><Clock size={16} className="mt-0.5 shrink-0 text-marigold" />Calls are charged ₹{CONSULT_PER_MINUTE_INR} per minute</li>
                        <li className="flex items-start gap-2"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-marigold" />Pay only if satisfied</li>
                        <li className="flex items-start gap-2"><Sparkles size={16} className="mt-0.5 shrink-0 text-marigold" />Remedies start working according to the scale of the problem — from 2 months to 1 year</li>
                    </ul>

                    {error && <p role="alert" className="mt-4 rounded-xl bg-ember/15 px-4 py-3 text-sm font-medium text-[#ffb3a6]">{error}</p>}
                    <button type="submit" disabled={busy}
                        className="btn-sheen mt-5 flex h-16 w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-marigold via-fire to-ember text-lg font-extrabold text-night shadow-[0_14px_40px_-10px_rgba(255,122,26,0.9)] disabled:opacity-70">
                        {busy ? <Loader2 size={20} className="animate-spin" /> : kind === "call" ? <Phone size={18} /> : <CalendarCheck size={18} />}
                        {busy ? "Sending…" : kind === "call" ? `Request a call with ${chosen.name.split(" ").slice(-2).join(" ")}` : `Request an appointment`}
                    </button>
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-white/50"><Lock size={12} /> Your details and photo are kept private and seen only by KashiGo and your expert.</p>
                </form>
            </div>
        </div>
    );
}

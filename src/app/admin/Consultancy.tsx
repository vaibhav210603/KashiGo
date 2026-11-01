"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarCheck, Hand, Loader2, Mail, Phone, RefreshCw, Search, X } from "lucide-react";
import { apiGet } from "@/components/auth/useAuth";
import { formatPhone } from "@/lib/phone";

type Req = {
    id: string; created_at: string; kind: "call" | "appointment"; expert: string; expertName: string; name: string;
    dob: string; birthPlace: string; birthTime: string; phone: string; email: string; question: string; palmUrl: string | null;
};

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const dobLabel = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

// Consultation requests from /consult: who, birth details, and the right-palm photo.
export default function Consultancy() {
    const [list, setList] = useState<Req[] | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState("");
    const [expert, setExpert] = useState("all");
    const [zoom, setZoom] = useState<Req | null>(null);
    const load = useCallback(async () => {
        setLoading(true);
        const r = await apiGet("/api/admin/consultations");
        if (r.ok) { setList(r.data.requests); setError(""); } else { setList([]); setError(r.data?.error || "Couldn't load requests."); }
        setLoading(false);
    }, []);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load
    useEffect(() => { load(); }, [load]);

    const experts = [...new Map((list ?? []).map((r) => [r.expert, r.expertName])).entries()];
    const needle = q.trim().toLowerCase();
    const rows = (list ?? []).filter((r) => (expert === "all" || r.expert === expert) && (!needle || [r.id, r.name, r.phone, r.email, r.birthPlace].some((v) => v.toLowerCase().includes(needle))));

    return (
        <div>
            <div className="flex flex-wrap items-center gap-3">
                <form onSubmit={(e) => e.preventDefault()} className="relative min-w-[14rem] flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, email, place…" className="h-11 w-full rounded-full border border-white/15 bg-white/5 pl-10 pr-4 outline-none focus:border-marigold" />
                </form>
                <select value={expert} onChange={(e) => setExpert(e.target.value)} className="h-11 rounded-full border border-white/15 bg-night px-4 text-sm outline-none focus:border-marigold">
                    <option value="all">All experts {list ? `(${list.length})` : ""}</option>
                    {experts.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}
                </select>
                <button onClick={load} aria-label="Refresh" className="h-11 w-11 inline-flex items-center justify-center rounded-full border border-white/15 hover:bg-white/10"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
            </div>
            {error && <p className="mt-3 text-sm text-ember">{error}</p>}
            {!list && <p className="mt-6 flex items-center gap-2 text-white/60"><Loader2 size={16} className="animate-spin" /> Loading requests…</p>}
            {list && rows.length === 0 && !error && <p className="mt-6 text-white/60">No consultation requests yet.</p>}

            <ul className="mt-5 grid gap-3 lg:grid-cols-2">
                {rows.map((r) => (
                    <li key={r.id} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <button onClick={() => setZoom(r)} disabled={!r.palmUrl} className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-white/5" aria-label={`See ${r.name}'s palm photo`}>
                            {r.palmUrl
                                // eslint-disable-next-line @next/next/no-img-element -- signed Supabase URL
                                ? <img src={r.palmUrl} alt="" className="h-full w-full object-cover" />
                                : <Hand className="m-auto h-full text-white/30" />}
                        </button>
                        <div className="min-w-0 flex-1 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                                <b className="text-base">{r.name}</b>
                                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${r.kind === "call" ? "bg-marigold/20 text-marigold" : "bg-sky-400/15 text-sky-300"}`}>{r.kind === "call" ? <><Phone size={10} className="mr-1 inline" />Call</> : <><CalendarCheck size={10} className="mr-1 inline" />Appointment</>}</span>
                            </div>
                            <p className="text-white/55">with {r.expertName} · {when(r.created_at)} · {r.id}</p>
                            <p className="mt-2"><span className="text-white/45">Born</span> {dobLabel(r.dob)}{r.birthTime ? `, ${r.birthTime}` : " (time not known)"} · {r.birthPlace}</p>
                            <p className="mt-1 flex flex-wrap gap-x-4">
                                <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1 hover:text-marigold"><Phone size={13} />{formatPhone(r.phone)}</a>
                                <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1 break-all hover:text-marigold"><Mail size={13} />{r.email}</a>
                            </p>
                            {r.question && <p className="mt-2 rounded-lg bg-white/5 px-3 py-2 text-white/80">“{r.question}”</p>}
                        </div>
                    </li>
                ))}
            </ul>

            {zoom?.palmUrl && (
                <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => setZoom(null)}>
                    <button aria-label="Close" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"><X size={20} /></button>
                    <figure className="max-h-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- signed Supabase URL */}
                        <img src={zoom.palmUrl} alt={`${zoom.name}'s right palm`} className="max-h-[80vh] w-auto rounded-xl" />
                        <figcaption className="mt-2 text-center text-sm text-white/70">{zoom.name} · right palm · <a href={zoom.palmUrl} target="_blank" rel="noopener" className="text-marigold underline">open full size</a></figcaption>
                    </figure>
                </div>
            )}
        </div>
    );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlarmClock, Check, ChevronDown, Copy, Loader2, MessageCircle, Phone, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { apiGet, apiPost, authHeaders } from "@/components/auth/useAuth";
import { formatPhone } from "@/lib/phone";
import {
    addDays, clientMessage, dateLabel, MESSAGE_LABEL, MESSAGES_FOR, SOURCE_LABEL, SOURCES, STATUS_LABEL, STATUSES, todayIST, waLink,
    type Lead, type LeadStatus, type MessageKey, type MsgLang,
} from "@/lib/leadsShared";

const STATUS_BAR: Record<LeadStatus, string> = { new: "bg-sky-400", contacted: "bg-violet-400", quoted: "bg-marigold", follow_up: "bg-fire", booked: "bg-ganga", lost: "bg-white/25" };
const STATUS_STYLE: Record<LeadStatus, string> = {
    new: "bg-sky-400/15 text-sky-300 border-sky-400/40",
    contacted: "bg-violet-400/15 text-violet-300 border-violet-400/40",
    quoted: "bg-marigold/15 text-marigold border-marigold/40",
    follow_up: "bg-fire/15 text-fire border-fire/40",
    booked: "bg-ganga/20 text-ganga border-ganga/50",
    lost: "bg-white/5 text-white/45 border-white/15",
};
const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const istDay = (iso: string) => new Date(new Date(iso).getTime() + 5.5 * 3600_000).toISOString().slice(0, 10);
const ago = (iso: string) => {
    const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    return m < 60 ? `${Math.max(m, 0)}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : `${Math.round(m / 1440)}d ago`;
};
const isOpen = (l: Lead) => l.status !== "booked" && l.status !== "lost";

// The leads CRM: what came in, where each one stands, and one tap to move it on or message the client.
export default function Leads() {
    const [list, setList] = useState<Lead[] | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState("");
    const [status, setStatus] = useState<LeadStatus | "all" | "open" | "due">("open");
    const [source, setSource] = useState("all");
    const [adding, setAdding] = useState(false);
    const [msgFor, setMsgFor] = useState<Lead | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const r = await apiGet("/api/admin/leads");
        if (r.ok) { setList(r.data.leads); setError(""); } else { setList((l) => l ?? []); setError(r.data?.error || "Couldn't load leads."); }
        setLoading(false);
    }, []);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load
    useEffect(() => { load(); }, [load]);
    // Leads added from WhatsApp show up without a reload.
    useEffect(() => { const t = setInterval(load, 60_000); return () => clearInterval(t); }, [load]);

    const patch = async (id: number, changes: Record<string, unknown>) => {
        setList((l) => l?.map((x) => (x.id === id ? { ...x, ...changes } as Lead : x)) ?? null);
        const r = await apiPost("/api/admin/leads", { id, ...changes }, "PATCH");
        if (r.ok) setList((l) => l?.map((x) => (x.id === id ? r.data.lead : x)) ?? null); else { setError(r.data?.error || "Couldn't save."); load(); }
    };
    const remove = async (l: Lead) => {
        if (!confirm(`Delete lead #${l.id} ${l.name}? This can't be undone.`)) return;
        const res = await fetch(`/api/admin/leads?id=${l.id}`, { method: "DELETE", headers: await authHeaders() });
        if (res.ok) setList((x) => x?.filter((y) => y.id !== l.id) ?? null); else setError("Couldn't delete.");
    };

    const today = todayIST();
    const all = useMemo(() => list ?? [], [list]);
    const stats = useMemo(() => {
        const weekStart = addDays(today, -6);
        const booked = all.filter((l) => l.status === "booked");
        const closed = booked.length + all.filter((l) => l.status === "lost").length;
        return {
            total: all.length,
            today: all.filter((l) => istDay(l.created_at) === today).length,
            week: all.filter((l) => istDay(l.created_at) >= weekStart).length,
            due: all.filter((l) => isOpen(l) && l.follow_up_on && l.follow_up_on <= today).length,
            booked: booked.length,
            rate: closed ? Math.round((booked.length / closed) * 100) : null,
            pipeline: all.filter((l) => isOpen(l)).reduce((s, l) => s + (l.amount_inr || 0), 0),
            won: booked.reduce((s, l) => s + (l.amount_inr || 0), 0),
            by: Object.fromEntries(STATUSES.map((s) => [s, all.filter((l) => l.status === s).length])) as Record<LeadStatus, number>,
            sources: SOURCES.map((s) => [s, all.filter((l) => l.source === s).length] as const).filter(([, n]) => n > 0),
        };
    }, [all, today]);

    const needle = q.trim().toLowerCase();
    const rows = all
        .filter((l) => status === "all" || (status === "open" ? isOpen(l) : status === "due" ? isOpen(l) && !!l.follow_up_on && l.follow_up_on <= today : l.status === status))
        .filter((l) => source === "all" || l.source === source)
        .filter((l) => !needle || [String(l.id), l.name, l.phone ?? "", l.interest, l.notes].some((v) => v.toLowerCase().includes(needle)))
        .sort((a, b) => (status === "due" ? (a.follow_up_on ?? "").localeCompare(b.follow_up_on ?? "") : b.created_at.localeCompare(a.created_at)));

    return (
        <div>
            {/* numbers */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <Stat label="New today" value={stats.today} sub={`${stats.week} this week`} />
                <Stat label="All leads" value={stats.total} sub={`${stats.by.new} untouched`} />
                <Stat label="Follow up now" value={stats.due} sub="due today or late" hot={stats.due > 0} onClick={() => setStatus("due")} />
                <Stat label="Booked" value={stats.booked} sub={stats.rate == null ? "—" : `${stats.rate}% of closed leads`} />
                <Stat label="In pipeline" value={rupees(stats.pipeline)} sub="quoted, still open" />
                <Stat label="Won" value={rupees(stats.won)} sub="booked value" />
            </div>

            {/* funnel */}
            <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-white/5">
                {STATUSES.map((s) => stats.by[s] > 0 && (
                    <div key={s} title={`${STATUS_LABEL[s]}: ${stats.by[s]}`} style={{ width: `${(stats.by[s] / Math.max(stats.total, 1)) * 100}%` }} className={`${STATUS_BAR[s]} border-r border-night last:border-0`} />
                ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
                {([["open", "Open", stats.total - stats.by.booked - stats.by.lost], ["due", "Follow up now", stats.due], ...STATUSES.map((s) => [s, STATUS_LABEL[s], stats.by[s]]), ["all", "All", stats.total]] as [typeof status, string, number][]).map(([id, label, n]) => (
                    <button key={id} onClick={() => setStatus(id)} className={`h-9 rounded-full border px-3.5 text-sm transition-colors ${status === id ? "border-white bg-white text-night" : "border-white/15 text-white/75 hover:text-white"}`}>
                        {label} <span className="opacity-60">{n}</span>
                    </button>
                ))}
            </div>

            {/* toolbar */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="relative min-w-[13rem] flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, #id, ride…" className="h-11 w-full rounded-full border border-white/15 bg-white/5 pl-10 pr-4 outline-none focus:border-marigold" />
                </div>
                <select value={source} onChange={(e) => setSource(e.target.value)} className="h-11 rounded-full border border-white/15 bg-night px-4 text-sm outline-none focus:border-marigold">
                    <option value="all">All sources</option>
                    {stats.sources.map(([s, n]) => <option key={s} value={s}>{SOURCE_LABEL[s]} ({n})</option>)}
                </select>
                <button onClick={load} aria-label="Refresh" className="h-11 w-11 inline-flex items-center justify-center rounded-full border border-white/15 hover:bg-white/10"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
                <button onClick={() => setAdding(true)} className="h-11 px-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-marigold via-fire to-ember font-semibold text-night"><Plus size={16} /> Add lead</button>
            </div>
            {error && <p className="mt-3 text-sm text-ember">{error}</p>}
            {!list && <p className="mt-6 flex items-center gap-2 text-white/60"><Loader2 size={16} className="animate-spin" /> Loading leads…</p>}
            {list && rows.length === 0 && !error && <p className="mt-6 text-white/60">{all.length ? "No leads match." : "No leads yet — forward an enquiry to the WhatsApp bot or tap Add lead."}</p>}

            <ul className="mt-5 grid gap-3">
                {rows.map((l) => <LeadCard key={l.id} lead={l} today={today} onPatch={(c) => patch(l.id, c)} onMessage={() => setMsgFor(l)} onDelete={() => remove(l)} />)}
            </ul>

            {adding && <AddLead onClose={() => setAdding(false)} onAdded={(lead) => { setAdding(false); setList((x) => [lead, ...(x ?? []).filter((y) => y.id !== lead.id)]); }} />}
            {msgFor && <MessageComposer lead={msgFor} onClose={() => setMsgFor(null)} />}
        </div>
    );
}

function Stat({ label, value, sub, hot, onClick }: { label: string; value: string | number; sub: string; hot?: boolean; onClick?: () => void }) {
    return (
        <button onClick={onClick} disabled={!onClick} className={`rounded-2xl border p-4 text-left ${hot ? "border-fire/50 bg-fire/10" : "border-white/10 bg-white/[0.04]"} ${onClick ? "hover:border-white/30" : "cursor-default"}`}>
            <p className="text-xs text-white/55">{label}</p>
            <p className={`mt-1 font-display text-2xl ${hot ? "text-fire" : ""}`}>{value}</p>
            <p className="mt-0.5 text-[11px] text-white/45">{sub}</p>
        </button>
    );
}

function LeadCard({ lead: l, today, onPatch, onMessage, onDelete }: { lead: Lead; today: string; onPatch: (c: Record<string, unknown>) => void; onMessage: () => void; onDelete: () => void }) {
    const [open, setOpen] = useState(false);
    const [note, setNote] = useState("");
    const due = isOpen(l) && l.follow_up_on && l.follow_up_on <= today;
    const field = "mt-1 h-10 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm outline-none focus:border-marigold";
    return (
        <li className={`rounded-2xl border bg-white/[0.04] p-4 ${due ? "border-fire/50" : "border-white/10"}`}>
            <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-white/40">#{l.id}</span>
                        <b className="text-base">{l.name || "(no name)"}</b>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/70">{SOURCE_LABEL[l.source] ?? l.source}</span>
                        {due && <span className="inline-flex items-center gap-1 rounded-full bg-fire/20 px-2 py-0.5 text-[11px] font-bold text-fire"><AlarmClock size={11} /> Follow up{l.follow_up_on! < today ? ` (since ${dateLabel(l.follow_up_on)})` : " today"}</span>}
                    </div>
                    <p className="mt-1 text-sm text-white/80">
                        {[l.interest, l.travel_date && `📅 ${dateLabel(l.travel_date, true)}`, l.pax && `👥 ${l.pax}`, l.amount_inr && `💰 ${rupees(l.amount_inr)}`].filter(Boolean).join("  ·  ") || <span className="text-white/40">No details yet</span>}
                    </p>
                    <p className="mt-1 text-xs text-white/45">added {ago(l.created_at)}{l.added_by ? ` by ${l.added_by}` : ""}{l.updated_at !== l.created_at ? ` · updated ${ago(l.updated_at)}` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                    {l.phone && <a href={`tel:${l.phone}`} title="Call" className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-white/15 hover:bg-white/10"><Phone size={16} /></a>}
                    <button onClick={onMessage} className="h-10 px-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold text-night"><MessageCircle size={16} /> Message</button>
                </div>
            </div>

            {/* one-tap status */}
            <div className="mt-3 flex flex-wrap gap-1.5">
                {STATUSES.map((s) => (
                    <button key={s} onClick={() => s !== l.status && onPatch({ status: s })} className={`h-8 rounded-full border px-3 text-xs font-medium transition-colors ${s === l.status ? STATUS_STYLE[s] : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"}`}>
                        {s === l.status && <Check size={11} className="mr-1 inline" />}{STATUS_LABEL[s]}
                    </button>
                ))}
                <button onClick={() => setOpen((o) => !o)} className="ml-auto h-8 px-3 inline-flex items-center gap-1 text-xs text-white/55 hover:text-white">Details <ChevronDown size={14} className={open ? "rotate-180" : ""} /></button>
            </div>

            {open && (
                <div className="mt-4 border-t border-white/10 pt-4">
                    <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                        <label><span className="text-white/50">Name</span><input defaultValue={l.name} onBlur={(e) => e.target.value !== l.name && onPatch({ name: e.target.value })} className={field} /></label>
                        <label><span className="text-white/50">Phone</span><input defaultValue={l.phone ? formatPhone(l.phone) : ""} onBlur={(e) => onPatch({ phone: e.target.value })} className={field} /></label>
                        <label className="col-span-2"><span className="text-white/50">Interested in</span><input defaultValue={l.interest} onBlur={(e) => e.target.value !== l.interest && onPatch({ interest: e.target.value })} className={field} /></label>
                        <label><span className="text-white/50">Travel date</span><input type="date" defaultValue={l.travel_date ?? ""} onChange={(e) => onPatch({ travel_date: e.target.value || null })} className={field} /></label>
                        <label><span className="text-white/50">People</span><input type="number" min={1} defaultValue={l.pax ?? ""} onBlur={(e) => onPatch({ pax: e.target.value || null })} className={field} /></label>
                        <label><span className="text-white/50">Amount ₹</span><input type="number" min={0} defaultValue={l.amount_inr ?? ""} onBlur={(e) => onPatch({ amount_inr: e.target.value === "" ? null : e.target.value })} className={field} /></label>
                        <label><span className="text-white/50">Next follow-up</span><input type="date" defaultValue={l.follow_up_on ?? ""} onChange={(e) => onPatch({ follow_up_on: e.target.value || null })} className={field} /></label>
                        <label><span className="text-white/50">Source</span>
                            <select defaultValue={l.source} onChange={(e) => onPatch({ source: e.target.value })} className={`${field} bg-night`}>{SOURCES.map((s) => <option key={s} value={s}>{SOURCE_LABEL[s]}</option>)}</select>
                        </label>
                    </div>
                    {l.notes && <p className="mt-3 whitespace-pre-wrap rounded-xl bg-white/5 px-3 py-2 text-sm text-white/75">{l.notes}</p>}
                    <form onSubmit={(e) => { e.preventDefault(); if (note.trim()) { onPatch({ note: note.trim() }); setNote(""); } }} className="mt-3 flex gap-2">
                        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note (e.g. called, no answer)" className="h-10 flex-1 rounded-full border border-white/15 bg-white/5 px-4 text-sm outline-none focus:border-marigold" />
                        <button className="h-10 rounded-full border border-white/20 px-4 text-sm hover:bg-white hover:text-night">Add</button>
                    </form>
                    {l.history?.length > 0 && (
                        <ol className="mt-3 space-y-1 text-xs text-white/55">
                            {[...l.history].reverse().map((h, i) => <li key={i}><span className="text-white/35">{new Date(h.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span> · {h.by} · {h.text}</li>)}
                        </ol>
                    )}
                    <button onClick={onDelete} className="mt-4 inline-flex items-center gap-1.5 text-xs text-ember/80 hover:text-ember"><Trash2 size={13} /> Delete lead</button>
                </div>
            )}
        </li>
    );
}

// Paste anything — a forwarded chat, call notes — and it's split into fields the same way the WhatsApp bot does.
function AddLead({ onClose, onAdded }: { onClose: () => void; onAdded: (l: Lead) => void }) {
    const [text, setText] = useState("");
    const [source, setSource] = useState("call");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const submit = async () => {
        setBusy(true); setError("");
        const r = await apiPost("/api/admin/leads", { text, source });
        setBusy(false);
        if (r.ok) onAdded(r.data.lead); else setError(r.data?.error || "Couldn't save.");
    };
    return (
        <Modal title="Add a lead" onClose={onClose}>
            <p className="text-sm text-white/60">Type or paste the details in any order — name, number, ride, date, people.</p>
            <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder={"Rahul 98765 43210 evening aarti 4 people 20 Dec"} className="mt-3 w-full rounded-2xl border border-white/15 bg-white/5 p-4 text-sm outline-none focus:border-marigold" />
            <div className="mt-3 flex flex-wrap gap-1.5">
                {SOURCES.map((s) => <button key={s} onClick={() => setSource(s)} className={`h-8 rounded-full border px-3 text-xs ${source === s ? "border-white bg-white text-night" : "border-white/15 text-white/65"}`}>{SOURCE_LABEL[s]}</button>)}
            </div>
            {error && <p className="mt-3 text-sm text-ember">{error}</p>}
            <button onClick={submit} disabled={busy || !text.trim()} className="mt-4 h-12 w-full rounded-full bg-gradient-to-r from-marigold via-fire to-ember font-semibold text-night disabled:opacity-40">{busy ? "Saving…" : "Save lead"}</button>
        </Modal>
    );
}

// Ready-to-send WhatsApp message for this client: pick one, tweak it, copy or open their chat with it typed.
function MessageComposer({ lead, onClose }: { lead: Lead; onClose: () => void }) {
    const keys = [...MESSAGES_FOR[lead.status], ...(Object.keys(MESSAGE_LABEL) as MessageKey[]).filter((k) => !MESSAGES_FOR[lead.status].includes(k))];
    const [key, setKey] = useState<MessageKey>(keys[0]);
    const [lang, setLang] = useState<MsgLang>("en");
    const [text, setText] = useState(() => clientMessage(keys[0], lead, "en"));
    const [copied, setCopied] = useState(false);
    const pick = (k: MessageKey, lg: MsgLang) => { setKey(k); setLang(lg); setText(clientMessage(k, lead, lg)); setCopied(false); };
    const copy = async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    return (
        <Modal title={`Message for ${lead.name || `#${lead.id}`}`} onClose={onClose}>
            <div className="flex flex-wrap gap-1.5">
                {keys.map((k, i) => <button key={k} onClick={() => pick(k, lang)} className={`h-8 rounded-full border px-3 text-xs ${key === k ? "border-white bg-white text-night" : i < MESSAGES_FOR[lead.status].length ? "border-marigold/40 text-marigold" : "border-white/15 text-white/60"}`}>{MESSAGE_LABEL[k]}</button>)}
            </div>
            <div className="mt-3 inline-flex rounded-full border border-white/15 p-0.5 text-xs">
                {([["en", "English"], ["hi", "हिंदी"]] as const).map(([lg, label]) => <button key={lg} onClick={() => pick(key, lg)} className={`h-7 rounded-full px-3 ${lang === lg ? "bg-white text-night" : "text-white/65"}`}>{label}</button>)}
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} className="mt-3 w-full rounded-2xl border border-white/15 bg-[#0b141a] p-4 text-sm leading-relaxed outline-none focus:border-marigold" />
            {text.includes("____") && <p className="mt-1 text-xs text-marigold">Fill in the ____ blanks before sending.</p>}
            <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={copy} className="h-12 inline-flex items-center justify-center gap-2 rounded-full border border-white/20 font-semibold hover:bg-white hover:text-night">{copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy</>}</button>
                <a href={waLink(lead.phone, text)} target="_blank" rel="noopener" className={`h-12 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] font-semibold text-night ${lead.phone ? "" : "pointer-events-none opacity-40"}`}><MessageCircle size={16} /> Open in WhatsApp</a>
            </div>
        </Modal>
    );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" onClick={onClose}>
            <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-night-2 p-5 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-center justify-between">
                    <p className="font-display text-xl">{title}</p>
                    <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-white/10"><X size={18} /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

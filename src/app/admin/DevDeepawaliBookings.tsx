"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Phone, RefreshCw, Search } from "lucide-react";
import { apiGet } from "@/components/auth/useAuth";
import { formatPhone } from "@/lib/phone";

type Booking = {
    key: string; created_at: string; name: string; phone: string; email: string; guests?: number; amount: number;
    payment_ref: string; payment_status: string; passengers: string[]; perInr: number; totalInr: number; dueInr: number; pay: "full" | "advance";
};
type Resp = { bookings: Booking[]; totals: { bookings: number; seats: number; collected: number; dueAtGhat: number }; configured: boolean; error?: string };

const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

// Paid Dev Deepawali seats (in full or a 50% advance), read straight from Razorpay.
export default function DevDeepawaliBookings() {
    const [data, setData] = useState<Resp | null>(null);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState("");
    const load = useCallback(async () => {
        setLoading(true);
        const r = await apiGet("/api/admin/dev-deepawali");
        setData(r.ok ? r.data : { bookings: [], totals: { bookings: 0, seats: 0, collected: 0, dueAtGhat: 0 }, configured: true, error: r.data?.error || "Couldn't load bookings." });
        setLoading(false);
    }, []);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load
    useEffect(() => { load(); }, [load]);

    const needle = q.trim().toLowerCase();
    const rows = (data?.bookings ?? []).filter((b) => !needle || [b.key, b.name, b.phone, b.email, ...b.passengers].some((v) => String(v).toLowerCase().includes(needle)));

    return (
        <div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {([["Bookings", data?.totals.bookings ?? "—"], ["Seats sold", data?.totals.seats ?? "—"], ["Collected online", data ? rupees(data.totals.collected) : "—"], ["Due at the ghat", data ? rupees(data.totals.dueAtGhat) : "—"]] as const).map(([label, v]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[11px] uppercase tracking-wider text-white/50">{label}</p>
                        <p className="mt-1 font-display text-2xl text-marigold">{v}</p>
                    </div>
                ))}
            </div>
            <div className="mt-5 flex items-center gap-3">
                <form onSubmit={(e) => e.preventDefault()} className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search booking, name, phone, email, passenger…" className="h-11 w-full rounded-full border border-white/15 bg-white/5 pl-10 pr-4 outline-none focus:border-marigold" />
                </form>
                <button onClick={load} aria-label="Refresh" className="h-11 w-11 inline-flex items-center justify-center rounded-full border border-white/15 hover:bg-white/10"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
            </div>
            {data?.error && <p className="mt-3 text-sm text-ember">{data.error}</p>}
            {data && !data.configured && <p className="mt-3 text-sm text-ember">Razorpay keys aren&apos;t set on this deployment, so bookings can&apos;t be read.</p>}
            {!data && <p className="mt-6 flex items-center gap-2 text-white/60"><Loader2 size={16} className="animate-spin" /> Loading bookings from Razorpay…</p>}
            {data && rows.length === 0 && !data.error && <p className="mt-6 text-white/60">No Dev Deepawali bookings yet.</p>}

            <ul className="mt-5 grid gap-3">
                {rows.map((b) => (
                    <li key={b.key} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="font-semibold"><span className="text-marigold">{b.key}</span> · {b.name}</p>
                                <p className="text-sm text-white/55">Booked {when(b.created_at)} · {b.guests} seat{b.guests === 1 ? "" : "s"} × {rupees(b.perInr)}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${b.dueInr ? "bg-marigold/20 text-marigold" : "bg-emerald-400/15 text-emerald-300"}`}>
                                {b.dueInr ? `50% paid · collect ${rupees(b.dueInr)} at ghat` : "Paid in full"}
                            </span>
                        </div>
                        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                            <p><span className="text-white/45">Paid online</span><br /><b>{rupees(b.amount)}</b> <span className="text-white/45">of {rupees(b.totalInr)}</span></p>
                            <p><span className="text-white/45">Contact</span><br /><a href={`tel:${b.phone}`} className="inline-flex items-center gap-1 hover:text-marigold"><Phone size={13} />{formatPhone(b.phone)}</a><br /><span className="text-white/70">{b.email}</span></p>
                            <p><span className="text-white/45">Passengers</span><br />{b.passengers.join(", ")}</p>
                        </div>
                        <p className="mt-2 text-xs text-white/40">Razorpay payment {b.payment_ref}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

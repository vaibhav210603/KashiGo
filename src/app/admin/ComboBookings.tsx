"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Phone, RefreshCw, Search, Ship, Video } from "lucide-react";
import { apiGet } from "@/components/auth/useAuth";
import { formatPhone } from "@/lib/phone";

type Booking = {
    booking: string; plan: "combo" | "consult"; created_at: string; name: string; phone: string; email: string; amount: number; payment_ref: string;
    rideName: string; rideTime: string; rideDate: string; guests: number; ghat: string;
    expertName: string; minutes: number; meetDate: string; meetLabel: string; concerns: string[]; dob: string; birthTime: string; birthPlace: string;
};
type Resp = { bookings: Booking[]; totals: { bookings: number; combos: number; consults: number; collected: number }; configured: boolean; error?: string };

const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const day = (iso: string) => (iso ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }) : "—");

// Paid ride + consultation combos and paid Google Meet sessions (/ride-and-consult), read straight from Razorpay.
export default function ComboBookings() {
    const [data, setData] = useState<Resp | null>(null);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState("");
    const load = useCallback(async () => {
        setLoading(true);
        const r = await apiGet("/api/admin/combo");
        setData(r.ok ? r.data : { bookings: [], totals: { bookings: 0, combos: 0, consults: 0, collected: 0 }, configured: true, error: r.data?.error || "Couldn't load bookings." });
        setLoading(false);
    }, []);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load
    useEffect(() => { load(); }, [load]);

    const needle = q.trim().toLowerCase();
    const rows = (data?.bookings ?? []).filter((b) => !needle || [b.booking, b.name, b.phone, b.email, b.expertName].some((v) => String(v).toLowerCase().includes(needle)));

    return (
        <div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {([["Bookings", data?.totals.bookings ?? "—"], ["Ride + consult", data?.totals.combos ?? "—"], ["Consult only", data?.totals.consults ?? "—"], ["Collected", data ? rupees(data.totals.collected) : "—"]] as const).map(([label, v]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[11px] uppercase tracking-wider text-white/50">{label}</p>
                        <p className="mt-1 font-display text-2xl text-marigold">{v}</p>
                    </div>
                ))}
            </div>
            <div className="mt-5 flex items-center gap-3">
                <form onSubmit={(e) => e.preventDefault()} className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search booking, name, phone, email, guru…" className="h-11 w-full rounded-full border border-white/15 bg-white/5 pl-10 pr-4 outline-none focus:border-marigold" />
                </form>
                <button onClick={load} aria-label="Refresh" className="h-11 w-11 inline-flex items-center justify-center rounded-full border border-white/15 hover:bg-white/10"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
            </div>
            {data?.error && <p className="mt-3 text-sm text-ember">{data.error}</p>}
            {data && !data.configured && <p className="mt-3 text-sm text-ember">Razorpay keys aren&apos;t set on this deployment, so bookings can&apos;t be read.</p>}
            {!data && <p className="mt-6 flex items-center gap-2 text-white/60"><Loader2 size={16} className="animate-spin" /> Loading bookings from Razorpay…</p>}
            {data && rows.length === 0 && !data.error && <p className="mt-6 text-white/60">No ride + consultation bookings yet.</p>}

            <ul className="mt-5 grid gap-3">
                {rows.map((b) => (
                    <li key={b.booking} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="font-semibold"><span className="text-marigold">{b.booking}</span> · {b.name}</p>
                                <p className="text-sm text-white/55">Booked {when(b.created_at)} · paid {rupees(b.amount)}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${b.plan === "combo" ? "bg-marigold/20 text-marigold" : "bg-sky-400/15 text-sky-300"}`}>{b.plan === "combo" ? "Ride + consultation" : "Consultation only"}</span>
                        </div>
                        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                            {b.plan === "combo" && (
                                <p><span className="inline-flex items-center gap-1 text-white/45"><Ship size={13} /> Boat ride</span><br />{b.rideName}<br /><span className="text-white/70">{day(b.rideDate)} · {b.rideTime} · {b.ghat} · {b.guests} {b.guests === 1 ? "person" : "people"}</span></p>
                            )}
                            <p><span className="inline-flex items-center gap-1 text-white/45"><Video size={13} /> Google Meet</span><br />{b.minutes} min with {b.expertName}<br /><span className="text-white/70">{day(b.meetDate)} · {b.meetLabel}</span><br /><span className="text-white/55">{b.concerns.join(", ")}</span></p>
                            <p><span className="text-white/45">Contact</span><br /><a href={`tel:${b.phone}`} className="inline-flex items-center gap-1 hover:text-marigold"><Phone size={13} />{formatPhone(b.phone)}</a><br /><span className="text-white/70">{b.email}</span><br /><span className="text-white/55">Born {b.dob || "—"} {b.birthTime} {b.birthPlace}</span></p>
                        </div>
                        <p className="mt-2 text-xs text-white/40">Razorpay payment {b.payment_ref}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

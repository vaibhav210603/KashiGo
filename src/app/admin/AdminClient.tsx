"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Coins, Loader2, LogOut, Plus, RefreshCw, Search, Tag, Ticket, Trash2, Undo2, X } from "lucide-react";
import PhoneLogin from "@/components/auth/PhoneLogin";
import { apiGet, apiPost, authHeaders, useAuth } from "@/components/auth/useAuth";
import { useAccount } from "@/components/auth/useAccount";
import { formatPhone, normalizePhone } from "@/lib/phone";
import { productName } from "@/lib/productNames";

type Tab = "orders" | "coupons" | "coins";
const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const when = (iso?: string | null) => (iso ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "—");

export default function AdminClient() {
    const auth = useAuth();
    const { account } = useAccount();
    const [tab, setTab] = useState<Tab>("orders");

    return (
        <div className="min-h-screen bg-night text-white pt-28 pb-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="ornament text-[11px] font-semibold uppercase tracking-[0.28em] text-marigold">KashiGo admin</p>
                        <h1 className="mt-3 font-display font-light text-5xl tracking-[-0.03em]">Control <em className="text-fire">room.</em></h1>
                    </div>
                    {auth.loggedIn && (
                        <button onClick={() => auth.signOut()} className="h-10 px-4 inline-flex items-center gap-2 rounded-full border border-white/20 text-sm text-white/80 hover:bg-white hover:text-night">
                            <LogOut size={15} /> {formatPhone(auth.phone)}
                        </button>
                    )}
                </div>

                {!auth.ready ? null : !auth.loggedIn ? (
                    <div className="mt-10 max-w-lg rounded-3xl border border-white/10 bg-white/5 p-6">
                        <PhoneLogin tone="dark" title="Admin login" subtitle="Use a phone number listed in ADMIN_PHONES." />
                    </div>
                ) : !account ? (
                    <p className="mt-10 flex items-center gap-2 text-white/60"><Loader2 className="animate-spin" size={18} /> Checking access…</p>
                ) : !account.admin ? (
                    <p className="mt-10 rounded-2xl border border-ember/40 bg-ember/10 p-5 text-white/85">{formatPhone(auth.phone)} isn&apos;t an admin. Add it to <code className="text-marigold">ADMIN_PHONES</code> in the server environment.</p>
                ) : (
                    <>
                        <nav className="mt-10 inline-flex rounded-full border border-white/15 p-1">
                            {([["orders", "Orders", Ticket], ["coupons", "Coupons", Tag], ["coins", "Coins", Coins]] as const).map(([id, label, Icon]) => (
                                <button key={id} onClick={() => setTab(id)} className={`h-10 px-5 inline-flex items-center gap-2 rounded-full text-sm font-medium transition-colors ${tab === id ? "bg-white text-night" : "text-white/70 hover:text-white"}`}>
                                    <Icon size={16} /> {label}
                                </button>
                            ))}
                        </nav>
                        <div className="mt-8">
                            {tab === "orders" && <Orders />}
                            {tab === "coupons" && <Coupons />}
                            {tab === "coins" && <CoinsTool />}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* ───────────────────────── Orders + refunds ───────────────────────── */

type BoatOrder = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any -- rows from the existing orders table
type ShopOrder = { order_ref: string; product: string; customer_phone: string | null; name: string | null; email: string | null; provider: string; amount_inr: number; amount_usd: number | null; credits_used: number; coupon: string | null; refunded_inr: number; created_at: string };
type RefundTarget = { kind: "boat" | "shop"; key: string; label: string; paid: number; refunded: number; phone: string | null; fallbackPhone: string | null };

function Orders() {
    const [q, setQ] = useState("");
    const [data, setData] = useState<{ boats: BoatOrder[]; shop: ShopOrder[]; errors: string[] } | null>(null);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<"boats" | "shop">("boats");
    const [refund, setRefund] = useState<RefundTarget | null>(null);

    const load = useCallback(async (term = "") => {
        setLoading(true);
        const r = await apiGet(`/api/admin/orders${term ? `?q=${encodeURIComponent(term)}` : ""}`);
        setData(r.ok ? r.data : { boats: [], shop: [], errors: [r.data.error || "Couldn't load orders."] });
        setLoading(false);
    }, []);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load
    useEffect(() => { load(); }, [load]);

    return (
        <div>
            <div className="flex flex-wrap items-center gap-3">
                <form onSubmit={(e) => { e.preventDefault(); load(q); }} className="relative flex-1 min-w-[16rem]">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ride ID, name, phone, product…" className="h-11 w-full rounded-full border border-white/15 bg-white/5 pl-10 pr-4 outline-none focus:border-marigold" />
                </form>
                <div className="inline-flex rounded-full border border-white/15 p-1 text-sm">
                    <button onClick={() => setView("boats")} className={`h-9 px-4 rounded-full ${view === "boats" ? "bg-white text-night" : "text-white/70"}`}>Boat rides {data ? `(${data.boats.length})` : ""}</button>
                    <button onClick={() => setView("shop")} className={`h-9 px-4 rounded-full ${view === "shop" ? "bg-white text-night" : "text-white/70"}`}>Guides {data ? `(${data.shop.length})` : ""}</button>
                </div>
                <button onClick={() => load(q)} aria-label="Refresh" className="h-11 w-11 inline-flex items-center justify-center rounded-full border border-white/15 hover:bg-white/10"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
            </div>
            {data?.errors?.map((e) => <p key={e} className="mt-3 text-sm text-ember">{e}</p>)}

            <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10" data-lenis-prevent>
                <table className="w-full min-w-[56rem] text-sm">
                    <thead className="bg-white/5 text-left text-[11px] uppercase tracking-wider text-white/50">
                        {view === "boats" ? (
                            <tr><Th>Ride</Th><Th>When</Th><Th>Customer</Th><Th>Payment</Th><Th className="text-right">Paid</Th><Th className="text-right">Refunded</Th><Th /></tr>
                        ) : (
                            <tr><Th>Order</Th><Th>Bought</Th><Th>Customer</Th><Th>Via</Th><Th className="text-right">Paid</Th><Th className="text-right">Refunded</Th><Th /></tr>
                        )}
                    </thead>
                    <tbody>
                        {view === "boats" && data?.boats.map((o) => {
                            const paid = Math.round(Number(o.amount) || 0) + (Number(o.credits_used) || 0);
                            const phone = o.customer_phone || null;
                            return (
                                <tr key={o.ride_id + (o.id ?? "")} className="border-t border-white/10 align-top">
                                    <Td><b>{o.ride_id}</b><span className="block text-white/55">{productName(o.package_id)} · {o.ghat}</span></Td>
                                    <Td>{o.ride_date || ""}<span className="block text-white/55">{o.time_of_day}</span></Td>
                                    <Td>{o.passenger_name}<span className="block text-white/55">{formatPhone(phone) || o.passenger_phone}{o.passengers_count ? ` · ${o.passengers_count} guests` : ""}</span></Td>
                                    <Td><Status s={o.payment_status} /><span className="block text-white/55">{o.payment_mode}{o.coupon ? ` · ${o.coupon}` : ""}</span>{o.check_notes && <span className="block text-xs text-ember">{o.check_notes}</span>}</Td>
                                    <Td className="text-right">{rupees(paid)}{o.credits_used ? <span className="block text-xs text-white/50">{o.credits_used} in coins</span> : null}</Td>
                                    <Td className="text-right">{o.refunded_inr ? rupees(o.refunded_inr) : "—"}</Td>
                                    <Td className="text-right">
                                        <button disabled={paid - (o.refunded_inr || 0) <= 0} onClick={() => setRefund({ kind: "boat", key: o.ride_id, label: `${o.ride_id} · ${o.passenger_name}`, paid, refunded: o.refunded_inr || 0, phone, fallbackPhone: normalizePhone(o.passenger_phone) })}
                                            className="h-9 px-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 hover:bg-marigold hover:text-night hover:border-marigold disabled:opacity-30 disabled:pointer-events-none"><Undo2 size={14} /> Refund</button>
                                    </Td>
                                </tr>
                            );
                        })}
                        {view === "shop" && data?.shop.map((o) => {
                            const paid = o.amount_inr + o.credits_used;
                            return (
                                <tr key={o.order_ref} className="border-t border-white/10 align-top">
                                    <Td><b>{productName(o.product)}</b><span className="block text-white/55 break-all">{o.order_ref}</span></Td>
                                    <Td>{when(o.created_at)}</Td>
                                    <Td>{o.name || "—"}<span className="block text-white/55">{formatPhone(o.customer_phone)} {o.email}</span></Td>
                                    <Td>{o.provider}{o.coupon ? <span className="block text-white/55">{o.coupon}</span> : null}</Td>
                                    <Td className="text-right">{rupees(paid)}{o.amount_usd ? <span className="block text-xs text-white/50">${Number(o.amount_usd).toFixed(2)} via PayPal</span> : null}</Td>
                                    <Td className="text-right">{o.refunded_inr ? rupees(o.refunded_inr) : "—"}</Td>
                                    <Td className="text-right">
                                        <button disabled={paid - o.refunded_inr <= 0} onClick={() => setRefund({ kind: "shop", key: o.order_ref, label: `${productName(o.product)} · ${o.name || o.email || ""}`, paid, refunded: o.refunded_inr, phone: o.customer_phone, fallbackPhone: null })}
                                            className="h-9 px-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 hover:bg-marigold hover:text-night hover:border-marigold disabled:opacity-30 disabled:pointer-events-none"><Undo2 size={14} /> Refund</button>
                                    </Td>
                                </tr>
                            );
                        })}
                        {data && (view === "boats" ? data.boats : data.shop).length === 0 && <tr><Td className="py-10 text-center text-white/50" colSpan={7}>No orders found.</Td></tr>}
                    </tbody>
                </table>
            </div>
            {refund && <RefundDialog target={refund} onClose={() => setRefund(null)} onDone={() => { setRefund(null); load(q); }} />}
        </div>
    );
}

function RefundDialog({ target, onClose, onDone }: { target: RefundTarget; onClose: () => void; onDone: () => void }) {
    const left = target.paid - target.refunded;
    const [amount, setAmount] = useState(String(left));
    const [note, setNote] = useState("");
    const [phone, setPhone] = useState(target.fallbackPhone ?? "");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<number | null>(null);

    const submit = async () => {
        setError(""); setBusy(true);
        const r = await apiPost("/api/admin/refund", { kind: target.kind, key: target.key, amount: Number(amount), note, phone: target.phone ? undefined : phone });
        setBusy(false);
        if (!r.ok) { setError(r.data.error || "Refund failed."); return; }
        setResult(r.data.balance);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-night/80 backdrop-blur-sm p-0 sm:p-4" role="dialog" aria-modal="true" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-white/10 bg-night-2 p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.25em] text-marigold">Refund as KashiGo coins</p>
                        <p className="mt-1 font-display text-2xl">{target.label}</p>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="text-white/50 hover:text-white"><X /></button>
                </div>
                {result !== null ? (
                    <div className="mt-6 space-y-4">
                        <p className="rounded-2xl border border-ganga/40 bg-ganga/10 p-4">Done — {Number(amount).toLocaleString("en-IN")} coins added. Their balance is now <b>{result.toLocaleString("en-IN")}</b>.</p>
                        <button onClick={onDone} className="h-12 w-full rounded-full bg-white text-night font-semibold">Close</button>
                    </div>
                ) : (
                    <div className="mt-6 space-y-3">
                        <p className="text-sm text-white/60">Paid {rupees(target.paid)}{target.refunded ? `, already refunded ${rupees(target.refunded)}` : ""}. Up to <b className="text-white">{left.toLocaleString("en-IN")}</b> coins can go back to {target.phone ? <b className="text-white">{formatPhone(target.phone)}</b> : "the customer"}.</p>
                        {!target.phone && (
                            <label className="block text-sm">
                                <span className="text-white/60">This order was saved before phones were recorded — refund to:</span>
                                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="mt-1 h-12 w-full rounded-2xl border border-white/15 bg-white/5 px-4 outline-none focus:border-marigold" />
                            </label>
                        )}
                        <label className="block text-sm">
                            <span className="text-white/60">Coins to refund (1 coin = ₹1)</span>
                            <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className="mt-1 h-12 w-full rounded-2xl border border-white/15 bg-white/5 px-4 text-lg outline-none focus:border-marigold" />
                        </label>
                        <label className="block text-sm">
                            <span className="text-white/60">Note (shown to the customer)</span>
                            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Ride cancelled — high river" className="mt-1 h-12 w-full rounded-2xl border border-white/15 bg-white/5 px-4 outline-none focus:border-marigold" />
                        </label>
                        {error && <p className="text-sm text-ember">{error}</p>}
                        <button onClick={submit} disabled={busy || !(Number(amount) > 0) || Number(amount) > left || (!target.phone && !normalizePhone(phone))}
                            className="h-12 w-full rounded-full bg-gradient-to-r from-marigold via-fire to-ember text-night font-semibold disabled:opacity-40">
                            {busy ? "Refunding…" : `Refund ${Number(amount || 0).toLocaleString("en-IN")} coins`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ───────────────────────── Coupons ───────────────────────── */

type Coupon = { code: string; kind: "percent" | "amount_off" | "fixed_price"; value: number; applies_to: string[]; max_uses: number | null; per_phone_limit: number | null; active: boolean; starts_at: string | null; expires_at: string | null; note: string | null; uses: number; created_at: string };
const SCOPES = [["all", "Everything"], ["boat", "Boat rides"], ["shop", "Ebooks & audio"], ["guide", "Varanasi guide"], ["india-tour", "India guide"]] as const;
const describe = (c: Pick<Coupon, "kind" | "value">) => (c.kind === "percent" ? `${c.value}% off` : c.kind === "amount_off" ? `₹${c.value} off` : `Pay ₹${c.value}`);

function Coupons() {
    const [list, setList] = useState<Coupon[] | null>(null);
    const [error, setError] = useState("");
    const [creating, setCreating] = useState(false);

    const load = useCallback(async () => {
        const r = await apiGet("/api/admin/coupons");
        if (!r.ok) setError(r.data.error || "Couldn't load coupons — has supabase/accounts_credits_admin.sql been run?");
        setList(r.data.coupons ?? []);
    }, []);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load
    useEffect(() => { load(); }, [load]);

    const patch = async (code: string, body: Partial<Coupon>) => {
        const r = await apiPost("/api/admin/coupons", { code, ...body }, "PATCH");
        if (!r.ok) setError(r.data.error || "Update failed.");
        load();
    };
    const remove = async (code: string) => {
        if (!window.confirm(`Delete ${code}? Its usage history goes too. To stop it but keep history, switch it off instead.`)) return;
        const r = await fetch(`/api/admin/coupons?code=${encodeURIComponent(code)}`, { method: "DELETE", headers: await authHeaders() });
        if (!r.ok) setError("Delete failed.");
        load();
    };

    return (
        <div>
            <div className="flex items-center justify-between gap-4">
                <p className="text-white/60 text-sm">New codes work at checkout the moment you save them. Customers log in with their phone to use one.</p>
                <button onClick={() => setCreating(true)} className="h-11 px-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-marigold via-fire to-ember text-night font-semibold"><Plus size={16} /> New coupon</button>
            </div>
            {error && <p className="mt-3 text-sm text-ember">{error}</p>}
            {creating && <NewCoupon onClose={() => setCreating(false)} onCreated={() => { setCreating(false); load(); }} />}

            <div className="mt-6 grid gap-3">
                {list?.map((c) => {
                    const expired = c.expires_at && new Date(c.expires_at) < new Date();
                    return (
                        <div key={c.code} className={`flex flex-wrap items-center gap-4 rounded-2xl border p-4 ${c.active && !expired ? "border-white/15 bg-white/[0.03]" : "border-white/5 opacity-60"}`}>
                            <div className="min-w-[10rem]">
                                <p className="font-mono text-lg font-semibold text-marigold">{c.code}</p>
                                <p className="text-sm text-white/60">{describe(c)} · {c.applies_to.map((s) => SCOPES.find(([k]) => k === s)?.[1] ?? productName(s)).join(", ")}</p>
                            </div>
                            <div className="flex-1 text-sm text-white/60">
                                <span className="text-white">{c.uses}</span>{c.max_uses ? ` / ${c.max_uses}` : ""} used
                                {c.per_phone_limit ? ` · ${c.per_phone_limit} per customer` : " · no per-customer limit"}
                                {c.expires_at ? ` · ${expired ? "expired" : "ends"} ${when(c.expires_at)}` : ""}
                                {c.note ? <span className="block text-white/45">{c.note}</span> : null}
                            </div>
                            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                                <span className="text-white/60">{c.active ? "Live" : "Off"}</span>
                                <button role="switch" aria-checked={c.active} onClick={() => patch(c.code, { active: !c.active })}
                                    className={`relative h-6 w-11 rounded-full transition-colors ${c.active ? "bg-ganga" : "bg-white/20"}`}>
                                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${c.active ? "translate-x-5" : "translate-x-0.5"}`} />
                                </button>
                            </label>
                            <button onClick={() => remove(c.code)} aria-label={`Delete ${c.code}`} className="h-9 w-9 inline-flex items-center justify-center rounded-full text-white/50 hover:bg-ember/20 hover:text-ember"><Trash2 size={16} /></button>
                        </div>
                    );
                })}
                {list && !list.length && !error && <p className="text-white/50">No coupons yet.</p>}
            </div>
        </div>
    );
}

function NewCoupon({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [f, setF] = useState({ code: "", kind: "percent", value: "10", applies_to: ["all"] as string[], max_uses: "", per_phone_limit: "1", expires_at: "", note: "" });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const set = (k: keyof typeof f, v: string | string[]) => setF((x) => ({ ...x, [k]: v }));
    const toggleScope = (s: string) => set("applies_to", s === "all" ? ["all"] : f.applies_to.includes(s) ? f.applies_to.filter((x) => x !== s) : [...f.applies_to.filter((x) => x !== "all"), s]);
    const field = "h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 outline-none focus:border-marigold";

    const submit = async () => {
        setError(""); setBusy(true);
        const r = await apiPost("/api/admin/coupons", {
            ...f, value: Number(f.value), applies_to: f.applies_to.length ? f.applies_to : ["all"],
            max_uses: f.max_uses || null, per_phone_limit: f.per_phone_limit || null,
            expires_at: f.expires_at ? new Date(`${f.expires_at}T23:59:59+05:30`).toISOString() : null,
        });
        setBusy(false);
        if (!r.ok) { setError(r.data.error || "Couldn't create the coupon."); return; }
        onCreated();
    };

    return (
        <div className="mt-6 rounded-3xl border border-marigold/30 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between"><p className="font-display text-2xl">New coupon</p><button onClick={onClose} aria-label="Close" className="text-white/50 hover:text-white"><X /></button></div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="text-sm"><span className="text-white/60">Code</span><input value={f.code} onChange={(e) => set("code", e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))} placeholder="DIWALI15" className={`${field} mt-1 font-mono uppercase`} /></label>
                <label className="text-sm"><span className="text-white/60">Type</span>
                    <select value={f.kind} onChange={(e) => set("kind", e.target.value)} className={`${field} mt-1`}>
                        <option value="percent" className="text-night">Percent off</option>
                        <option value="amount_off" className="text-night">Rupees off</option>
                        <option value="fixed_price" className="text-night">Fixed price (₹)</option>
                    </select>
                </label>
                <label className="text-sm"><span className="text-white/60">{f.kind === "percent" ? "Percent" : "Rupees"}</span><input value={f.value} onChange={(e) => set("value", e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" className={`${field} mt-1`} /></label>
                <label className="text-sm"><span className="text-white/60">Ends (optional)</span><input type="date" value={f.expires_at} onChange={(e) => set("expires_at", e.target.value)} className={`${field} mt-1 [color-scheme:dark]`} /></label>
                <label className="text-sm"><span className="text-white/60">Total uses (blank = unlimited)</span><input value={f.max_uses} onChange={(e) => set("max_uses", e.target.value.replace(/\D/g, ""))} inputMode="numeric" className={`${field} mt-1`} /></label>
                <label className="text-sm"><span className="text-white/60">Uses per customer (blank = unlimited)</span><input value={f.per_phone_limit} onChange={(e) => set("per_phone_limit", e.target.value.replace(/\D/g, ""))} inputMode="numeric" className={`${field} mt-1`} /></label>
                <label className="text-sm sm:col-span-2"><span className="text-white/60">Note (just for you)</span><input value={f.note} onChange={(e) => set("note", e.target.value)} placeholder="Instagram giveaway, Oct 2026" className={`${field} mt-1`} /></label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-white/60 self-center mr-1">Works on:</span>
                {SCOPES.map(([k, label]) => (
                    <button key={k} type="button" onClick={() => toggleScope(k)} className={`h-9 px-4 rounded-full border text-sm ${f.applies_to.includes(k) ? "border-marigold bg-marigold text-night" : "border-white/20 text-white/70"}`}>{label}</button>
                ))}
            </div>
            {error && <p className="mt-3 text-sm text-ember">{error}</p>}
            <button onClick={submit} disabled={busy || f.code.length < 3 || !(Number(f.value) > 0)} className="mt-5 h-12 px-8 rounded-full bg-gradient-to-r from-marigold via-fire to-ember text-night font-semibold disabled:opacity-40">
                {busy ? "Saving…" : `Create ${f.code || "coupon"} — goes live now`}
            </button>
        </div>
    );
}

/* ───────────────────────── Coins lookup / adjust ───────────────────────── */

function CoinsTool() {
    const [phone, setPhone] = useState("");
    const [res, setRes] = useState<{ phone: string; profile: { name: string | null; credits_inr: number; user_id: string | null } | null; ledger: { delta_inr: number; balance_after: number; kind: string; ref: string | null; note: string | null; created_by: string | null; created_at: string }[] } | null>(null);
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [error, setError] = useState("");
    const normal = useMemo(() => normalizePhone(phone), [phone]);

    const lookup = async () => {
        setError("");
        const r = await apiGet(`/api/admin/credits?phone=${encodeURIComponent(phone)}`);
        if (!r.ok) { setError(r.data.error || "Lookup failed."); setRes(null); return; }
        setRes(r.data);
    };
    const adjust = async () => {
        setError("");
        const r = await apiPost("/api/admin/credits", { phone, amount: Number(amount), note });
        if (!r.ok) { setError(r.data.error || "Couldn't change the balance."); return; }
        setAmount(""); setNote("");
        lookup();
    };

    return (
        <div className="max-w-2xl">
            <form onSubmit={(e) => { e.preventDefault(); lookup(); }} className="flex gap-2">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Customer phone, e.g. +44 7700 900123" className="h-12 flex-1 rounded-full border border-white/15 bg-white/5 px-5 outline-none focus:border-marigold" />
                <button disabled={!normal} className="h-12 px-6 rounded-full bg-white text-night font-semibold disabled:opacity-40">Look up</button>
            </form>
            {error && <p className="mt-3 text-sm text-ember">{error}</p>}
            {res && (
                <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-white/60">{formatPhone(res.phone)}{res.profile?.name ? ` · ${res.profile.name}` : ""}{res.profile?.user_id ? " · has logged in" : " · hasn't logged in yet"}</p>
                    <p className="mt-1 font-display text-5xl text-fire">{(res.profile?.credits_inr ?? 0).toLocaleString("en-IN")} <span className="text-xl text-white/60">coins</span></p>
                    <div className="mt-5 grid gap-2 sm:grid-cols-[8rem_1fr_auto]">
                        <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d-]/g, ""))} placeholder="+500 / -200" inputMode="numeric" className="h-11 rounded-xl border border-white/15 bg-white/5 px-3 outline-none focus:border-marigold" />
                        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason (shown to customer)" className="h-11 rounded-xl border border-white/15 bg-white/5 px-3 outline-none focus:border-marigold" />
                        <button onClick={adjust} disabled={!Number(amount)} className="h-11 px-5 rounded-full bg-gradient-to-r from-marigold via-fire to-ember text-night font-semibold disabled:opacity-40">Apply</button>
                    </div>
                    <div className="mt-6 divide-y divide-white/10 text-sm">
                        {res.ledger.map((l, i) => (
                            <div key={i} className="flex justify-between gap-4 py-2.5">
                                <span><b className="capitalize">{l.kind}</b> <span className="text-white/50">· {when(l.created_at)}{l.note ? ` · ${l.note}` : ""}{l.ref ? ` · ${l.ref}` : ""}{l.created_by ? ` · by ${formatPhone(l.created_by)}` : ""}</span></span>
                                <span className={l.delta_inr > 0 ? "text-ganga" : "text-ember"}>{l.delta_inr > 0 ? "+" : ""}{l.delta_inr} → {l.balance_after}</span>
                            </div>
                        ))}
                        {!res.ledger.length && <p className="py-3 text-white/50">No coin history.</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ───────────────────────── bits ───────────────────────── */

const Th = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => <th className={`px-4 py-3 font-semibold ${className}`}>{children}</th>;
const Td = ({ children, className = "", colSpan }: { children?: React.ReactNode; className?: string; colSpan?: number }) => <td colSpan={colSpan} className={`px-4 py-3 ${className}`}>{children}</td>;
const Status = ({ s }: { s: string }) => (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${s === "paid" ? "bg-ganga/20 text-ganga" : s === "pending" ? "bg-marigold/15 text-marigold" : "bg-ember/20 text-ember"}`}>{s === "pending" ? "at ghat" : s}</span>
);

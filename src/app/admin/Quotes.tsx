"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, ExternalLink, Loader2, MessageCircle, Plus, RefreshCw, RotateCcw, Trash2, X } from "lucide-react";
import { apiGet, apiPost, authHeaders } from "@/components/auth/useAuth";
import { GHATS, addDaysIso, istNow, toMinutes } from "@/lib/boatRides";
import { CHILD_JACKET_INR, DEFAULT_EXTRA_PASSENGER_INR, QUOTE_PACKAGES, defaultItinerary, defaultRoute, defaultValidUntil, passengerLines, quotePackage, shiftTime, type Quote } from "@/lib/quotes";

const rupees = (n: number) => `${n < 0 ? "− " : ""}₹${Math.abs(Math.round(n)).toLocaleString("en-IN")}`;
const pretty = (t: string) => shiftTime(t, 0); // "18:30" → "6:30 PM"
const to24 = (t: string) => { const m = toMinutes(t); return Number.isNaN(m) ? "" : `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; };
const longDate = (iso: string) => new Date(`${iso}T00:00:00+05:30`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
const quoteUrl = (id: string) => `${window.location.origin}/quote/${id}`;
const pdfUrl = (id: string) => `/quote/${id}?pdf=1&download=1`;
const field = "h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 outline-none focus:border-marigold";

type Row = { quote: Quote; createdAt: string; createdBy: string | null; paidAt: string | null; total: number; paid: boolean };
type Person = { name: string; child: boolean };
type Extra = { label: string; amount: string; discount: boolean };

export default function Quotes() {
    const [rows, setRows] = useState<Row[] | null>(null);
    const [error, setError] = useState("");
    const [made, setMade] = useState<Quote | null>(null);
    const [creating, setCreating] = useState(true);

    const load = useCallback(async () => {
        setError("");
        const r = await apiGet("/api/admin/quotes");
        setRows(r.data.quotes ?? []);
        if (!r.ok) setError(r.data.error || "Couldn't load quotations.");
    }, []);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load
    useEffect(() => { load(); }, [load]);

    const remove = async (id: string) => {
        if (!window.confirm(`Delete quotation ${id}? Its link will stop working.`)) return;
        const r = await fetch(`/api/admin/quotes?id=${encodeURIComponent(id)}`, { method: "DELETE", headers: await authHeaders() });
        if (!r.ok) setError((await r.json().catch(() => ({}))).error || "Delete failed.");
        load();
    };

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-white/60 text-sm max-w-2xl">Fill in the customer and ride, check the price, and press Create. You get a payment page with a QR code (Razorpay), a link to send on WhatsApp, and a PDF.</p>
                {!creating && <button onClick={() => { setMade(null); setCreating(true); }} className="h-11 px-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-marigold via-fire to-ember text-night font-semibold"><Plus size={16} /> New quotation</button>}
            </div>

            {made && <Made q={made} onClose={() => setMade(null)} />}
            {creating && !made && <Generator onClose={() => setCreating(false)} onCreated={(q) => { setMade(q); setCreating(false); load(); }} />}

            <div className="mt-10 flex items-center justify-between">
                <p className="font-display text-2xl">All quotations</p>
                <button onClick={load} className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-white/15 text-white/70 hover:text-white" aria-label="Refresh"><RefreshCw size={16} /></button>
            </div>
            {error && <p className="mt-3 text-sm text-ember">{error}</p>}
            <div className="mt-4 grid gap-3">
                {!rows && <p className="flex items-center gap-2 text-white/60"><Loader2 className="animate-spin" size={16} /> Loading…</p>}
                {rows?.map(({ quote: q, total, paid, createdBy }) => (
                    <div key={q.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.03] p-4">
                        <div className="min-w-[14rem] flex-1">
                            <p className="font-semibold">{q.customer.name} <span className="font-mono text-xs text-white/45 ml-1">{q.id}</span></p>
                            <p className="text-sm text-white/60">{q.ride.title} · {q.ride.ghat} · {longDate(q.ride.date)}, {q.ride.startTime}{q.ride.guests ? ` · ${q.ride.guests} passenger${q.ride.guests === 1 ? "" : "s"}` : ""}</p>
                        </div>
                        <p className="font-display text-2xl text-marigold tabular-nums">{rupees(total)}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paid ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/70"}`}>{paid ? "Paid" : "Awaiting payment"}</span>
                        <Actions q={q} total={total} compact />
                        {createdBy && <button onClick={() => remove(q.id)} aria-label={`Delete ${q.id}`} className="h-9 w-9 inline-flex items-center justify-center rounded-full text-white/50 hover:bg-ember/20 hover:text-ember"><Trash2 size={16} /></button>}
                    </div>
                ))}
                {rows && !rows.length && !error && <p className="text-white/50">No quotations yet.</p>}
            </div>
        </div>
    );
}

function Actions({ q, total, compact }: { q: Quote; total: number; compact?: boolean }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => { await navigator.clipboard.writeText(quoteUrl(q.id)); setCopied(true); setTimeout(() => setCopied(false), 1500); };
    const wa = () => {
        const msg = `Namaste ${q.customer.name.split(" ")[0]} ji 🙏\n\nHere is your KashiGo quotation for the ${q.ride.title} on ${longDate(q.ride.date)} (reach ${q.ride.ghat} by ${q.ride.reportTime}).\n\nTotal: ${rupees(total)}\nView & pay securely (UPI / card): ${quoteUrl(q.id)}\n\nPlease don't pay any cash at the ghat. — Team KashiGo`;
        const phone = (q.customer.phone || "").replace(/\D/g, "");
        const to = phone.length === 10 ? `91${phone}` : phone;
        window.open(`https://wa.me/${to}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
    };
    const btn = compact
        ? "h-9 px-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 text-sm text-white/80 hover:bg-white hover:text-night"
        : "h-11 px-5 inline-flex items-center gap-2 rounded-full border border-white/20 font-medium hover:bg-white hover:text-night";
    return (
        <div className="flex flex-wrap gap-2">
            <a href={`/quote/${q.id}`} target="_blank" rel="noopener" className={btn}><ExternalLink size={15} /> Open page</a>
            <a href={pdfUrl(q.id)} target="_blank" rel="noopener" className={btn}><Download size={15} /> PDF</a>
            <button onClick={copy} className={btn}>{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied" : "Copy link"}</button>
            <button onClick={wa} className={btn}><MessageCircle size={15} /> WhatsApp</button>
        </div>
    );
}

function Made({ q, onClose }: { q: Quote; onClose: () => void }) {
    const total = q.lines.reduce((s, l) => s + l.amountInr, 0);
    return (
        <div className="mt-6 rounded-3xl border border-emerald-400/40 bg-emerald-500/10 p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="flex items-center gap-2 text-emerald-300 font-semibold"><Check size={18} /> Quotation {q.id} is ready</p>
                    <p className="mt-1 font-display text-3xl">{q.customer.name} · {rupees(total)}</p>
                    <p className="mt-1 text-sm text-white/65">{q.ride.title} · {q.ride.ghat} · {longDate(q.ride.date)}, {q.ride.startTime}</p>
                    <p className="mt-2 font-mono text-sm text-marigold break-all">{quoteUrl(q.id)}</p>
                </div>
                <button onClick={onClose} aria-label="Close" className="text-white/50 hover:text-white"><X /></button>
            </div>
            <div className="mt-5"><Actions q={q} total={total} /></div>
            <p className="mt-4 text-xs text-white/50">The page has the QR code and the Razorpay button for exactly {rupees(total)}. You and the customer get an email when it&apos;s paid.</p>
        </div>
    );
}

function Generator({ onClose, onCreated }: { onClose: () => void; onCreated: (q: Quote) => void }) {
    const first = QUOTE_PACKAGES[0];
    const [f, setF] = useState({
        phone: "", email: "",
        packageId: first.id, date: addDaysIso(istNow().iso, 1), start: to24(first.time), report: to24(shiftTime(first.time, -30)), ghat: first.ghat,
        price: String(first.priceInr), withReturn: true,
    });
    const [extras, setExtras] = useState<Extra[]>([]);
    // Everyone travelling; the first is the lead passenger, whose name heads the quotation.
    // The boat price covers the lead passenger; each extra adult pays the per-passenger charge. Children under 6 ride free (life jacket only).
    const [passengers, setPassengers] = useState<Person[]>([{ name: "", child: false }, { name: "", child: false }]);
    const [extraPer, setExtraPer] = useState(String(DEFAULT_EXTRA_PASSENGER_INR));
    const setCount = (n: number) => setPassengers((ps) => Array.from({ length: Math.max(1, Math.min(20, n)) }, (_, i) => ps[i] ?? { name: "", child: false }));
    const setPerson = (i: number, patch: Partial<Person>) => setPassengers((ps) => ps.map((x, j) => (j === i ? { ...x, ...patch } : x)));
    const lead = passengers[0].name.trim();
    const kids = passengers.filter((p) => p.child).length;
    // Wording that's filled in automatically until the admin edits it; null = automatic.
    const [own, setOwn] = useState<{ title: string | null; route: string | null; validUntil: string | null; intro: string | null; itinerary: { time: string; what: string }[] | null }>({ title: null, route: null, validUntil: null, intro: null, itinerary: null });
    const [note, setNote] = useState("");
    const [more, setMore] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const pkg = quotePackage(f.packageId) ?? first;
    const set = (k: keyof typeof f, v: string | boolean) => setF((x) => ({ ...x, [k]: v }));
    const pickPackage = (id: string) => {
        const p = quotePackage(id)!;
        setF((x) => ({ ...x, packageId: id, start: to24(p.time), report: to24(shiftTime(p.time, -30)), ghat: p.ghat, price: String(p.priceInr), withReturn: id !== "custom" }));
    };
    const setStart = (v: string) => setF((x) => ({ ...x, start: v, report: v ? to24(shiftTime(v, -30)) : x.report }));

    const startTime = pretty(f.start);
    const reportTime = pretty(f.report);
    const price = Math.round(Number(f.price) || 0);
    const guests = passengers.length;
    const lines = useMemo(() => [
        ...passengerLines({ pkg, ghat: f.ghat, boatPriceInr: price, withReturn: f.withReturn, extraPerPassengerInr: Math.round(Number(extraPer) || 0), people: passengers.map((p) => ({ name: p.name.trim(), child: p.child })) }),
        ...extras.filter((e) => e.label.trim() && Number(e.amount)).map((e) => ({ label: e.label.trim(), detail: "", amountInr: (e.discount ? -1 : 1) * Math.round(Math.abs(Number(e.amount))) })),
    ], [pkg, f.ghat, price, extraPer, passengers, f.withReturn, extras]);
    const total = lines.reduce((s, l) => s + l.amountInr, 0);
    const auto = {
        title: pkg.title,
        route: defaultRoute(f.ghat),
        validUntil: f.date && f.start ? defaultValidUntil(f.date, startTime) : "",
        intro: pkg.intro,
        itinerary: f.start && f.report ? defaultItinerary(pkg, f.ghat, startTime, reportTime) : [],
    };
    const val = <K extends keyof typeof auto>(k: K) => (own[k] ?? auto[k]) as (typeof auto)[K];
    const setOwnField = <K extends keyof typeof own>(k: K, v: (typeof own)[K]) => setOwn((o) => ({ ...o, [k]: v }));
    const itinerary = val("itinerary");

    const submit = async () => {
        setError(""); setBusy(true);
        const r = await apiPost("/api/admin/quotes", {
            name: lead, passengers: passengers.map((p) => ({ name: p.name.trim(), child: p.child })), phone: f.phone, email: f.email, packageId: f.packageId, date: f.date, startTime, reportTime, ghat: f.ghat, guests,
            title: val("title"), route: val("route"), validUntil: val("validUntil"), intro: val("intro"), itinerary, lines, note,
        });
        setBusy(false);
        if (!r.ok) { setError(r.data.error || "Couldn't create the quotation."); return; }
        onCreated(r.data.quote);
    };

    const extraAdults = passengers.slice(1).filter((p) => !p.child).length;
    const ready = lead.length >= 2 && f.date && f.start && f.report && f.ghat && total >= 1;

    return (
        <div className="mt-6 rounded-3xl border border-marigold/30 bg-white/[0.04] p-5 sm:p-6">
            <div className="flex items-center justify-between"><p className="font-display text-3xl">New quotation</p><button onClick={onClose} aria-label="Close" className="text-white/50 hover:text-white"><X /></button></div>

            <Step n="1" title="Passengers">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-white/60">Number of passengers</span>
                    <div className="inline-flex items-center rounded-full border border-white/15">
                        <button type="button" onClick={() => setCount(passengers.length - 1)} disabled={passengers.length <= 1} aria-label="One passenger fewer" className="h-11 w-11 text-xl text-white/75 hover:text-white disabled:opacity-30">−</button>
                        <span className="w-10 text-center text-lg font-semibold tabular-nums">{passengers.length}</span>
                        <button type="button" onClick={() => setCount(passengers.length + 1)} disabled={passengers.length >= 20} aria-label="One passenger more" className="h-11 w-11 text-xl text-white/75 hover:text-white disabled:opacity-30">+</button>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-white/60 sm:ml-4">Charge for each extra passenger ₹
                        <input value={extraPer} onChange={(e) => setExtraPer(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className="h-11 w-24 rounded-xl border border-marigold/50 bg-white/5 px-3 outline-none focus:border-marigold text-white text-base font-semibold" />
                    </label>
                </div>
                <div className="mt-4 grid gap-3">
                    {passengers.map((p, i) => (
                        <div key={i} className="grid gap-2 items-end grid-cols-[1fr_auto_6.5rem]">
                            <label className="text-sm">
                                <span className={i === 0 ? "text-marigold font-semibold" : "text-white/60"}>{i === 0 ? "Lead passenger * — name on top of the quotation" : `Passenger ${i + 1}`}</span>
                                <input value={p.name} onChange={(e) => setPerson(i, { name: e.target.value })} placeholder={i === 0 ? "KrishnaKant Joshi" : "Full name"}
                                    className={`${field} mt-1 ${i === 0 ? "border-marigold/50" : ""}`} />
                            </label>
                            {i === 0 ? <span className="h-11 w-[7.5rem]" /> : (
                                <button type="button" onClick={() => setPerson(i, { child: !p.child })} aria-pressed={p.child}
                                    className={`h-11 w-[7.5rem] rounded-xl border text-sm ${p.child ? "border-ganga bg-ganga/20 text-white" : "border-white/15 text-white/60 hover:text-white"}`}>
                                    {p.child ? "✓ Under 6" : "Child under 6?"}
                                </button>
                            )}
                            <p className={`h-11 flex flex-col justify-center text-xs leading-tight ${p.child ? "text-ganga" : "text-white/55"}`}>
                                {i === 0 ? <>In the<br />boat price</> : p.child ? <>Free ride<br />+ ₹{CHILD_JACKET_INR} jacket</> : <>+ {rupees(Math.round(Number(extraPer) || 0))}</>}
                            </p>
                        </div>
                    ))}
                </div>
                <p className="mt-3 text-xs text-white/50">The boat price covers the lead passenger. Each extra adult adds {rupees(Math.round(Number(extraPer) || 0))} (life jacket included); children under 6 ride free and pay only the ₹{CHILD_JACKET_INR} life jacket.{extraAdults || kids ? ` This quote: ${extraAdults} extra adult${extraAdults === 1 ? "" : "s"}, ${kids} child${kids === 1 ? "" : "ren"}.` : ""}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm"><span className="text-white/60">Lead passenger&apos;s WhatsApp / phone</span><input value={f.phone} onChange={(e) => set("phone", e.target.value)} inputMode="tel" placeholder="98765 43210" className={`${field} mt-1`} /></label>
                    <label className="text-sm"><span className="text-white/60">Email (gets the payment confirmation)</span><input value={f.email} onChange={(e) => set("email", e.target.value)} inputMode="email" placeholder="optional" className={`${field} mt-1`} /></label>
                </div>
            </Step>

            <Step n="2" title="Ride">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {QUOTE_PACKAGES.map((p) => (
                        <button key={p.id} type="button" onClick={() => pickPackage(p.id)}
                            className={`rounded-2xl border p-3 text-left transition-colors ${f.packageId === p.id ? "border-marigold bg-marigold/15" : "border-white/15 hover:border-white/40"}`}>
                            <p className="font-semibold text-sm leading-snug">{p.title}</p>
                            <p className="text-xs text-white/55 mt-1">{p.time} · {rupees(p.priceInr)}{p.id === "custom" ? "" : " + return"}</p>
                        </button>
                    ))}
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="text-sm"><span className="text-white/60">Date *</span><input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} className={`${field} mt-1 [color-scheme:dark]`} /></label>
                    <label className="text-sm"><span className="text-white/60">{pkg.startLabel} *</span><input type="time" value={f.start} onChange={(e) => setStart(e.target.value)} className={`${field} mt-1 [color-scheme:dark]`} /></label>
                    <label className="text-sm"><span className="text-white/60">Reach the ghat by *</span><input type="time" value={f.report} onChange={(e) => set("report", e.target.value)} className={`${field} mt-1 [color-scheme:dark]`} /></label>
                    <label className="text-sm"><span className="text-white/60">Meeting ghat *</span>
                        <select value={GHATS.includes(f.ghat) ? f.ghat : "__other"} onChange={(e) => set("ghat", e.target.value === "__other" ? "" : e.target.value)} className={`${field} mt-1`}>
                            {GHATS.map((g) => <option key={g} value={g} className="text-night">{g}</option>)}
                            <option value="__other" className="text-night">Other…</option>
                        </select>
                        {!GHATS.includes(f.ghat) && <input value={f.ghat} onChange={(e) => set("ghat", e.target.value)} placeholder="Ghat name" className={`${field} mt-2`} />}
                    </label>
                </div>
            </Step>

            <Step n="3" title="Price">
                <div className="grid gap-4 items-end sm:grid-cols-[14rem_1fr]">
                    <label className="text-sm"><span className="text-white/60">Boat price — 1 passenger (₹)</span><input value={f.price} onChange={(e) => set("price", e.target.value.replace(/\D/g, ""))} inputMode="numeric" className={`${field} mt-1 text-lg font-semibold`} /></label>
                    <label className="inline-flex items-center gap-3 text-sm cursor-pointer h-11">
                        <input type="checkbox" checked={f.withReturn} onChange={(e) => set("withReturn", e.target.checked)} className="h-5 w-5 accent-marigold" />
                        Add the return journey (50% of the boat price, total rounded up to ₹100)
                    </label>
                </div>
                {extras.map((x, i) => (
                    <div key={i} className="mt-3 grid gap-2 grid-cols-[1fr_8rem_auto_auto] items-center">
                        <input value={x.label} onChange={(e) => setExtras((xs) => xs.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)))} placeholder={x.discount ? "Discount — e.g. Returning guest" : "Extra — e.g. Flowers & diyas"} className={field} />
                        <input value={x.amount} onChange={(e) => setExtras((xs) => xs.map((y, j) => (j === i ? { ...y, amount: e.target.value.replace(/\D/g, "") } : y)))} inputMode="numeric" placeholder="₹" className={field} />
                        <span className={`text-xs font-semibold ${x.discount ? "text-emerald-300" : "text-white/60"}`}>{x.discount ? "off" : "extra"}</span>
                        <button onClick={() => setExtras((xs) => xs.filter((_, j) => j !== i))} aria-label="Remove line" className="h-9 w-9 inline-flex items-center justify-center rounded-full text-white/50 hover:text-ember"><X size={16} /></button>
                    </div>
                ))}
                <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setExtras((xs) => [...xs, { label: "", amount: "", discount: false }])} className="h-9 px-4 rounded-full border border-white/20 text-sm text-white/75 hover:text-white">+ Extra charge</button>
                    <button type="button" onClick={() => setExtras((xs) => [...xs, { label: "Discount", amount: "", discount: true }])} className="h-9 px-4 rounded-full border border-white/20 text-sm text-white/75 hover:text-white">+ Discount</button>
                </div>
                <div className="mt-5 rounded-2xl bg-night/60 border border-white/10 divide-y divide-white/10">
                    {lines.map((l, i) => (
                        <div key={i} className="flex justify-between gap-4 px-4 py-3 text-sm">
                            <span><span className="font-medium">{l.label}</span>{l.detail && <span className="block text-white/45 text-xs">{l.detail}</span>}</span>
                            <span className={`tabular-nums ${l.amountInr < 0 ? "text-emerald-300" : ""}`}>{rupees(l.amountInr)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between items-center px-4 py-4">
                        <span className="text-xs uppercase tracking-[0.2em] text-white/55 font-semibold">Total the customer pays</span>
                        <span className="font-display text-4xl text-marigold tabular-nums">{rupees(total)}</span>
                    </div>
                </div>
            </Step>

            <button type="button" onClick={() => setMore((m) => !m)} className="mt-6 block text-sm text-white/65 hover:text-white underline underline-offset-4">
                {more ? "Hide wording" : "Change the wording (title, timeline, message) — optional"}
            </button>
            {more && (
                <div className="mt-4 grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Auto label="Title on the quotation" value={val("title")} edited={own.title !== null} onChange={(v) => setOwnField("title", v)} onReset={() => setOwnField("title", null)} />
                        <Auto label="Route" value={val("route")} edited={own.route !== null} onChange={(v) => setOwnField("route", v)} onReset={() => setOwnField("route", null)} />
                        <Auto label="Valid until" value={val("validUntil")} edited={own.validUntil !== null} onChange={(v) => setOwnField("validUntil", v)} onReset={() => setOwnField("validUntil", null)} />
                    </div>
                    <Auto label="Opening line (after “Namaste … ji, thank you for choosing KashiGo.”)" value={val("intro")} edited={own.intro !== null} onChange={(v) => setOwnField("intro", v)} onReset={() => setOwnField("intro", null)} area />
                    <div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-white/60">Timeline</span>
                            {own.itinerary && <button onClick={() => setOwnField("itinerary", null)} className="inline-flex items-center gap-1 text-white/55 hover:text-white"><RotateCcw size={13} /> Back to automatic</button>}
                        </div>
                        <div className="mt-2 grid gap-2">
                            {itinerary.map((s, i) => (
                                <div key={i} className="grid grid-cols-[8.5rem_1fr_auto] gap-2">
                                    <input value={s.time} onChange={(e) => setOwnField("itinerary", itinerary.map((y, j) => (j === i ? { ...y, time: e.target.value } : y)))} className={field} />
                                    <input value={s.what} onChange={(e) => setOwnField("itinerary", itinerary.map((y, j) => (j === i ? { ...y, what: e.target.value } : y)))} className={field} />
                                    <button onClick={() => setOwnField("itinerary", itinerary.filter((_, j) => j !== i))} aria-label="Remove step" className="h-11 w-9 inline-flex items-center justify-center text-white/50 hover:text-ember"><X size={16} /></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => setOwnField("itinerary", [...itinerary, { time: "", what: "" }])} className="justify-self-start h-9 px-4 rounded-full border border-white/20 text-sm text-white/75 hover:text-white">+ Add step</button>
                        </div>
                    </div>
                    <label className="text-sm"><span className="text-white/60">Note to the customer (optional — shown in a highlighted box)</span>
                        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 p-3 outline-none focus:border-marigold" />
                    </label>
                </div>
            )}

            {error && <p className="mt-4 text-sm text-ember">{error}</p>}
            <button onClick={submit} disabled={busy || !ready} className="mt-6 h-14 w-full sm:w-auto px-10 rounded-full bg-gradient-to-r from-marigold via-fire to-ember text-night font-semibold text-lg disabled:opacity-40 inline-flex items-center justify-center gap-2">
                {busy && <Loader2 className="animate-spin" size={18} />}
                {busy ? "Creating…" : `Create quotation — ${rupees(total)}`}
            </button>
        </div>
    );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
    return (
        <section className="mt-6">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/70"><span className="font-display italic normal-case tracking-normal text-marigold text-xl">{n}</span>{title}</p>
            <div className="mt-3">{children}</div>
        </section>
    );
}

function Auto({ label, value, edited, onChange, onReset, area }: { label: string; value: string; edited: boolean; onChange: (v: string) => void; onReset: () => void; area?: boolean }) {
    return (
        <label className="text-sm">
            <span className="flex items-center justify-between gap-2 text-white/60">
                {label}
                {edited && <button type="button" onClick={onReset} className="inline-flex items-center gap-1 text-white/55 hover:text-white"><RotateCcw size={12} /> auto</button>}
            </span>
            {area
                ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 p-3 outline-none focus:border-marigold" />
                : <input value={value} onChange={(e) => onChange(e.target.value)} className={`${field} mt-1`} />}
        </label>
    );
}

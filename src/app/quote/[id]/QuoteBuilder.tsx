"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, LifeBuoy, Minus, Plus, Tag, Trash2, UserPlus, X } from "lucide-react";
import { CHILD_FREE_UNDER, CHILD_JACKET_INR, cleanSelection, priceQuote, quoteSplit, startSelection, type Quote, type QuoteSelection } from "@/lib/quotes";
import QuotePay from "./QuotePay";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

type Props = { quote: Pick<Quote, "id" | "lines" | "builder" | "customer" | "inclusions" | "payment">; paid: { amountInr: number; choices: string; dueInr?: number } | null; readOnly: boolean };

// Checkout for quotes the customer can shape, in the order they decide: who's coming, extras, coupon, bill, pay.
export default function QuoteBuilder({ quote, paid, readOnly }: Props) {
    const b = quote.builder!;
    const [sel, setSel] = useState<QuoteSelection>(() => startSelection(quote));
    const clean = useMemo(() => cleanSelection(quote, sel), [quote, sel]);
    const { lines, total } = priceQuote(quote, clean);
    // 50%-advance quotes: half online now, the rest to the boatman at the ghat.
    const split = quoteSplit(quote, total);
    const missingName = sel.passengers.some((p) => !p.name.trim());
    const locked = readOnly || Boolean(paid);
    const [code, setCode] = useState("");
    const [codeMsg, setCodeMsg] = useState("");
    const [payInView, setPayInView] = useState(false);
    useEffect(() => {
        const el = document.getElementById("quote-pay");
        if (!el) return;
        const io = new IntersectionObserver(([e]) => setPayInView(e.isIntersecting));
        io.observe(el);
        return () => io.disconnect();
    }, []);
    const freebies = [b.kidsUnder6 ? "Life jackets for adults" : `Life jackets × ${1 + sel.passengers.length}`, ...(quote.inclusions ?? []).map((f) => f.label)];

    const applyCode = () => {
        const c = code.trim().toUpperCase();
        const hit = b.coupons?.find((x) => x.code === c);
        setSel((s) => ({ ...s, coupon: hit ? hit.code : "" }));
        setCodeMsg(!c ? "" : hit ? `${hit.percentOff}% off applied` : "That code isn't valid.");
    };
    const removeCode = () => { setSel((s) => ({ ...s, coupon: "" })); setCode(""); setCodeMsg(""); };
    const setPassenger = (i: number, key: "name" | "age", v: string) =>
        setSel((s) => ({ ...s, passengers: s.passengers.map((p, j) => (j === i ? { ...p, [key]: key === "age" ? v.replace(/\D/g, "").slice(0, 3) : v.slice(0, 60) } : p)) }));
    const bump = (id: string, d: number, max: number) =>
        setSel((s) => ({ ...s, addOns: { ...s.addOns, [id]: Math.max(0, Math.min(max, (s.addOns[id] ?? 0) + d)) } }));
    const toggle = (on: boolean) => `h-5 w-5 rounded-md grid place-items-center shrink-0 border-2 ${on ? "bg-fire border-fire text-white" : "border-night/25 bg-white"}`;

    if (paid) {
        return (
            <Card title="Your booking">
                <p className="text-sm font-semibold">{quote.lines[0]?.label}</p>
                {paid.choices && <p className="text-xs text-night/60 mt-1">{paid.choices}</p>}
                <div className="mt-3 flex items-center justify-between border-t border-sandstone/40 pt-3">
                    <span className="text-sm font-bold">{paid.dueInr ? "Advance paid (50%)" : "Total paid"}</span>
                    <span className="font-heading font-extrabold text-xl text-emerald-700 tabular-nums">{inr(paid.amountInr)}</span>
                </div>
                {paid.dueInr ? (
                    <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-sm font-bold">Due at the ghat <span className="font-normal text-xs text-night/50">to your boatman</span></span>
                        <span className="font-heading font-extrabold text-xl tabular-nums">{inr(paid.dueInr)}</span>
                    </div>
                ) : null}
                <div className="mt-3"><QuotePay id={quote.id} name={quote.customer.name} total={inr(paid.amountInr)} paid due={paid.dueInr ? inr(paid.dueInr) : undefined} /></div>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {!locked && (
                <>
                    {/* Passengers */}
                    <Card title={`Passengers · ${1 + sel.passengers.length}`} aside={`+${inr(b.perPassengerInr)} each extra${b.kidsUnder6 ? ` · under ${CHILD_FREE_UNDER}: ${inr(CHILD_JACKET_INR)}` : ""}`}>
                        <ol className="space-y-2">
                            <li className="flex items-center gap-2.5 h-10">
                                <Num n={1} />
                                <span className="flex-1 truncate text-sm font-semibold">{quote.customer.name}</span>
                                <span className="text-[11px] font-semibold text-night/50">Included</span>
                            </li>
                            {sel.passengers.map((p, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    <Num n={i + 2} />
                                    <input
                                        value={p.name}
                                        onChange={(e) => setPassenger(i, "name", e.target.value)}
                                        placeholder="Full name"
                                        aria-label={`Passenger ${i + 2} name`}
                                        autoFocus={i === sel.passengers.length - 1}
                                        className={`flex-1 min-w-0 h-10 rounded-lg bg-white px-3 text-base ring-1 outline-none focus:ring-2 focus:ring-fire ${p.name.trim() ? "ring-sandstone/60" : "ring-red-300"}`}
                                    />
                                    <input
                                        value={p.age}
                                        onChange={(e) => setPassenger(i, "age", e.target.value)}
                                        placeholder="Age"
                                        inputMode="numeric"
                                        aria-label={`Passenger ${i + 2} age`}
                                        className="w-14 h-10 rounded-lg bg-white px-2 text-base text-center ring-1 ring-sandstone/60 outline-none focus:ring-2 focus:ring-fire"
                                    />
                                    <button
                                        onClick={() => setSel((s) => ({ ...s, passengers: s.passengers.filter((_, j) => j !== i) }))}
                                        aria-label={`Remove passenger ${i + 2}`}
                                        className="h-10 w-8 grid place-items-center rounded-lg text-night/35 hover:text-red-600"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </li>
                            ))}
                        </ol>
                        {sel.passengers.length < b.maxPassengers && (
                            <button
                                onClick={() => setSel((s) => ({ ...s, passengers: [...s.passengers, { name: "", age: "" }] }))}
                                className="mt-2 w-full h-10 rounded-lg border border-dashed border-fire/50 text-fire text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-fire/5"
                            >
                                <UserPlus size={16} /> Add passenger
                            </button>
                        )}
                        {b.kidsUnder6 && <p className="mt-2 text-[11px] text-night/55">Children under {CHILD_FREE_UNDER} ride free — enter their age and only the {inr(CHILD_JACKET_INR)} life jacket is charged.</p>}
                    </Card>

                    {/* Extras */}
                    <Card title="Extras">
                        <ul className="divide-y divide-sandstone/40">
                            {b.returnTrip && (
                                <li>
                                    <label className="flex items-center gap-3 py-2.5 cursor-pointer">
                                        <input type="checkbox" className="sr-only" checked={sel.returnTrip} onChange={(e) => setSel((s) => ({ ...s, returnTrip: e.target.checked }))} />
                                        <span className={toggle(sel.returnTrip)}>{sel.returnTrip && <Check size={13} strokeWidth={3} />}</span>
                                        <span className="flex-1 min-w-0">
                                            <span className="block text-sm font-semibold">{b.returnTrip.label}</span>
                                            <span className="block text-xs text-night/55">{b.returnTrip.detail}</span>
                                        </span>
                                        <span className="text-sm font-bold tabular-nums">+{inr(b.returnTrip.amountInr)}</span>
                                    </label>
                                </li>
                            )}
                            {b.addOns.map((a) => {
                                const n = sel.addOns[a.id] ?? 0;
                                if (a.perPerson) {
                                    const on = n > 0;
                                    return (
                                        <li key={a.id}>
                                            <label className="flex items-center gap-3 py-2.5 cursor-pointer">
                                                <input type="checkbox" className="sr-only" checked={on} onChange={(e) => setSel((s) => ({ ...s, addOns: { ...s.addOns, [a.id]: e.target.checked ? 1 : 0 } }))} />
                                                <span className={toggle(on)}>{on && <Check size={13} strokeWidth={3} />}</span>
                                                <span className="flex-1 min-w-0">
                                                    <span className="block text-sm font-semibold">{a.label}</span>
                                                    <span className="block text-xs text-night/55">{a.detail}</span>
                                                </span>
                                                <span className="text-sm font-bold tabular-nums whitespace-nowrap">+{inr(a.amountInr)}/person</span>
                                            </label>
                                        </li>
                                    );
                                }
                                return (
                                    <li key={a.id} className="flex items-center gap-3 py-2.5">
                                        <span className="flex-1 min-w-0">
                                            <span className="block text-sm font-semibold">{a.label} <span className="font-normal text-night/55">· {inr(a.amountInr)}</span></span>
                                            <span className="block text-xs text-night/55">{a.detail}</span>
                                        </span>
                                        <span className="flex items-center rounded-full bg-white ring-1 ring-sandstone/60">
                                            <button onClick={() => bump(a.id, -1, a.max)} disabled={n === 0} aria-label={`Fewer ${a.label}`} className="h-8 w-8 grid place-items-center text-night/60 disabled:opacity-30"><Minus size={14} /></button>
                                            <span className="w-5 text-center text-sm font-bold tabular-nums">{n}</span>
                                            <button onClick={() => bump(a.id, 1, a.max)} disabled={n >= a.max} aria-label={`More ${a.label}`} className="h-8 w-8 grid place-items-center text-fire disabled:opacity-30"><Plus size={14} /></button>
                                        </span>
                                    </li>
                                );
                            })}
                            <li className="flex items-center gap-3 py-2.5">
                                <span className="h-5 w-5 rounded-md grid place-items-center shrink-0 bg-ganga text-white"><LifeBuoy size={13} /></span>
                                <span className="flex-1 text-sm font-semibold">{freebies.join(" · ")}</span>
                                <span className="text-xs font-extrabold text-ganga tracking-wider">FREE</span>
                            </li>
                        </ul>
                    </Card>

                    {/* Coupon */}
                    {b.coupons && b.coupons.length > 0 && (
                        <Card title="Coupon code">
                            {clean.coupon ? (
                                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 ring-1 ring-emerald-200 px-3 h-10">
                                    <Tag size={15} className="text-emerald-700" />
                                    <span className="flex-1 text-sm font-bold text-emerald-800">{clean.coupon} · {codeMsg || "applied"}</span>
                                    <button onClick={removeCode} aria-label="Remove coupon" className="text-emerald-800/60 hover:text-red-600"><X size={16} /></button>
                                </div>
                            ) : (
                                <form onSubmit={(e) => { e.preventDefault(); applyCode(); }} className="flex gap-2">
                                    <input
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 30))}
                                        placeholder="Enter code"
                                        aria-label="Coupon code"
                                        className="flex-1 min-w-0 h-10 rounded-lg bg-white px-3 text-base ring-1 ring-sandstone/60 outline-none focus:ring-2 focus:ring-fire uppercase tracking-wider font-semibold"
                                    />
                                    <button type="submit" className="h-10 px-4 rounded-lg bg-night text-white text-sm font-bold hover:bg-fire transition-colors">Apply</button>
                                </form>
                            )}
                            {codeMsg && !clean.coupon && <p className="mt-1.5 text-xs font-semibold text-red-600">{codeMsg}</p>}
                        </Card>
                    )}
                </>
            )}

            {/* Bill */}
            <Card title="Bill">
                <ul className="space-y-1.5 text-sm">
                    {lines.map((l, i) => (
                        <li key={`${l.label}-${i}`} className="flex items-baseline justify-between gap-3">
                            <span className={l.label === "Taxes" ? "text-night/60" : ""}>{l.label}</span>
                            <span className={`tabular-nums font-semibold whitespace-nowrap ${l.amountInr < 0 ? "text-emerald-700" : ""}`}>{l.amountInr < 0 ? `− ${inr(-l.amountInr)}` : inr(l.amountInr)}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-3 flex items-center justify-between border-t border-sandstone/50 pt-3">
                    <span className="font-bold">Total <span className="font-normal text-xs text-night/50">incl. taxes</span></span>
                    <span className={`font-heading font-extrabold text-2xl tabular-nums ${split.atGhat ? "text-night" : "text-fire"}`}>{inr(total)}</span>
                </div>
                {split.atGhat > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-marigold/20 px-3 py-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-fire">Pay online now · 50%</p>
                            <p className="font-heading font-extrabold text-lg tabular-nums">{inr(split.online)}</p>
                        </div>
                        <div className="rounded-lg bg-parchment px-3 py-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-night/55">Due at the ghat</p>
                            <p className="font-heading font-extrabold text-lg tabular-nums">{inr(split.atGhat)}</p>
                            <p className="text-[10px] text-night/50">To your boatman · cash/UPI</p>
                        </div>
                    </div>
                )}
            </Card>

            {!readOnly && (
                <>
                    <div id="quote-pay">
                        <QuotePay
                            id={quote.id}
                            name={quote.customer.name}
                            total={inr(split.online)}
                            paid={false}
                            selection={clean}
                            due={split.atGhat ? inr(split.atGhat) : undefined}
                            blocked={missingName ? "Enter a name for every passenger you added (or remove the empty row)." : undefined}
                        />
                    </div>
                    {/* Phones: the total and a jump to Pay stay on screen while choosing. */}
                    <div className="sm:hidden h-16" aria-hidden />
                    <div className={`sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-sandstone/50 px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] flex items-center gap-3 print:hidden transition-transform duration-300 ${payInView ? "translate-y-full" : ""}`}>
                        <div className="flex-1">
                            <p className="text-[11px] text-night/50 leading-none">{split.atGhat ? "Pay now (50%)" : "Total"} · {1 + clean.passengers.filter((p) => p.name).length} pax</p>
                            <p className="font-heading font-extrabold text-xl text-night tabular-nums leading-tight">{inr(split.online)}</p>
                        </div>
                        <button
                            onClick={() => document.getElementById("quote-pay")?.scrollIntoView({ behavior: "smooth", block: "center" })}
                            className="h-11 px-6 rounded-full bg-gradient-to-r from-fire to-marigold text-night text-sm font-extrabold"
                        >
                            Review &amp; pay
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

function Card({ title, aside, children }: { title: string; aside?: string; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl bg-white ring-1 ring-sandstone/50 p-4">
            <div className="flex items-baseline justify-between gap-3 mb-2.5">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-night/55">{title}</h3>
                {aside && <span className="text-[11px] text-night/45">{aside}</span>}
            </div>
            {children}
        </section>
    );
}

function Num({ n }: { n: number }) {
    return <span className="h-6 w-6 rounded-full bg-marigold/25 text-fire grid place-items-center text-[11px] font-bold shrink-0">{n}</span>;
}

"use client";

import { Fragment, useMemo, useState } from "react";
import { Check, LifeBuoy, Minus, Plus, Sparkles, Trash2, UserPlus, Users } from "lucide-react";
import { cleanSelection, emptySelection, priceQuote, type Quote, type QuoteSelection } from "@/lib/quotes";
import QuotePay from "./QuotePay";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

type Props = { quote: Pick<Quote, "id" | "lines" | "builder" | "customer">; paid: { amountInr: number; choices: string } | null; readOnly: boolean };

// The quotation table for quotes the customer can shape: return trip, extra passengers and add-ons, then tax and total.
export default function QuoteBuilder({ quote, paid, readOnly }: Props) {
    const b = quote.builder!;
    const [sel, setSel] = useState<QuoteSelection>(emptySelection);
    const clean = useMemo(() => cleanSelection(quote, sel), [quote, sel]);
    const { lines, total } = priceQuote(quote, clean);
    const missingName = sel.passengers.some((p) => !p.name.trim());
    const locked = readOnly || Boolean(paid);

    const setPassenger = (i: number, key: "name" | "age", v: string) =>
        setSel((s) => ({ ...s, passengers: s.passengers.map((p, j) => (j === i ? { ...p, [key]: key === "age" ? v.replace(/\D/g, "").slice(0, 3) : v.slice(0, 60) } : p)) }));
    const bump = (id: string, d: number, max: number) =>
        setSel((s) => ({ ...s, addOns: { ...s.addOns, [id]: Math.max(0, Math.min(max, (s.addOns[id] ?? 0) + d)) } }));

    return (
        <div className="space-y-6">
            {!locked && (
                <div className="grid gap-4">
                    {/* Return trip */}
                    {b.returnTrip && (
                        <label className={`flex items-center gap-4 rounded-2xl p-5 cursor-pointer ring-1 transition-colors ${sel.returnTrip ? "bg-marigold/15 ring-marigold/60" : "bg-white/70 ring-sandstone/40 hover:ring-marigold/50"}`}>
                            <input type="checkbox" className="sr-only" checked={sel.returnTrip} onChange={(e) => setSel((s) => ({ ...s, returnTrip: e.target.checked }))} />
                            <span className={`h-6 w-6 rounded-md grid place-items-center shrink-0 border-2 ${sel.returnTrip ? "bg-fire border-fire text-white" : "border-night/30 bg-white"}`}>
                                {sel.returnTrip && <Check size={16} strokeWidth={3} />}
                            </span>
                            <span className="flex-1">
                                <span className="block font-heading font-bold">Add {b.returnTrip.label.charAt(0).toLowerCase() + b.returnTrip.label.slice(1)}</span>
                                <span className="block text-sm text-night/60">{b.returnTrip.detail} · optional</span>
                            </span>
                            <span className="font-heading font-bold tabular-nums">+ {inr(b.returnTrip.amountInr)}</span>
                        </label>
                    )}

                    {/* Passengers */}
                    <div className="rounded-2xl bg-white/70 ring-1 ring-sandstone/40 p-5">
                        <div className="flex items-center justify-between gap-3">
                            <p className="flex items-center gap-2 font-heading font-bold"><Users className="text-fire" size={20} /> Passengers</p>
                            <p className="text-sm text-night/55">{inr(b.perPassengerInr)} per additional passenger</p>
                        </div>
                        <ol className="mt-4 space-y-3">
                            <li className="flex items-center gap-3 rounded-xl bg-parchment px-4 py-3">
                                <span className="h-7 w-7 rounded-full bg-marigold/25 text-fire grid place-items-center text-xs font-bold shrink-0">1</span>
                                <span className="font-heading font-bold flex-1">{quote.customer.name}</span>
                                <span className="rounded-full bg-fire/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-fire">Lead · included</span>
                            </li>
                            {sel.passengers.map((p, i) => (
                                <li key={i} className="flex flex-wrap sm:flex-nowrap items-center gap-3 rounded-xl bg-parchment px-4 py-3">
                                    <span className="h-7 w-7 rounded-full bg-marigold/25 text-fire grid place-items-center text-xs font-bold shrink-0">{i + 2}</span>
                                    <input
                                        value={p.name}
                                        onChange={(e) => setPassenger(i, "name", e.target.value)}
                                        placeholder="Full name"
                                        aria-label={`Passenger ${i + 2} name`}
                                        autoFocus={i === sel.passengers.length - 1}
                                        className={`flex-1 min-w-0 h-11 rounded-lg bg-white px-3 ring-1 outline-none focus:ring-2 focus:ring-fire ${p.name.trim() ? "ring-sandstone/50" : "ring-red-300"}`}
                                    />
                                    <input
                                        value={p.age}
                                        onChange={(e) => setPassenger(i, "age", e.target.value)}
                                        placeholder="Age"
                                        inputMode="numeric"
                                        aria-label={`Passenger ${i + 2} age`}
                                        className="w-20 h-11 rounded-lg bg-white px-3 ring-1 ring-sandstone/50 outline-none focus:ring-2 focus:ring-fire"
                                    />
                                    <span className="font-heading font-bold tabular-nums text-sm w-14 text-right">{inr(b.perPassengerInr)}</span>
                                    <button
                                        onClick={() => setSel((s) => ({ ...s, passengers: s.passengers.filter((_, j) => j !== i) }))}
                                        aria-label={`Remove passenger ${i + 2}`}
                                        className="h-9 w-9 grid place-items-center rounded-lg text-night/40 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={17} />
                                    </button>
                                </li>
                            ))}
                        </ol>
                        {sel.passengers.length < b.maxPassengers && (
                            <button
                                onClick={() => setSel((s) => ({ ...s, passengers: [...s.passengers, { name: "", age: "" }] }))}
                                className="mt-3 w-full h-12 rounded-xl border-2 border-dashed border-fire/40 text-fire font-heading font-bold flex items-center justify-center gap-2 hover:bg-fire/5 hover:border-fire transition-colors"
                            >
                                <UserPlus size={18} /> Add passenger <span className="font-normal text-night/50">+{inr(b.perPassengerInr)}</span>
                            </button>
                        )}
                    </div>

                    {/* Add-ons */}
                    {(
                        <div className="rounded-2xl bg-white/70 ring-1 ring-sandstone/40 p-5">
                            <p className="flex items-center gap-2 font-heading font-bold"><Sparkles className="text-fire" size={20} /> Add-ons</p>
                            <ul className="mt-4 space-y-3">
                                <li className="flex items-center gap-4 rounded-xl bg-ganga/10 ring-1 ring-ganga/30 px-4 py-3">
                                    <span className="h-10 w-10 rounded-xl bg-ganga text-white grid place-items-center shrink-0"><LifeBuoy size={20} /></span>
                                    <div className="flex-1">
                                        <p className="font-heading font-bold">Life jackets for every passenger</p>
                                        <p className="text-sm text-night/60">On us — included free with your ride</p>
                                    </div>
                                    <span className="rounded-full bg-ganga px-3 py-1 text-xs font-extrabold tracking-[0.15em] text-white">FREE</span>
                                </li>
                                {b.addOns.map((a) => {
                                    const n = sel.addOns[a.id] ?? 0;
                                    return (
                                        <li key={a.id} className="flex items-center gap-4 rounded-xl bg-parchment px-4 py-3">
                                            <div className="flex-1">
                                                <p className="font-heading font-bold">{a.label} <span className="font-normal text-night/55">· {inr(a.amountInr)}</span></p>
                                                <p className="text-sm text-night/60">{a.detail}</p>
                                            </div>
                                            <div className="flex items-center rounded-full bg-white ring-1 ring-sandstone/50">
                                                <button onClick={() => bump(a.id, -1, a.max)} disabled={n === 0} aria-label={`Fewer ${a.label}`} className="h-10 w-10 grid place-items-center rounded-full text-night/60 hover:text-fire disabled:opacity-30"><Minus size={16} /></button>
                                                <span className="w-6 text-center font-heading font-bold tabular-nums">{n}</span>
                                                <button onClick={() => bump(a.id, 1, a.max)} disabled={n >= a.max} aria-label={`More ${a.label}`} className="h-10 w-10 grid place-items-center rounded-full text-fire hover:bg-fire/10 disabled:opacity-30"><Plus size={16} /></button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Bill */}
            {paid ? (
                <div className="rounded-2xl overflow-hidden ring-1 ring-sandstone/50 bg-white">
                    <div className="px-5 sm:px-6 py-5">
                        <p className="font-heading font-bold">{quote.lines[0]?.label}</p>
                        {paid.choices && <p className="text-sm text-night/60 mt-1">{paid.choices}</p>}
                    </div>
                    <TotalBar total={paid.amountInr} label="Total paid" />
                </div>
            ) : (
                <div className="rounded-2xl overflow-hidden ring-1 ring-sandstone/50 bg-white">
                    <table className="w-full text-left">
                        <thead className="bg-night text-white/80 text-[11px] uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-5 sm:px-6 py-3 font-bold">#</th>
                                <th className="px-2 py-3 font-bold">Description</th>
                                <th className="px-5 sm:px-6 py-3 font-bold text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lines.map((l, i) => {
                                const tax = b.taxInr > 0 && i === lines.length - 1;
                                return (
                                    <Fragment key={`${l.label}-${i}`}>
                                    {tax && <FreeJacketsRow />}
                                    <tr className={`border-t border-sandstone/30 ${tax ? "bg-parchment/60" : ""}`}>
                                        <td className="px-5 sm:px-6 py-4 align-top font-heading font-bold text-night/40">{tax ? "" : String(i + 1).padStart(2, "0")}</td>
                                        <td className="px-2 py-4">
                                            <p className={`font-heading ${tax ? "font-semibold text-night/70" : "font-bold"}`}>{l.label}</p>
                                            <p className="text-sm text-night/60">{l.detail}</p>
                                        </td>
                                        <td className="px-5 sm:px-6 py-4 text-right font-heading font-bold tabular-nums whitespace-nowrap">{inr(l.amountInr)}</td>
                                    </tr>
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                    <TotalBar total={total} label="Total payable" />
                </div>
            )}

            {!readOnly && (
                <div className="max-w-xl mx-auto">
                    <QuotePay
                        id={quote.id}
                        name={quote.customer.name}
                        total={inr(total)}
                        paid={Boolean(paid)}
                        selection={clean}
                        blocked={missingName ? "Please enter a name for every passenger you added (or remove the empty row)." : undefined}
                    />
                </div>
            )}
        </div>
    );
}

function FreeJacketsRow() {
    return (
        <tr className="border-t border-sandstone/30">
            <td className="px-5 sm:px-6 py-4 align-top text-ganga"><LifeBuoy size={18} /></td>
            <td className="px-2 py-4">
                <p className="font-heading font-bold">Life jackets for every passenger</p>
                <p className="text-sm text-night/60">Free add-on — on us</p>
            </td>
            <td className="px-5 sm:px-6 py-4 text-right font-heading font-extrabold text-ganga whitespace-nowrap">FREE</td>
        </tr>
    );
}

function TotalBar({ total, label }: { total: number; label: string }) {
    return (
        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-5 bg-gradient-to-r from-night to-night-3 text-white">
            <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-white/55 font-bold">{label}</p>
                <p className="text-xs text-white/50 mt-0.5">Including taxes · no cash at the ghat</p>
            </div>
            <p className="font-display text-4xl sm:text-5xl text-marigold tabular-nums">{inr(total)}</p>
        </div>
    );
}

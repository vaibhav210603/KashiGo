"use client";

import Link from "next/link";
import { ArrowRight, Coins, LogOut, ShieldCheck } from "lucide-react";
import EmailLogin from "@/components/auth/EmailLogin";
import { useAuth } from "@/components/auth/useAuth";
import { useAccount } from "@/components/auth/useAccount";
import { productName } from "@/lib/productNames";

const KIND_LABEL: Record<string, string> = { refund: "Refund", spend: "Spent", release: "Returned (checkout not completed)", adjust: "Adjustment" };
const date = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");

export default function AccountClient() {
    const auth = useAuth();
    const { account } = useAccount();

    return (
        <div className="bg-parchment min-h-screen">
            <section className="grain relative overflow-hidden bg-night pt-32 pb-16 text-white">
                <div aria-hidden className="flicker absolute -bottom-32 left-1/2 h-72 w-[90%] -translate-x-1/2 rounded-full bg-fire/25 blur-[100px]" />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
                    <p className="ornament text-[11px] font-semibold uppercase tracking-[0.28em] text-marigold">Your KashiGo</p>
                    {!auth.ready ? (
                        <div className="mt-6 h-40" />
                    ) : !auth.loggedIn ? (
                        <>
                            <h1 className="mt-4 font-display font-light text-5xl sm:text-6xl leading-[0.95] tracking-[-0.03em]">Your <em className="text-fire">KashiGo.</em></h1>
                            <p className="mt-4 max-w-lg text-white/65">See your KashiGo coins, your rides and your guides. Refunds come back here as coins you can spend on anything.</p>
                            <div className="mt-8 max-w-lg rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                                <EmailLogin tone="dark" title="Log in" subtitle="Continue with Google, or get a one-time code by email. No password." />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
                                <div>
                                    <p className="text-white/60">{account?.name || auth.name ? `Namaste, ${(account?.name || auth.name || "").split(" ")[0]}` : "Namaste"} · {auth.email}</p>
                                    <h1 className="mt-2 flex items-baseline gap-3 font-display font-light text-6xl sm:text-7xl tracking-[-0.03em]">
                                        <Coins className="self-center text-marigold" size={44} />
                                        <span className="text-fire">{(account?.credits ?? 0).toLocaleString("en-IN")}</span>
                                        <span className="text-2xl text-white/60">coins</span>
                                    </h1>
                                    <p className="mt-2 text-sm text-white/55">1 coin = ₹1 · spend them on any boat ride or guide at checkout.</p>
                                </div>
                                <div className="flex gap-2">
                                    {account?.admin && <Link href="/admin" className="h-11 px-5 inline-flex items-center gap-2 rounded-full border border-white/20 text-sm font-medium hover:bg-white hover:text-night"><ShieldCheck size={16} /> Admin</Link>}
                                    <button onClick={() => auth.signOut()} className="h-11 px-5 inline-flex items-center gap-2 rounded-full border border-white/20 text-sm font-medium hover:bg-white hover:text-night"><LogOut size={16} /> Log out</button>
                                </div>
                            </div>
                            <Link href="/book" className="btn-sheen mt-8 h-12 px-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-marigold via-fire to-ember text-night font-semibold">Book a boat ride <ArrowRight size={16} /></Link>
                        </>
                    )}
                </div>
            </section>

            {auth.loggedIn && (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 grid gap-12">
                    <Block title="Your rides" empty="No rides booked with this number yet." items={account?.rides ?? []}
                        render={(r) => (
                            <Row key={r.ride_id} left={<><b>{productName(r.package_id)}</b><span className="text-night/55"> · {r.ride_date ? date(r.ride_date) : ""} {r.time_of_day}</span></>}
                                sub={`${r.ride_id} · ${r.payment_status === "paid" ? "Paid" : r.payment_status === "pending" ? "Pay at the ghat" : r.payment_status === "advance" ? "50% paid · rest at the ghat" : r.payment_status}${r.credits_used ? ` · ${r.credits_used} coins used` : ""}`}
                                right={<>₹{(Math.round(Number(r.amount) || 0) + (r.credits_used || 0)).toLocaleString("en-IN")}{r.refunded_inr > 0 && <span className="block text-xs text-ganga">Refunded {r.refunded_inr} coins</span>}</>} />
                        )} />
                    <Block title="Your guides" empty="No guides bought with this number yet." items={account?.purchases ?? []}
                        render={(p) => (
                            <Row key={p.order_ref} left={<b>{productName(p.product)}</b>} sub={`${date(p.created_at)}${p.credits_used ? ` · ${p.credits_used} coins used` : ""}`}
                                right={<>₹{(p.amount_inr + p.credits_used).toLocaleString("en-IN")}{p.refunded_inr > 0 && <span className="block text-xs text-ganga">Refunded {p.refunded_inr} coins</span>}</>} />
                        )} />
                    <Block title="Coin history" empty="No coins yet — refunds land here." items={account?.ledger ?? []}
                        render={(l, i) => (
                            <Row key={i} left={<b>{KIND_LABEL[l.kind] ?? l.kind}</b>} sub={`${date(l.created_at)}${l.note ? ` · ${l.note}` : ""}${l.ref ? ` · ${l.ref}` : ""}`}
                                right={<><span className={l.delta_inr > 0 ? "text-ganga" : "text-ember"}>{l.delta_inr > 0 ? "+" : ""}{l.delta_inr.toLocaleString("en-IN")}</span><span className="block text-xs text-night/45">balance {l.balance_after.toLocaleString("en-IN")}</span></>} />
                        )} />
                </div>
            )}
        </div>
    );
}

function Block<T>({ title, empty, items, render }: { title: string; empty: string; items: T[]; render: (item: T, i: number) => React.ReactNode }) {
    return (
        <section>
            <h2 className="font-display text-3xl text-night">{title}</h2>
            <div className="mt-4 border-t border-night/15">
                {items.length ? items.map(render) : <p className="py-6 text-night/55">{empty}</p>}
            </div>
        </section>
    );
}

function Row({ left, sub, right }: { left: React.ReactNode; sub: string; right: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-night/15 py-4">
            <div className="min-w-0"><p className="text-night">{left}</p><p className="mt-0.5 text-sm text-night/55 break-words">{sub}</p></div>
            <div className="shrink-0 text-right font-display text-xl text-night">{right}</div>
        </div>
    );
}

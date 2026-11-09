"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Lock, Printer, Tag, X } from "lucide-react";
import { quoteSplit, siteCouponOff, type QuoteSelection, type SiteCoupon } from "@/lib/quotes";
import { planProblem, type PayPlan } from "@/lib/pricing";
import { goToThankYou } from "@/lib/thankYou";

// Every quotation offers two ways to pay: all online now, or 50% now and 50% at the ghat.
// `fullInr`: the total after any code applied by the page around it (QuoteBuilder's `siteCoupon`); `beforeCodeInr` without it.
// `plan` / `onPlan`: the page around it keeps the choice (QuoteBuilder); otherwise it's kept here, starting at `defaultPlan`.
// `codeBox`: fixed-price quotes — show a discount-code box here and take the code off `fullInr`.
// `paid`: shows the confirmation instead; `dueInr` is what's left to pay at the ghat on a 50/50 booking.
type Props = {
    id: string; name: string; fullInr: number; beforeCodeInr?: number; paid?: { dueInr: number } | null; selection?: QuoteSelection; blocked?: string;
    siteCoupon?: SiteCoupon | null; codeBox?: boolean; plan?: PayPlan; onPlan?: (p: PayPlan) => void; defaultPlan?: PayPlan;
};
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const loadRazorpay = () =>
    new Promise<void>((resolve, reject) => {
        if ((window as any).Razorpay) return resolve();
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Could not load Razorpay. Check your connection and try again."));
        document.body.appendChild(s);
    });

const post = (body: object) =>
    fetch("/api/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json());

export default function QuotePay({ id, name, fullInr, beforeCodeInr, paid: paidOrder, selection, blocked, siteCoupon, codeBox, plan: shownPlan, onPlan, defaultPlan = "full" }: Props) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [paymentId] = useState(paidOrder ? "received" : "");
    const [ownPlan, setOwnPlan] = useState<PayPlan>(defaultPlan);
    const plan = shownPlan ?? ownPlan;
    // Fixed-price quotes: the code box lives here.
    const [ownCoupon, setOwnCoupon] = useState<SiteCoupon | null>(null);
    const [code, setCode] = useState("");
    const [codeMsg, setCodeMsg] = useState("");
    const [codeOpen, setCodeOpen] = useState(false);
    const [checking, setChecking] = useState(false);
    const coupon = siteCoupon ?? ownCoupon;
    const off = codeBox ? siteCouponOff(fullInr, ownCoupon) : 0;
    const split = quoteSplit(plan, fullInr - off);
    const total = inr(split.online);
    const due = paidOrder ? (paidOrder.dueInr ? inr(paidOrder.dueInr) : undefined) : split.atGhat ? inr(split.atGhat) : undefined;
    // What each choice would cost, for the two buttons — without the code on the choice it doesn't work with.
    const totalFor = (p: PayPlan) => (coupon && planProblem(coupon.code, p) ? beforeCodeInr ?? fullInr : fullInr - off);
    const fullNow = totalFor("full");
    const half = quoteSplit("advance50", totalFor("advance50"));

    const check = async (c: string, p: PayPlan) => {
        setCodeMsg("");
        setChecking(true); // feedback the moment Apply is pressed, while the server checks the code
        const r = await post({ action: "coupon", id, code: c, plan: p }).catch(() => ({ success: false, message: "Couldn't check the code — try again." }));
        setChecking(false);
        if (r.success) setOwnCoupon(r.coupon);
        else { setOwnCoupon(null); setCodeOpen(true); setCodeMsg(r.message || "That code isn't valid."); }
    };
    const applyCode = () => {
        const c = code.trim().toUpperCase();
        if (c && !checking) check(c, plan);
    };
    // Switching between full and 50/50 checks the applied code again (WELCOME10 is 50/50 only, WELCOME20 full only).
    const choosePlan = (p: PayPlan) => {
        if (p === plan) return;
        if (onPlan) onPlan(p);
        else setOwnPlan(p);
        if (ownCoupon) check(ownCoupon.code, p);
    };

    const pay = async () => {
        if (blocked) return setError(blocked);
        setBusy(true);
        setError("");
        try {
            const o = await post({ action: "order", id, selection, siteCoupon: coupon?.code, plan });
            if (!o.success) throw new Error(o.message);
            await loadRazorpay();
            const rzp = new (window as any).Razorpay({
                key: o.keyId,
                order_id: o.orderId,
                amount: o.amount,
                currency: "INR",
                name: "KashiGo",
                description: `Quotation ${id}`,
                image: "https://kashigo.in/icon-192.png",
                prefill: { name },
                notes: { quote: id },
                theme: { color: "#f97316" },
                handler: async (r: any) => {
                    // Razorpay has taken the money by now: land on /thank-you even if our check fails, and say so.
                    const v = await post({ action: "verify", id, ...r }).catch(() => ({ success: false }));
                    goToThankYou({
                        title: v.success ? "Your boat is confirmed!" : "Payment received!",
                        message: v.success
                            ? `A confirmation is on its way to your email. ${due ? `Pay the remaining ${due} to your KashiGo boatman at the ghat — nobody else.` : "Nothing more is to be paid at the ghat."}`
                            : "We couldn't confirm it automatically. Please WhatsApp +91 81759 66910 with your payment ID and we'll confirm your boat.",
                        ref: { label: "Payment ID", value: r.razorpay_payment_id },
                        rows: [["Quotation", id], ["Paid online", total], ...(due ? [["Due at the ghat", due]] as [string, string][] : [])],
                        cta: { label: "View your quotation", href: `/quote/${id}` },
                    });
                },
                modal: { ondismiss: () => setBusy(false) },
            });
            rzp.on("payment.failed", (r: any) => {
                setError(r?.error?.description || "Payment failed. No money was taken — please try again.");
                setBusy(false);
            });
            rzp.open();
        } catch (e: any) {
            setError(e?.message || "Something went wrong.");
            setBusy(false);
        }
    };

    if (paymentId) {
        return (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 sm:p-6 flex gap-4 items-start">
                <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={28} />
                <div>
                    <p className="font-heading font-bold text-emerald-900 text-lg">Payment received — your boat is confirmed.</p>
                    <p className="text-emerald-800/80 text-sm mt-1">
                        {paymentId !== "received" && <>Payment ID <span className="font-mono">{paymentId}</span>. </>}
                        A confirmation is on its way to your email. {due ? <>Pay the remaining <b>{due}</b> to your KashiGo boatman at the ghat — nobody else.</> : "Nothing more is to be paid at the ghat."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="print:hidden">
            <div role="radiogroup" aria-label="How would you like to pay?" className="mb-3 grid grid-cols-2 gap-2">
                {([
                    ["full", "Pay in full", `${inr(fullNow)} online now`, "Nothing to pay at the ghat · WELCOME20"],
                    ["advance50", "50 / 50", `${inr(half.online)} online now`, `${inr(half.atGhat)} at the ghat · WELCOME10`],
                ] as const).map(([p, title, now, sub]) => (
                    <button key={p} type="button" role="radio" aria-checked={plan === p} onClick={() => choosePlan(p)}
                        className={`rounded-xl p-3 text-left ring-1 transition-colors ${plan === p ? "bg-night text-white ring-night" : "bg-white text-night ring-sandstone/60 hover:ring-night/40"}`}>
                        <span className="flex items-center justify-between gap-2">
                            <span className="text-sm font-extrabold">{title}</span>
                            <span className={`h-4 w-4 rounded-full border-2 shrink-0 ${plan === p ? "border-marigold bg-marigold shadow-[inset_0_0_0_2px_#070b18]" : "border-night/25"}`} />
                        </span>
                        <span className={`mt-1 block font-heading font-extrabold tabular-nums ${plan === p ? "text-marigold" : "text-fire"}`}>{now}</span>
                        <span className={`block text-[11px] leading-snug ${plan === p ? "text-white/60" : "text-night/55"}`}>{sub}</span>
                    </button>
                ))}
            </div>
            {codeBox && (
                <div className="mb-3">
                    {ownCoupon ? (
                        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 px-3 h-11">
                            <Tag size={15} className="text-emerald-700" />
                            <span className="flex-1 text-sm font-bold text-emerald-800">{ownCoupon.code} applied · {inr(off)} off</span>
                            <button onClick={() => { setOwnCoupon(null); setCode(""); }} aria-label="Remove code" className="text-emerald-800/60 hover:text-red-600"><X size={16} /></button>
                        </div>
                    ) : codeOpen ? (
                        <form onSubmit={(e) => { e.preventDefault(); applyCode(); }} className="flex gap-2">
                            <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase().slice(0, 30)); setCodeMsg(""); }} readOnly={checking} placeholder="Discount code" aria-label="Discount code" autoFocus
                                className="flex-1 min-w-0 h-11 rounded-xl bg-white px-3 text-base ring-1 ring-sandstone/60 outline-none focus:ring-2 focus:ring-fire uppercase tracking-wider font-semibold" />
                            <button type="submit" disabled={checking} className="h-11 min-w-[6rem] px-5 rounded-xl bg-night text-white text-sm font-bold hover:bg-fire transition-colors disabled:bg-night/70 flex items-center justify-center gap-1.5">
                                {checking ? <><Loader2 size={15} className="animate-spin" /> Checking</> : "Apply"}
                            </button>
                        </form>
                    ) : (
                        <button type="button" onClick={() => setCodeOpen(true)} className="mx-auto flex items-center gap-1.5 text-sm font-semibold text-night/70 hover:text-fire">
                            <Tag size={15} className="text-fire" /> Have a discount code?
                        </button>
                    )}
                    {codeMsg && <p className="mt-1.5 text-center text-xs font-semibold text-red-600">{codeMsg}</p>}
                </div>
            )}
            <button
                onClick={pay}
                disabled={busy}
                className="group w-full h-[52px] rounded-full bg-gradient-to-r from-fire to-marigold text-night font-heading font-extrabold text-base shadow-[0_14px_30px_-12px_rgba(255,122,26,0.65)] hover:shadow-[0_22px_50px_-10px_rgba(255,122,26,0.8)] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:translate-y-0 flex items-center justify-center gap-3"
            >
                {busy ? <Loader2 className="animate-spin" size={22} /> : <Lock size={20} />}
                {busy ? "Opening secure checkout…" : due ? `Pay 50% advance · ${total}` : `Pay ${total} securely`}
            </button>
            <p className="mt-3 text-center text-xs text-slate-500">{due ? <>The remaining {due} is paid at the ghat · </> : null}UPI · Cards · Net banking · Wallets — processed by Razorpay</p>
            {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}
            <button onClick={() => window.print()} className="mt-2 mx-auto flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-fire transition-colors">
                <Printer size={14} /> Download / print this quotation
            </button>
        </div>
    );
}

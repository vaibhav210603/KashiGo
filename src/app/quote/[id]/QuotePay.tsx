"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Lock, Printer, Tag, X } from "lucide-react";
import { siteCouponOff, type QuoteSelection, type SiteCoupon } from "@/lib/quotes";
import { goToThankYou } from "@/lib/thankYou";

// `due`: on a 50%-advance quote, what's left to pay at the ghat (then `total` is the advance charged now).
// `siteCoupon`: a site-wide code already applied by the page around it (QuoteBuilder).
// `codeBox`: fixed-price quotes — show a discount-code box here and re-split the full total when a code applies.
type Props = {
    id: string; name: string; total: string; paid: boolean; selection?: QuoteSelection; blocked?: string; due?: string;
    siteCoupon?: SiteCoupon | null; codeBox?: { fullInr: number; advance: boolean };
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

export default function QuotePay({ id, name, total: totalLabel, paid: initiallyPaid, selection, blocked, due: dueLabel, siteCoupon, codeBox }: Props) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [paymentId] = useState(initiallyPaid ? "received" : "");
    // Fixed-price quotes: the code box lives here.
    const [ownCoupon, setOwnCoupon] = useState<SiteCoupon | null>(null);
    const [code, setCode] = useState("");
    const [codeMsg, setCodeMsg] = useState("");
    const [codeOpen, setCodeOpen] = useState(false);
    const coupon = siteCoupon ?? ownCoupon;
    let total = totalLabel, due = dueLabel, off = 0;
    if (codeBox && ownCoupon) {
        off = siteCouponOff(codeBox.fullInr, ownCoupon);
        const after = codeBox.fullInr - off;
        const online = codeBox.advance ? Math.ceil(after / 2) : after;
        total = inr(online);
        due = codeBox.advance ? inr(after - online) : undefined;
    }
    const applyCode = async () => {
        const c = code.trim().toUpperCase();
        if (!c) return;
        setCodeMsg("");
        const r = await post({ action: "coupon", id, code: c }).catch(() => ({ success: false, message: "Couldn't check the code — try again." }));
        if (r.success) setOwnCoupon(r.coupon);
        else { setOwnCoupon(null); setCodeMsg(r.message || "That code isn't valid."); }
    };

    const pay = async () => {
        if (blocked) return setError(blocked);
        setBusy(true);
        setError("");
        try {
            const o = await post({ action: "order", id, selection, siteCoupon: coupon?.code });
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
                            <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase().slice(0, 30)); setCodeMsg(""); }} placeholder="Discount code" aria-label="Discount code" autoFocus
                                className="flex-1 min-w-0 h-11 rounded-xl bg-white px-3 text-base ring-1 ring-sandstone/60 outline-none focus:ring-2 focus:ring-fire uppercase tracking-wider font-semibold" />
                            <button type="submit" className="h-11 px-5 rounded-xl bg-night text-white text-sm font-bold hover:bg-fire transition-colors">Apply</button>
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

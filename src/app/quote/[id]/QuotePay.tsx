"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Lock, Printer } from "lucide-react";
import type { QuoteSelection } from "@/lib/quotes";

type Props = { id: string; name: string; total: string; paid: boolean; selection?: QuoteSelection; blocked?: string };

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

export default function QuotePay({ id, name, total, paid: initiallyPaid, selection, blocked }: Props) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [paymentId, setPaymentId] = useState(initiallyPaid ? "received" : "");

    const pay = async () => {
        if (blocked) return setError(blocked);
        setBusy(true);
        setError("");
        try {
            const o = await post({ action: "order", id, selection });
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
                    const v = await post({ action: "verify", id, ...r });
                    if (v.success) setPaymentId(r.razorpay_payment_id);
                    else setError(`${v.message} Your payment ID is ${r.razorpay_payment_id} — please WhatsApp us and we'll sort it out.`);
                    setBusy(false);
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
                        A confirmation is on its way to your email. Nothing more is to be paid at the ghat.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="print:hidden">
            <button
                onClick={pay}
                disabled={busy}
                className="group w-full h-[52px] rounded-full bg-gradient-to-r from-fire to-marigold text-night font-heading font-extrabold text-base shadow-[0_14px_30px_-12px_rgba(255,122,26,0.65)] hover:shadow-[0_22px_50px_-10px_rgba(255,122,26,0.8)] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:translate-y-0 flex items-center justify-center gap-3"
            >
                {busy ? <Loader2 className="animate-spin" size={22} /> : <Lock size={20} />}
                {busy ? "Opening secure checkout…" : `Pay ${total} securely`}
            </button>
            <p className="mt-3 text-center text-xs text-slate-500">UPI · Cards · Net banking · Wallets — processed by Razorpay</p>
            {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}
            <button onClick={() => window.print()} className="mt-2 mx-auto flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-fire transition-colors">
                <Printer size={14} /> Download / print this quotation
            </button>
        </div>
    );
}

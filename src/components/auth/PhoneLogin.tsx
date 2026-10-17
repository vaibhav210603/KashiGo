"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Loader2, Smartphone } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { normalizePhone, formatPhone } from "@/lib/phone";

const CODES = [
    ["+91", "India"], ["+1", "USA / Canada"], ["+44", "UK"], ["+61", "Australia"], ["+49", "Germany"], ["+33", "France"],
    ["+34", "Spain"], ["+39", "Italy"], ["+31", "Netherlands"], ["+41", "Switzerland"], ["+972", "Israel"], ["+971", "UAE"],
    ["+65", "Singapore"], ["+81", "Japan"], ["+82", "South Korea"], ["+86", "China"], ["+7", "Russia"], ["+55", "Brazil"], ["+64", "New Zealand"],
] as const;

// Phone number → 6-digit SMS code → logged in (Supabase phone OTP). `tone` matches the surface it sits on.
export default function PhoneLogin({ tone = "light", title = "Log in with your phone", subtitle, onDone, defaultCode = "+91" }: {
    tone?: "light" | "dark";
    title?: string;
    subtitle?: string;
    onDone?: () => void;
    defaultCode?: string;
}) {
    const [cc, setCc] = useState(defaultCode);
    const [num, setNum] = useState("");
    const [phone, setPhone] = useState<string | null>(null); // set once the code is sent
    const [otp, setOtp] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [wait, setWait] = useState(0);
    const otpRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (wait <= 0) return;
        const t = setTimeout(() => setWait((w) => w - 1), 1000);
        return () => clearTimeout(t);
    }, [wait]);

    const sb = supabaseBrowser();
    const dark = tone === "dark";
    const input = dark
        ? "h-12 rounded-2xl border border-white/15 bg-white/5 px-4 text-white placeholder:text-white/35 outline-none focus:border-marigold"
        : "h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-400";
    const button = "h-12 px-5 shrink-0 whitespace-nowrap inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-marigold via-fire to-ember text-night font-semibold disabled:opacity-50";

    const friendly = (msg: string) =>
        /provider|sms|unsupported|disabled/i.test(msg) ? "Phone login isn't switched on yet — please try again later or call +91 81759 66910."
            : /rate|too many|seconds/i.test(msg) ? "Too many tries — wait a minute and try again."
                : /expired|invalid|token/i.test(msg) ? "That code didn't work — check it or send a new one."
                    : msg;

    const send = async () => {
        setError("");
        const p = normalizePhone(num.trim().startsWith("+") ? num : `${cc}${num.replace(/^0+/, "")}`);
        if (!p) { setError("Enter your mobile number."); return; }
        if (!sb) { setError("Phone login isn't available right now."); return; }
        setBusy(true);
        const { error } = await sb.auth.signInWithOtp({ phone: p });
        setBusy(false);
        if (error) { setError(friendly(error.message)); return; }
        setPhone(p); setOtp(""); setWait(30);
        setTimeout(() => otpRef.current?.focus(), 50);
    };

    const verify = async () => {
        if (!sb || !phone || otp.length < 6) return;
        setError(""); setBusy(true);
        const { error } = await sb.auth.verifyOtp({ phone, token: otp, type: "sms" });
        setBusy(false);
        if (error) { setError(friendly(error.message)); return; }
        onDone?.();
    };

    return (
        <div className={dark ? "text-white" : "text-slate-900"}>
            <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${dark ? "bg-marigold/15 text-marigold" : "bg-orange-100 text-orange-600"}`}><Smartphone size={18} /></span>
                <div>
                    <p className="font-semibold leading-tight">{phone ? "Enter the 6-digit code" : title}</p>
                    <p className={`text-sm ${dark ? "text-white/55" : "text-slate-500"}`}>
                        {phone ? <>Sent by SMS to {formatPhone(phone)} · <button type="button" className="underline" onClick={() => { setPhone(null); setError(""); }}>change</button></> : subtitle ?? "We'll text you a one-time code. No password needed."}
                    </p>
                </div>
            </div>

            {!phone ? (
                <form className="mt-4 flex flex-col sm:flex-row gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
                    <div className="flex gap-2 flex-1">
                        <select aria-label="Country code" value={cc} onChange={(e) => setCc(e.target.value)} className={`${input} w-[5.25rem] shrink-0 px-2`}>
                            {CODES.map(([c, name]) => <option key={c} value={c} label={c} className="text-slate-900">{c} {name}</option>)}
                        </select>
                        <input value={num} onChange={(e) => setNum(e.target.value)} inputMode="tel" autoComplete="tel-national" placeholder="Mobile number" aria-label="Mobile number" className={`${input} flex-1 min-w-0`} />
                    </div>
                    <button type="submit" disabled={busy} className={button}>{busy ? <Loader2 size={18} className="animate-spin" /> : <>Send code <ArrowRight size={16} /></>}</button>
                </form>
            ) : (
                <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); verify(); }}>
                    <input ref={otpRef} value={otp} onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 6); setOtp(v); }}
                        inputMode="numeric" autoComplete="one-time-code" placeholder="••••••" aria-label="6-digit code"
                        className={`${input} flex-1 min-w-0 text-center text-xl tracking-[0.5em] font-semibold`} />
                    <button type="submit" disabled={busy || otp.length < 6} className={button}>{busy ? <Loader2 size={18} className="animate-spin" /> : "Verify"}</button>
                </form>
            )}
            {phone && (
                <button type="button" disabled={wait > 0 || busy} onClick={send} className={`mt-2 text-sm ${dark ? "text-white/60" : "text-slate-500"} disabled:opacity-60`}>
                    {wait > 0 ? `Resend code in ${wait}s` : "Resend code"}
                </button>
            )}
            {error && <p role="alert" className={`mt-2 text-sm ${dark ? "text-ember" : "text-rose-600"}`}>{error}</p>}
        </div>
    );
}

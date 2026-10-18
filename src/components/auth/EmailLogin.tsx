"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { normalizeEmail } from "@/lib/email";
import GoogleG from "@/components/ui/GoogleG";

// Log in with Google (one tap), or with an email: we send a 6-digit code and a sign-in link in the same
// email (Supabase), so either works. Both are free. `tone` matches the surface it sits on.
export default function EmailLogin({ tone = "light", title = "Log in", subtitle, onDone, defaultEmail = "" }: {
    tone?: "light" | "dark";
    title?: string;
    subtitle?: string;
    onDone?: () => void;
    defaultEmail?: string;
}) {
    const [email, setEmail] = useState(defaultEmail);
    const [sentTo, setSentTo] = useState<string | null>(null);
    const [code, setCode] = useState("");
    const [busy, setBusy] = useState<"" | "send" | "verify" | "google">("");
    const [error, setError] = useState("");
    const [wait, setWait] = useState(0);
    const codeRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (wait <= 0) return;
        const t = setTimeout(() => setWait((w) => w - 1), 1000);
        return () => clearTimeout(t);
    }, [wait]);

    const sb = supabaseBrowser();
    const dark = tone === "dark";
    const input = dark
        ? "h-12 rounded-2xl border border-white/15 bg-white/5 px-4 text-white placeholder:text-white/35 outline-none focus:border-marigold"
        : "h-12 rounded-2xl border border-night/15 bg-white/80 px-4 text-night placeholder:text-night/35 outline-none focus:border-fire";
    const fire = "h-12 px-5 shrink-0 whitespace-nowrap inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-marigold via-fire to-ember text-night font-semibold disabled:opacity-50";
    const muted = dark ? "text-white/55" : "text-night/55";

    const friendly = (msg: string) =>
        /provider|disabled|not enabled/i.test(msg) ? "This login option isn't switched on yet — please try another or call +91 81759 66910."
            : /rate|too many|seconds|security purposes/i.test(msg) ? "Too many tries — wait a minute and try again."
                : /expired|invalid|token/i.test(msg) ? "That code didn't work — check it or send a new one."
                    : msg;

    // Come back to this same page after Google or the emailed link.
    const back = () => (typeof window !== "undefined" ? window.location.href.split("#")[0] : undefined);

    const google = async () => {
        if (!sb) { setError("Login isn't available right now."); return; }
        setError(""); setBusy("google");
        const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: back() } });
        if (error) { setBusy(""); setError(friendly(error.message)); }
        // On success the browser leaves for Google.
    };

    const send = async () => {
        setError("");
        const e = normalizeEmail(email);
        if (!e) { setError("Enter your email address."); return; }
        if (!sb) { setError("Login isn't available right now."); return; }
        setBusy("send");
        const { error } = await sb.auth.signInWithOtp({ email: e, options: { shouldCreateUser: true, emailRedirectTo: back() } });
        setBusy("");
        if (error) { setError(friendly(error.message)); return; }
        setSentTo(e); setCode(""); setWait(45);
        setTimeout(() => codeRef.current?.focus(), 50);
    };

    const verify = async () => {
        if (!sb || !sentTo || code.length < 6) return;
        setError(""); setBusy("verify");
        const { error } = await sb.auth.verifyOtp({ email: sentTo, token: code, type: "email" });
        setBusy("");
        if (error) { setError(friendly(error.message)); return; }
        onDone?.();
    };

    return (
        <div className={dark ? "text-white" : "text-night"}>
            <p className="font-semibold leading-tight">{sentTo ? "Check your email" : title}</p>
            <p className={`text-sm ${muted}`}>
                {sentTo ? <>We sent a 6-digit code and a sign-in link to <b className={dark ? "text-white" : "text-night"}>{sentTo}</b> · <button type="button" className="underline" onClick={() => { setSentTo(null); setError(""); }}>change</button></>
                    : subtitle ?? "No password needed."}
            </p>

            {!sentTo ? (
                <div className="mt-4 grid gap-3">
                    <button type="button" onClick={google} disabled={!!busy}
                        className={`h-12 inline-flex items-center justify-center gap-3 rounded-full font-semibold transition-colors disabled:opacity-60 ${dark ? "bg-white text-night hover:bg-parchment" : "border border-night/15 bg-white text-night hover:border-night/40"}`}>
                        {busy === "google" ? <Loader2 size={18} className="animate-spin" /> : <GoogleG size={18} />} Continue with Google
                    </button>
                    <div className={`flex items-center gap-3 text-xs ${muted}`}><span className="h-px flex-1 bg-current opacity-30" />or with email<span className="h-px flex-1 bg-current opacity-30" /></div>
                    <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
                        <div className="relative flex-1 min-w-0">
                            <Mail size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${muted}`} />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" aria-label="Email address" className={`${input} w-full pl-10`} />
                        </div>
                        <button type="submit" disabled={!!busy} className={fire}>{busy === "send" ? <Loader2 size={18} className="animate-spin" /> : <>Email me a code <ArrowRight size={16} /></>}</button>
                    </form>
                </div>
            ) : (
                <>
                    <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); verify(); }}>
                        <input ref={codeRef} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            inputMode="numeric" autoComplete="one-time-code" placeholder="••••••" aria-label="6-digit code"
                            className={`${input} flex-1 min-w-0 text-center text-xl tracking-[0.5em] font-semibold`} />
                        <button type="submit" disabled={!!busy || code.length < 6} className={fire}>{busy === "verify" ? <Loader2 size={18} className="animate-spin" /> : "Verify"}</button>
                    </form>
                    <p className={`mt-2 text-sm ${muted}`}>
                        Or just tap the link in the email.{" "}
                        <button type="button" disabled={wait > 0 || !!busy} onClick={send} className="underline disabled:no-underline disabled:opacity-60">{wait > 0 ? `Resend in ${wait}s` : "Resend"}</button>
                    </p>
                </>
            )}
            {error && <p role="alert" className="mt-2 text-sm text-ember">{error}</p>}
        </div>
    );
}

import { Download, ShieldCheck, Mail } from "lucide-react";

// Currency switch. `dark` for night heroes.
export function RegionToggle({ region, setRegion, dark = false }: { region: "inr" | "usd"; setRegion: (r: "inr" | "usd") => void; dark?: boolean }) {
    return (
        <div className={`inline-flex rounded-full p-1 ${dark ? "border border-white/15 bg-white/5 backdrop-blur-md" : "border border-night/15 bg-white/60"}`}>
            {(["usd", "inr"] as const).map((r) => (
                <button key={r} onClick={() => setRegion(r)} aria-pressed={region === r}
                    className={`h-9 px-4 rounded-full text-sm font-semibold transition-colors ${region === r ? (dark ? "bg-marigold text-night" : "bg-night text-marigold") : dark ? "text-white/65 hover:text-white" : "text-night/60 hover:text-night"}`}>
                    {r === "usd" ? "USD $" : "INR ₹"}
                </button>
            ))}
        </div>
    );
}

export const TRUST = [
    [Download, "Instant download", "On screen and in your inbox the moment you pay."],
    [ShieldCheck, "7-day money-back", "Not useful? Reply to your receipt for a full refund."],
    [Mail, "A real human", "Every email is read by Vaibhav, in Varanasi."],
] as const;

// The three promises, as a ruled row on parchment.
export function TrustRow() {
    return (
        <div className="grid sm:grid-cols-3 border-y border-night/15">
            {TRUST.map(([Icon, t, d], i) => (
                <div key={t} className={`flex sm:flex-col gap-4 py-6 sm:px-6 ${i > 0 ? "border-t sm:border-t-0 sm:border-l border-night/15" : "sm:pl-0"}`}>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-night text-marigold"><Icon size={19} /></span>
                    <div><p className="font-display text-xl text-night">{t}</p><p className="mt-1 text-sm text-night/60">{d}</p></div>
                </div>
            ))}
        </div>
    );
}

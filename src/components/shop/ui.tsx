import { Download, ShieldCheck, Mail } from "lucide-react";

export function RegionToggle({ region, setRegion }: { region: "inr" | "usd"; setRegion: (r: "inr" | "usd") => void }) {
    return (
        <div className="inline-flex rounded-full bg-white border border-slate-200 p-1 shadow-sm">
            {(["usd", "inr"] as const).map((r) => (
                <button key={r} onClick={() => setRegion(r)} aria-pressed={region === r}
                    className={`h-9 px-4 rounded-full text-sm font-semibold transition-colors ${region === r ? "bg-slate-900 text-white" : "text-slate-600"}`}>
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

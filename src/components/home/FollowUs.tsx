import { Coins, Facebook, Instagram } from "lucide-react";

export const INSTAGRAM_URL = "https://www.instagram.com/kashigo_in/";
export const FACEBOOK_URL = "https://www.facebook.com/p/KashiGo-61595856537213/";

const LINKS = [
    { href: INSTAGRAM_URL, Icon: Instagram, name: "Instagram", handle: "@kashigo_in", bg: "bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5]" },
    { href: FACEBOOK_URL, Icon: Facebook, name: "Facebook", handle: "KashiGo", bg: "bg-[#1877f2]" },
];

// Our Instagram and Facebook, right after the consultations.
export default function FollowUs() {
    return (
        <section className="bg-night px-4 pb-14 pt-2 text-white sm:px-6 md:pb-20">
            <div className="mx-auto max-w-3xl text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-marigold">Follow KashiGo</p>
                <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-marigold/40 bg-marigold/10 px-4 py-2 font-semibold">
                    <Coins size={18} className="text-marigold" /> Follow and get <span className="text-marigold">100 KashiGo coins</span>
                </p>
                <p className="mt-2 text-xs text-white/55">1 KashiGo coin = ₹1</p>
                <p className="mt-3 text-white/70">Daily reels from the ghats, aarti nights and festival updates.</p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {LINKS.map(({ href, Icon, name, handle, bg }) => (
                        <li key={name}>
                            <a href={href} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 text-left transition-colors hover:border-marigold/60">
                                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white ${bg}`}><Icon size={24} /></span>
                                <span className="flex-1">
                                    <span className="block font-semibold">{name}</span>
                                    <span className="block text-sm text-white/55">{handle}</span>
                                </span>
                                <span className="rounded-full bg-marigold px-4 py-1.5 text-sm font-bold text-night">Follow</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

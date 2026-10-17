import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { Logo } from "@/components/layout/Header";
import RiverWave from "@/components/motion/RiverWave";

const COLS = [
    { title: "Boat rides", links: [["/book", "Book a boat ride"], ["/book#prices", "Prices"], ["/blog/varanasi-boat-ride-price-guide-foreigners", "Boat price guide"]] },
    { title: "Guides", links: [["/shop", "Complete bundle"], ["/guide", "Varanasi Insider Guide"], ["/ebooks", "Ebooks"], ["/audiobooks", "Audio tours"], ["/india-tour", "India Field Guide"]] },
    { title: "KashiGo", links: [["/about", "About"], ["/blog", "Blog"]] },
];

export default function Footer() {
    return (
        <footer className="grain relative overflow-hidden bg-night text-white">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 md:pt-24 grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
                <div>
                    <Link href="/" aria-label="KashiGo home"><Logo dark /></Link>
                    <p className="mt-4 text-white/55 max-w-xs">Varanasi boat rides and travel guides by a local. Pay a genuine price for comfort.</p>
                    <ul className="mt-6 space-y-2.5 text-sm text-white/75">
                        <li><a href="tel:+918175966910" className="inline-flex items-center gap-2.5 hover:text-marigold transition-colors"><Phone size={16} className="text-marigold" />+91 81759 66910</a></li>
                        <li><a href="mailto:support@kashigo.in" className="inline-flex items-center gap-2.5 hover:text-marigold transition-colors"><Mail size={16} className="text-marigold" />support@kashigo.in</a></li>
                        <li className="inline-flex items-center gap-2.5"><MapPin size={16} className="text-marigold" />Brahma Ghat, Varanasi</li>
                    </ul>
                </div>
                <div className="grid grid-cols-2 gap-8 md:contents">
                    {COLS.map((c) => (
                        <div key={c.title}>
                            <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-marigold mb-4">{c.title}</h3>
                            <ul className="space-y-2.5 text-sm text-white/65">
                                {c.links.map(([href, label]) => (
                                    <li key={href}><Link href={href} className="group inline-flex items-center gap-1 hover:text-white transition-colors"><span className="h-px w-0 bg-marigold transition-all duration-300 group-hover:w-3" />{label}</Link></li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Giant wordmark rising out of the river */}
            <div aria-hidden className="relative mt-16 select-none overflow-hidden">
                <p className="text-center font-display font-light italic leading-[0.8] tracking-[-0.05em] text-[26vw] md:text-[19vw] bg-gradient-to-b from-white/[0.14] to-transparent bg-clip-text text-transparent translate-y-[18%]">
                    KashiGo
                </p>
                <RiverWave fill="#0d1328" className="absolute bottom-0 left-0" />
            </div>
            <div className="relative bg-night-2 px-4 pb-8 pt-2 text-center text-xs text-white/40">
                &copy; {new Date().getFullYear()} KashiGo · Varanasi, India · <span className="font-deva">हर हर गंगे</span>
            </div>
        </footer>
    );
}

import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { Logo } from "@/components/layout/Header";

const COLS = [
    { title: "Boat rides", links: [["/book", "Book a boat ride"], ["/book#prices", "Prices"], ["/blog/varanasi-boat-ride-price-guide-foreigners", "Boat price guide"]] },
    { title: "Guides", links: [["/shop", "Complete bundle"], ["/guide", "Varanasi Insider Guide"], ["/ebooks", "Ebooks"], ["/audiobooks", "Audio tours"], ["/india-tour", "India Field Guide"]] },
    { title: "KashiGo", links: [["/about", "About"], ["/blog", "Blog"]] },
];

export default function Footer() {
    return (
        <footer className="bg-gradient-to-b from-white to-amber-50 border-t border-slate-200/70">
            <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
                <div>
                    <Link href="/" aria-label="KashiGo home"><Logo /></Link>
                    <p className="mt-3 text-slate-600 max-w-xs">Varanasi boat rides and travel guides by a local. Pay a genuine price for comfort.</p>
                    <ul className="mt-5 space-y-2 text-sm text-slate-700">
                        <li><a href="tel:+918175966910" className="inline-flex items-center gap-2 hover:text-orange-600"><Phone size={16} className="text-teal-600" />+91 81759 66910</a></li>
                        <li><a href="mailto:support@kashigo.in" className="inline-flex items-center gap-2 hover:text-orange-600"><Mail size={16} className="text-teal-600" />support@kashigo.in</a></li>
                        <li className="inline-flex items-center gap-2"><MapPin size={16} className="text-teal-600" />Brahma Ghat, Varanasi</li>
                    </ul>
                </div>
                <div className="grid grid-cols-2 gap-8 md:contents">
                    {COLS.map((c) => (
                        <div key={c.title}>
                            <h3 className="font-heading font-semibold text-slate-900 mb-3">{c.title}</h3>
                            <ul className="space-y-2 text-sm text-slate-600">
                                {c.links.map(([href, label]) => (
                                    <li key={href}><Link href={href} className="hover:text-orange-600">{label}</Link></li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            <p className="text-center text-xs text-slate-500 pb-8">&copy; {new Date().getFullYear()} KashiGo · Varanasi, India</p>
        </footer>
    );
}

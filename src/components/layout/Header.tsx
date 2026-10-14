"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SHOW_ON } from "@/components/layout/MobileActionBar";
import { Menu, X, Phone, Sailboat, BookOpen, Headphones, ShoppingBag, Newspaper, Info } from "lucide-react";

const NAV = [
    { href: "/book", label: "Boat rides", icon: Sailboat },
    { href: "/shop", label: "Guides & bundle", icon: ShoppingBag },
    { href: "/ebooks", label: "Ebooks", icon: BookOpen },
    { href: "/audiobooks", label: "Audio tours", icon: Headphones },
    { href: "/blog", label: "Blog", icon: Newspaper },
    { href: "/about", label: "About", icon: Info },
];

export function Logo() {
    return (
        <span className="tracking-tight select-none">
            <span className="font-cursive text-[1.75rem] leading-none text-orange-500 font-bold pr-0.5">Kashi</span>
            <span className="font-heading font-bold text-xl text-slate-900">Go</span>
        </span>
    );
}

export default function Header() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    useEffect(() => setOpen(false), [pathname]);
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    const onBook = pathname === "/book";

    return (
        <>
            <header className="fixed top-8 inset-x-0 z-50 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200/70">
                <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between gap-3">
                    <Link href="/" aria-label="KashiGo home"><Logo /></Link>

                    <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
                        {NAV.slice(0, 5).map((n) => (
                            <Link key={n.href} href={n.href}
                                className={`px-3 py-2 rounded-full transition-colors hover:text-slate-900 hover:bg-slate-100 ${pathname === n.href ? "text-slate-900 bg-slate-100" : ""}`}>
                                {n.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        {!onBook && (
                            <Link href="/book" className={`${SHOW_ON(pathname || "") ? "hidden md:inline-flex" : "inline-flex"} h-10 px-4 items-center rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-sm shadow-orange-500/30 transition-colors`}>
                                Book a boat
                            </Link>
                        )}
                        <button onClick={() => setOpen(true)} aria-label="Open menu"
                            className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-full border border-slate-200 text-slate-700">
                            <Menu size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {open && (
                <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true">
                    <button aria-label="Close menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />
                    <div className="absolute inset-x-0 top-0 bg-white rounded-b-3xl shadow-2xl p-4 pb-6">
                        <div className="flex items-center justify-between h-12 mb-3">
                            <Logo />
                            <button onClick={() => setOpen(false)} aria-label="Close menu" className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-700">
                                <X size={20} />
                            </button>
                        </div>
                        <nav className="grid grid-cols-2 gap-2">
                            {NAV.map(({ href, label, icon: Icon }) => (
                                <Link key={href} href={href}
                                    className={`flex items-center gap-3 rounded-2xl p-4 font-semibold text-slate-800 ${pathname === href ? "bg-orange-100" : "bg-slate-50"}`}>
                                    <Icon size={20} className="text-orange-500 shrink-0" />{label}
                                </Link>
                            ))}
                        </nav>
                        <a href="tel:+918175966910" className="mt-3 flex items-center justify-center gap-2 h-12 rounded-full border border-slate-200 font-semibold text-slate-800">
                            <Phone size={18} className="text-teal-600" /> Call +91 81759 66910
                        </a>
                    </div>
                </div>
            )}
        </>
    );
}

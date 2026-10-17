"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SHOW_ON } from "@/components/layout/MobileActionBar";
import { Phone, Sailboat, BookOpen, Headphones, ShoppingBag, Newspaper, Info } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";

const NAV = [
    { href: "/book", label: "Boat rides", icon: Sailboat },
    { href: "/shop", label: "Guides & bundle", icon: ShoppingBag },
    { href: "/ebooks", label: "Ebooks", icon: BookOpen },
    { href: "/audiobooks", label: "Audio tours", icon: Headphones },
    { href: "/blog", label: "Blog", icon: Newspaper },
    { href: "/about", label: "About", icon: Info },
];

export function Logo({ dark = false }: { dark?: boolean }) {
    return (
        <span className="tracking-tight select-none">
            <span className={`font-cursive text-[1.75rem] leading-none font-bold pr-0.5 ${dark ? "text-marigold" : "text-orange-500"}`}>Kashi</span>
            <span className={`font-heading font-bold text-xl ${dark ? "text-white" : "text-slate-900"}`}>Go</span>
        </span>
    );
}

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Header() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [atTop, setAtTop] = useState(true);
    const [hidden, setHidden] = useState(false);
    const { scrollY, scrollYProgress } = useScroll();
    const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

    // Close the menu on navigation (adjusting state during render, not in an effect).
    const [lastPath, setLastPath] = useState(pathname);
    if (pathname !== lastPath) { setLastPath(pathname); setOpen(false); }
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    useMotionValueEvent(scrollY, "change", (y) => {
        const prev = scrollY.getPrevious() ?? 0;
        setAtTop(y < 40);
        setHidden(y > 400 && y > prev + 2 ? true : y < prev - 2 ? false : hidden);
    });

    const onBook = pathname === "/book";
    const clear = pathname === "/" && atTop && !open;

    return (
        <>
            <header className={`fixed top-8 inset-x-0 z-50 h-16 transition-[transform,background-color,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${hidden && !open ? "-translate-y-24" : "translate-y-0"} ${clear ? "bg-transparent border-transparent" : "bg-night/80 backdrop-blur-xl border-b border-white/10"}`}>
                <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-3">
                    <Link href="/" aria-label="KashiGo home"><Logo dark /></Link>

                    <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
                        {NAV.slice(0, 5).map((n) => {
                            const here = pathname === n.href;
                            return (
                                <Link key={n.href} href={n.href} className={`group relative px-3 py-2 transition-colors ${here ? "text-white" : "text-white/65 hover:text-white"}`}>
                                    {n.label}
                                    <span className={`absolute inset-x-3 bottom-1 h-px origin-left bg-marigold transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${here ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-2">
                        {!onBook && (
                            <Link href="/book" className={`${SHOW_ON(pathname || "") ? "hidden md:inline-flex" : "inline-flex"} btn-sheen h-10 px-5 items-center rounded-full bg-gradient-to-r from-marigold via-fire to-ember text-night text-sm font-semibold shadow-[0_6px_24px_-6px_rgba(255,122,26,0.8)]`}>
                                Book a boat
                            </Link>
                        )}
                        <button onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}
                            className="md:hidden relative h-10 w-10 inline-flex items-center justify-center rounded-full border border-white/20 text-white">
                            <span className={`absolute h-[1.5px] w-4 bg-current transition-transform duration-500 ${open ? "rotate-45" : "-translate-y-[4px]"}`} />
                            <span className={`absolute h-[1.5px] w-4 bg-current transition-transform duration-500 ${open ? "-rotate-45" : "translate-y-[4px]"}`} />
                        </button>
                    </div>
                </div>
                {/* reading progress */}
                <motion.div aria-hidden className="absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-gradient-to-r from-marigold via-fire to-ember" style={{ scaleX: progress, opacity: clear ? 0 : 1 }} />
            </header>

            <AnimatePresence>
                {open && (
                    <motion.div className="fixed inset-0 z-[45] md:hidden bg-night grain overflow-y-auto" role="dialog" aria-modal="true"
                        initial={{ clipPath: "circle(0% at calc(100% - 2.25rem) 4rem)" }}
                        animate={{ clipPath: "circle(150% at calc(100% - 2.25rem) 4rem)" }}
                        exit={{ clipPath: "circle(0% at calc(100% - 2.25rem) 4rem)" }}
                        transition={{ duration: 0.7, ease: EASE }}>
                        <div aria-hidden className="flicker absolute -bottom-20 left-1/2 h-64 w-[120%] -translate-x-1/2 rounded-full bg-fire/25 blur-[90px]" />
                        <p aria-hidden className="pointer-events-none absolute -right-8 bottom-24 select-none font-deva text-[9rem] leading-none text-white/[0.05]">काशी</p>
                        <nav className="relative flex min-h-full flex-col px-6 pt-32 pb-10">
                            {NAV.map(({ href, label }, i) => (
                                <motion.div key={href} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.15 + i * 0.05 }}>
                                    <Link href={href} className="group flex items-baseline gap-4 border-b border-white/10 py-4">
                                        <span className="font-display italic text-sm text-marigold/70">0{i + 1}</span>
                                        <span className={`font-display text-4xl tracking-tight ${pathname === href ? "text-fire italic" : "text-white"}`}>{label}</span>
                                    </Link>
                                </motion.div>
                            ))}
                            <motion.div className="mt-auto pt-10 grid gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                                <Link href="/book" className="h-14 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-marigold via-fire to-ember text-night font-semibold">Book a boat ride</Link>
                                <a href="tel:+918175966910" className="flex items-center justify-center gap-2 h-14 rounded-full border border-white/20 font-medium text-white">
                                    <Phone size={18} className="text-marigold" /> Call +91 81759 66910
                                </a>
                            </motion.div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

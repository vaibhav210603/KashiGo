"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function MiniBar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 20);
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // The chooser screen ("/") is its own full-screen experience — no bar there.
    if (pathname === "/") return null;

    const onBookPage = pathname === "/book";

    return (
        <div
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
                isScrolled
                    ? "bg-white/80 backdrop-blur-xl shadow-sm py-3"
                    : "bg-transparent py-4"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                {/* Logo → back to the chooser */}
                <Link href="/" className="flex items-center tracking-tighter" aria-label="Back to KashiGo home">
                    <span className="font-cursive text-3xl text-orange-500 font-bold pr-1">Kashi</span>
                    <span
                        className={`font-heading font-bold text-xl transition-colors ${
                            isScrolled ? "text-slate-900" : "text-white drop-shadow"
                        }`}
                    >
                        Go
                    </span>
                </Link>

                {!onBookPage && (
                    <Link
                        href="/book"
                        className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all shadow-md hover:scale-105"
                    >
                        Book
                    </Link>
                )}
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/#about" },
    { name: "Packages", href: "/#packages" },
    { name: "Reviews", href: "/#reviews" },
    { name: "Guide", href: "/guide" },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
        ? "bg-amber-50/90 backdrop-blur-md shadow-sm py-3"
        : "bg-transparent py-5"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img src="/Untitled.png" alt="KashiGo" className="h-10 w-auto object-contain" />
            <span className={`tracking-tighter ${isScrolled ? "text-slate-900" : "text-white"}`}>
              <span className="font-cursive text-4xl text-orange-500 font-bold pr-1">Kashi</span>
              <span className="font-heading font-bold text-2xl">Go</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-orange-500 ${isScrolled ? "text-slate-700" : "text-slate-200"
                  }`}
              >
                {link.name}
              </Link>
            ))}
            <Link href="/book" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 shadow-md">
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`${isScrolled ? "text-slate-900" : "text-white"}`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-slate-100 py-4 px-4"
        >
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-800 text-base font-medium px-2 py-1 hover:bg-orange-50 rounded-md hover:text-orange-600"
              >
                {link.name}
              </Link>
            ))}
            <Link href="/book" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-md text-base font-medium mt-4 shadow-sm inline-block">
              Book Now
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

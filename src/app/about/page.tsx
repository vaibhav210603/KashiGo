import type { Metadata } from "next";
import Link from "next/link";
import AboutSection from "@/components/sections/AboutSection";
import ReviewsSection from "@/components/sections/ReviewsSection";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "About KashiGo — Varanasi Boat Rides & Local Travel Guides",
  description:
    "KashiGo is Varanasi's scam-free travel platform — instant boat-ride bookings on the Ganges and local's guides to Varanasi and India, written by someone born in the city.",
  alternates: {
    canonical: "https://kashigo.in/about",
  },
  openGraph: {
    title: "About KashiGo",
    description:
      "Varanasi's scam-free travel platform — boat rides and local's guides written by someone born in the city.",
    url: "https://kashigo.in/about",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function AboutPage() {
  return (
    <div className="w-full flex flex-col bg-white">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "About KashiGo",
        "url": "https://kashigo.in/about",
        "description": "KashiGo is Varanasi's scam-free travel platform for boat rides and local travel guides.",
      }} />

      {/* Intro */}
      <section className="pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-orange-100 text-orange-700">
            Namaste from Kashi
          </span>
          <h1 className="mt-4 font-heading font-bold text-slate-900 text-3xl sm:text-5xl leading-tight tracking-tight">
            Travel Varanasi like you were born here.
          </h1>
          <p className="mt-4 text-[15px] sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            KashiGo was built by a local to fix the two hardest parts of visiting India&apos;s
            oldest city — getting scammed, and not knowing where to begin. Fair-priced boat
            rides on the Ganges, and honest guides that read like a friend showing you around.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Link
              href="/book"
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors shadow-sm"
            >
              Book a boat ride
            </Link>
            <Link
              href="/guide"
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-full border border-slate-300 bg-white text-slate-800 font-semibold hover:bg-slate-50 transition-colors"
            >
              Read the Varanasi guide
            </Link>
          </div>
        </div>
      </section>

      <AboutSection />
      <ReviewsSection />
    </div>
  );
}

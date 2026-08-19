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
    <div className="w-full flex flex-col">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "About KashiGo",
        "url": "https://kashigo.in/about",
        "description": "KashiGo is Varanasi's scam-free travel platform for boat rides and local travel guides.",
      }} />

      {/* Intro */}
      <section className="relative bg-slate-900 pt-32 pb-20 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-cursive text-3xl text-orange-400 mb-3">Namaste from Kashi</p>
          <h1 className="font-heading font-bold text-white text-4xl md:text-6xl leading-[1.05] mb-6">
            Travel Varanasi like you were born here.
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            KashiGo was built by a local to fix the two hardest parts of visiting India&apos;s
            oldest city — getting scammed, and not knowing where to begin. Fair-priced boat
            rides on the Ganges, and honest guides that read like a friend showing you around.
          </p>
          <div className="mt-9 flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/book"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-7 py-3.5 rounded-full transition-colors shadow-lg shadow-orange-900/30"
            >
              Book a boat ride
            </Link>
            <Link
              href="/"
              className="text-slate-200 hover:text-white font-medium px-4 py-3.5 transition-colors"
            >
              Explore all options
            </Link>
          </div>
        </div>
      </section>

      <AboutSection />
      <ReviewsSection />
    </div>
  );
}

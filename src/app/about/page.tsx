import type { Metadata } from "next";
import Link from "next/link";
import AboutSection from "@/components/sections/AboutSection";
import ReviewsSection from "@/components/sections/ReviewsSection";
import { JsonLd } from "@/components/JsonLd";
import { ArrowRight } from "lucide-react";
import PageHero from "@/components/layout/PageHero";
import { FIRE_BTN, GHOST_BTN_DARK } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: { absolute: "About KashiGo — Varanasi Boat Rides & Local Travel Guides" },
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
    <div className="w-full flex flex-col bg-parchment">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "About KashiGo",
        "url": "https://kashigo.in/about",
        "description": "KashiGo is Varanasi's scam-free travel platform for boat rides and local travel guides.",
      }} />

      {/* Intro */}
      <PageHero
        eyebrow="Namaste from Kashi"
        title="Travel Varanasi"
        highlight="like you were born here."
        intro={
          <p>
            KashiGo was built by a local to fix the two hardest parts of visiting India&apos;s
            oldest city — getting scammed, and not knowing where to begin. Fair-priced boat
            rides on the Ganges, and honest guides that read like a friend showing you around.
          </p>
        }
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link href="/book" className={`${FIRE_BTN} w-full sm:w-auto h-14 px-8 text-lg`}>
            Book a boat ride
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/guide" className={`${GHOST_BTN_DARK} w-full sm:w-auto h-14 px-8`}>
            Read the Varanasi guide
          </Link>
        </div>
      </PageHero>

      <AboutSection />
      <ReviewsSection />
    </div>
  );
}

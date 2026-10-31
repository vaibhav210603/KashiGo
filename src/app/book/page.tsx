import type { Metadata } from "next";
import BookingFlow from "@/components/booking/BookingFlow";
import { Sailboat, BadgeIndianRupee, Phone } from "lucide-react";
import FAQSection from "@/components/sections/FAQSection";
import { JsonLd } from "@/components/JsonLd";
import { BOAT_RIDES, BOAT_PRICE_RANGE, CUSTOM_RIDE, boatPrice, inr, BOOKING_PHONE } from "@/lib/boatRides";
import { BOAT_PRICES_INR } from "@/lib/boatPrices";
import Link from "next/link";
import { ridePagePath } from "@/lib/ridePages";
import PageHero from "@/components/layout/PageHero";
import { Eyebrow } from "@/components/motion/primitives";
import { H2_LIGHT, PAPER_CARD } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: { absolute: "Book Varanasi Boat Ride — Sunrise, Ganga Aarti & Sunset | KashiGo" },
  description:
    "Book your Varanasi boat ride online in seconds. Sunrise on the Ganges, Ganga Aarti evening experience, sunset cruise. Fixed prices from ₹2,599 per private boat, trusted local boatmen, instant confirmation.",
  keywords: [
    "Varanasi boat ride booking online",
    "Ganga Aarti boat ride book",
    "Varanasi sunrise boat ride price",
    "book boat ride Varanasi foreigners",
    "Varanasi river boat tour online",
    "Ganges boat ride cost 2026",
    "Varanasi Ganga boat booking",
    "Kashi boat ride reservation",
  ],
  alternates: {
    canonical: "https://kashigo.in/book",
  },
  openGraph: {
    title: "Book Varanasi Boat Rides Instantly — KashiGo",
    description:
      "Sunrise, Ganga Aarti & sunset boat rides on the Ganges. Book online, fair prices, trusted local boatmen, instant confirmation.",
    url: "https://kashigo.in/book",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function BookPage() {
  return (
    <div className="min-h-screen bg-parchment">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kashigo.in" },
          { "@type": "ListItem", "position": 2, "name": "Book a Boat Ride", "item": "https://kashigo.in/book" }
        ]
      }} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "TouristTrip",
        "name": "Varanasi Boat Rides — Sunrise, Ganga Aarti & Sunset",
        "description": "Book private boat rides on the Ganges River in Varanasi. Sunrise, Ganga Aarti evening ceremony, and sunset experiences available.",
        "image": "https://kashigo.in/og-image.jpg",
        "url": "https://kashigo.in/book",
        "provider": {
          "@type": "LocalBusiness",
          "name": "KashiGo",
          "url": "https://kashigo.in",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Varanasi",
            "addressCountry": "IN"
          }
        },
        "touristType": ["Foreign tourists", "Solo travelers", "Backpackers", "Spiritual travelers"],
        "itinerary": {
          "@type": "ItemList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Sunrise boat ride — watch Varanasi awaken on the Ganges"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Ganga Aarti boat ride — floating front-row view of the fire ceremony"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Sunset cruise — golden hour on the Ganges"
            }
          ]
        },
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "INR",
          "lowPrice": String(BOAT_PRICE_RANGE.low),
          "highPrice": String(BOAT_PRICE_RANGE.high),
          "offerCount": BOAT_RIDES.length + 1,
          "availability": "https://schema.org/InStock",
          "url": "https://kashigo.in/book",
          "offers": BOAT_RIDES.map((r) => ({
            "@type": "Offer",
            "name": r.name,
            "description": r.summary,
            "price": String(boatPrice(r.id)),
            "priceCurrency": "INR",
            "availability": "https://schema.org/InStock",
            "url": `https://kashigo.in${ridePagePath(r.id)}`
          }))
        }
      }} />
      <PageHero
        eyebrow="Now operating · private boats"
        title="Book a Varanasi"
        highlight="Boat Ride"
        deva="नाव"
        intro={<p><strong className="font-semibold text-white">Pay a genuine price for comfort.</strong> One fixed price per boat — no haggling.</p>}
      >
        <ul className="flex flex-wrap gap-2 text-xs font-semibold">
          <li className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-white/85 backdrop-blur-md"><BadgeIndianRupee size={14} className="text-marigold" />Fixed price</li>
          <li className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-white/85 backdrop-blur-md"><Sailboat size={14} className="text-ganga" />Private boat</li>
          <li><a href={`tel:${BOOKING_PHONE.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-white/85 backdrop-blur-md transition-colors hover:border-marigold hover:text-marigold"><Phone size={14} className="text-marigold" />{BOOKING_PHONE}</a></li>
        </ul>
      </PageHero>

      <div id="booking" className="relative max-w-3xl mx-auto px-4 -mt-6 md:-mt-10 scroll-mt-24">
        <BookingFlow />
      </div>

      <section className="max-w-3xl mx-auto px-4 mt-16 md:mt-20 scroll-mt-24" id="prices" aria-labelledby="prices-h">
        <Eyebrow className="text-fire">Price list</Eyebrow>
        <h2 id="prices-h" className={`${H2_LIGHT} mt-3 mb-6 text-3xl md:text-[2.75rem]`}>Varanasi boat ride prices <em className="text-fire-deep pr-1">(private boat, 2026)</em></h2>
        <div className={`${PAPER_CARD} overflow-x-auto`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-night/10 font-mono text-[11px] uppercase tracking-[0.2em] text-night/45">
              <tr><th className="p-3 sm:p-4 font-medium">Ride</th><th className="py-3 px-1 sm:p-4 font-medium">Starts</th><th className="p-3 sm:p-4 font-medium text-right">Price</th></tr>
            </thead>
            <tbody>
              {BOAT_RIDES.map((r) => (
                <tr key={r.id} className="border-t border-night/[0.07] align-top transition-colors hover:bg-parchment-2/50">
                  <td className="p-3 sm:p-4"><Link href={ridePagePath(r.id)} className="font-display text-base sm:text-lg leading-tight text-night underline decoration-marigold/60 decoration-1 underline-offset-4 hover:text-fire">{r.name}</Link><p className="mt-1 text-night/55">{r.summary}</p></td>
                  <td className="py-3 px-1 sm:p-4 whitespace-nowrap text-night/70">{r.time}</td>
                  <td className="p-3 sm:p-4 whitespace-nowrap text-right font-display text-lg sm:text-xl text-night">{inr(boatPrice(r.id))}</td>
                </tr>
              ))}
              <tr className="border-t border-night/[0.07] align-top transition-colors hover:bg-parchment-2/50">
                <td className="p-3 sm:p-4"><Link href={ridePagePath("custom")} className="font-display text-base sm:text-lg leading-tight text-night underline decoration-marigold/60 decoration-1 underline-offset-4 hover:text-fire">{CUSTOM_RIDE.name}</Link><p className="mt-1 text-night/55">{CUSTOM_RIDE.summary}</p></td>
                <td className="py-3 px-1 sm:p-4 text-night/70">Any time</td>
                <td className="p-3 sm:p-4 whitespace-nowrap text-right font-display text-lg sm:text-xl text-night">{inr(BOAT_PRICES_INR.custom)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-night/55 mt-4">Price is for the whole private boat and includes 2 passengers — each extra passenger is ₹350. Book today or up to a week ahead. Dates further out? Call us. <Link href="/policies" className="underline decoration-night/25 underline-offset-2 hover:text-night">Booking &amp; refund policy</Link>.</p>
      </section>

      {/* Boat-ride story, relocated from the old homepage */}
      <FAQSection />
    </div>
  );
}

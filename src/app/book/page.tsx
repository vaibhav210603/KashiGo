import type { Metadata } from "next";
import BookingFlow from "@/components/booking/BookingFlow";
import { LifeBuoy, BadgeIndianRupee, Phone } from "lucide-react";
import FAQSection from "@/components/sections/FAQSection";
import { JsonLd } from "@/components/JsonLd";
import { BOAT_RIDES, BOAT_PRICE_RANGE, CUSTOM_RIDE, boatPrice, inr, BOOKING_PHONE } from "@/lib/boatRides";
import { BOAT_PRICES_INR } from "@/lib/boatPrices";
import Link from "next/link";
import { ridePagePath } from "@/lib/ridePages";

export const metadata: Metadata = {
  title: { absolute: "Book Varanasi Boat Ride — Sunrise, Ganga Aarti & Sunset | KashiGo" },
  description:
    "Book your Varanasi boat ride online in seconds. Sunrise on the Ganges, Ganga Aarti evening experience, sunset cruise. Fixed prices from ₹1,190 per private boat, trusted local boatmen, instant confirmation.",
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/40 to-white pt-20 pb-12">
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
      <div className="max-w-3xl mx-auto px-4 pt-4 pb-5">
        <p className="text-sm font-semibold text-teal-700">Now operating · private boats</p>
        <h1 className="mt-1 font-heading font-bold text-3xl sm:text-4xl text-slate-900">Book a Varanasi Boat Ride</h1>
        <p className="mt-2 text-slate-700"><strong className="font-semibold">Pay a genuine price for comfort.</strong> One fixed price per boat — no haggling.</p>
        <ul className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
          <li className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-slate-700"><BadgeIndianRupee size={14} className="text-orange-500" />Fixed price</li>
          <li className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-slate-700"><LifeBuoy size={14} className="text-teal-600" />Life jackets</li>
          <li><a href={`tel:${BOOKING_PHONE.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-slate-700"><Phone size={14} className="text-pink-500" />{BOOKING_PHONE}</a></li>
        </ul>
      </div>

      <div id="booking" className="max-w-3xl mx-auto px-4">
        <BookingFlow />
      </div>

      <section className="max-w-3xl mx-auto px-4 mt-4 scroll-mt-20" id="prices" aria-labelledby="prices-h">
        <h2 id="prices-h" className="text-2xl md:text-3xl font-bold font-heading text-slate-900 mb-4">Varanasi boat ride prices (private boat, 2026)</h2>
        <div className="overflow-x-auto rounded-3xl border border-slate-200/70 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr><th className="p-3">Ride</th><th className="p-3">Starts</th><th className="p-3">Price</th></tr>
            </thead>
            <tbody>
              {BOAT_RIDES.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 align-top">
                  <td className="p-3"><Link href={ridePagePath(r.id)} className="font-semibold text-slate-900 underline decoration-orange-300 underline-offset-2 hover:text-orange-600">{r.name}</Link><p className="text-slate-500">{r.summary}</p></td>
                  <td className="p-3 whitespace-nowrap text-slate-700">{r.time}</td>
                  <td className="p-3 whitespace-nowrap font-bold text-slate-900">{inr(boatPrice(r.id))}</td>
                </tr>
              ))}
              <tr className="border-t border-slate-100 align-top">
                <td className="p-3"><Link href={ridePagePath("custom")} className="font-semibold text-slate-900 underline decoration-orange-300 underline-offset-2 hover:text-orange-600">{CUSTOM_RIDE.name}</Link><p className="text-slate-500">{CUSTOM_RIDE.summary}</p></td>
                <td className="p-3 text-slate-700">Any time</td>
                <td className="p-3 whitespace-nowrap font-bold text-slate-900">{inr(BOAT_PRICES_INR.custom)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 mt-3">Price is for the whole private boat, not per person. Book today or up to a week ahead. Dates further out? Call us.</p>
      </section>

      {/* Boat-ride story, relocated from the old homepage */}
      <FAQSection />
    </div>
  );
}

import type { Metadata } from "next";
import BookingWizard from "@/components/booking/BookingWizard";
import PackagesSection from "@/components/sections/PackagesSection";
import ReviewsSection from "@/components/sections/ReviewsSection";
import FAQSection from "@/components/sections/FAQSection";
import { JsonLd } from "@/components/JsonLd";
import { BOAT_RIDES, BOAT_PRICE_RANGE, CUSTOM_RIDE, boatPrice, inr, BOOKING_PHONE } from "@/lib/boatRides";
import { BOAT_PRICES_INR } from "@/lib/boatPrices";

export const metadata: Metadata = {
  title: "Book Varanasi Boat Ride — Sunrise, Ganga Aarti & Sunset | KashiGo",
  description:
    "Book your Varanasi boat ride online in seconds. Sunrise on the Ganges, Ganga Aarti evening experience, sunset cruise. Fixed prices from ₹1,013 per private boat, trusted local boatmen, instant confirmation.",
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
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
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
            "url": "https://kashigo.in/book"
          }))
        }
      }} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Now operating on the ghats of Varanasi</p>
        <h1 className="text-3xl md:text-5xl font-bold font-heading text-slate-900 mt-3">Book a Varanasi Boat Ride</h1>
        <p className="text-xl md:text-2xl font-cursive text-orange-500 mt-2">Pay a genuine price for comfort</p>
        <p className="text-slate-600 mt-4 leading-relaxed max-w-2xl mx-auto">
          Private boats on the Ganges with trusted local boatmen — sunrise, Ganga Aarti, sunset and custom rides. One fixed price per boat,
          shown up front, no haggling on the ghat steps. Pay online (UPI, cards, PayPal) or pay at the ghat. Questions? Call us on {BOOKING_PHONE}.
        </p>
      </div>

      <div id="booking" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <BookingWizard />
      </div>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12" aria-labelledby="prices">
        <h2 id="prices" className="text-2xl md:text-3xl font-bold font-heading text-slate-900 mb-4">Varanasi boat ride prices (private boat, 2026)</h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr><th className="p-3">Ride</th><th className="p-3">Starts</th><th className="p-3">Price</th></tr>
            </thead>
            <tbody>
              {BOAT_RIDES.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 align-top">
                  <td className="p-3"><p className="font-semibold text-slate-900">{r.name}</p><p className="text-slate-500">{r.summary}</p></td>
                  <td className="p-3 whitespace-nowrap text-slate-700">{r.time}</td>
                  <td className="p-3 whitespace-nowrap font-bold text-slate-900">{inr(boatPrice(r.id))}</td>
                </tr>
              ))}
              <tr className="border-t border-slate-100 align-top">
                <td className="p-3"><p className="font-semibold text-slate-900">{CUSTOM_RIDE.name}</p><p className="text-slate-500">{CUSTOM_RIDE.summary}</p></td>
                <td className="p-3 text-slate-700">Any time</td>
                <td className="p-3 whitespace-nowrap font-bold text-slate-900">{inr(BOAT_PRICES_INR.custom)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 mt-3">Price is for the whole private boat, not per person. Book today or up to a week ahead.</p>
      </section>

      {/* Boat-ride story, relocated from the old homepage */}
      <PackagesSection />
      <ReviewsSection />
      <FAQSection />
    </div>
  );
}

import type { Metadata } from "next";
import BookingWizard from "@/components/booking/BookingWizard";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Book Varanasi Boat Ride — Sunrise, Ganga Aarti & Sunset | KashiGo",
  description:
    "Book your Varanasi boat ride online in seconds. Sunrise on the Ganges, Ganga Aarti evening experience, sunset cruise. Fair prices, local boatmen, instant confirmation.",
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
          "lowPrice": "600",
          "highPrice": "2000",
          "availability": "https://schema.org/InStock"
        }
      }} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <BookingWizard />
      </div>
    </div>
  );
}

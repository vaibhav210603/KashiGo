import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import Hero from "@/components/home/Hero";
import RideRail from "@/components/home/RideRail";
import WhyKashiGo from "@/components/home/WhyKashiGo";
import HowItWorks from "@/components/home/HowItWorks";
import ShopShelf from "@/components/home/ShopShelf";
import CheatSheetSignup from "@/components/home/CheatSheetSignup";
import FAQSection from "@/components/sections/FAQSection";
import { BOAT_RIDES, BOAT_PRICE_RANGE, boatPrice, inr } from "@/lib/boatRides";
import { BOAT_PRICES_INR } from "@/lib/boatPrices";

export const metadata: Metadata = {
  title: "KashiGo — Book Varanasi Boat Rides Online | Sunrise, Ganga Aarti & Sunset",
  description:
    "Book a private Varanasi boat ride online — sunrise, Ganga Aarti and sunset on the Ganges with trusted local boatmen and life jackets. Fixed prices from ₹990 per boat, no haggling. Plus scam-free guides by a local.",
  keywords: [
    "Varanasi boat ride booking",
    "Ganga Aarti boat ride Varanasi",
    "Varanasi travel guide foreigners",
    "Varanasi scam free guide",
    "Varanasi sunrise boat ride",
    "things to do Varanasi foreigners",
    "KashiGo Varanasi",
    "Varanasi local guide",
    "book boat Varanasi online",
  ],
  alternates: {
    canonical: "https://kashigo.in",
  },
  openGraph: {
    title: "KashiGo — Varanasi Boat Rides & Local Travel Guide",
    description:
      "Book Varanasi boat rides in seconds. Get the #1 scam-free travel guide for foreigners — written by a local born here.",
    url: "https://kashigo.in",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function Home() {
  return (
    <div className="w-full flex flex-col">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "KashiGo",
        "description": "Varanasi boat ride bookings and scam-free travel guide for foreign tourists visiting Varanasi, India",
        "url": "https://kashigo.in",
        "logo": "https://kashigo.in/icon-512.png",
        "image": "https://kashigo.in/og-image.jpg",
        "priceRange": "₹₹",
        "telephone": "+91-8175966910",
        "slogan": "Pay a genuine price for comfort",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Varanasi",
          "addressRegion": "Uttar Pradesh",
          "postalCode": "221001",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "25.3176",
          "longitude": "82.9739"
        },
        "email": "info.kashigo@gmail.com",
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer support",
          "email": "info.kashigo@gmail.com",
          "availableLanguage": ["English", "Hindi"]
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
          "opens": "04:00",
          "closes": "21:00"
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Varanasi boat rides",
          "itemListElement": BOAT_RIDES.map((r) => ({
            "@type": "Offer",
            "price": String(boatPrice(r.id)),
            "priceCurrency": "INR",
            "availability": "https://schema.org/InStock",
            "url": "https://kashigo.in/book",
            "itemOffered": {
              "@type": "Service",
              "name": `${r.name} — Varanasi`,
              "description": r.summary,
              "areaServed": "Varanasi"
            }
          }))
        }
      }} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How much does a boat ride in Varanasi cost?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `KashiGo's fixed online prices for a private boat in Varanasi are ${inr(BOAT_PRICES_INR.p1)} for the sunrise ride, ${inr(BOAT_PRICES_INR.p5)} for the evening Ganga Aarti ride at Dashashwamedh and ${inr(BOAT_PRICES_INR.p6)} for sunset (all rides ${inr(BOAT_PRICE_RANGE.low)}–${inr(BOAT_PRICE_RANGE.high)}), with a vetted boatman and life jackets. Bargained on the ghat steps, a private boat usually costs ₹800–₹2,000, and shared boats are ₹100–₹400 per person. Book at kashigo.in/book.`
            }
          },
          {
            "@type": "Question",
            "name": "How do I book a boat ride in Varanasi online?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Book online through KashiGo at kashigo.in/book. Choose your ghat, date and ride (sunrise, Ganga Aarti, sunset, day tour or a custom route), then pay by UPI, card or PayPal — or pay at the ghat. You get a ride number and email confirmation instantly. You can also call +91 81759 66910."
            }
          },
          {
            "@type": "Question",
            "name": "What is the best time for a boat ride in Varanasi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The sunrise boat ride (5:00–6:30 AM) is the most magical — you see morning rituals, golden light on the ghats, and the city waking up. The evening Ganga Aarti boat ride (6:30–8:30 PM) is the most dramatic — you watch the fire ceremony from the river with a panoramic view. October to March is the best season for boat rides in Varanasi as the weather is cooler and the river level is safe."
            }
          },
          {
            "@type": "Question",
            "name": "How do I avoid boat ride scams in Varanasi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Common Varanasi boat scams include: being quoted 5–10x the fair price on the ghat steps, 'middlemen' adding hidden commissions, and price changes after the ride. To avoid scams: know the fair price before you go (₹800–₹1,500 for a private boat), agree on the price and duration before boarding, pay only at the end, and book through a verified service like KashiGo for fixed prices."
            }
          },
          {
            "@type": "Question",
            "name": "Is Varanasi safe for foreign tourists?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, Varanasi is generally safe for foreign tourists. The main risks are scams, not safety — touts at ghats, overpriced boat rides, and fake guides. Stick to busy ghats during the day, avoid following strangers off the main paths at night, and book services in advance through trusted local operators. Solo female travelers can visit safely with standard precautions."
            }
          }
        ]
      }} />
      {/* Order = what most visitors came for, then highest value: book a boat → trust → guides */}
      <Hero />
      <RideRail />
      <WhyKashiGo />
      <HowItWorks />
      <ShopShelf />
      <FAQSection />
      <CheatSheetSignup />
    </div>
  );
}

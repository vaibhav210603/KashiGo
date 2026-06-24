import type { Metadata } from "next";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import PackagesSection from "@/components/sections/PackagesSection";
import ReviewsSection from "@/components/sections/ReviewsSection";
import GuideFeatureSection from "@/components/sections/GuideFeatureSection";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "KashiGo — Varanasi Boat Rides & Local Travel Guide",
  description:
    "Book your Varanasi boat ride in seconds. Sunrise, Ganga Aarti, and sunset experiences. Get the #1 scam-free travel guide written by a local born in the city.",
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
          "name": "KashiGo Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Varanasi Sunrise Boat Ride",
                "description": "Private boat ride on the Ganges at sunrise — watch Varanasi awaken from the water"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Ganga Aarti Boat Ride Varanasi",
                "description": "Evening Ganga Aarti experience from a floating boat — panoramic view of the fire ceremony"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Varanasi Sunset Boat Cruise",
                "description": "Golden hour on the Ganges — a serene sunset cruise past the ancient ghats of Varanasi"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "Varanasi Travel Guide for Foreigners 2026",
                "description": "Complete scam-free Varanasi guide for international visitors — all 84 ghats, 9 scam shields, 2-day itinerary"
              }
            }
          ]
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
              "text": "A private boat ride in Varanasi costs between ₹800–₹2,000 depending on the experience. Sunrise boat rides cost ₹800–₹1,500 for a private boat (up to 4 people). Evening Ganga Aarti boat rides cost ₹1,200–₹2,000 because boats must arrive early to secure a good spot. Shared boats are available for ₹100–₹400 per person. KashiGo offers fixed, fair prices with no ghat-side haggling."
            }
          },
          {
            "@type": "Question",
            "name": "How do I book a boat ride in Varanasi online?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can book a Varanasi boat ride online through KashiGo at kashigo.in/book. Select your experience (sunrise, Ganga Aarti, or sunset), pick your date and group size, and receive instant confirmation. KashiGo uses verified local boatmen and provides fixed, scam-free pricing."
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
      <HeroSection />
      <AboutSection />
      <PackagesSection />
      <ReviewsSection />
      <GuideFeatureSection />
    </div>
  );
}

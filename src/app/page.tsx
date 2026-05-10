import type { Metadata } from "next";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import PackagesSection from "@/components/sections/PackagesSection";
import ReviewsSection from "@/components/sections/ReviewsSection";
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
        "priceRange": "$$",
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
        "telephone": "+910000000000",
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
                "description": "Private boat ride on the Ganges at sunrise — watch Varanasi awaken"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Ganga Aarti Boat Ride",
                "description": "Evening Ganga Aarti experience from a floating boat — panoramic view of the fire ceremony"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "Varanasi Travel Guide for Foreigners 2026",
                "description": "Complete scam-free Varanasi guide for international visitors"
              }
            }
          ]
        }
      }} />
      <HeroSection />
      <AboutSection />
      <PackagesSection />
      <ReviewsSection />
    </div>
  );
}

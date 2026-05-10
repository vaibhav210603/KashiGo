import type { Metadata } from "next";
import GuideClient from "./GuideClient";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Varanasi Travel Guide for Foreigners 2026 — Written by a Local",
  description:
    "Complete Varanasi travel guide written by a local born in the city. 9 scam shields, all 84 ghats, temple etiquette, food safety, dos & don'ts, 2-day itinerary. $10.39.",
  keywords: [
    "Varanasi travel guide foreigners 2026",
    "Varanasi scam guide tourists",
    "Varanasi travel tips foreigners",
    "Varanasi ebook guide foreigners",
    "how to avoid scams Varanasi",
    "Varanasi dos and donts foreigners",
    "is Varanasi safe foreigners",
    "Varanasi first timer guide",
    "Varanasi local guide written by local",
  ],
  alternates: {
    canonical: "https://kashigo.in/guide",
  },
  openGraph: {
    title: "Varanasi Travel Guide for Foreigners 2026 — Written by a Local",
    description:
      "Don't get scammed in Varanasi. 9 scam shields, ghat guide, temple etiquette, food safety — written by someone born here. $10.39.",
    url: "https://kashigo.in/guide",
    images: [{ url: "/og-guide.jpg", width: 1200, height: 630 }],
    type: "website",
  },
};

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col font-sans overflow-hidden">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Varanasi Travel Guide for Foreigners 2026",
        "description": "Complete scam-free Varanasi travel guide written by a local born in the city. Covers 9 scam shields, all 84 ghats, temple etiquette, food safety, dos and don'ts, 2-day itinerary.",
        "image": "https://kashigo.in/og-guide.jpg",
        "sku": "KASHI-GUIDE-2026",
        "brand": {
          "@type": "Brand",
          "name": "KashiGo"
        },
        "author": {
          "@type": "Person",
          "name": "KashiGo",
          "url": "https://kashigo.in"
        },
        "publisher": {
          "@type": "Organization",
          "name": "KashiGo",
          "url": "https://kashigo.in"
        },
        "inLanguage": "en",
        "offers": {
          "@type": "Offer",
          "url": "https://kashigo.in/guide",
          "priceCurrency": "USD",
          "price": "10.39",
          "priceValidUntil": "2026-12-31",
          "availability": "https://schema.org/InStock",
          "itemCondition": "https://schema.org/NewCondition",
          "seller": {
            "@type": "Organization",
            "name": "KashiGo"
          }
        }
      }} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is Varanasi safe for foreign tourists?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Varanasi is generally safe but has a high concentration of tourist scams including fake guides, boat ride pricing inflation, fake holy men demanding payment, and ATM skimming. The KashiGo Varanasi Travel Guide covers all 9 major scams with exact scripts to avoid them."
            }
          },
          {
            "@type": "Question",
            "name": "What is the price for a boat ride in Varanasi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "A private boat for 2-6 people costs INR 600-1,500 for 1.5-2 hours. Shared public boats cost INR 30-100 per person. Always fix the price before boarding — foreigners are routinely overcharged. Book through KashiGo for guaranteed fair pricing."
            }
          },
          {
            "@type": "Question",
            "name": "What time is the Ganga Aarti in Varanasi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The Ganga Aarti at Dashashwamedh Ghat starts at approximately 6:00-7:30 PM and shifts seasonally. Arrive by 5:30 PM for a standing spot, or book a KashiGo boat for the best floating panoramic view."
            }
          },
          {
            "@type": "Question",
            "name": "What are the biggest scams in Varanasi for foreigners?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The 9 major scams are: fake guide commission trips, boat ride price inflation on water, fake holy man blessings, wood donation scams at Manikarnika Ghat, silk shop commission traps, taxi overcharging, fake government tourist offices, stranded traveler stories, and ATM skimming. The KashiGo guide covers all of them."
            }
          },
          {
            "@type": "Question",
            "name": "Do I need a guide in Varanasi as a foreigner?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Not mandatory but strongly recommended for first-timers. The narrow galis are disorienting and cultural context is much richer with local knowledge. The KashiGo Varanasi guide gives you everything a local guide would tell you — for $10.39."
            }
          },
          {
            "@type": "Question",
            "name": "What is the best time to visit Varanasi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "October to February is the best time to visit Varanasi — cool weather (10-25°C), peak festival season including Dev Deepawali, and the most atmospheric ghat experience. Avoid July-September (monsoon, possible flooding)."
            }
          }
        ]
      }} />
      <GuideClient />
    </main>
  );
}

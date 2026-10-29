import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { PUJAS } from "@/lib/pujas";
import PujaClient from "./PujaClient";

export const metadata: Metadata = {
  title: { absolute: "Puja & Yajna in Varanasi — Rudrabhishek, Lakshmi Puja, Pind Daan | KashiGo" },
  description:
    "Have a puja or yajna performed in Kashi by learned acharyas — in person at the ghats, live on video from anywhere, or on your behalf. Rudrabhishek, Deepavali Lakshmi Puja, Maha Mrityunjaya Jaap, Pind Daan and more, with the dakshina agreed in writing.",
  alternates: { canonical: "https://kashigo.in/puja" },
  openGraph: {
    title: "Puja & Yajna in Kashi | KashiGo",
    description: "Rites of the oldest city, performed by learned acharyas — in person, live from anywhere, or on your behalf.",
    url: "https://kashigo.in/puja",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function PujaPage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Puja & Yajna in Varanasi",
        "url": "https://kashigo.in/puja",
        "itemListElement": PUJAS.map((p, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "item": {
            "@type": "Service",
            "name": p.name,
            "description": p.purpose,
            "areaServed": "Varanasi",
            "provider": { "@type": "Organization", "name": "KashiGo", "url": "https://kashigo.in" },
            "offers": { "@type": "Offer", "price": p.dakshina, "priceCurrency": "INR" },
          },
        })),
      }} />
      <PujaClient />
    </>
  );
}

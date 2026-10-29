import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { SERVICES } from "@/lib/services";
import ServicesClient from "./ServicesClient";

export const metadata: Metadata = {
  title: { absolute: "VIP Darshan, Puja & Private Tours in Varanasi — KashiGo Services" },
  description:
    "Beyond the boat: assured VIP darshan at Kashi Vishwanath, puja and yajna by learned acharyas, Varanasi's hidden gems, and a peaceful, crowd-free Kashi — one honest price in writing.",
  alternates: { canonical: "https://kashigo.in/services" },
  openGraph: {
    title: "KashiGo Services — Kashi, beyond the boat",
    description: "VIP darshan, puja & yajna, hidden gems and a crowd-free Kashi — arranged by a local.",
    url: "https://kashigo.in/services",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "KashiGo services in Varanasi",
        "url": "https://kashigo.in/services",
        "itemListElement": SERVICES.map((s, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "item": { "@type": "Service", "name": s.name, "description": s.tagline, "areaServed": "Varanasi", "provider": { "@type": "Organization", "name": "KashiGo", "url": "https://kashigo.in" } },
        })),
      }} />
      <ServicesClient />
    </>
  );
}

import type { Metadata } from "next";
import ShopClient from "./ShopClient";
import { JsonLd } from "@/components/JsonLd";
import { SHOP_PRODUCTS } from "@/lib/products";

export const metadata: Metadata = {
  title: "Varanasi & India Travel Ebooks and Audio Tours — KashiGo Shop",
  description:
    "Instant-download travel guides written by a Varanasi local: India Scam-Proof, Kashi Unveiled, the Walk the Ghats audio tour and the Varanasi Insider Guide. Bundle and save.",
  keywords: [
    "Varanasi audio tour",
    "Varanasi self guided walking tour",
    "India travel scams ebook",
    "India travel guide ebook 2026",
    "Varanasi spiritual guide",
    "Varanasi ebook",
  ],
  alternates: { canonical: "https://kashigo.in/shop" },
  openGraph: {
    title: "KashiGo Shop — Guides written by a Varanasi local",
    description: "Ebooks and audio tours for India and Varanasi. Instant download.",
    url: "https://kashigo.in/shop",
    images: [{ url: "/shop/complete-bundle.jpg", width: 2400, height: 1600 }],
    type: "website",
  },
};

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col font-sans overflow-hidden">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: SHOP_PRODUCTS.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Product",
              name: p.name,
              description: p.tagline,
              image: `https://kashigo.in${p.cover}`,
              brand: { "@type": "Brand", name: "KashiGo" },
              offers: {
                "@type": "Offer",
                price: p.usd,
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
                url: `https://kashigo.in/shop#${p.id}`,
              },
            },
          })),
        }}
      />
      <ShopClient />
    </main>
  );
}

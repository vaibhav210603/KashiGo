import type { Metadata } from "next";
import ProductLanding from "@/components/shop/ProductLanding";
import { JsonLd } from "@/components/JsonLd";
import { productListSchema } from "@/lib/productSchema";

export const metadata: Metadata = {
  title: "India & Varanasi Travel Ebooks — Instant PDF + EPUB Download",
  description:
    "Travel ebooks written by a Varanasi local: India Scam-Proof (every tourist scam and the real prices), Kashi Unveiled (the spiritual guide to Varanasi) and the Varanasi Insider Guide 2026. PDF + EPUB for Kindle and Apple Books.",
  keywords: [
    "India travel ebook",
    "Varanasi ebook",
    "India scams ebook",
    "Varanasi travel guide PDF",
    "Varanasi spiritual guide book",
    "India travel guide 2026 Kindle",
  ],
  alternates: { canonical: "https://kashigo.in/ebooks" },
  openGraph: {
    title: "Travel ebooks by a Varanasi local — KashiGo",
    description: "India Scam-Proof, Kashi Unveiled and the Varanasi Insider Guide. Instant PDF + EPUB download.",
    url: "https://kashigo.in/ebooks",
    images: [{ url: "/shop/india-scam-proof.jpg" }],
    type: "website",
  },
};

const faqs = [
  { q: "What format are the ebooks?", a: "Every ebook comes as a PDF (opens on any phone, tablet or computer) and an EPUB for Kindle (via Send to Kindle) and Apple Books." },
  { q: "How do I get my ebook after paying?", a: "Download links appear on screen the moment your payment goes through, and we email them to you as well — so you can download again later." },
  { q: "Do they work offline in India?", a: "Yes. Save the files to your phone before you fly and they work without signal — handy on trains, at the ghats and in temples." },
  { q: "Which one should I buy?", a: "First trip to India: India Scam-Proof. Going to Varanasi for the rituals and temples: Kashi Unveiled. Want everything, including the audio tour and audiobook: the Complete Varanasi Bundle saves over 50%." },
  { q: "Can I get a refund?", a: "Yes — if it isn't useful, reply to your receipt email within 7 days for a full refund." },
];

export default function EbooksPage() {
  return (
    <main className="min-h-screen bg-parchment flex flex-col font-sans overflow-hidden">
      <JsonLd data={productListSchema(["india-scam-proof", "kashi-unveiled", "complete-bundle"], "https://kashigo.in/ebooks")} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }} />
      <ProductLanding
        eyebrow="KashiGo ebooks · Instant download"
        title="Read it before you land."
        highlight="Travel ebooks by a Varanasi local."
        intro="Real prices, every common scam and the meaning behind the rituals you'll see — written by someone born on the ghats. PDF + EPUB, ready for your phone or Kindle."
        productIds={["india-scam-proof", "kashi-unveiled"]}
        linkedProduct={{
          name: "Varanasi Insider Guide 2026",
          tagline: "The practical playbook for Varanasi — prices, scams, ghats, food and a local's itinerary.",
          cover: "/VARANASi.png",
          href: "/guide",
          inr: 999,
          usd: 14.99,
          bullets: ["All 84 ghats, explained", "9 Varanasi scam shields with the real prices", "A local's 2-day itinerary"],
          format: "Ebook · PDF",
        }}
        video={{ src: "/ebook_video_optimized.mp4", poster: "/og-guide.jpg", heading: "A look inside" }}
        faqs={faqs}
        deva="पुस्तक"
        otherPage={{ href: "/audiobooks", label: "Prefer to listen? See the audiobooks" }}
      />
    </main>
  );
}

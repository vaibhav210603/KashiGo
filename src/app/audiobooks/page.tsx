import type { Metadata } from "next";
import ProductLanding from "@/components/shop/ProductLanding";
import { JsonLd } from "@/components/JsonLd";
import { productListSchema } from "@/lib/productSchema";

export const metadata: Metadata = {
  title: "Varanasi Audio Tour & India Travel Audiobook — MP3 Download",
  description:
    "Walk the Ghats: a 90-minute self-guided audio tour of Varanasi from Assi to Manikarnika, and the India Scam-Proof audiobook (2.5 hours). MP3s that work offline on any phone.",
  keywords: [
    "Varanasi audio tour",
    "Varanasi self guided walking tour",
    "Varanasi ghats audio guide",
    "India travel audiobook",
    "India scams audiobook",
  ],
  alternates: { canonical: "https://kashigo.in/audiobooks" },
  openGraph: {
    title: "Varanasi audio tour & India travel audiobook — KashiGo",
    description: "Self-guided ghat audio tour and the India Scam-Proof audiobook. Instant MP3 download.",
    url: "https://kashigo.in/audiobooks",
    images: [{ url: "/shop/walk-the-ghats.jpg" }],
    type: "website",
  },
};

const faqs = [
  { q: "How does the Walk the Ghats audio tour work?", a: "Start at Assi Ghat and press play. 20 tracks guide you stop by stop along 3.5 km of riverfront to Manikarnika, with a printable route card. It also works as an armchair audiobook at home." },
  { q: "What do I download?", a: "A ZIP of MP3 files (plus a PDF route card for the audio tour). On a phone, open the ZIP in the Files app; on a computer, unzip and copy the MP3s to your phone." },
  { q: "Do I need internet while listening?", a: "No. Download before you go and the audio plays offline — no app or data needed." },
  { q: "Is the audiobook the full India Scam-Proof ebook?", a: "Yes — every chapter, unabridged, in 17 MP3 chapters (about 2.5 hours). It is AI-narrated." },
  { q: "Can I get a refund?", a: "Yes — if it isn't useful, reply to your receipt email within 7 days for a full refund." },
];

export default function AudiobooksPage() {
  return (
    <main className="min-h-screen bg-parchment flex flex-col font-sans overflow-hidden">
      <JsonLd data={productListSchema(["walk-the-ghats", "scam-proof-audiobook", "complete-bundle"], "https://kashigo.in/audiobooks")} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }} />
      <ProductLanding
        eyebrow="KashiGo audio · Instant MP3 download"
        title="Press play on Varanasi."
        highlight="Audio tours & audiobooks."
        intro="Let a local walk you along the ghats story by story, or listen to the full India Scam-Proof field manual on the flight over. Works offline on any phone."
        productIds={["walk-the-ghats", "scam-proof-audiobook"]}
        faqs={faqs}
        deva="श्रवण"
        otherPage={{ href: "/ebooks", label: "Prefer to read? See the ebooks" }}
      />
    </main>
  );
}

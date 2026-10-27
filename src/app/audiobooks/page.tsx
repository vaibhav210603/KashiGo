import type { Metadata } from "next";
import { Headphones, Smartphone, MapPin } from "lucide-react";
import ProductLanding from "@/components/shop/ProductLanding";
import { JsonLd } from "@/components/JsonLd";
import { productListSchema } from "@/lib/productSchema";
import { Eyebrow } from "@/components/motion/primitives";
import { H2_LIGHT } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "Varanasi Audio Tour & India Travel Audiobook — Free Sample, MP3 + M4B",
  description:
    "Walk the Ghats: a 90-minute self-guided audio tour of Varanasi from Assi to Manikarnika, and the India Scam-Proof audiobook (2.5 hours). Listen to a free sample. MP3s and a chaptered M4B that work offline on any phone.",
  keywords: [
    "Varanasi audio tour",
    "Varanasi self guided walking tour",
    "Varanasi ghats audio guide",
    "Varanasi audio guide app",
    "India travel audiobook",
    "India scams audiobook",
  ],
  alternates: { canonical: "https://kashigo.in/audiobooks" },
  openGraph: {
    title: "Varanasi audio tour & India travel audiobook — KashiGo",
    description: "Self-guided ghat audio tour and the India Scam-Proof audiobook. Free sample, instant download, works offline.",
    url: "https://kashigo.in/audiobooks",
    images: [{ url: "/shop/walk-the-ghats.jpg" }],
    type: "website",
  },
};

const faqs = [
  { q: "Can I listen before I buy?", a: "Yes. Press play on either product above: the full Walk the Ghats trailer, or a 3-minute sample from India Scam-Proof. Tap the track count to see every chapter and its length." },
  { q: "How does the Walk the Ghats audio tour work?", a: "Start at Assi Ghat at sunrise, or around 3 pm to reach Dashashwamedh for the evening Ganga Aarti. Press play at each stop. 20 tracks guide you along 3.5 km of riverfront to Manikarnika and Panchganga, with a 62-page route card and script. Allow 2.5–3 hours. It also works as an armchair audiobook at home." },
  { q: "What exactly do I download?", a: "One M4B audiobook file with chapters and cover art (the easiest way to listen on a phone), a ZIP of the same audio as MP3s for any player with a short listening guide, and a PDF: the route card for the tour, or a quick-reference card of scripts, prices and emergency numbers for India Scam-Proof." },
  { q: "How do I play it on my phone?", a: "iPhone: download the M4B in Safari and open it in Apple Books or the free BookPlayer app. Android: download it and open it in a free audiobook app such as Smart AudioBook Player. Both remember where you stopped. Prefer MP3s? Open the ZIP in your Files app." },
  { q: "Do I need internet while listening?", a: "No. Download on Wi-Fi before you go and everything plays offline. You don't need an app account or mobile data." },
  { q: "Is the audiobook the full India Scam-Proof ebook?", a: "Yes. It is every chapter, unabridged, in 17 chapters (about 2.5 hours). It is AI-narrated. The tables and Hindi phrases are also in the quick-reference PDF, so you can see them as well as hear them." },
  { q: "Can I get a refund?", a: "Yes. If it isn't useful, reply to your receipt email within 7 days for a full refund." },
];

const steps = [
  { Icon: Headphones, t: "Listen first", d: "Play the free sample right here. No email or sign-up needed." },
  { Icon: Smartphone, t: "Save it to your phone", d: "One tap to download the chaptered M4B, or take the MP3s. We email the links too." },
  { Icon: MapPin, t: "Press play in India", d: "Works offline on the ghats, on the train or in the air, and remembers where you stopped." },
];

const HowToListen = (
  <div className="pt-16">
    <Eyebrow className="text-fire">How it works</Eyebrow>
    <h2 className={`${H2_LIGHT} mt-3 text-4xl md:text-5xl`}>From checkout to <em className="text-fire-deep pr-1">the ghats</em></h2>
    <ol className="mt-8 grid gap-5 sm:grid-cols-3">
      {steps.map(({ Icon, t, d }, i) => (
        <li key={t} className="rounded-[1.5rem] border border-night/10 bg-[#fffaf0] p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-night text-marigold"><Icon size={19} /></span>
            <span className="font-mono text-xs text-night/40">0{i + 1}</span>
          </div>
          <p className="mt-4 font-display text-xl text-night">{t}</p>
          <p className="mt-1 text-sm text-night/60">{d}</p>
        </li>
      ))}
    </ol>
  </div>
);

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
        eyebrow="KashiGo audio · Free sample · Instant download"
        title="Press play on Varanasi."
        highlight="Audio tours & audiobooks."
        intro="Let a local walk you along the ghats story by story, or listen to the full India Scam-Proof field manual on the flight over. Hear a sample before you buy. Everything works offline on any phone."
        productIds={["walk-the-ghats", "scam-proof-audiobook"]}
        faqs={faqs}
        deva="श्रवण"
        extra={HowToListen}
        otherPage={{ href: "/ebooks", label: "Prefer to read? See the ebooks" }}
      />
    </main>
  );
}

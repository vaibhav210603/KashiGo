"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { BOAT_PRICES_INR } from "@/lib/boatPrices";
import { inr } from "@/lib/boatRides";

const faqs = [
  {
    q: "How much does a boat ride in Varanasi cost?",
    a: `KashiGo's fixed prices for a private boat are ${inr(BOAT_PRICES_INR.p1)} for the sunrise ride, ${inr(BOAT_PRICES_INR.p5)} for the evening Ganga Aarti ride and ${inr(BOAT_PRICES_INR.p6)} for sunset — booked online, no ghat-side haggling. On the ghat steps a private boat usually goes for ₹800–₹2,000 after bargaining (first quotes to foreigners are often far higher), and shared boats are ₹100–₹400 per person. Pay a genuine price for comfort: a vetted boatman, life jackets and the price agreed before you board.`,
  },
  {
    q: "How do I book a Varanasi boat ride online?",
    a: "Book directly on KashiGo — select your experience (sunrise, Ganga Aarti, or sunset), pick your date and group size, and get instant confirmation. No middlemen, no negotiation on arrival.",
  },
  {
    q: "What is the best time for a boat ride in Varanasi?",
    a: "Sunrise (5:00–6:30 AM) is the most magical — the city waking up, morning rituals on the ghats, golden light. Evening Ganga Aarti (6:00–7:30 PM) is the most dramatic — watch the fire ceremony from the river. October to March is the best season overall.",
  },
  {
    q: "How do I avoid boat ride scams in Varanasi?",
    a: "Know the fair price before you go (₹800–₹1,500 for a private boat). Agree on price and duration before boarding. Never pay in full upfront. Avoid anyone who approaches you on the street offering to 'find a boatman' — they earn a 30–50% commission. Or simply book through KashiGo for a fixed, guaranteed price.",
  },
  {
    q: "Is Varanasi safe for foreign tourists?",
    a: "Yes. The main risks in Varanasi are scams, not physical danger. Stick to busy ghats, book services in advance through trusted operators, and know your prices. Solo female travelers visit safely every day with standard precautions.",
  },
  {
    q: "What is included in a KashiGo boat ride?",
    a: "A private hand-rowed wooden boat, a verified local boatman who has been rowing the Ganges for years, life jackets (rare in Varanasi), and a fixed pre-agreed price with no surprise charges at the end.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative bg-parchment py-20 md:py-28 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-32 self-start">
          <p className="ornament text-[11px] font-semibold uppercase tracking-[0.28em] text-fire">FAQ</p>
          <h2 className="mt-4 font-display font-light text-5xl sm:text-6xl leading-[0.95] tracking-[-0.03em] text-night">
            Questions travellers <em className="text-fire-deep pr-1">ask.</em>
          </h2>
          <p className="mt-6 text-night/60 max-w-sm">
            Still unsure? Call <a href="tel:+918175966910" className="font-semibold text-night underline decoration-marigold decoration-2 underline-offset-4 hover:text-fire">+91 81759 66910</a> or{" "}
            <Link href="/book" className="font-semibold text-night underline decoration-marigold decoration-2 underline-offset-4 hover:text-fire">book your ride</Link>.
          </p>
        </div>
        <div className="border-t border-night/15">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.q} className="border-b border-night/15">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group w-full flex items-start justify-between gap-6 py-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="flex gap-5">
                    <span className={`font-display italic text-lg pt-0.5 transition-colors ${isOpen ? "text-fire" : "text-night/30"}`}>0{i + 1}</span>
                    <span className={`font-display text-xl sm:text-2xl leading-snug transition-colors ${isOpen ? "text-night" : "text-night/80 group-hover:text-night"}`}>{faq.q}</span>
                  </span>
                  <span className={`relative mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${isOpen ? "rotate-45 border-transparent bg-night text-marigold" : "border-night/20 text-night group-hover:border-night"}`}>
                    <Plus size={18} />
                  </span>
                </button>
                {/* Always in the HTML (just collapsed) so search engines and AI crawlers can read every answer */}
                <div className="accordion" data-open={isOpen} aria-hidden={!isOpen}>
                  <div>
                    <p className="pb-7 pl-11 pr-14 text-night/65 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

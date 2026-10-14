"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
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
    <section id="faq" className="py-12 md:py-16 scroll-mt-16">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900">Questions travellers ask</h2>
        <div className="mt-6 divide-y divide-slate-200 rounded-3xl border border-slate-200/70 bg-white overflow-hidden">
          {faqs.map((faq, i) => (
            <div key={faq.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left min-h-14"
                aria-expanded={open === i}
              >
                <span className="font-semibold text-slate-900 leading-snug">{faq.q}</span>
                <ChevronDown size={20} className={`shrink-0 text-orange-500 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {/* Always in the HTML (just hidden) so search engines and AI crawlers can read every answer */}
              <div hidden={open !== i} className="px-5 pb-5 -mt-1 text-slate-600 leading-relaxed">
                {faq.a}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-slate-600">
          Still unsure? Call <a href="tel:+918175966910" className="font-semibold text-teal-700">+91 81759 66910</a> or{" "}
          <Link href="/book" className="font-semibold text-orange-600">book your ride</Link>.
        </p>
      </div>
    </section>
  );
}

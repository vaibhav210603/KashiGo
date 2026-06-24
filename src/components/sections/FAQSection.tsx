"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    q: "How much does a boat ride in Varanasi cost?",
    a: "A private boat for up to 4 people costs ₹800–₹1,500 for a sunrise ride and ₹1,200–₹2,000 for the evening Ganga Aarti ride. Shared boats are ₹100–₹400 per person. KashiGo offers fixed, pre-agreed prices — no ghat-side haggling.",
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
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-cursive text-orange-500 mb-3">FAQ</h2>
          <h3 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-4">
            Common Questions
          </h3>
          <p className="text-slate-500 text-base md:text-lg max-w-xl mx-auto">
            Everything foreigners ask before their first Varanasi boat ride.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={open === i}
              >
                <span className="font-semibold text-slate-900 text-base md:text-lg leading-snug">
                  {faq.q}
                </span>
                <ChevronDown
                  size={20}
                  className={`flex-shrink-0 text-orange-500 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-6 text-slate-600 text-base leading-relaxed border-t border-slate-100 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-slate-500 mb-4">Still have questions?</p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:-translate-y-0.5"
          >
            Book Your Boat Ride
          </Link>
        </div>

      </div>
    </section>
  );
}

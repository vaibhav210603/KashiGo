import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import PageHero from "@/components/layout/PageHero";
import { EXTRA_PASSENGER_INR, FREE_PASSENGERS } from "@/lib/boatPrices";
import { inr } from "@/lib/boatRides";

export const metadata: Metadata = {
  title: "Booking & Refund Policy",
  description: "How KashiGo boat-ride bookings, passengers, payments, changes, cancellations and refunds work.",
  alternates: { canonical: "https://kashigo.in/policies" },
};

const SECTIONS: { id: string; title: string; body: ReactNode[] }[] = [
  {
    id: "booking",
    title: "Booking and payment",
    body: [
      "Every boat ride is a private boat at the fixed price shown when you book. Prices are set by KashiGo and are not bargained on the ghat.",
      "You can pay in full online (UPI or an Indian card through Razorpay, or an international card through PayPal), or choose to pay at the ghat: a 50% advance is paid online to confirm the boat, and the rest is paid to your boatman in cash or UPI.",
      "Your booking is confirmed once you receive a ride number on screen and by email.",
    ],
  },
  {
    id: "passengers",
    title: "Passengers",
    body: [
      `The boat price includes ${FREE_PASSENGERS} passengers. Each passenger after that is ${inr(EXTRA_PASSENGER_INR)}, added to the total when you book.`,
      "Please book the number of people who will actually be on board. If more people arrive than were booked, the boatman may collect the extra-passenger charge at the ghat, or decline to carry more people than the boat can safely take.",
    ],
  },
  {
    id: "changes",
    title: "Changes and cancellations",
    body: [
      <>To change your date, time or starting ghat, call or WhatsApp <a href="tel:+918175966910" className="underline underline-offset-2">+91 81759 66910</a> or email <a href="mailto:support@kashigo.in" className="underline underline-offset-2">support@kashigo.in</a> with your ride number, as early as you can. We&apos;ll move your booking when a boat is available.</>,
      "If the river is closed to boats (high water, weather, or an order from local authorities) or we can't provide your ride for any other reason, we'll offer you another time or a refund as described below.",
    ],
  },
  {
    id: "guarantee",
    title: "100% money-back guarantee",
    body: [
      "If we can't provide the ride or service you booked, or it isn't what we promised — a private boat at the fixed price, the ride, date and time you booked — tell us within 7 days and we'll refund 100% of what you paid.",
      <>Call or WhatsApp <a href="tel:+918175966910" className="underline underline-offset-2">+91 81759 66910</a> or email <a href="mailto:support@kashigo.in" className="underline underline-offset-2">support@kashigo.in</a> with your ride or order number and what went wrong.</>,
    ],
  },
  {
    id: "refunds",
    title: "Refunds",
    body: [
      "Refunds are paid back as money to the way you paid: your UPI or Indian card through Razorpay, or your PayPal account or international card through PayPal. Your bank or PayPal usually shows it within 5–7 working days.",
      "If you'd rather keep the value for your next ride, you can ask for KashiGo coins instead (1 coin is worth ₹1). Coins can be used on any KashiGo boat ride or guide: log in with the same email at checkout and they are applied to your total. Your balance is shown on your account page.",
      "The refund is based on the amount you actually paid to KashiGo, after any discount code.",
    ],
  },
  {
    id: "digital",
    title: "Guides, ebooks and audio tours",
    body: [
      "Digital products are delivered instantly by download link and email. If a file doesn't work or you were charged twice, contact us and we'll fix it or refund it in full, as above.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    body: [
      <>KashiGo, Brahma Ghat, Varanasi. Phone <a href="tel:+918175966910" className="underline underline-offset-2">+91 81759 66910</a> · <a href="mailto:support@kashigo.in" className="underline underline-offset-2">support@kashigo.in</a>.</>,
    ],
  },
];

export default function PoliciesPage() {
  return (
    <div className="w-full flex flex-col bg-parchment">
      <PageHero eyebrow="Policies" title="Booking &" highlight="refund policy" compact
        intro={<p>How bookings, passengers, payments, changes and refunds work at KashiGo. Last updated 31 October 2026.</p>} />

      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <nav aria-label="On this page" className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-night/60">
          {SECTIONS.map((s) => <a key={s.id} href={`#${s.id}`} className="hover:text-fire">{s.title}</a>)}
        </nav>
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-28 mt-10">
            <h2 className="font-display text-2xl tracking-tight text-night">{s.title}</h2>
            <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-night/75">
              {s.body.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </section>
        ))}
        <p className="mt-12 text-sm text-night/50"><Link href="/book" className="underline underline-offset-2 hover:text-night">Book a boat ride</Link></p>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeIndianRupee, Clock, LifeBuoy, MapPin, Phone, Sparkles } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { BOAT_RIDES, CUSTOM_RIDE, BOOKING_PHONE, inr } from "@/lib/boatRides";
import { BOAT_PRICES_INR } from "@/lib/boatPrices";
import { RIDE_PAGES, ridePageBySlug, ridePageFor, ridePagePath, type RidePage, type RidePageId } from "@/lib/ridePages";

type PageProps = { params: Promise<{ slug: string }> };

const BASE = "https://kashigo.in";

function rideFacts(id: RidePageId) {
  if (id === "custom") return { name: CUSTOM_RIDE.name, short: CUSTOM_RIDE.short, summary: CUSTOM_RIDE.summary, image: CUSTOM_RIDE.image, time: "Any time", price: BOAT_PRICES_INR.custom };
  const r = BOAT_RIDES.find((x) => x.id === id)!;
  return { name: r.name, short: r.short, summary: r.summary, image: r.image, time: r.time, price: BOAT_PRICES_INR[id] };
}

const fill = (text: string, page: RidePage) =>
  text
    .replaceAll("{price}", inr(rideFacts(page.rideId).price))
    .replaceAll("{custom}", inr(BOAT_PRICES_INR.custom))
    .replaceAll("{phone}", BOOKING_PHONE);

export function generateStaticParams() {
  return RIDE_PAGES.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = ridePageBySlug(slug);
  if (!page) return {};
  const ride = rideFacts(page.rideId);
  const url = `${BASE}/boat-rides/${page.slug}`;
  const description = `${page.description} ${inr(ride.price)} per boat.`;
  return {
    title: { absolute: `${page.title} | KashiGo` },
    description,
    keywords: page.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: page.title,
      description,
      url,
      images: [{ url: ride.image, width: 1200, height: 630 }],
    },
  };
}

export default async function RidePageView({ params }: PageProps) {
  const { slug } = await params;
  const page = ridePageBySlug(slug);
  if (!page) notFound();

  const ride = rideFacts(page.rideId);
  const url = `${BASE}/boat-rides/${page.slug}`;
  const bookHref = `/book?ride=${page.rideId}#booking`;
  const tel = `tel:${BOOKING_PHONE.replace(/\s/g, "")}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/40 to-white pt-20 pb-24">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": "Boat rides", "item": `${BASE}/book` },
          { "@type": "ListItem", "position": 3, "name": page.h1, "item": url },
        ],
      }} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "TouristTrip",
        "name": page.h1,
        "description": ride.summary,
        "url": url,
        "image": `${BASE}${ride.image}`,
        "touristType": page.bestFor,
        "duration": page.iso8601Duration,
        "itinerary": {
          "@type": "Place",
          "name": page.startPoint,
          "address": { "@type": "PostalAddress", "addressLocality": "Varanasi", "addressRegion": "Uttar Pradesh", "addressCountry": "IN" },
        },
        "provider": {
          "@type": "LocalBusiness",
          "name": "KashiGo",
          "url": BASE,
          "telephone": BOOKING_PHONE,
          "address": { "@type": "PostalAddress", "streetAddress": "B-20/205, Brahma Ghat", "addressLocality": "Varanasi", "postalCode": "221001", "addressCountry": "IN" },
        },
        "offers": {
          "@type": "Offer",
          "price": String(ride.price),
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock",
          "url": `${BASE}${bookHref.replace("#booking", "")}`,
          "description": "Price per private boat, not per person",
        },
      }} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": page.faqs.map((f) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": fill(f.a, page) },
        })),
      }} />

      <article className="max-w-3xl mx-auto px-4">
        <nav aria-label="Breadcrumb" className="pt-4 text-sm text-slate-500">
          <Link href="/" className="hover:text-orange-600">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/book" className="hover:text-orange-600">Boat rides</Link>
          <span className="mx-1.5">/</span>
          <span className="text-slate-700">{ride.short}</span>
        </nav>

        <header className="mt-3">
          <p className="text-sm font-semibold text-teal-700">Private boat · Varanasi</p>
          <h1 className="mt-1 font-heading font-bold text-3xl sm:text-5xl text-slate-900 tracking-tight leading-tight">{page.h1}</h1>
          <p className="mt-3 text-lg text-slate-700">{ride.summary}</p>
        </header>

        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-3xl bg-slate-200">
          <Image src={ride.image} alt={`${page.h1} on the Ganges`} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
        </div>

        <section aria-label="Ride details" className="mt-6 rounded-3xl border border-slate-200/70 bg-white p-5 sm:p-6">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
            <div><dt className="flex items-center gap-1 text-slate-500"><BadgeIndianRupee size={14} className="text-orange-500" />Price</dt><dd className="mt-1 text-xl font-bold text-slate-900">{inr(ride.price)}</dd><dd className="text-xs text-slate-500">per boat, not per person</dd></div>
            <div><dt className="flex items-center gap-1 text-slate-500"><Clock size={14} className="text-teal-600" />Starts</dt><dd className="mt-1 font-semibold text-slate-900">{ride.time}</dd><dd className="text-xs text-slate-500">{page.duration}</dd></div>
            <div><dt className="flex items-center gap-1 text-slate-500"><MapPin size={14} className="text-pink-500" />From</dt><dd className="mt-1 font-semibold text-slate-900">{page.startPoint}</dd></div>
            <div><dt className="flex items-center gap-1 text-slate-500"><LifeBuoy size={14} className="text-teal-600" />Included</dt><dd className="mt-1 font-semibold text-slate-900">Life jackets, local boatman</dd></div>
          </dl>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link href={bookHref} className="inline-flex flex-1 items-center justify-center rounded-full bg-orange-500 px-6 py-3 font-semibold text-white shadow-sm hover:bg-orange-600">Book this ride — {inr(ride.price)}</Link>
            <a href={tel} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 hover:bg-slate-50"><Phone size={16} />{BOOKING_PHONE}</a>
          </div>
        </section>

        <div className="mt-10 space-y-5 text-[17px] leading-relaxed text-slate-700">
          {page.intro.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        <section className="mt-8">
          <h2 className="text-2xl sm:text-[28px] font-bold font-heading text-slate-900 tracking-tight">Best for</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {page.bestFor.map((b) => (
              <li key={b} className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700"><Sparkles size={14} className="text-orange-500" />{b}</li>
            ))}
          </ul>
        </section>

        {page.sections.map((s) => (
          <section key={s.heading} className="mt-10">
            <h2 className="text-2xl sm:text-[28px] font-bold font-heading text-slate-900 tracking-tight">{s.heading}</h2>
            <div className="mt-4 space-y-5 text-[17px] leading-relaxed text-slate-700">
              {s.body.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </section>
        ))}

        <section className="mt-10 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <h2 className="font-semibold text-xs uppercase tracking-wider text-amber-800">Local tips</h2>
          <ul className="mt-3 space-y-3">
            {page.tips.map((t) => (
              <li key={t} className="flex gap-3 text-[17px] leading-relaxed text-slate-800"><span className="mt-[0.6rem] h-2 w-2 flex-shrink-0 rounded-full bg-orange-500" aria-hidden="true" />{t}</li>
            ))}
          </ul>
        </section>

        <section className="mt-10" aria-labelledby="faq-h">
          <h2 id="faq-h" className="text-2xl sm:text-[28px] font-bold font-heading text-slate-900 tracking-tight">Frequently asked questions</h2>
          <div className="mt-4 divide-y divide-slate-200 rounded-3xl border border-slate-200/70 bg-white">
            {page.faqs.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="cursor-pointer list-none font-semibold text-slate-900 flex justify-between gap-4">{f.q}<span className="text-orange-500 group-open:rotate-45 transition-transform" aria-hidden="true">+</span></summary>
                <p className="mt-3 text-slate-700 leading-relaxed">{fill(f.a, page)}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl bg-slate-900 p-6 text-white">
          <h2 className="font-heading text-2xl font-bold">Book your {ride.short.toLowerCase()}</h2>
          <p className="mt-2 text-slate-300">One fixed price for the whole private boat — {inr(ride.price)}. No haggling on the ghat. Book today or up to a week ahead.</p>
          <Link href={bookHref} className="mt-4 inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">Book now</Link>
        </section>

        <section className="mt-10" aria-labelledby="related-h">
          <h2 id="related-h" className="text-xl font-bold font-heading text-slate-900">Other boat rides in Varanasi</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {page.related.map((id) => {
              const r = rideFacts(id);
              return (
                <li key={id}>
                  <Link href={ridePagePath(id)} className="block h-full rounded-2xl border border-slate-200 bg-white p-4 hover:border-orange-300">
                    <p className="font-semibold text-slate-900">{ridePageFor(id)!.h1}</p>
                    <p className="mt-1 text-sm text-slate-500">{r.time} · {inr(r.price)} per boat</p>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-sm text-slate-500">
            Compare every ride on the <Link href="/book#prices" className="font-semibold text-orange-600 hover:underline">price list</Link>, or read the <Link href="/blog/varanasi-boat-ride-price-guide-foreigners" className="font-semibold text-orange-600 hover:underline">Varanasi boat ride price guide</Link>.
          </p>
        </section>
      </article>
    </div>
  );
}

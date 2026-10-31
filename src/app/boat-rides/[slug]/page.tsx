import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeIndianRupee, Clock, MapPin, Phone, Plus, Sailboat, Sparkles } from "lucide-react";
import PageHero, { Crumbs } from "@/components/layout/PageHero";
import { FIRE_BTN, GHOST_BTN_DARK, H2_LIGHT, LINK_LIGHT, PAPER_CARD, splitTitle } from "@/components/ui/styles";
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
    <div className="min-h-screen bg-parchment pb-24">
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
          "description": "Price per private boat, 2 passengers included; ₹350 per extra passenger",
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

      <PageHero
        compact
        {...splitTitle(page.h1)}
        eyebrow="Private boat · Varanasi"
        deva="गंगा"
        breadcrumb={<Crumbs items={[{ href: "/", label: "Home" }, { href: "/book", label: "Boat rides" }, { label: ride.short }]} />}
        intro={<p>{ride.summary}</p>}
        aside={
          <div className="relative mx-auto max-w-xl rotate-1">
            <div aria-hidden className="absolute -inset-3 -rotate-2 rounded-[2.25rem] border border-marigold/25" />
            <div className="relative aspect-[16/11] overflow-hidden rounded-[2rem] bg-night-3 ring-1 ring-white/10 shadow-[0_40px_90px_-30px_rgba(255,122,26,0.45)]">
              <Image src={ride.image} alt={`${page.h1} on the Ganges`} fill priority sizes="(max-width: 1024px) 100vw, 560px" className="object-cover" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" />
              <p className="absolute bottom-4 left-5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-marigold"><Clock size={13} />{ride.time}</p>
            </div>
          </div>
        }
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={bookHref} className={`${FIRE_BTN} h-14 px-8 text-lg`}>Book this ride — {inr(ride.price)}</Link>
          <a href={tel} className={`${GHOST_BTN_DARK} h-14 px-7`}><Phone size={16} className="text-marigold" />{BOOKING_PHONE}</a>
        </div>
      </PageHero>

      <article className="max-w-3xl mx-auto px-4">
        <section aria-label="Ride details" className="grain relative -mt-4 overflow-hidden rounded-[1.75rem] bg-night p-5 sm:p-7 text-white shadow-[0_40px_90px_-40px_rgba(7,11,24,0.7)]">
          <dl className="relative grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 text-sm">
            <div><dt className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/45"><BadgeIndianRupee size={13} className="text-marigold" />Price</dt><dd className="mt-1.5 font-display text-3xl text-marigold">{inr(ride.price)}</dd><dd className="text-xs text-white/50">per boat · 2 passengers included</dd></div>
            <div><dt className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/45"><Clock size={13} className="text-marigold" />Starts</dt><dd className="mt-1.5 font-display text-xl">{ride.time}</dd><dd className="text-xs text-white/50">{page.duration}</dd></div>
            <div className="col-span-2 sm:col-span-1 min-w-0"><dt className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/45"><MapPin size={13} className="text-marigold" />From</dt><dd className="mt-1.5 font-display text-lg leading-snug [overflow-wrap:anywhere]">{page.startPoint}</dd></div>
            <div className="col-span-2 sm:col-span-1 min-w-0"><dt className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/45"><Sailboat size={13} className="text-ganga" />Included</dt><dd className="mt-1.5 font-display text-lg leading-snug">Private boat, local boatman</dd></div>
          </dl>
        </section>

        <div className="mt-12 space-y-5 text-[17px] sm:text-[18px] leading-[1.75] text-night/75 first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-[4.2rem] first-letter:leading-[0.85] first-letter:text-fire">
          {page.intro.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        <section className="mt-12">
          <h2 className={`${H2_LIGHT} text-[1.9rem] sm:text-[2.35rem]`}>Best for</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {page.bestFor.map((b) => (
              <li key={b} className="inline-flex items-center gap-1.5 rounded-full border border-night/15 bg-[#fffaf0] px-3.5 py-2 text-sm font-semibold text-night/80"><Sparkles size={14} className="text-fire" />{b}</li>
            ))}
          </ul>
        </section>

        {page.sections.map((s) => (
          <section key={s.heading} className="mt-12">
            <h2 className={`${H2_LIGHT} text-[1.9rem] sm:text-[2.35rem]`}>{s.heading}</h2>
            <div className="mt-5 space-y-5 text-[17px] sm:text-[18px] leading-[1.75] text-night/75">
              {s.body.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </section>
        ))}

        <section className={`${PAPER_CARD} relative mt-12 overflow-hidden p-6 sm:p-8`}>
          <p aria-hidden className="pointer-events-none absolute -right-3 -top-6 select-none font-deva text-[7rem] leading-none text-sandstone/20">दीया</p>
          <h2 className="relative ornament text-[11px] font-semibold uppercase tracking-[0.28em] text-fire">Local tips</h2>
          <ul className="relative mt-5 space-y-4">
            {page.tips.map((t) => (
              <li key={t} className="flex gap-3 text-[17px] leading-relaxed text-night/80"><span className="mt-[0.65rem] h-2 w-2 flex-shrink-0 rotate-45 bg-gradient-to-br from-marigold to-ember" aria-hidden="true" />{t}</li>
            ))}
          </ul>
        </section>

        <section className="mt-14" aria-labelledby="faq-h">
          <h2 id="faq-h" className={`${H2_LIGHT} text-[1.9rem] sm:text-[2.35rem]`}>Frequently asked <em className="text-fire-deep pr-1">questions</em></h2>
          <div className="mt-6 border-t border-night/15">
            {page.faqs.map((f) => (
              <details key={f.q} className="group border-b border-night/15">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-5 font-display text-lg sm:text-xl leading-snug text-night/85 hover:text-night [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden="true" className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-night/20 text-night transition-all duration-500 group-open:rotate-45 group-open:border-transparent group-open:bg-night group-open:text-marigold"><Plus size={16} /></span>
                </summary>
                <p className="pb-6 pr-12 text-night/65 leading-relaxed">{fill(f.a, page)}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="grain relative mt-14 overflow-hidden rounded-[2rem] bg-night p-6 sm:p-10 text-white">
          <div aria-hidden className="flicker absolute -right-16 -top-20 h-60 w-60 rounded-full bg-fire/35 blur-[80px]" />
          <h2 className="relative font-display font-light text-3xl sm:text-5xl tracking-[-0.02em] leading-[1.02]">Book your <em className="text-fire pr-1">{ride.short.toLowerCase()}</em></h2>
          <p className="relative mt-3 text-white/65">One fixed price for the whole private boat — {inr(ride.price)}, 2 passengers included (₹350 per extra passenger). No haggling on the ghat. Book today or up to a week ahead.</p>
          <Link href={bookHref} className={`${FIRE_BTN} relative mt-6 h-12 px-8`}>Book now<ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></Link>
        </section>

        <section className="mt-14" aria-labelledby="related-h">
          <h2 id="related-h" className={`${H2_LIGHT} text-2xl sm:text-3xl`}>Other boat rides in Varanasi</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {page.related.map((id) => {
              const r = rideFacts(id);
              return (
                <li key={id}>
                  <Link href={ridePagePath(id)} className={`${PAPER_CARD} group block h-full p-5 transition-[transform,border-color] duration-500 hover:-translate-y-1 hover:border-fire/40`}>
                    <p className="font-display text-lg leading-snug text-night group-hover:text-fire transition-colors">{ridePageFor(id)!.h1}</p>
                    <p className="mt-2 text-sm text-night/55">{r.time} · {inr(r.price)} per boat</p>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-5 text-sm text-night/60">
            Compare every ride on the <Link href="/book#prices" className={LINK_LIGHT}>price list</Link>, or read the <Link href="/blog/varanasi-boat-ride-price-guide-foreigners" className={LINK_LIGHT}>Varanasi boat ride price guide</Link>.
          </p>
        </section>
      </article>
    </div>
  );
}

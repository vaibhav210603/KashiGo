import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { ArrowRight, Clock } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import PageHero from "@/components/layout/PageHero";
import Embers from "@/components/motion/Embers";
import { Reveal } from "@/components/motion/primitives";
import { FIRE_BTN, GHOST_BTN_DARK, PAPER_CARD } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: { absolute: "Varanasi Travel Tips & Local Guides | KashiGo Blog" },
  description:
    "Free travel guides for foreigners visiting Varanasi. Scam alerts, ghat tips, boat ride pricing, temple etiquette — written by a local born in the city.",
  alternates: {
    canonical: "https://kashigo.in/blog",
  },
  openGraph: {
    title: "Varanasi Travel Tips & Local Guides | KashiGo Blog",
    description:
      "Free Varanasi guides for foreigners — scam shields, boat prices, ghat tips. Written by a local.",
    url: "https://kashigo.in/blog",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-parchment">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Varanasi Travel Tips & Local Guides | KashiGo Blog",
        "description": "Free travel guides for foreigners visiting Varanasi. Scam alerts, ghat tips, boat ride pricing, temple etiquette — written by a local born in the city.",
        "url": "https://kashigo.in/blog"
      }} />

      <PageHero
        eyebrow="Travel journal"
        title="Varanasi"
        highlight="travel guides"
        deva="कथा"
        intro={<p>Scam alerts, boat prices, ghat tips and temple etiquette — free, and written by a local born in the city.</p>}
      />

      {/* Posts */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {posts.map((post, idx) => (
                <Reveal key={post.slug} y={40} delay={(idx % 3) * 0.08} className="h-full">
                  <Link href={`/blog/${post.slug}`} className="group block h-full rounded-[1.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire">
                    <article className={`${PAPER_CARD} relative h-full flex flex-col overflow-hidden p-6 sm:p-7 transition-[transform,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5 group-hover:shadow-[0_30px_60px_-30px_rgba(255,122,26,0.55)]`}>
                      <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-marigold via-fire to-ember transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
                      <div className="flex items-center justify-between gap-3">
                        <span aria-hidden className="font-display italic text-lg text-fire">{String(idx + 1).padStart(2, "0")}</span>
                        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-night/45">
                          <span>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          <span className="inline-flex items-center gap-1"><Clock size={12} /> {post.readingTime}</span>
                        </div>
                      </div>

                      <h2 className="mt-5 font-display text-2xl leading-[1.15] tracking-tight text-night transition-colors group-hover:text-fire">
                        {post.title}
                      </h2>

                      <p className="mt-3 text-[15px] text-night/60 leading-relaxed line-clamp-3 flex-grow">
                        {post.description}
                      </p>

                      <span className="mt-6 inline-flex items-center gap-2 border-t border-night/10 pt-4 text-sm font-semibold text-night">
                        Read guide
                        <ArrowRight size={16} className="text-fire transition-transform group-hover:translate-x-1" />
                      </span>
                    </article>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            <p className={`${PAPER_CARD} text-night/55 text-center py-16`}>Coming soon...</p>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-4 sm:px-6 pb-20 sm:pb-28">
        <Reveal y={50} className="max-w-7xl mx-auto">
          <div className="grain relative overflow-hidden rounded-[2.5rem] bg-night px-6 py-12 sm:px-12 md:py-16 text-center text-white">
            <Embers density={0.6} />
            <div aria-hidden className="flicker absolute -bottom-32 left-1/2 h-72 w-[80%] -translate-x-1/2 rounded-full bg-fire/35 blur-[100px]" />
            <p aria-hidden className="pointer-events-none absolute -right-6 -top-10 select-none font-deva text-[11rem] md:text-[16rem] leading-none text-white/[0.04]">गंगा</p>
            <h2 className="relative font-display font-light text-4xl sm:text-6xl leading-[0.98] tracking-[-0.03em]">Ready to experience <em className="text-fire pr-1">Varanasi?</em></h2>
            <p className="relative mt-4 text-[15px] sm:text-lg text-white/65 max-w-2xl mx-auto">
              Book a boat ride on the Ganges — from ₹1,190 per private boat — or get the complete local&apos;s guide before you arrive.
            </p>
            <div className="relative mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Link href="/book" className={`${FIRE_BTN} w-full sm:w-auto h-14 px-8`}>
                Book a boat ride
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/guide" className={`${GHOST_BTN_DARK} w-full sm:w-auto h-14 px-8`}>
                Get the guide — $14.99
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

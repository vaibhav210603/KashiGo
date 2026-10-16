import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { ArrowRight, Clock } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";

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

const ACCENTS = [
  "bg-orange-100 text-orange-700",
  "bg-teal-100 text-teal-700",
  "bg-pink-100 text-pink-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-800",
];

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Varanasi Travel Tips & Local Guides | KashiGo Blog",
        "description": "Free travel guides for foreigners visiting Varanasi. Scam alerts, ghat tips, boat ride pricing, temple etiquette — written by a local born in the city.",
        "url": "https://kashigo.in/blog"
      }} />

      {/* Header */}
      <section className="pt-24 sm:pt-28 pb-10 sm:pb-14 px-4 bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-orange-100 text-orange-700">
            Travel journal
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-bold font-heading text-slate-900 tracking-tight">
            Varanasi travel guides
          </h1>
          <p className="mt-3 text-[15px] sm:text-lg text-slate-600 leading-relaxed">
            Scam alerts, boat prices, ghat tips and temple etiquette — free, and written by a local born in the city.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="px-4 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {posts.map((post, idx) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group h-full rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
                  <article className="h-full flex flex-col rounded-3xl bg-white border border-slate-200/70 shadow-sm p-5 sm:p-6 transition-shadow group-hover:shadow-md">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className={`rounded-full px-3 py-1 font-semibold ${ACCENTS[idx % ACCENTS.length]}`}>
                        {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="inline-flex items-center gap-1"><Clock size={13} /> {post.readingTime}</span>
                    </div>

                    <h2 className="mt-4 text-lg sm:text-xl font-bold font-heading text-slate-900 leading-snug group-hover:text-orange-600 transition-colors">
                      {post.title}
                    </h2>

                    <p className="mt-2 text-[15px] text-slate-600 leading-relaxed line-clamp-3 flex-grow">
                      {post.description}
                    </p>

                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600">
                      Read guide
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-16 rounded-3xl bg-amber-50">Coming soon...</p>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-4 pb-16 sm:pb-24">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-orange-500 to-pink-500 p-6 sm:p-12 text-center text-white shadow-sm">
          <h2 className="text-2xl sm:text-4xl font-bold font-heading tracking-tight">Ready to experience Varanasi?</h2>
          <p className="mt-3 text-[15px] sm:text-lg text-white/90 max-w-2xl mx-auto">
            Book a boat ride on the Ganges — from ₹990 per private boat — or get the complete local&apos;s guide before you arrive.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Link
              href="/book"
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-full bg-white text-orange-600 font-semibold hover:bg-orange-50 transition-colors"
            >
              Book a boat ride
            </Link>
            <Link
              href="/guide"
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-full border border-white/70 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Get the guide — $14.99
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

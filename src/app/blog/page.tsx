// src/app/blog/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Varanasi Travel Tips & Local Guides | KashiGo Blog",
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
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="max-w-4xl mx-auto px-4 py-16 mt-16">
      <h1 className="text-4xl font-bold mb-4 font-heading">Varanasi Travel Guides</h1>
      <p className="text-lg text-gray-600 mb-12">
        Written by a local. For foreigners visiting Varanasi.
      </p>

      <div className="grid gap-8">
        {posts.length > 0 ? (
          posts.map((post) => (
            <article key={post.slug} className="border-b pb-8">
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-2xl font-semibold hover:text-orange-600 transition-colors mb-2 font-heading">
                  {post.title}
                </h2>
              </Link>
              <p className="text-gray-600 mb-3">{post.description}</p>
              <div className="flex gap-4 text-sm text-gray-400">
                <span>{new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                <span>·</span>
                <span>{post.readingTime}</span>
              </div>
            </article>
          ))
        ) : (
          <p className="text-gray-500 italic">No posts found. Check back soon!</p>
        )}
      </div>

      {/* Internal links to products */}
      <div className="mt-16 p-8 bg-orange-50 rounded-2xl border border-orange-100">
        <h3 className="text-xl font-bold mb-2 font-heading">Ready to visit Varanasi?</h3>
        <p className="text-gray-600 mb-6">
          Get the complete local's guide or book your boat ride.
        </p>
        <div className="flex gap-4 flex-wrap">
          <Link
            href="/guide"
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Get the Travel Guide — $10.39
          </Link>
          <Link
            href="/book"
            className="border border-orange-600 text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
          >
            Book a Boat Ride
          </Link>
        </div>
      </div>
    </main>
  );
}

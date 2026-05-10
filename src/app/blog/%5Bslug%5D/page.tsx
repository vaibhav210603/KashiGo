// src/app/blog/[slug]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { JsonLd } from "@/components/JsonLd";
import { MDXRemote } from "next-mdx-remote/rsc";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `https://kashigo.in/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://kashigo.in/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      authors: ["KashiGo"],
      images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/og-image.jpg"],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.description,
          author: {
            "@type": "Person",
            name: "KashiGo",
            url: "https://kashigo.in",
          },
          publisher: {
            "@type": "Organization",
            name: "KashiGo",
            url: "https://kashigo.in",
            logo: {
              "@type": "ImageObject",
              url: "https://kashigo.in/icon-512.png",
            },
          },
          datePublished: post.date,
          dateModified: post.date,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://kashigo.in/blog/${post.slug}`,
          },
          image: "https://kashigo.in/og-image.jpg",
        }}
      />

      <main className="max-w-3xl mx-auto px-4 py-16 mt-16">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-orange-600">Home</Link>
          {" / "}
          <Link href="/blog" className="hover:text-orange-600">Blog</Link>
          {" / "}
          <span className="text-gray-600 truncate inline-block max-w-[200px] align-bottom">{post.title}</span>
        </nav>

        {/* Post Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold mb-4 leading-tight font-heading">
            {post.title}
          </h1>
          <div className="flex gap-4 text-sm text-gray-400 flex-wrap">
            <span>By KashiGo — Local Varanasi Guide</span>
            <span>·</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span>·</span>
            <span>{post.readingTime}</span>
          </div>
        </header>

        {/* Post Content */}
        <article className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:font-heading prose-a:text-orange-600 prose-img:rounded-3xl shadow-none">
          <MDXRemote source={post.content} />
        </article>

        {/* End-of-post CTA — appears on EVERY blog post */}
        <div className="mt-16 p-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl border border-orange-200">
          <p className="text-xs uppercase tracking-widest text-orange-600 font-bold mb-2">
            Written by a local born in Varanasi
          </p>
          <h3 className="text-2xl font-bold mb-3 font-heading">
            Want the complete guide?
          </h3>
          <p className="text-gray-600 mb-6">
            9 scam shields, all 84 ghats, temple etiquette, food safety,
            2-day itinerary — everything you need to experience Varanasi
            without getting scammed.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/guide"
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20"
            >
              Get the Guide — $10.39 →
            </Link>
            <Link
              href="/book"
              className="border border-orange-600 text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
            >
              Book a Boat Ride →
            </Link>
          </div>
        </div>

        {/* Related posts navigation */}
        <div className="mt-8 pt-8 border-t border-gray-100">
          <Link
            href="/blog"
            className="text-orange-600 hover:underline font-medium flex items-center gap-2"
          >
            ← Back to all Varanasi guides
          </Link>
        </div>
      </main>
    </>
  );
}

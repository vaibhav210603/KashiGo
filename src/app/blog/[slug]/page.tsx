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

import { Calendar, Clock, ArrowLeft, ArrowRight, Lightbulb } from "lucide-react";
import React from "react";
import BlogEmailPopup from "@/components/blog/BlogEmailPopup";

// MDX components — readable, mobile-first typography
const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mt-12 mb-5 tracking-tight leading-tight" {...props} />,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="text-2xl sm:text-[28px] font-bold font-heading text-slate-900 mt-12 mb-4 tracking-tight leading-snug" {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="text-xl font-bold font-heading text-slate-900 mt-10 mb-3 tracking-tight leading-snug" {...props} />,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => {
    // Detect if this paragraph is a "Tip"
    const childrenArray = React.Children.toArray(props.children);
    const firstChild = childrenArray[0] as any;

    // Avoid React.isValidElement as it narrows props to 'unknown' in strict TypeScript
    let isTip = false;
    if (firstChild && firstChild.type === 'strong' && firstChild.props && typeof firstChild.props.children === 'string') {
      if (firstChild.props.children.toLowerCase().startsWith('tip:')) {
        isTip = true;
      }
    }

    if (isTip) {
      return (
        <div className="my-8 p-5 bg-amber-50 border border-amber-200 rounded-3xl flex gap-3 items-start">
          <div className="bg-amber-100 p-2 rounded-xl text-amber-700 flex-shrink-0">
            <Lightbulb size={18} />
          </div>
          <div className="flex-grow">
            <span className="block text-amber-800 font-semibold text-xs uppercase tracking-wider mb-1">Local insight</span>
            <div className="text-slate-800 leading-relaxed text-[17px]">
                {(firstChild.props.children as string).toLowerCase().startsWith('tip:') ?
                  childrenArray.slice(1) : childrenArray}
            </div>
          </div>
        </div>
      );
    }

    return <p className="text-[17px] text-slate-700 mb-6 last:mb-0 leading-relaxed" {...props} />;
  },
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-none space-y-3 mb-8" {...props} />,
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="flex gap-3 text-[17px] text-slate-700 leading-relaxed items-start">
      <span className="flex-shrink-0 w-2 h-2 rounded-full bg-orange-500 mt-[0.6rem]" aria-hidden="true" />
      <div className="flex-grow min-w-0 [&>p]:mb-0">
        {props.children}
      </div>
    </li>
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => <strong className="font-semibold text-slate-900" {...props} />,
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a className="text-orange-600 hover:text-orange-700 font-semibold underline decoration-orange-300 decoration-2 underline-offset-4 break-words" {...props} />,
  blockquote: (props: React.HTMLAttributes<HTMLElement>) => (
    <blockquote className="border-l-4 border-teal-500 pl-5 py-2 my-8 bg-teal-50/60 rounded-r-2xl text-slate-700 text-lg leading-relaxed" {...props} />
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-8 -mx-4 sm:mx-0 overflow-x-auto px-4 sm:px-0">
      <table className="w-full text-[15px] text-left border-collapse" {...props} />
    </div>
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => <th className="bg-orange-50 font-semibold text-slate-900 px-3 py-2 border-b border-slate-200" {...props} />,
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => <td className="px-3 py-2 border-b border-slate-100 text-slate-700 align-top" {...props} />,
};

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

      <BlogEmailPopup />

      <div className="min-h-screen bg-white selection:bg-orange-200 selection:text-orange-900">
        <main className="pt-24 sm:pt-28 pb-16 sm:pb-24">
          <article className="max-w-2xl mx-auto px-4">

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 mb-6 min-w-0">
              <Link href="/" className="hover:text-orange-600 transition-colors">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/blog" className="hover:text-orange-600 transition-colors">Blog</Link>
            </nav>

            {/* Header */}
            <header className="mb-8 sm:mb-10">
              <h1 className="text-3xl sm:text-5xl font-bold leading-tight font-heading text-slate-900 tracking-tight">
                {post.title}
              </h1>
              {post.description && (
                <p className="mt-4 text-lg text-slate-600 leading-relaxed">{post.description}</p>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full px-3 py-1 font-semibold bg-teal-100 text-teal-700">By a local</span>
                <time dateTime={post.date} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold bg-orange-100 text-orange-700">
                  <Calendar size={13} />
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold bg-sky-100 text-sky-700">
                  <Clock size={13} />
                  {post.readingTime}
                </span>
              </div>
            </header>

            {/* Post Content */}
            <div className="border-t border-slate-200/70 pt-8">
              <MDXRemote source={post.content} components={mdxComponents} />
            </div>

            {/* End-of-post CTA */}
            <aside className="mt-14 rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 border border-slate-200/70 p-6 sm:p-8">
              <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-orange-100 text-orange-700">
                Planning your Varanasi trip?
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
                Book a boat ride — from ₹990 per private boat
              </h2>
              <p className="mt-2 text-[15px] sm:text-[17px] text-slate-600 leading-relaxed">
                Fair, fixed prices on the Ganges — no haggling at the ghats. Want everything else covered too? The local&apos;s guide has 9 scam shields, all 84 ghats and a 2-day itinerary.
              </p>
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/book"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors shadow-sm"
                >
                  Book a boat ride
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/guide"
                  className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-full border border-slate-300 bg-white text-slate-800 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Get the guide — $14.99
                </Link>
              </div>
            </aside>

            {/* Back link */}
            <div className="mt-10 flex justify-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-slate-300 bg-white text-slate-700 font-semibold hover:text-orange-600 transition-colors text-sm"
              >
                <ArrowLeft size={16} />
                All guides
              </Link>
            </div>

          </article>
        </main>
      </div>
    </>
  );
}

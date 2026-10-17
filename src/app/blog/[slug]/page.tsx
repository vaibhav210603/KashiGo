// src/app/blog/[slug]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { JsonLd } from "@/components/JsonLd";
import { extractFaqs } from "@/lib/blogFaq";
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
import PageHero, { Crumbs } from "@/components/layout/PageHero";
import { FIRE_BTN, GHOST_BTN_DARK, GHOST_BTN_LIGHT, splitTitle } from "@/components/ui/styles";

// MDX components — readable, mobile-first typography
const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="font-display font-light text-3xl sm:text-4xl text-night mt-14 mb-5 tracking-[-0.02em] leading-[1.08]" {...props} />,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="font-display font-light text-[1.9rem] sm:text-[2.35rem] text-night mt-14 mb-5 tracking-[-0.02em] leading-[1.08]" {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="font-display text-[1.4rem] text-night mt-10 mb-3 tracking-tight leading-snug" {...props} />,
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
        <div className="grain my-9 p-5 sm:p-6 bg-night text-white rounded-[1.5rem] flex gap-4 items-start overflow-hidden">
          <div className="relative bg-marigold/15 p-2.5 rounded-full text-marigold flex-shrink-0">
            <Lightbulb size={18} />
          </div>
          <div className="relative flex-grow min-w-0">
            <span className="block text-marigold font-semibold text-[11px] uppercase tracking-[0.25em] mb-1.5">Local insight</span>
            <div className="text-white/85 leading-relaxed text-[17px] [&_strong]:text-white [&_a]:text-marigold [&_a]:decoration-marigold/50">
                {(firstChild.props.children as string).toLowerCase().startsWith('tip:') ?
                  childrenArray.slice(1) : childrenArray}
            </div>
          </div>
        </div>
      );
    }

    return <p className="text-[17px] sm:text-[18px] text-night/75 mb-6 last:mb-0 leading-[1.75]" {...props} />;
  },
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-none space-y-3 mb-8" {...props} />,
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="flex gap-3 text-[17px] sm:text-[18px] text-night/75 leading-[1.7] items-start">
      <span className="flex-shrink-0 w-2 h-2 rotate-45 bg-gradient-to-br from-marigold to-ember mt-[0.7rem]" aria-hidden="true" />
      <div className="flex-grow min-w-0 [&>p]:mb-0">
        {props.children}
      </div>
    </li>
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => <strong className="font-semibold text-night" {...props} />,
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a className="text-night hover:text-fire font-semibold underline decoration-marigold decoration-2 underline-offset-4 break-words transition-colors" {...props} />,
  blockquote: (props: React.HTMLAttributes<HTMLElement>) => (
    <blockquote className="border-l-2 border-fire pl-6 py-1 my-10 font-display italic text-night/80 text-xl sm:text-2xl leading-snug [&_p]:font-display [&_p]:text-[inherit] [&_p]:leading-[inherit]" {...props} />
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-8 overflow-x-auto rounded-[1.25rem] border border-night/10 bg-[#fffaf0]">
      <table className="w-full text-[15px] text-left border-collapse" {...props} />
    </div>
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => <th className="bg-parchment-2/70 font-semibold text-night px-3 py-2.5 border-b border-night/10" {...props} />,
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => <td className="px-3 py-2.5 border-b border-night/[0.07] text-night/75 align-top" {...props} />,
};

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  const faqs = extractFaqs(post.content);
  const url = `https://kashigo.in/blog/${post.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://kashigo.in" },
            { "@type": "ListItem", position: 2, name: "Blog", item: "https://kashigo.in/blog" },
            { "@type": "ListItem", position: 3, name: post.title, item: url },
          ],
        }}
      />
      {faqs.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }}
        />
      )}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.description,
          author: {
            "@type": "Person",
            name: "KashiGo — a Varanasi local",
            url: "https://kashigo.in/about",
          },
          about: { "@type": "City", name: "Varanasi", sameAs: "https://en.wikipedia.org/wiki/Varanasi" },
          keywords: post.keywords.join(", "),
          inLanguage: "en",
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

      <div className="min-h-screen bg-parchment">
        <PageHero
          compact
          {...splitTitle(post.title)}
          deva="गंगा"
          breadcrumb={<Crumbs items={[{ href: "/", label: "Home" }, { href: "/blog", label: "Blog" }]} />}
          intro={post.description ? <p>{post.description}</p> : undefined}
        >
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full border border-ganga/40 bg-ganga/10 px-3 py-1.5 text-ganga">By a local</span>
            <time dateTime={post.date} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white/75">
              <Calendar size={13} className="text-marigold" />
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white/75">
              <Clock size={13} className="text-marigold" />
              {post.readingTime}
            </span>
          </div>
        </PageHero>

        <div className="pb-16 sm:pb-24">
          <article className="max-w-2xl mx-auto px-4">

            {/* Post Content */}
            <div className="pt-2 [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:mr-2 [&>p:first-of-type]:first-letter:font-display [&>p:first-of-type]:first-letter:text-[4.2rem] [&>p:first-of-type]:first-letter:leading-[0.85] [&>p:first-of-type]:first-letter:text-fire">
              <MDXRemote source={post.content} components={mdxComponents} />
            </div>

            {/* End-of-post CTA */}
            <aside className="grain relative mt-16 overflow-hidden rounded-[2rem] bg-night p-6 sm:p-9 text-white">
              <div aria-hidden className="flicker absolute -right-16 -top-20 h-60 w-60 rounded-full bg-fire/35 blur-[80px]" />
              <p className="relative ornament text-[11px] font-semibold uppercase tracking-[0.28em] text-marigold">
                Planning your Varanasi trip?
              </p>
              <h2 className="relative mt-4 font-display font-light text-3xl sm:text-4xl tracking-[-0.02em] leading-[1.05]">
                Book a boat ride — <em className="text-fire pr-1">from ₹1,190 per private boat</em>
              </h2>
              <p className="relative mt-3 text-[15px] sm:text-[17px] text-white/65 leading-relaxed">
                Fair, fixed prices on the Ganges — no haggling at the ghats. Want everything else covered too? The local&apos;s guide has 9 scam shields, all 84 ghats and a 2-day itinerary.
              </p>
              <div className="relative mt-7 flex flex-col sm:flex-row gap-3">
                <Link href="/book" className={`${FIRE_BTN} w-full sm:w-auto h-12 px-6`}>
                  Book a boat ride
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/guide" className={`${GHOST_BTN_DARK} w-full sm:w-auto h-12 px-6`}>
                  Get the guide — $14.99
                </Link>
              </div>
            </aside>

            {/* Back link */}
            <div className="mt-10 flex justify-center">
              <Link href="/blog" className={`${GHOST_BTN_LIGHT} group h-11 px-5 text-sm font-semibold`}>
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                All guides
              </Link>
            </div>

          </article>
        </div>
      </div>
    </>
  );
}

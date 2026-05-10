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

import { Calendar, Clock, MapPin, Compass, ArrowLeft, ShieldCheck, Lightbulb } from "lucide-react";
import React from "react";

// Custom MDX Components for premium typography
const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mt-16 mb-8 tracking-tight leading-tight" {...props} />,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-900 mt-20 mb-8 tracking-tight flex items-center gap-4 before:content-[''] before:block before:w-1.5 before:h-8 before:bg-orange-500 before:rounded-full" {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="text-xl md:text-2xl font-bold font-heading text-slate-800 mt-14 mb-6 tracking-tight" {...props} />,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => {
    // Detect if this paragraph is a "Tip"
    const childrenArray = React.Children.toArray(props.children);
    const firstChild = childrenArray[0];
    
    // Check if first child is a strong tag containing "Tip:"
    const isTip = React.isValidElement(firstChild) && 
                  firstChild.type === 'strong' && 
                  typeof firstChild.props.children === 'string' &&
                  firstChild.props.children.toLowerCase().startsWith('tip:');

    if (isTip) {
      return (
        <div className="my-10 p-6 bg-amber-50/80 border border-amber-100 rounded-2xl flex gap-4 items-start shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
          <div className="bg-amber-400/20 p-2 rounded-lg text-amber-700 mt-1">
            <Lightbulb size={20} className="fill-amber-400/30" />
          </div>
          <div className="flex-grow">
            <span className="block text-amber-900 font-bold text-xs uppercase tracking-widest mb-1">Local Insight</span>
            <div className="text-amber-900/90 leading-relaxed italic text-base md:text-lg">
                {childrenArray.slice(1)}
            </div>
          </div>
        </div>
      );
    }
    
    return <p className="text-base md:text-lg text-slate-600 mb-8 leading-[1.8] font-normal" {...props} />;
  },
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-none space-y-4 mb-10 ml-2" {...props} />,
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="flex gap-4 text-base md:text-lg text-slate-600 leading-[1.8] items-start">
      <span className="text-orange-500 mt-2 text-xl">•</span>
      <span {...props} />
    </li>
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => <strong className="font-bold text-slate-900" {...props} />,
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a className="text-orange-600 hover:text-orange-700 font-bold underline decoration-orange-300 decoration-2 underline-offset-4 hover:decoration-orange-600 transition-all" {...props} />,
  blockquote: (props: React.HTMLAttributes<HTMLElement>) => (
    <blockquote className="border-l-4 border-orange-500 pl-8 py-4 my-12 bg-orange-50/30 rounded-r-3xl italic text-slate-700 text-xl md:text-2xl font-serif leading-relaxed" {...props} />
  ),
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

      <div className="min-h-screen bg-slate-50 selection:bg-orange-200 selection:text-orange-900">
        {/* Progress Bar (Optional UI enhancement, simulated with top border) */}
        <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400 z-50" />

        <main className="pt-32 pb-24">
          <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-10 uppercase tracking-widest">
              <Link href="/" className="hover:text-orange-600 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-orange-600 transition-colors">Journal</Link>
              <span>/</span>
              <span className="text-orange-500 truncate max-w-[200px] md:max-w-none">{post.slug.replace(/-/g, ' ')}</span>
            </nav>

            {/* Premium Post Header */}
            <header className="mb-12 relative">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-[1.2] font-heading text-slate-900 tracking-tight relative z-10">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-500 uppercase tracking-widest relative z-10 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 inline-flex shadow-sm">
                <div className="flex items-center gap-2 text-slate-900">
                  <ShieldCheck size={18} className="text-green-500" />
                  <span>By Local Expert</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <time dateTime={post.date} className="flex items-center gap-2">
                  <Calendar size={16} className="text-orange-500" />
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="flex items-center gap-2 text-orange-600">
                  <Clock size={16} />
                  {post.readingTime}
                </span>
              </div>
            </header>

            {/* Post Content */}
            <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-xl border border-slate-100 relative z-10">
              <div className="prose prose-lg max-w-none">
                <MDXRemote source={post.content} components={mdxComponents} />
              </div>
            </div>

            {/* Premium End-of-post CTA */}
            <div className="mt-20 p-8 md:p-14 bg-slate-900 rounded-[3rem] border border-slate-800 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="lg:w-3/5 text-left">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px w-8 bg-orange-500" />
                    <p className="text-orange-500 font-bold tracking-[0.2em] uppercase text-[10px]">
                      Written by a local born in Varanasi
                    </p>
                  </div>
                  <h3 className="text-3xl md:text-5xl font-bold mb-6 font-heading text-white tracking-tight leading-tight">
                    Want the <span className="text-orange-500">complete</span> guide?
                  </h3>
                  <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-xl">
                    Don't be another tourist who pays triple. Get 9 scam shields, all 84 ghats, and a perfect 2-day itinerary.
                  </p>
                </div>
                <div className="lg:w-2/5 flex flex-col gap-4 w-full sm:max-w-xs lg:max-w-none">
                  <Link
                    href="/guide"
                    className="w-full flex items-center justify-center gap-3 bg-orange-500 text-white px-8 py-5 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/25 hover:-translate-y-1 active:scale-95"
                  >
                    <MapPin size={20} />
                    Get the Guide — $10.39
                  </Link>
                  <Link
                    href="/book"
                    className="w-full flex items-center justify-center gap-3 bg-white/5 text-white px-8 py-5 rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/10 hover:border-white/20 backdrop-blur-md active:scale-95"
                  >
                    <Compass size={20} />
                    Book a Boat Ride
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="mt-12 flex justify-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-orange-600 transition-colors uppercase tracking-widest text-sm bg-white px-6 py-3 rounded-full shadow-sm border border-slate-200 hover:border-orange-200"
              >
                <ArrowLeft size={16} />
                Back to Journal
              </Link>
            </div>

          </article>
        </main>
      </div>
    </>
  );
}

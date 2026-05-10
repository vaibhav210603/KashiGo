import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { ArrowRight, Calendar, Clock, BookOpen, MapPin, Compass } from "lucide-react";

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
    <div className="min-h-screen bg-[#F8FAFC] pt-28 pb-20">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-orange-50/50 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white border border-orange-100 text-orange-600 font-bold text-xs tracking-widest uppercase mb-6 shadow-sm">
            <BookOpen size={16} />
            <span>KashiGo Journal</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading text-slate-900 mb-6 tracking-tight">
            Varanasi Travel <span className="text-orange-500 font-cursive font-normal text-5xl md:text-7xl lg:text-8xl align-bottom -ml-2">Guides</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Insider tips, scam shields, and cultural etiquette for foreigners visiting the holy city. Written by locals who know the real Kashi.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-24">
          {posts.length > 0 ? (
            posts.map((post, idx) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group h-full outline-none">
                <article className="bg-white rounded-[2.5rem] p-8 h-full border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(249,115,22,0.15)] hover:-translate-y-2 transition-all duration-500 flex flex-col relative overflow-hidden focus-visible:ring-2 focus-visible:ring-orange-500">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-orange-100/50 to-transparent rounded-full blur-3xl -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150" />
                  
                  <div className="flex gap-4 text-[11px] font-bold text-slate-500 mb-6 uppercase tracking-widest relative z-10">
                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-orange-500" /> {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-orange-500" /> {post.readingTime}</span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 font-heading group-hover:text-orange-600 transition-colors duration-300 leading-[1.3] relative z-10">
                    {post.title}
                  </h2>
                  
                  <p className="text-slate-600 mb-8 flex-grow leading-relaxed relative z-10">
                    {post.description}
                  </p>
                  
                  <div className="flex items-center text-sm font-bold text-slate-900 mt-auto pt-6 border-t border-slate-100 relative z-10">
                    <span className="group-hover:text-orange-600 transition-colors duration-300">Read Full Guide</span>
                    <div className="ml-auto w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                        <ArrowRight size={16} className="transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </article>
              </Link>
            ))
          ) : (
            <p className="text-slate-500 italic col-span-full text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">No posts found. Check back soon!</p>
          )}
        </div>

        {/* Call to Action */}
        <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-10 md:p-16 text-center border border-slate-800 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600" />
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
              <h3 className="text-3xl md:text-5xl font-bold mb-6 font-heading text-white tracking-tight">Ready to experience Varanasi?</h3>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-xl mx-auto">
                Get the complete 2026 local's travel guide or secure your sunrise boat ride before you arrive. Don't leave it to chance.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/guide"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5"
                >
                  <MapPin size={20} />
                  Get The Full Guide — $10.39
                </Link>
                <Link
                  href="/book"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all border border-white/10 hover:border-white/20 backdrop-blur-sm"
                >
                  <Compass size={20} />
                  Book a Boat Ride
                </Link>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

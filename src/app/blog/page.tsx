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
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 relative">
      {/* Background patterns for a premium feel */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-orange-100/30 to-transparent pointer-events-none" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-white border border-orange-100 text-orange-600 font-bold text-[9px] tracking-[0.2em] uppercase mb-4 shadow-sm">
            <BookOpen size={12} />
            <span>Travel Journal</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-slate-900 mb-4 tracking-tight">
            Varanasi Travel <span className="text-orange-500 font-cursive font-normal block md:inline mt-1 md:mt-0 text-5xl md:text-7xl">Guides</span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Expert insights, scam-prevention, and cultural wisdom for the modern traveler.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 max-w-5xl mx-auto mb-20">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group h-full outline-none">
                <article className="bg-white rounded-[2rem] p-8 md:p-10 pb-12 md:pb-14 h-full border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(249,115,22,0.1)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-100 transition-colors duration-500" />
                  
                  <div className="flex gap-4 text-[9px] font-bold text-slate-400 mb-5 uppercase tracking-[0.15em] relative z-10">
                    <span className="flex items-center gap-1.5"><Calendar size={13} className="text-orange-500/70" /> {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span className="flex items-center gap-1.5"><Clock size={13} className="text-orange-500/70" /> {post.readingTime}</span>
                  </div>
                  
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 font-heading group-hover:text-orange-600 transition-colors duration-300 leading-tight relative z-10">
                    {post.title}
                  </h2>
                  
                  <p className="text-slate-600 text-base mb-8 flex-grow leading-relaxed relative z-10">
                    {post.description}
                  </p>
                  
                  <div className="flex items-center text-xs font-bold text-slate-900 mt-auto pt-6 border-t border-slate-100 relative z-10 group-hover:border-orange-200 transition-colors">
                    <span className="group-hover:text-orange-600 transition-all duration-300 flex items-center gap-2">
                        Read Full Guide
                        <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </article>
              </Link>
            ))
          ) : (
            <p className="text-slate-500 italic col-span-full text-center py-20 bg-white rounded-[3rem] border border-slate-100">Coming soon...</p>
          )}
        </div>

        {/* Call to Action */}
        <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-10 md:p-20 text-center border border-slate-800 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600" />
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
              <h3 className="text-3xl md:text-5xl font-bold mb-6 font-heading text-white tracking-tight leading-tight">Ready to experience <span className="text-orange-500">Varanasi?</span></h3>
              <p className="text-lg md:text-xl text-slate-400 mb-12 leading-relaxed max-w-2xl mx-auto">
                Get the complete 2026 local's travel guide or secure your sunrise boat ride before you arrive. Don't leave it to chance.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <Link
                  href="/guide"
                  className="w-full sm:w-auto flex items-center justify-center gap-3 bg-orange-500 text-white px-10 py-5 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/25 hover:-translate-y-1 active:scale-95"
                >
                  <MapPin size={22} />
                  Get The Full Guide — $10.39
                </Link>
                <Link
                  href="/book"
                  className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/5 text-white px-10 py-5 rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/10 hover:border-white/20 backdrop-blur-md active:scale-95"
                >
                  <Compass size={22} />
                  Book a Boat Ride
                </Link>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

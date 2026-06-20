"use client";
import { motion } from "framer-motion";

export default function WelcomeSection() {
  return (
    <section id="welcome" className="py-24 bg-[#FCFAF5]">
      <div className="max-w-3xl mx-auto px-6">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs tracking-[0.16em] uppercase text-orange-600 mb-4 flex items-center gap-3"
        >
          <span className="w-6 h-[2px] bg-orange-500"></span>
          00 — Welcome
        </motion.p>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-4 tracking-tight"
        >
          Read this first. It'll save your trip.
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xl text-slate-600 mb-10"
        >
          Three minutes here will make the other 280 pages make sense.
        </motion.p>

        <div className="space-y-6 text-lg text-slate-800 leading-relaxed font-sans">
          <p>
            Here's the truth no glossy brochure will tell you: India will overwhelm you in the first 48 hours. The noise, the colour, the smells, the sheer <em className="italic">density</em> of life — it hits everyone, even seasoned travellers. People who've crossed forty countries still call India "the great exam."
          </p>
          <p>
            And here's the part the scary headlines leave out: millions of foreigners do this trip every year and go home transformed, not traumatised. The difference between a miserable week and the journey of your life is almost never luck. It's <strong className="font-bold">preparation</strong>. Knowing which auto fare is fair. Knowing which samosa is safe and which lassi is a gamble. Knowing that the man saying your hotel "burned down last night" is reading from a script thousands of tourists have heard before.
          </p>
          
          <div className="my-10 pl-6 border-l-4 border-orange-500 py-2">
            <p className="text-2xl font-bold font-heading text-slate-900 leading-snug">
              This guide is built around one idea: you don't need to be braver. You need to be informed. Informed travellers relax — and relaxed travellers fall in love with India.
            </p>
          </div>

          <h3 className="text-2xl font-bold font-heading text-slate-900 mt-12 mb-4 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-[#F4ECE0] flex items-center justify-center text-xl">
              🧭
            </span>
            How this book is built
          </h3>
          
          <p>
            It works in two halves. <strong className="font-bold">The first half</strong> (sections 01–06) is everything that's true everywhere in India — food, water, scams, safety, money, etiquette, and how to choose your route. Read it once before you fly.
          </p>
          <p>
            <strong className="font-bold">The second half</strong> is a chapter per destination. Each one opens with a one-screen "dossier" — how many days you need, the best season, the vibe — then gives you what to see, what's safe to eat, the local scams to dodge, and the do's and don'ts that matter <em className="italic">in that specific place</em>. Skim the chapter the night before you arrive somewhere new.
          </p>

          <div className="mt-10 p-6 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
            <p className="font-bold font-heading text-lg text-amber-600 mb-2 flex items-center gap-2">
              ⚑ A note on tone
            </p>
            <p className="text-slate-700 m-0 text-base">
              We point out scams and stomach risks bluntly because being vague helps no one. Don't read the warnings as "India is dangerous." Read them the way a good friend who lives here would brief you over chai — so you can stop worrying and start enjoying.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

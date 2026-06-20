"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RoutePlanner() {
  const [activeTab, setActiveTab] = useState("r1");

  const tabs = [
    { id: "r1", label: "1 Week · The Classic" },
    { id: "r2", label: "2 Weeks · Triangle + Rajasthan" },
    { id: "r3", label: "3 Weeks · The Grand Loop" },
  ];

  return (
    <section id="routes" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs tracking-[0.16em] uppercase text-orange-600 mb-4 flex items-center gap-3"
        >
          <span className="w-6 h-[2px] bg-orange-500"></span>
          06 — Plan Your Route
        </motion.p>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-4 tracking-tight"
        >
          Don't try to "do" India
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xl text-slate-600 mb-10"
        >
          India is the size of a continent. The happiest first-timers pick a lane and go deep — not a frantic dash across the map.
        </motion.p>

        <div className="text-lg text-slate-800 leading-relaxed font-sans mb-10">
          <p>
            The data backs this up: the average foreign visitor stays about <strong className="font-bold">18 days</strong> and realistically sees <strong className="font-bold">three to six places</strong>. Trying to cram in twelve cities means you spend the whole trip in transit, exhausted and ill. Choose one of these proven routes, then steal days from it or add to it.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`font-heading font-bold px-5 py-3 rounded-full transition-colors ${
                activeTab === tab.id 
                  ? "bg-slate-900 text-white border-slate-900" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <AnimatePresence mode="wait">
            {activeTab === "r1" && (
              <motion.div
                key="r1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-lg text-slate-800 mb-6 font-sans">
                  <strong className="font-bold">The Golden Triangle.</strong> The most-travelled first-timer route on earth, and for good reason: three iconic cities, short hops between them, world-famous sights, and the gentlest possible introduction to India.
                </p>
                <div className="space-y-4 font-sans text-base">
                  <div className="flex gap-4 pb-4 border-b border-dashed border-slate-200"><span className="font-mono text-xs font-bold text-orange-500 w-16 pt-1">Day 1–2</span><div className="text-slate-700"><strong className="font-heading font-bold text-slate-900">Delhi</strong> — arrive, acclimatise, Old &amp; New Delhi.</div></div>
                  <div className="flex gap-4 pb-4 border-b border-dashed border-slate-200"><span className="font-mono text-xs font-bold text-orange-500 w-16 pt-1">Day 3</span><div className="text-slate-700"><strong className="font-heading font-bold text-slate-900">Agra</strong> — fast train down; Taj Mahal at sunrise, Agra Fort.</div></div>
                  <div className="flex gap-4 pb-4 border-b border-dashed border-slate-200"><span className="font-mono text-xs font-bold text-orange-500 w-16 pt-1">Day 4–6</span><div className="text-slate-700"><strong className="font-heading font-bold text-slate-900">Jaipur</strong> — Amber Fort, City Palace, bazaars, Hawa Mahal.</div></div>
                  <div className="flex gap-4"><span className="font-mono text-xs font-bold text-orange-500 w-16 pt-1">Day 7</span><div className="text-slate-700">Back to Delhi &amp; fly out.</div></div>
                </div>
                <p className="mt-6 text-sm text-slate-500 italic">Best for: limited time, history lovers, and anyone nervous who wants a "training wheels" India.</p>
              </motion.div>
            )}
            
            {activeTab === "r2" && (
              <motion.div
                key="r2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-lg text-slate-800 mb-6 font-sans">
                  <strong className="font-bold">Golden Triangle + Rajasthan.</strong> The sweet spot for most two-week trips: the icons, then deeper into the Land of Kings for palaces, lakes and desert.
                </p>
                <div className="space-y-4 font-sans text-base">
                  <div className="flex gap-4 pb-4 border-b border-dashed border-slate-200"><span className="font-mono text-xs font-bold text-orange-500 w-20 pt-1">Day 1–3</span><div className="text-slate-700"><strong className="font-heading font-bold text-slate-900">Delhi</strong> — ease in, see the capital.</div></div>
                  <div className="flex gap-4 pb-4 border-b border-dashed border-slate-200"><span className="font-mono text-xs font-bold text-orange-500 w-20 pt-1">Day 4–5</span><div className="text-slate-700"><strong className="font-heading font-bold text-slate-900">Agra</strong> — Taj Mahal &amp; Fatehpur Sikri en route.</div></div>
                  <div className="flex gap-4 pb-4 border-b border-dashed border-slate-200"><span className="font-mono text-xs font-bold text-orange-500 w-20 pt-1">Day 6–8</span><div className="text-slate-700"><strong className="font-heading font-bold text-slate-900">Jaipur</strong> — the Pink City in full.</div></div>
                  <div className="flex gap-4 pb-4 border-b border-dashed border-slate-200"><span className="font-mono text-xs font-bold text-orange-500 w-20 pt-1">Day 9–10</span><div className="text-slate-700"><strong className="font-heading font-bold text-slate-900">Jodhpur</strong> — the Blue City &amp; mighty Mehrangarh Fort.</div></div>
                  <div className="flex gap-4 pb-4 border-b border-dashed border-slate-200"><span className="font-mono text-xs font-bold text-orange-500 w-20 pt-1">Day 11–13</span><div className="text-slate-700"><strong className="font-heading font-bold text-slate-900">Udaipur</strong> — lakes, palaces, the most romantic city.</div></div>
                  <div className="flex gap-4"><span className="font-mono text-xs font-bold text-orange-500 w-20 pt-1">Day 14</span><div className="text-slate-700">Fly home from Udaipur.</div></div>
                </div>
              </motion.div>
            )}

            {activeTab === "r3" && (
              <motion.div
                key="r3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-lg text-slate-800 mb-6 font-sans">
                  <strong className="font-bold">The Grand Loop.</strong> Three weeks lets you pair North India's icons with something completely different — the spiritual Ganges, or the tropical south to decompress.
                </p>
                <div className="space-y-4 font-sans text-base">
                  <div className="flex gap-4 pb-4 border-b border-dashed border-slate-200"><span className="font-mono text-xs font-bold text-orange-500 w-16 pt-1">Week 1</span><div className="text-slate-700"><strong className="font-heading font-bold text-slate-900">Golden Triangle</strong> — Delhi, Agra, Jaipur.</div></div>
                  <div className="flex gap-4 pb-4 border-b border-dashed border-slate-200"><span className="font-mono text-xs font-bold text-orange-500 w-16 pt-1">Week 2</span><div className="text-slate-700"><strong className="font-heading font-bold text-slate-900">Rajasthan</strong> — Jodhpur &amp; Udaipur, OR fly east to <strong className="font-heading font-bold text-slate-900">Varanasi</strong> for the Ganges.</div></div>
                  <div className="flex gap-4"><span className="font-mono text-xs font-bold text-orange-500 w-16 pt-1">Week 3</span><div className="text-slate-700"><strong className="font-heading font-bold text-slate-900">Wind down</strong> — fly south to <strong className="font-heading font-bold text-slate-900">Goa's</strong> beaches or <strong className="font-heading font-bold text-slate-900">Kerala's</strong> backwaters.</div></div>
                </div>
                <p className="mt-6 text-sm text-slate-500 italic">The golden rule: end somewhere restful. After two weeks of forts and cities, a Kerala houseboat is the perfect full stop.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-10 p-6 rounded-2xl bg-teal-50 border border-teal-200 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
          <p className="font-bold font-heading text-lg text-teal-700 mb-2 flex items-center gap-2">
            ✓ How to get between cities
          </p>
          <p className="text-slate-700 m-0 text-base">
            <strong className="font-bold">Trains</strong> are the soul of Indian travel — book AC classes early via IRCTC (the official railway site/app) or a tool like 12Go. <strong className="font-bold">Private car + driver</strong> is the comfortable, flexible favourite for the Golden Triangle and Rajasthan. <strong className="font-bold">Domestic flights</strong> (IndiGo, Air India, Akasa) are cheap and save days on long hops like Delhi→Varanasi or anywhere→the south.
          </p>
        </div>
      </div>
    </section>
  );
}

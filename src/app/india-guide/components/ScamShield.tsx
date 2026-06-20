"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScamShield() {
  const [openId, setOpenId] = useState<number | null>(1);

  const scams = [
    {
      id: 1,
      tag: "Transport",
      title: "The auto/taxi \"no meter\" overcharge",
      desc: "The oldest one going. A driver refuses the meter, quotes a flat fare 3–5× the real price, or \"the meter's broken.\" A 3 km ride that should be ₹50–80 becomes ₹300.",
      shield: "Use Uber or Ola (fixed price, GPS-tracked, no haggling). For autos, agree the fare before getting in, or insist on the meter. Check the rough distance on Google Maps first so you know what's fair."
    },
    {
      id: 2,
      tag: "Classic",
      title: "The fake \"Tourist Office\"",
      desc: "Near big stations (especially Delhi's Paharganj & Connaught Place) someone in an official-looking shirt says the real tourist office \"moved\" or that foreigners need to \"register.\" You're walked to a convincing fake office and told your hotel is fake or your train is cancelled — then sold an overpriced \"tour.\"",
      shield: "There is no special registration for tourists. Government offices never tout on the street. Book tours through your hotel or a verified operator, and ignore anyone who approaches you first."
    },
    {
      id: 3,
      tag: "Arrival",
      title: "\"Your hotel is closed / burned down\"",
      desc: "A taxi or auto driver insists your booked hotel is full, closed, or \"had a fire last night\" — then offers a \"better\" one where he earns commission (and you pay double).",
      shield: "Call the hotel yourself, in front of the driver, to confirm. Better: arrange an airport/station pickup through your hotel in advance and skip random drivers entirely."
    },
    {
      id: 4,
      tag: "Rajasthan",
      title: "The gemstone / export scam",
      desc: "The most financially damaging one, and Jaipur's specialty. A friendly new \"friend\" or driver mentions cheap export-quality gems. You're shown beautiful stones and told you can't carry them out yourself — but they'll \"ship them home\" and you can resell at a profit. You pay thousands; worthless glass arrives, or nothing does.",
      shield: "Never buy gems to \"resell.\" It is always a scam. Buy jewellery only from established, certified shops, with a proper GST receipt, and only if you want to keep it."
    },
    {
      id: 5,
      tag: "Monuments",
      title: "\"It's closed today\" + the fake guide",
      desc: "Outside the Taj, Red Fort, Amber Fort: a stranger says the site is \"closed for a ceremony / lunch / VIP\" and offers to take you somewhere else (a shop) instead. Cousins of this: fake guides who attach themselves then demand a big fee, and fake \"tickets\" sold outside the gate.",
      shield: "Verify opening hours on Google and walk to the official gate yourself. Buy tickets only at the official counter or the ASI website. Hire guides only through your hotel or with a government licence ID."
    }
  ];

  return (
    <section id="scams" className="py-24 bg-slate-900 text-white">
      <div className="max-w-3xl mx-auto px-6">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs tracking-[0.16em] uppercase text-orange-400 mb-4 flex items-center gap-3"
        >
          <span className="w-6 h-[2px] bg-orange-500"></span>
          03 — The Scam Shield
        </motion.p>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold font-heading text-white mb-4 tracking-tight"
        >
          The core scams to know cold
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xl text-slate-300 mb-10"
        >
          Almost every tourist scam in India follows a script. Learn these and you'll spot them mid-sentence — and most "scams" are just money, not danger.
        </motion.p>

        <div className="space-y-4">
          {scams.map((scam) => (
            <motion.div 
              key={scam.id}
              className="bg-white text-slate-900 rounded-2xl border-l-4 border-pink-500 overflow-hidden shadow-lg transition-all"
            >
              <button 
                onClick={() => setOpenId(openId === scam.id ? null : scam.id)}
                className="w-full px-6 py-5 flex items-center justify-between text-left font-heading font-bold text-lg"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[10px] tracking-wider uppercase bg-pink-100 text-pink-600 px-2 py-1 rounded">
                    {scam.tag}
                  </span>
                  {scam.title}
                </div>
                <motion.span 
                  animate={{ rotate: openId === scam.id ? 45 : 0 }}
                  className="text-pink-500 text-2xl"
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence>
                {openId === scam.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-0 border-t border-slate-100 font-sans">
                      <p className="text-slate-700 text-base mt-4 mb-4">
                        {scam.desc}
                      </p>
                      <div className="bg-teal-50 rounded-xl p-4 text-base">
                        <strong className="font-heading font-bold text-teal-800">Shield → </strong>
                        <span className="text-slate-700">{scam.shield}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 bg-teal-500/20 border border-teal-500/40 rounded-2xl p-6 shadow-sm">
          <p className="font-bold font-heading text-lg text-teal-300 mb-2 flex items-center gap-2">
            ✓ The universal shield
          </p>
          <p className="text-slate-300 m-0 text-base font-sans">
            99% of scams start the same way: <strong className="font-bold text-white">a stranger approaches you</strong> with unsolicited "help," a "deal," or "bad news." Real help in India rarely seeks you out and asks for money. A warm, firm "No thank you" — and continuing to walk — defeats almost everything in this section.
          </p>
        </div>
      </div>
    </section>
  );
}

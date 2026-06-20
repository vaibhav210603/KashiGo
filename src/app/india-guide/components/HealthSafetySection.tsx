"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HealthSafetySection() {
  return (
    <>
      {/* Belly Section */}
      <section id="belly" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-mono text-xs tracking-[0.16em] uppercase text-orange-600 mb-4 flex items-center gap-3"
          >
            <span className="w-6 h-[2px] bg-orange-500"></span>
            02 — Food & Water
          </motion.p>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-4 tracking-tight"
          >
            Beating "Delhi Belly"
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl text-slate-600 mb-10"
          >
            The single most common thing that derails a trip to India isn't crime — it's an upset stomach. The good news: it's almost entirely preventable.
          </motion.p>

          <div className="space-y-6 text-lg text-slate-800 leading-relaxed font-sans">
            <p>
              "Delhi Belly" is just the local nickname for traveller's diarrhoea — your gut meeting unfamiliar bacteria, usually through <strong className="font-bold">water</strong> rather than food itself. Most cases trace back to one careless moment: ice in a drink, a rinsed salad, brushing teeth with tap water. Master a few rules and you can eat your way across India happily.
            </p>

            <div className="my-8 p-6 rounded-2xl bg-pink-50 border border-pink-200 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
              <p className="font-bold font-heading text-lg text-pink-600 mb-2 flex items-center gap-2">
                💧 The one rule that prevents most of it
              </p>
              <p className="text-slate-700 m-0 text-base">
                <strong className="font-bold">Never drink the tap water — and that includes ice, fresh juices made with tap water, and even rinsing your toothbrush.</strong> Drink sealed bottled water (check the seal is intact) or use a filter bottle like a Grayl or LifeStraw. This single habit stops the majority of stomach trouble.
              </p>
            </div>

            <h3 className="text-2xl font-bold font-heading text-slate-900 mt-12 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl">🚦</span>
              The food traffic light
            </h3>

            <div className="relative w-full aspect-[16/9] mb-8 rounded-2xl overflow-hidden shadow-md border border-slate-200">
              <Image 
                src="/food_guide.png" 
                alt="Indian Street Food" 
                fill 
                className="object-cover"
              />
            </div>
            
            <p className="mb-8">
              You don't need to avoid street food — some of India's best meals are cooked in front of you on a cart. You need to read the situation. Heat kills bugs; busy stalls mean fast turnover; your eyes are a good filter.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* GO */}
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
                <h4 className="flex items-center gap-2 text-sm uppercase tracking-widest font-bold text-teal-800 mb-4">
                  <span className="w-3 h-3 rounded-full bg-teal-500"></span> Green — tuck in
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-base text-slate-700">
                  <li>Freshly cooked, <strong className="font-bold">served piping hot</strong> (curries, dal, fried snacks)</li>
                  <li>Busy stalls with a queue of locals &amp; families</li>
                  <li><strong className="font-bold">Hot chai</strong> — the water's boiled, it's one of the safest things going</li>
                  <li>Samosas, pakoras, dosas, idli — high-heat cooked</li>
                  <li>Fruit <strong className="font-bold">you peel yourself</strong> (bananas, oranges)</li>
                  <li>Sealed bottled water &amp; sealed packaged snacks</li>
                </ul>
              </div>
              
              {/* CARE */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
                <h4 className="flex items-center gap-2 text-sm uppercase tracking-widest font-bold text-amber-600 mb-4">
                  <span className="w-3 h-3 rounded-full bg-orange-500"></span> Amber — think twice
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-base text-slate-700">
                  <li>Dairy left unrefrigerated (some lassis, sweets)</li>
                  <li>Meat from small street stalls — go veg when unsure</li>
                  <li>Buffets — be first, while it's hot &amp; fresh</li>
                  <li>Reheated dishes sitting out</li>
                  <li>"Western" food in non-Western places (often riskier than local food)</li>
                </ul>
              </div>

              {/* STOP */}
              <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
                <h4 className="flex items-center gap-2 text-sm uppercase tracking-widest font-bold text-pink-600 mb-4">
                  <span className="w-3 h-3 rounded-full bg-pink-500"></span> Red — skip it
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-base text-slate-700">
                  <li><strong className="font-bold">Tap water &amp; ice</strong> — the number-one culprit</li>
                  <li>Raw salads &amp; pre-cut fruit (rinsed in tap water)</li>
                  <li>Street juices &amp; sugarcane (tap water + open air)</li>
                  <li>Golgappa / pani puri with unknown water</li>
                  <li>Anything that smells or looks "off" — trust your nose</li>
                </ul>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-teal-50/50 border border-teal-200 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
              <p className="font-bold font-heading text-lg text-teal-700 mb-2 flex items-center gap-2">
                ✓ Pro move: go (mostly) vegetarian
              </p>
              <p className="text-slate-700 m-0 text-base">
                India is the easiest country on earth to eat vegetarian — look for "Veg" and "Pure Veg" everywhere. Going veg for the trip removes one of the biggest bacteria risks and you'll honestly eat better for it. "Cook it, peel it, or leave it" is the whole philosophy in five words.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section id="safety" className="py-24 bg-[#F4ECE0]">
        <div className="max-w-3xl mx-auto px-6">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-mono text-xs tracking-[0.16em] uppercase text-orange-600 mb-4 flex items-center gap-3"
          >
            <span className="w-6 h-[2px] bg-orange-500"></span>
            04 — Safety & Solo Travel
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-4 tracking-tight"
          >
            Staying safe, calmly
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl text-slate-600 mb-10"
          >
            India sees far less violent crime against tourists than headlines suggest. The real challenges are stomach bugs, scams and culture shock. A little street-smarts handles the rest.
          </motion.p>

          <div className="space-y-6 text-lg text-slate-800 leading-relaxed font-sans">
            <p>
              Let's be straight, because vagueness helps no one: India is generally <strong className="font-bold">safe for tourists</strong>, and crime against visitors is rarer than the media implies. It's also a place that rewards awareness — busy, intense, and in many regions conservative. Travel with the same instincts you'd use in any unfamiliar big city, dial them up a notch, and you'll be fine.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
                <h4 className="text-sm uppercase tracking-widest font-bold text-teal-800 mb-4">Smart habits</h4>
                <ul className="list-none space-y-3 text-base text-slate-700">
                  <li className="relative pl-6"><span className="absolute left-0 text-teal-600 font-bold">✓</span> Arrive in new cities <strong className="font-bold">before dark</strong></li>
                  <li className="relative pl-6"><span className="absolute left-0 text-teal-600 font-bold">✓</span> Pre-book airport/station pickups through your hotel</li>
                  <li className="relative pl-6"><span className="absolute left-0 text-teal-600 font-bold">✓</span> Share your live location with someone back home</li>
                  <li className="relative pl-6"><span className="absolute left-0 text-teal-600 font-bold">✓</span> Keep a charged power bank — your phone is your lifeline</li>
                  <li className="relative pl-6"><span className="absolute left-0 text-teal-600 font-bold">✓</span> Stick to AC trains/buses &amp; reputable hotels with reviews</li>
                </ul>
              </div>
              <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
                <h4 className="text-sm uppercase tracking-widest font-bold text-pink-600 mb-4">Avoid</h4>
                <ul className="list-none space-y-3 text-base text-slate-700">
                  <li className="relative pl-6"><span className="absolute left-0 text-pink-600 font-bold">✕</span> Unregistered taxis &amp; empty late-night autos</li>
                  <li className="relative pl-6"><span className="absolute left-0 text-pink-600 font-bold">✕</span> Walking alone in unlit, deserted areas at night</li>
                  <li className="relative pl-6"><span className="absolute left-0 text-pink-600 font-bold">✕</span> Flashing expensive cameras, phones or jewellery</li>
                  <li className="relative pl-6"><span className="absolute left-0 text-pink-600 font-bold">✕</span> Overnight buses/trains alone in unreserved class</li>
                  <li className="relative pl-6"><span className="absolute left-0 text-pink-600 font-bold">✕</span> Drinking heavily alone in unfamiliar places</li>
                </ul>
              </div>
            </div>

            <h3 className="text-2xl font-bold font-heading text-slate-900 mt-12 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xl shadow-sm">👩</span>
              For solo female travellers
            </h3>
            <p>
              Thousands of women travel India solo every year and have the trip of their lives — but it asks for more vigilance than Europe or Southeast Asia, and that's worth saying plainly rather than glossing over. The biggest single lever you control is how you dress and carry yourself.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base mb-10">
              <li><strong className="font-bold">Dress modestly</strong> — cover shoulders and knees. A loose <em className="italic">kurta</em> over leggings plus a light scarf (dupatta) is comfortable, cheap to buy locally, respectful, and dramatically reduces unwanted attention.</li>
              <li><strong className="font-bold">Carry a scarf</strong> everywhere — it covers your head at temples and your shoulders in conservative towns.</li>
              <li><strong className="font-bold">Set firm boundaries.</strong> You don't owe anyone politeness at the cost of your comfort. A cold, direct "No" and walking away is completely acceptable.</li>
              <li><strong className="font-bold">Be reserved with men</strong> you don't know — over-friendliness or casual touching can be misread. Sit in the back of cabs.</li>
            </ul>

            <div className="bg-slate-900 text-white rounded-2xl p-8 my-10 shadow-lg">
              <h4 className="text-sm tracking-widest uppercase font-bold text-white mb-6 flex items-center gap-3">
                ☎ Emergency numbers — memorise 112
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
                <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-300">All-in-one emergency</span><span className="font-mono font-bold text-orange-400">112</span></div>
                <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-300">Tourist helpline (24×7)</span><span className="font-mono font-bold text-orange-400">1363</span></div>
                <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-300">Women's helpline</span><span className="font-mono font-bold text-orange-400">1091</span></div>
                <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-300">Ambulance</span><span className="font-mono font-bold text-orange-400">108</span></div>
                <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-300">Police</span><span className="font-mono font-bold text-orange-400">100</span></div>
                <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-300">Fire</span><span className="font-mono font-bold text-orange-400">101</span></div>
              </div>
              <p className="mt-6 text-sm text-slate-400">Add your embassy's number and address before you fly, and screenshot this card so it works offline.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

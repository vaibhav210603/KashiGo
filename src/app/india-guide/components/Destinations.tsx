"use client";
import { motion } from "framer-motion";

function DestinationDossier({
  id,
  num,
  name,
  aka,
  verdict,
  days,
  season,
  vibe,
  extra,
  extraLabel,
  content
}: any) {
  return (
    <section id={id} className="py-24 border-t border-slate-100">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-slate-900 text-white rounded-3xl overflow-hidden shadow-xl mb-12">
          <div className="p-8 md:p-10 relative">
            <div className="font-mono text-xs tracking-[0.2em] text-orange-400 uppercase mb-3">{num}</div>
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-2">{name}</h2>
            <div className="font-serif italic text-xl text-slate-300 mb-6">{aka}</div>
            <p className="text-lg text-slate-200 max-w-2xl font-sans leading-relaxed">{verdict}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-slate-800 bg-slate-800/50">
            <div className="p-5 border-r border-b md:border-b-0 border-slate-800">
              <div className="font-mono text-[10px] tracking-widest uppercase text-slate-400 mb-2">Days needed</div>
              <div className="font-bold font-heading text-lg">{days}</div>
            </div>
            <div className="p-5 border-r border-b md:border-b-0 border-slate-800">
              <div className="font-mono text-[10px] tracking-widest uppercase text-slate-400 mb-2">Best season</div>
              <div className="font-bold font-heading text-lg">{season}</div>
            </div>
            <div className="p-5 border-r border-slate-800">
              <div className="font-mono text-[10px] tracking-widest uppercase text-slate-400 mb-2">Vibe</div>
              <div className="font-bold font-heading text-lg">{vibe}</div>
            </div>
            <div className="p-5">
              <div className="font-mono text-[10px] tracking-widest uppercase text-slate-400 mb-2">{extraLabel}</div>
              <div className="font-bold font-heading text-lg">{extra}</div>
            </div>
          </div>
        </div>
        
        <div className="text-lg text-slate-800 leading-relaxed font-sans prose prose-lg prose-slate max-w-none">
          {content}
        </div>
      </div>
    </section>
  );
}

export default function Destinations() {
  return (
    <>
      <section className="bg-slate-900 text-center py-32 border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-6">
          <p className="font-mono text-xs tracking-[0.2em] text-orange-500 uppercase mb-4">Part Two</p>
          <h2 className="text-5xl md:text-6xl font-bold font-heading text-white mb-6">The Destinations</h2>
          <p className="text-xl text-slate-300">
            Eight places, each with a one-screen dossier, what to see, what's safe to eat, the local scams — and the one insider tip we'd give a friend.
          </p>
        </div>
      </section>

      {/* Delhi */}
      <DestinationDossier 
        id="delhi" num="Destination 07" name="Delhi" aka="Where every great India trip begins"
        verdict="Loud, layered, a thousand years of empires stacked on top of each other. It overwhelms on arrival — then becomes the city you secretly miss."
        days="2–3" season="Oct–Mar" vibe="Intense capital" extraLabel="Solo-female read" extra="Aware, manageable"
        content={
          <>
            <p>Most trips start here, so most culture shock lands here. Give yourself a buffer day — jet-lagged and sensory-overloaded is the worst state to make decisions in. Delhi is really two cities: <strong className="font-bold">Old Delhi</strong>, a Mughal maze of spice markets and minarets, and <strong className="font-bold">New Delhi</strong>, the leafy, ordered capital the British built.</p>
            <div className="bg-teal-50 p-6 rounded-2xl my-8">
              <h4 className="font-bold font-heading text-teal-800 text-lg mb-2">✦ Insider tip</h4>
              <p className="text-base m-0">Do Old Delhi by <strong className="font-bold">cycle-rickshaw with a guide</strong>, not on foot the first time — you'll see twice as much, get the stories, and a local presence melts away the touts. Then come back on foot once you've found your feet.</p>
            </div>
          </>
        }
      />

      {/* Agra */}
      <DestinationDossier 
        id="agra" num="Destination 08" name="Agra" aka="Home of the Taj Mahal"
        verdict="You come for one building — and it lives up to every photograph and then some. One perfect day, done right, is all Agra asks."
        days="1–2" season="Oct–Mar" vibe="Pilgrimage to beauty" extraLabel="Closed" extra="Taj shut Fridays"
        content={
          <>
            <p>The Taj Mahal is the rare icon that exceeds the hype. Built by Shah Jahan as a tomb for his wife Mumtaz, it shifts colour from grey to pink to blinding white as the sun rises over it. Beyond the Taj, Agra has a magnificent fort and a "Baby Taj" most people skip — and should not.</p>
            <div className="bg-teal-50 p-6 rounded-2xl my-8">
              <h4 className="font-bold font-heading text-teal-800 text-lg mb-2">✦ Insider tip</h4>
              <p className="text-base m-0">Don't sleep in Agra unless you want sunrise <em>and</em> sunset Taj views. Many do Agra as a long day-trip from Delhi or a stop on the way to Jaipur — but staying one night lets you catch the Taj at dawn (best light, fewest people) and Mehtab Bagh at dusk.</p>
            </div>
          </>
        }
      />

      {/* Jaipur */}
      <DestinationDossier 
        id="jaipur" num="Destination 09" name="Jaipur" aka="Rajasthan's royal capital"
        verdict="Forts on the hills, palaces in the centre, and bazaars bursting with block-print, gemstones and silver. The third point of the Triangle, and many people's favourite."
        days="2–3" season="Oct–Mar" vibe="Royal & vibrant" extraLabel="Shopping" extra="World-class"
        content={
          <>
            <p>Painted pink in 1876 to welcome a prince, Jaipur is the gateway to the "Land of Kings." It's where the Mughal-tinged north gives way to the colour and swagger of Rajasthan — and where, fair warning, the famous gem scam was practically invented.</p>
            <div className="bg-teal-50 p-6 rounded-2xl my-8">
              <h4 className="font-bold font-heading text-teal-800 text-lg mb-2">✦ Insider tip</h4>
              <p className="text-base m-0">The best Hawa Mahal photo isn't from the street — it's from the rooftop of the Tattoo Café directly across the road, chai in hand, at sunrise before the traffic builds.</p>
            </div>
          </>
        }
      />

      {/* Udaipur */}
      <DestinationDossier 
        id="udaipur" num="Destination 10" name="Udaipur" aka="India's most romantic city"
        verdict="White palaces floating on blue lakes, ringed by green hills. After the intensity of the north, Udaipur feels like exhaling. Many travellers' single favourite stop."
        days="2–3" season="Oct–Mar" vibe="Calm & romantic" extraLabel="Solo-female read" extra="Among the gentlest"
        content={
          <>
            <p>Built around Lake Pichola, Udaipur is softer, slower and more relaxed than its Rajasthani cousins — the place to swap fort-fatigue for rooftop dinners and boat rides at golden hour. It's also a comfortable, welcoming first stop for solo travellers.</p>
          </>
        }
      />

      {/* Varanasi */}
      <DestinationDossier 
        id="varanasi" num="Destination 12" name="Varanasi" aka="Kashi — the city older than history"
        verdict="The most intense, sacred, overwhelming place in India. Life and death happen openly on the banks of the Ganges, and nobody leaves unchanged. Our home turf."
        days="2–3" season="Oct–Mar" vibe="Profound & raw" extraLabel="Newcomer read" extra="A local guide helps"
        content={
          <>
            <p>Varanasi (Kashi/Benares) is said to be one of the oldest continuously inhabited cities on Earth, and the holiest place in Hinduism. Pilgrims come to bathe in the Ganges, to pray, and to die here — cremations burn openly on the ghats day and night. It is beautiful, confronting, and unlike anywhere else you'll ever stand.</p>
            <div className="bg-orange-50 border border-orange-200 p-6 rounded-2xl my-8">
              <h4 className="font-bold font-heading text-orange-600 text-lg mb-2">✦ Insider tip — from KashiGo</h4>
              <p className="text-base m-0 text-slate-800">Varanasi reveals itself to those who slow down. Don't just "tick" the ghats — sit on the steps at dawn with a chai and just watch the city pray. And in this one city above all others, a knowledgeable local guide turns confusion into meaning. This is exactly what we built <strong className="font-bold">KashiGo</strong> to do.</p>
            </div>
          </>
        }
      />
    </>
  );
}

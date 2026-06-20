"use client";
import { motion } from "framer-motion";

export default function EssentialsSection() {
  return (
    <section id="essentials" className="py-24 bg-[#F4ECE0]">
      <div className="max-w-3xl mx-auto px-6">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-xs tracking-[0.16em] uppercase text-orange-600 mb-4 flex items-center gap-3"
        >
          <span className="w-6 h-[2px] bg-orange-500"></span>
          01 — The Essentials
        </motion.p>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-4 tracking-tight"
        >
          The seven things to sort before you fly
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xl text-slate-600 mb-10"
        >
          Visa, season, money, connectivity, insurance, vaccines, documents. Get these right and the rest is detail.
        </motion.p>

        <div className="space-y-12 text-lg text-slate-800 leading-relaxed font-sans">
          
          {/* Section 1 */}
          <div>
            <h3 className="text-2xl font-bold font-heading text-slate-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xl shadow-sm">🛂</span>
              1. The e-Visa
            </h3>
            <p className="mb-6">
              Most nationalities enter India on an <strong className="font-bold">e-Tourist Visa</strong>, applied for entirely online. Options usually run from a 30-day double-entry visa up to 1-year and 5-year multiple-entry visas. Apply roughly <strong className="font-bold">4 to 30 days before</strong> you travel.
            </p>
            <div className="p-6 rounded-2xl bg-pink-50 border border-pink-200 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
              <p className="font-bold font-heading text-lg text-pink-600 mb-2 flex items-center gap-2">
                ⚠ Use the official portal only
              </p>
              <p className="text-slate-700 m-0 text-base">
                Apply at the government site — <span className="font-mono bg-white px-1 py-0.5 rounded text-sm border border-slate-200">indianvisaonline.gov.in</span>. Dozens of look-alike sites charge 3–5× the real fee for the same form. If a site looks like an ad and promises "fast-track," close it. Always confirm the current fee, validity options and rules on the official portal before paying.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="text-2xl font-bold font-heading text-slate-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xl shadow-sm">🗓️</span>
              2. When to come
            </h3>
            <p className="mb-6">
              For 90% of first trips — the Golden Triangle, Rajasthan, Varanasi, the cities — the answer is <strong className="font-bold">October to March</strong>. Cool, dry, walkable. It's peak season for a reason.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-white p-4">
                <div className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-1">Oct – Mar · Winter</div>
                <div className="text-base">🟢 Ideal. Cool &amp; dry across the north, Rajasthan, Goa, Kerala. Book ahead — everyone else comes now too.</div>
              </div>
              <div className="bg-white p-4">
                <div className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-1">Apr – Jun · Summer</div>
                <div className="text-base">🟠 Brutal heat (40°C+) in the plains. Good only for Himalayan hill stations &amp; Ladakh.</div>
              </div>
              <div className="bg-white p-4">
                <div className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-1">Jul – Sep · Monsoon</div>
                <div className="text-base">🟠 Heavy rain, lush landscapes, lower prices. Kerala is beautiful; sightseeing elsewhere gets soggy.</div>
              </div>
              <div className="bg-white p-4">
                <div className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-1">Festival windows</div>
                <div className="text-base">🟡 Diwali (Oct/Nov) &amp; Holi (Mar) are magical but crowded — book months early.</div>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="text-2xl font-bold font-heading text-slate-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xl shadow-sm">💳</span>
              3. Money — cash is still king
            </h3>
            <p className="mb-4">
              India runs on the <strong className="font-bold">rupee (₹)</strong> and, increasingly, on UPI digital payments. As a foreigner you'll lean on <strong className="font-bold">cash and cards</strong>, because UPI usually needs an Indian bank account.
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6 text-base">
              <li><strong className="font-bold">Withdraw from bank ATMs</strong> (SBI, HDFC, ICICI, Axis) inside branches — avoid stand-alone machines in markets.</li>
              <li><strong className="font-bold">Carry small notes.</strong> Rickshaw drivers and chai stalls rarely break a ₹500. Hoard ₹10/20/50/100 notes.</li>
              <li><strong className="font-bold">Tell your bank</strong> you're travelling so your card isn't frozen on day one.</li>
              <li><strong className="font-bold">Tipping:</strong> ~10% at restaurants; ₹20–50 for porters and helpful drivers. Appreciated, not obligatory.</li>
            </ul>
            <div className="p-6 rounded-2xl bg-teal-50 border border-teal-200 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
              <p className="font-bold font-heading text-lg text-teal-700 mb-2 flex items-center gap-2">
                ✓ The "split your cash" habit
              </p>
              <p className="text-slate-700 m-0 text-base">
                Never keep all your money in one place. A day's spending in your pocket, the rest in your bag, an emergency $100 hidden separately. If a wallet goes missing, your trip doesn't.
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div>
            <h3 className="text-2xl font-bold font-heading text-slate-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xl shadow-sm">📶</span>
              4. Staying connected
            </h3>
            <p className="mb-6">
              A working phone with maps and a ride app is your single best safety tool. Two routes:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden mb-6">
              <div className="bg-white p-4">
                <div className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-1">Local SIM (cheapest)</div>
                <div className="text-base"><strong className="font-bold">Airtel</strong> or <strong className="font-bold">Jio</strong> from an <em>official</em> store or airport kiosk. Bring passport + visa + a hotel address. ~₹300–800 for 28 days. Airtel tends to deliver OTPs fastest.</div>
              </div>
              <div className="bg-white p-4">
                <div className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-1">eSIM (zero hassle)</div>
                <div className="text-base">Providers like Airalo, Holafly or Saily activate <em>before</em> you land — no paperwork, no store queue. Slightly pricier, far simpler. Great for short trips.</div>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-pink-50 border border-pink-200 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
              <p className="font-bold font-heading text-lg text-pink-600 mb-2 flex items-center gap-2">
                ⚠ Buy SIMs from official stores only
              </p>
              <p className="text-slate-700 m-0 text-base">
                Roadside SIM sellers are a known scam — they may never activate, or register the number to your passport for someone else's use. Airtel/Jio company stores or airport counters only.
              </p>
            </div>
          </div>

          {/* Section 5, 6, 7 */}
          <div>
            <h3 className="text-2xl font-bold font-heading text-slate-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xl shadow-sm">🩺</span>
              5. Insurance &amp; vaccines
            </h3>
            <p className="mb-8">
              <strong className="font-bold">Travel insurance is non-negotiable</strong> — get a policy that covers medical evacuation. Private hospitals in major cities are excellent but pay-upfront. For vaccines, see a travel clinic <strong className="font-bold">4–6 weeks ahead</strong>; commonly advised for India are <strong className="font-bold">Hepatitis A &amp; B, Typhoid, Tetanus</strong>, and a malaria conversation depending on your route. This book isn't medical advice — your travel doctor has the final word.
            </p>

            <h3 className="text-2xl font-bold font-heading text-slate-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xl shadow-sm">📄</span>
              6 &amp; 7. Documents &amp; copies
            </h3>
            <p>
              Photograph your passport, visa, insurance and a couple of passport photos, and email them to yourself + store them offline. Hotels and SIM shops will ask for passport copies constantly — having a stack saves time. Keep the physical passport in the hotel safe and carry a copy by day.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

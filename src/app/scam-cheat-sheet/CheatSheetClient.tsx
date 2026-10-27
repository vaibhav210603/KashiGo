"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, animate, motion } from "framer-motion";
import { ArrowRight, Check, Download, RotateCcw, Sparkles, Trophy, X } from "lucide-react";
import PageHero from "@/components/layout/PageHero";
import Checkout from "@/components/shop/Checkout";
import { useRegion } from "@/components/shop/useRegion";
import { RegionToggle, TrustRow } from "@/components/shop/ui";
import { Eyebrow, Reveal } from "@/components/motion/primitives";
import { FIRE_BTN, H2_LIGHT, PAPER_CARD } from "@/components/ui/styles";
import { TRIVIA_GUIDE } from "@/lib/products";
import { track } from "@/lib/analytics";

const PDF = "/Varanasi-Scam-Cheat-Sheet.pdf";
// The guide's usual price, which the unlock animation counts down from.
const FULL = { usd: 14.99, inr: 999 };

const SCAMS = [
    { t: "The boat “price list”", trick: "A laminated “official” card quotes ₹3,000–5,000 for a sunrise ride — or the price is secretly per person and doubles mid-river.", move: "A private wooden boat (2–4 people) is ₹800–1,500 an hour. Agree the total price AND the exact duration before you step in." },
    { t: "Manikarnika “wood donation”", trick: "A kind “helper” explains the cremation, walks you to a balcony, then asks for money toward a family’s firewood.", move: "It’s invented — the families have already paid. Never follow anyone up the stairs. No photos." },
    { t: "The “free” tour / English practice", trick: "A friendly “student” just wants to practise English and show you the real city for free.", move: "Every shop he walks you into pays him 30–50%. Say “no thanks” and keep walking." },
    { t: "The ghat “entry ticket”", trick: "Someone at the top of the steps sells a “ticket” or “camera fee” to enter the ghats.", move: "The ghats are public and free. Always. Walk straight past." },
    { t: "“The temple’s closed” detour", trick: "Your driver says your temple is shut for a ceremony and offers a “government” silk emporium to wait at.", move: "It isn’t closed. He earns 20–40% on anything you buy. Name your stops up front: “no shops, please.”" },
    { t: "The fake sadhu photo", trick: "A holy man in saffron beckons you for a photo, then demands ₹500–1,000.", move: "Agree a price first if you want the shot — ₹20–50 is respectful. If you didn’t ask, you owe nothing." },
    { t: "The “friend boatman” introducer", trick: "A stranger insists on taking you to “his friend, the best boatman” — then vanishes.", move: "The boatman’s price already hides his 30–50% kickback. You didn’t ask for help — don’t pay for it." },
    { t: "ATM “helpers”", trick: "A “helpful” local hovers at the ATM offering to assist you.", move: "Cover your PIN, refuse all help, and use machines inside banks during busy hours." },
    { t: "The foreigner price", trick: "No price is displayed; the shopkeeper reads your clothes and quotes 3–5×.", move: "Packaged goods have an MRP printed on them — never pay above it. For crafts, haggle or use fixed-price government emporiums." },
];

const PRICES = [
    ["Private boat (2–4 people)", "₹800–1,500 / hour"],
    ["Shared public boat", "₹30–100 / person"],
    ["Airport prepaid taxi into town", "₹800–1,000"],
    ["Sadhu photo (only if you ask)", "₹20–50"],
    ["Ganga Aarti at Dashashwamedh", "Free — ~6:45pm, arrive by 5:45pm"],
    ["Best sunrise boat window", "5:00–6:30am"],
    ["Packaged water & snacks", "Never above the printed MRP"],
];

// Every answer is in the cheat sheet above. `a` is the index of the right option.
const QUIZ = [
    { q: "What's a fair price for a private wooden boat for 2–4 people?", o: ["₹3,000–5,000 for the ride", "₹800–1,500 an hour", "₹200 an hour"], a: 1 },
    { q: "Someone at the top of the steps sells you a ghat “entry ticket”. What do you do?", o: ["Pay — it's the camera fee", "Haggle it down to half", "Walk past — the ghats are always free"], a: 2 },
    { q: "Your driver says the temple is closed for a ceremony. What's really going on?", o: ["It isn't closed — he earns 20–40% at the shop he suggests", "It really is closed, so wait at the emporium", "You need a VIP pass to get in"], a: 0 },
    { q: "You asked a sadhu for a photo. What's a respectful amount?", o: ["₹500–1,000", "₹20–50", "Nothing — never pay"], a: 1 },
    { q: "What's the most you should pay for a bottle of packaged water?", o: ["Whatever the shopkeeper quotes", "₹100 — it's a tourist area", "The MRP printed on the bottle"], a: 2 },
];

export default function CheatSheetClient() {
    const [region, setRegion] = useRegion();
    const [picks, setPicks] = useState<(number | null)[]>(() => QUIZ.map(() => null));
    const [checked, setChecked] = useState(false);
    const [checkout, setCheckout] = useState(false);

    const allAnswered = picks.every((p) => p !== null);
    const score = picks.filter((p, i) => p === QUIZ[i].a).length;
    const passed = checked && score === QUIZ.length;

    const pick = (qi: number, oi: number) => {
        if (passed) return;
        setChecked(false);
        setPicks((ps) => ps.map((p, i) => (i === qi ? oi : p)));
    };

    const check = () => {
        setChecked(true);
        track("trivia_submit", { score });
        if (score === QUIZ.length) setTimeout(() => document.getElementById("unlocked")?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
    };

    return (
        <div className="bg-parchment">
            <PageHero
                eyebrow="Free PDF · from a local"
                title="The Varanasi"
                highlight="Scam Cheat Sheet."
                intro="The 9 scams almost every first-timer meets, the one-line move that beats each, and the real prices for boats, taxis and temples."
                deva="दीया"
            >
                <div className="flex flex-wrap items-center gap-4">
                    <a href={PDF} download onClick={() => track("file_download", { file_name: "Varanasi-Scam-Cheat-Sheet.pdf" })} className={`${FIRE_BTN} h-14 px-8 text-lg`}>
                        <Download size={19} /> Download the free PDF
                    </a>
                    <a href="#trivia" className="text-sm font-semibold text-marigold underline decoration-marigold/40 underline-offset-4 hover:decoration-marigold">
                        Or take the trivia → full guide for $5.99
                    </a>
                </div>
            </PageHero>

            <section className="px-4 sm:px-6 pt-16 md:pt-24">
                <div className="max-w-5xl mx-auto">
                    <Eyebrow className="text-fire">The nine</Eyebrow>
                    <h2 className={`${H2_LIGHT} mt-3 text-4xl md:text-6xl`}>Know the trick, <em className="text-fire-deep pr-1">keep your money</em></h2>
                    <ol className="mt-10 grid gap-4 md:grid-cols-2">
                        {SCAMS.map((s, i) => (
                            <Reveal key={s.t} as="li" delay={(i % 2) * 0.06} y={30} className={`${PAPER_CARD} p-5 sm:p-6`}>
                                <div className="flex items-baseline gap-3">
                                    <span className="font-display text-3xl text-fire-deep">{i + 1}</span>
                                    <h3 className="font-display text-xl text-night leading-snug">{s.t}</h3>
                                </div>
                                <p className="mt-3 text-[15px] text-night/65"><b className="text-night/80">The trick:</b> {s.trick}</p>
                                <p className="mt-2 text-[15px] text-night/80"><b className="text-ganga">Your move:</b> {s.move}</p>
                            </Reveal>
                        ))}
                    </ol>

                    <Reveal y={30} className="mt-6 rounded-[1.75rem] bg-night text-white p-6 sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-marigold">The one rule behind all of them</p>
                        <p className="mt-3 font-display text-2xl sm:text-3xl leading-snug">Every scam runs on you not knowing the real price. Never accept help you didn&apos;t ask for. Know the number before you&apos;re quoted one.</p>
                    </Reveal>

                    <div className="mt-16">
                        <Eyebrow className="text-fire">Know before you land</Eyebrow>
                        <h2 className={`${H2_LIGHT} mt-3 text-3xl md:text-5xl`}>The <em className="text-fire-deep pr-1">real numbers</em></h2>
                        <dl className={`${PAPER_CARD} mt-8 divide-y divide-night/10 overflow-hidden`}>
                            {PRICES.map(([k, v]) => (
                                <div key={k} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-5 sm:px-6 py-4">
                                    <dt className="text-night/70">{k}</dt>
                                    <dd className="font-semibold text-night">{v}</dd>
                                </div>
                            ))}
                        </dl>
                        <div className="mt-8 text-center">
                            <a href={PDF} download onClick={() => track("file_download", { file_name: "Varanasi-Scam-Cheat-Sheet.pdf" })} className={`${FIRE_BTN} h-12 px-7`}>
                                <Download size={17} /> Save it as a PDF
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section id="trivia" className="px-4 sm:px-6 py-20 md:py-28 scroll-mt-20">
                <div className="max-w-3xl mx-auto">
                    <Eyebrow className="text-fire">Five-question trivia</Eyebrow>
                    <h2 className={`${H2_LIGHT} mt-3 text-4xl md:text-6xl`}>Get all five right, <em className="text-fire-deep pr-1">get the full guide for $5.99</em></h2>
                    <p className="mt-4 text-lg text-night/65">
                        Every answer is in the cheat sheet above. Answer all five correctly and the full Varanasi Insider Guide — usually ${FULL.usd} — is yours for <b className="text-night">$5.99</b>.
                    </p>

                    <ol className="mt-10 space-y-5">
                        {QUIZ.map((item, qi) => {
                            const wrong = checked && picks[qi] !== null && picks[qi] !== item.a;
                            return (
                                <li key={item.q} className={`${PAPER_CARD} p-5 sm:p-6 transition-colors ${wrong ? "border-ember/50" : ""}`}>
                                    <p className="font-display text-xl text-night leading-snug"><span className="text-fire-deep mr-2">{qi + 1}.</span>{item.q}</p>
                                    <div className="mt-4 grid gap-2">
                                        {item.o.map((opt, oi) => {
                                            const chosen = picks[qi] === oi;
                                            const right = checked && chosen && oi === item.a;
                                            const miss = checked && chosen && oi !== item.a;
                                            return (
                                                <button key={opt} type="button" onClick={() => pick(qi, oi)} aria-pressed={chosen} disabled={passed}
                                                    className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-[15px] transition-colors ${right ? "border-ganga bg-ganga/10 text-night" : miss ? "border-ember bg-ember/10 text-night" : chosen ? "border-night bg-night text-white" : "border-night/15 bg-white/60 text-night/80 hover:border-night/40"}`}>
                                                    <span>{opt}</span>
                                                    {right && <Check size={18} className="text-ganga shrink-0" />}
                                                    {miss && <X size={18} className="text-ember shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </li>
                            );
                        })}
                    </ol>

                    {!passed && (
                        <div className="mt-8 flex flex-col items-center gap-3 text-center">
                            {checked && (
                                <p className="text-night/70">
                                    <b className="text-night">{score} of {QUIZ.length}</b> right — the ones in red need another look. Scroll up to the cheat sheet if you need a hint.
                                </p>
                            )}
                            <button onClick={check} disabled={!allAnswered} className={`${FIRE_BTN} h-14 px-10 text-lg`}>
                                {checked ? <><RotateCcw size={18} /> Check again</> : <>Check my answers <ArrowRight size={18} /></>}
                            </button>
                            {!allAnswered && <p className="text-sm text-night/50">Answer all five to check.</p>}
                        </div>
                    )}

                    <AnimatePresence>{passed && <Unlocked key={region} region={region} setRegion={setRegion} onBuy={() => { track("begin_checkout", { item_id: TRIVIA_GUIDE.id }); setCheckout(true); }} />}</AnimatePresence>

                    <div className="mt-16"><TrustRow /></div>
                </div>
            </section>

            <AnimatePresence>{checkout && <Checkout product={TRIVIA_GUIDE} region={region} onClose={() => setCheckout(false)} />}</AnimatePresence>
        </div>
    );
}

// The reward card: the guide's usual price counts down to the trivia price, then the pay button appears.
// Keyed by region, so switching currency remounts it and replays the countdown.
function Unlocked({ region, setRegion, onBuy }: { region: "inr" | "usd"; setRegion: (r: "inr" | "usd") => void; onBuy: () => void }) {
    const from = region === "inr" ? FULL.inr : FULL.usd;
    const to = region === "inr" ? TRIVIA_GUIDE.inr : TRIVIA_GUIDE.usd;
    const fmt = (n: number) => (region === "inr" ? `₹${Math.round(n).toLocaleString("en-IN")}` : `$${n.toFixed(2)}`);
    const off = Math.round((1 - to / from) * 100);
    const [val, setVal] = useState(from);
    const [done, setDone] = useState(false);

    useEffect(() => {
        const c = animate(from, to, { duration: 1.8, delay: 0.6, ease: [0.16, 1, 0.3, 1], onUpdate: setVal, onComplete: () => setDone(true) });
        return () => c.stop();
    }, [from, to]);

    return (
        <motion.div id="unlocked" initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="grain relative mt-10 overflow-hidden rounded-[2rem] bg-night text-white p-6 sm:p-10 shadow-[0_40px_90px_-30px_rgba(7,11,24,0.7)]">
            <div aria-hidden className="flicker absolute -bottom-24 left-1/2 h-64 w-[80%] -translate-x-1/2 rounded-full bg-fire/30 blur-[90px]" />
            <div className="relative grid gap-8 sm:grid-cols-[150px_1fr] sm:items-center">
                <div className="relative mx-auto aspect-[5/7] w-32 sm:w-full">
                    <Image src={TRIVIA_GUIDE.cover} alt={TRIVIA_GUIDE.name} fill className="object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]" sizes="150px" />
                </div>
                <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-ganga/40 bg-ganga/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ganga">
                        <Trophy size={14} /> 5 of 5 — unlocked
                    </span>
                    <h3 className="mt-4 font-display text-3xl sm:text-4xl leading-tight">{TRIVIA_GUIDE.name}</h3>
                    <ul className="mt-4 space-y-1.5">
                        {TRIVIA_GUIDE.bullets.map((b) => <li key={b} className="flex gap-2 text-[15px] text-white/75"><Check size={16} className="text-ganga shrink-0 mt-0.5" />{b}</li>)}
                    </ul>

                    <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-2">
                        <span className="relative text-xl text-white/45 mb-1.5">
                            {fmt(from)}
                            <motion.span aria-hidden initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.4 }}
                                className="absolute left-0 right-0 top-1/2 h-[2px] origin-left bg-ember" />
                        </span>
                        <motion.span aria-live="polite" animate={done ? { scale: [1, 1.12, 1] } : {}} transition={{ duration: 0.45 }}
                            className={`font-display text-6xl tabular-nums ${done ? "text-marigold" : "text-white"}`}>
                            {fmt(val)}
                        </motion.span>
                        <AnimatePresence>
                            {done && (
                                <motion.span initial={{ opacity: 0, scale: 0.4, rotate: -12 }} animate={{ opacity: 1, scale: 1, rotate: -6 }} transition={{ type: "spring", stiffness: 380, damping: 14 }}
                                    className="mb-3 inline-flex items-center gap-1 rounded-full bg-ember px-3 py-1 text-sm font-bold text-white">
                                    <Sparkles size={14} /> {off}% off
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-4">
                        <motion.button onClick={onBuy} initial={{ opacity: 0, y: 10 }} animate={{ opacity: done ? 1 : 0.5, y: 0 }} disabled={!done}
                            className={`${FIRE_BTN} h-14 px-10 text-lg`}>
                            Pay {fmt(to)} <ArrowRight size={18} />
                        </motion.button>
                        <RegionToggle region={region} setRegion={setRegion} dark />
                    </div>
                    <p className="mt-3 text-xs text-white/45">{TRIVIA_GUIDE.format} · 7-day money-back guarantee</p>
                </div>
            </div>
        </motion.div>
    );
}

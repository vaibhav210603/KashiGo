import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { AlertTriangle, Backpack, BadgeIndianRupee, CalendarDays, Clock, Globe, LifeBuoy, MapPin, Phone, ShieldCheck, Sunrise, Users } from "lucide-react";
import { quoteTotal, type Quote } from "@/lib/quotes";
import { getQuote } from "@/lib/quoteStore";
import { paidQuoteOrder } from "@/lib/quotePayments";
import QuotePay from "./QuotePay";
import PdfDownload from "./PdfDownload";
import QuoteBuilder from "./QuoteBuilder";

export const dynamic = "force-dynamic";

const SITE = "https://kashigo.in";
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) => new Date(`${iso}T00:00:00+05:30`).toLocaleDateString("en-IN", { ...opts, timeZone: "Asia/Kolkata" });

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const q = await getQuote((await params).id);
    return {
        title: q ? `Quotation ${q.id} · ${q.customer.name}` : "Quotation",
        description: q ? `${q.ride.title} at ${q.ride.ghat} — your KashiGo quotation and secure payment page.` : undefined,
        robots: { index: false, follow: false },
    };
}

function carryList(q: Quote): string[][] {
    const { slot } = q.ride;
    return [
        ["Photo ID", "Aadhaar, driving licence or passport."],
        slot === "Afternoon"
            ? ["Cap, sunglasses & sunscreen", "There's little shade on the river in the middle of the day."]
            : ["A light shawl or jacket", `${slot === "Morning" ? "Dawn" : "Evening"} on the river can be cool and breezy.`],
        slot === "Afternoon"
            ? ["Comfortable walking shoes", "The ghat steps are steep and the old-city lanes are narrow."]
            : ["Small torch or phone light", `The ghat steps are dark at ${q.ride.reportTime}.`],
        ["Slip-on footwear with grip", "Steps can be wet and you may remove shoes near temples and the Aarti."],
        ["Phone, charged + power bank", "For photos — and so we can reach you."],
        ["Water bottle & small towel", "Plus tissues or wet wipes."],
        ["Camera with a strap", "A wrist or neck strap so nothing slips into the Ganga."],
        ["Personal medicines", "Including anything for motion sickness, if you need it."],
    ];
}

function carefulList(q: Quote) {
    const aarti = /aarti/i.test(`${q.ride.title} ${q.ride.startLabel}`);
    return [
        { icon: LifeBuoy, title: "Wear your life jacket — always", body: "Put it on before the boat leaves and keep it fastened until you're back on the steps. Ask the boatman if you don't see one. Children must be in one at all times." },
        { icon: AlertTriangle, title: "Stay seated on the boat", body: "Don't stand, lean over the side or sit on the edge for photos. Board and step off only when the boatman says the boat is steady." },
        { icon: MapPin, title: "Mind the steps", body: `Ghat steps are steep, uneven and can be slippery${q.ride.slot === "Afternoon" ? "" : " in low light"}. Take it slow and hold the railing.` },
        { icon: ShieldCheck, title: "Say no to touts", body: "Ignore anyone offering a 'better boat', a 'free' tilak, flowers or blessings — they ask for money afterwards. Your boat is already arranged." },
        aarti
            ? { icon: Sunrise, title: "Respect the Aarti", body: "No flash photography at the priests, keep voices low, and dress modestly (shoulders and knees covered)." }
            : { icon: Sunrise, title: "Respect the ghats", body: "Don't photograph cremations at Manikarnika or Harishchandra, keep voices low near rituals, and dress modestly (shoulders and knees covered)." },
        { icon: Clock, title: "Be on time", body: `Please reach ${q.ride.ghat} by ${q.ride.reportTime} — ${q.ride.startLabel.toLowerCase()} at ${q.ride.startTime}, so we can't wait for late arrivals. Weather or fog may delay the ride — the boatman's safety call is final.` },
    ];
}

// The same layout is used for the printed copy; ?pdf=1 renders it on screen (site chrome hidden) for image exports.
const PRINT_CSS = "body > *:not(main) { display: none !important; } main { padding: 0 !important; }";

export default async function QuotePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ pdf?: string; download?: string }> }) {
    const q = await getQuote((await params).id);
    const sp = await searchParams;
    const pdfMode = sp.pdf === "1";
    if (!q) notFound();

    const total = quoteTotal(q);
    const [paidOrder, qr] = await Promise.all([
        paidQuoteOrder(q),
        QRCode.toString(`${SITE}/quote/${q.id}`, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#070b18", light: "#00000000" } }),
    ]);
    const paid = paidOrder !== null;
    const journeyDate = fmt(q.ride.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const CARRY = carryList(q);
    const CAREFUL = carefulList(q);

    return (
        <div data-quote-doc className="bg-night min-h-screen print:bg-white">
            {pdfMode && <PdfDownload id={q.id} auto={sp.download === "1"} />}
            <style>{pdfMode ? PRINT_CSS : `@media print { ${PRINT_CSS} @page { margin: 12mm; } }`}</style>

            {/* Banner */}
            <section className="relative h-[440px] sm:h-[500px] overflow-hidden print:h-[230px] print:rounded-2xl">
                <Image src={q.ride.image} alt={`${q.ride.title} at ${q.ride.ghat}, Varanasi`} fill priority sizes="100vw" className="object-cover object-center scale-105" />
                <div className="absolute inset-0 bg-gradient-to-b from-night/70 via-night/30 to-night" />
                <div className="absolute inset-0 bg-gradient-to-r from-night/70 via-transparent to-transparent" />
                <div className="relative h-full max-w-5xl mx-auto px-4 sm:px-8 flex flex-col justify-end pb-24 sm:pb-28 print:pb-6">
                    <span className="font-deva text-marigold text-2xl sm:text-3xl">काशी</span>
                    <p className="mt-1 text-xs sm:text-sm font-semibold uppercase tracking-[0.35em] text-white/70">Quotation · {q.id}</p>
                    <h1 className="mt-3 font-display text-white text-4xl sm:text-6xl leading-[1.02]">
                        {q.ride.title}
                        <span className="block italic text-marigold">at {q.ride.ghat}</span>
                    </h1>
                </div>
            </section>

            {/* Document */}
            <div className="relative max-w-5xl mx-auto px-4 sm:px-8 -mt-16 sm:-mt-20 pb-28 print:mt-4 print:px-0 print:pb-0">
                <article className="rounded-[28px] bg-parchment text-night shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] ring-1 ring-sandstone/40 overflow-hidden print:shadow-none print:ring-0">
                    {/* Letterhead */}
                    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-6 sm:px-10 pt-8 pb-6 border-b border-sandstone/40">
                        <div className="flex items-center gap-4">
                            <div className="relative h-20 w-20 rounded-full bg-white ring-4 ring-marigold/30 overflow-hidden shrink-0">
                                <Image src="/KashiGo.png" alt="KashiGo logo" fill sizes="80px" priority className="object-cover" />
                            </div>
                            <div>
                                <p className="font-heading font-extrabold text-2xl tracking-[0.18em]">KASHIGO</p>
                                <p className="font-cursive text-fire text-lg leading-tight">Your ride on the river, just a click away</p>
                            </div>
                        </div>
                        <div className="text-sm text-night/70 sm:text-right leading-relaxed">
                            <p>Varanasi, Uttar Pradesh, India</p>
                            <p><a href="tel:+918175966910" className="hover:text-fire">+91 81759 66910</a> · Call / WhatsApp</p>
                            <p><a href={SITE} className="font-semibold text-fire hover:underline">kashigo.in</a></p>
                        </div>
                    </header>

                    {/* Meta */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-sandstone/30 border-b border-sandstone/40">
                        {[
                            ["Prepared for", q.customer.name],
                            ["Quotation no.", q.id],
                            ["Issued", fmt(q.issued, { day: "numeric", month: "short", year: "numeric" })],
                            ["Valid until", q.validUntil],
                        ].map(([k, v]) => (
                            <div key={k} className="bg-parchment px-6 sm:px-8 py-5">
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-night/45">{k}</p>
                                <p className={`mt-1 font-heading font-bold ${k === "Prepared for" ? "text-xl text-fire" : "text-base"}`}>{v}</p>
                            </div>
                        ))}
                    </div>

                    <div className="px-6 sm:px-10 py-8 sm:py-10 space-y-12">
                        <p className="text-lg leading-relaxed text-night/80 max-w-3xl">
                            Namaste <b className="text-night">{q.customer.name}</b> ji, thank you for choosing KashiGo. {q.intro}
                        </p>

                        {/* Journey */}
                        <section>
                            <SectionTitle kicker="01" title="Your journey" />
                            <div className="grid sm:grid-cols-3 gap-4">
                                <Fact icon={CalendarDays} label="Date" value={journeyDate} />
                                <Fact icon={Sunrise} label={q.ride.startLabel} value={q.ride.startTime} />
                                <Fact icon={Clock} label="Please reach by" value={`${q.ride.reportTime} sharp`} highlight />
                            </div>
                            <div className="mt-4 rounded-2xl bg-white/70 ring-1 ring-sandstone/40 p-5 flex items-start gap-3">
                                <MapPin className="text-fire shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="font-heading font-bold">Meeting point: {q.ride.ghat}, Varanasi{q.ride.guests ? ` · ${q.ride.guests} passenger${q.ride.guests === 1 ? "" : "s"}` : ""}</p>
                                    <p className="text-sm text-night/65 mt-0.5">{q.ride.route}. Can&apos;t find us? Call +91 81759 66910 and we&apos;ll guide you to the boat.</p>
                                </div>
                            </div>
                            {q.passengers && q.passengers.length > 0 && (
                                <div className="mt-4 rounded-2xl bg-white/70 ring-1 ring-sandstone/40 p-5">
                                    <p className="flex items-center gap-2 font-heading font-bold"><Users className="text-fire" size={20} /> Passengers ({q.passengers.length})</p>
                                    <ol className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-2">
                                        {q.passengers.map((p, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <span className="h-7 w-7 rounded-full bg-marigold/20 text-fire grid place-items-center text-xs font-bold shrink-0">{i + 1}</span>
                                                <span className={i === 0 ? "font-heading font-bold" : "text-night/80"}>{p}</span>
                                                {i === 0 && <span className="rounded-full bg-fire/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-fire">Lead</span>}
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                            <ol className="mt-6 relative border-l-2 border-dashed border-marigold/60 ml-3 space-y-5">
                                {q.itinerary.map((s, i) => (
                                    <li key={i} className="pl-6 relative">
                                        <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-marigold ring-4 ring-parchment" />
                                        <p className="font-heading font-bold text-fire text-sm">{s.time}</p>
                                        <p className="text-night/80">{s.what}</p>
                                    </li>
                                ))}
                            </ol>
                        </section>

                        {q.note && (
                            <section className="rounded-2xl bg-marigold/15 ring-1 ring-marigold/40 p-5 sm:p-6">
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-fire">A note from us</p>
                                <p className="mt-2 text-night/80 leading-relaxed whitespace-pre-line">{q.note}</p>
                            </section>
                        )}

                        {/* Quote */}
                        <section>
                            <SectionTitle kicker="02" title="Quotation" />
                            {q.builder ? (
                                <QuoteBuilder quote={{ id: q.id, lines: q.lines, builder: q.builder, customer: q.customer }} paid={paidOrder} readOnly={pdfMode} />
                            ) : (
                            <>
                            <div className="rounded-2xl overflow-hidden ring-1 ring-sandstone/50 bg-white">
                                <table className="w-full text-left">
                                    <thead className="bg-night text-white/80 text-[11px] uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-5 sm:px-6 py-3 font-bold">#</th>
                                            <th className="px-2 py-3 font-bold">Description</th>
                                            <th className="px-5 sm:px-6 py-3 font-bold text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {q.lines.map((l, i) => (
                                            <tr key={i} className="border-t border-sandstone/30">
                                                <td className="px-5 sm:px-6 py-5 align-top font-heading font-bold text-night/40">{String(i + 1).padStart(2, "0")}</td>
                                                <td className="px-2 py-5">
                                                    <p className="font-heading font-bold">{l.label}</p>
                                                    <p className="text-sm text-night/60">{l.detail}</p>
                                                </td>
                                                <td className={`px-5 sm:px-6 py-5 text-right font-heading font-bold tabular-nums whitespace-nowrap ${l.amountInr < 0 ? "text-emerald-700" : ""}`}>{l.amountInr < 0 ? `− ${inr(-l.amountInr)}` : inr(l.amountInr)}</td>
                                            </tr>
                                        ))}
                                        <tr className="border-t border-sandstone/30 text-sm text-night/60">
                                            <td />
                                            <td className="px-2 py-3">Taxes, boatman &amp; life jackets</td>
                                            <td className="px-5 sm:px-6 py-3 text-right">Included</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-5 bg-gradient-to-r from-night to-night-3 text-white">
                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.25em] text-white/55 font-bold">Total payable</p>
                                        <p className="text-xs text-white/50 mt-0.5">One-time · no cash at the ghat</p>
                                    </div>
                                    <p className="font-display text-4xl sm:text-5xl text-marigold tabular-nums">{inr(total)}</p>
                                </div>
                            </div>

                            <div className="mt-6 max-w-xl mx-auto">
                                {paid && <PaidStamp />}
                                {!pdfMode && <QuotePay id={q.id} name={q.customer.name} total={inr(total)} paid={paid} />}
                                {!paid && (
                                    <div className={`${pdfMode ? "" : "hidden print:block"} rounded-2xl bg-white ring-2 ring-marigold/60 p-5 text-center`}>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-night/50">Pay securely online · UPI, cards, net banking</p>
                                        <p className="mt-1.5 font-heading font-extrabold text-lg text-fire break-all">kashigo.in/quote/{q.id}</p>
                                    </div>
                                )}
                            </div>
                            </>
                            )}
                            {q.builder && pdfMode && !paid && (
                                <div className="mt-6 max-w-xl mx-auto rounded-2xl bg-white ring-2 ring-marigold/60 p-5 text-center">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-night/50">Add passengers &amp; extras, then pay online</p>
                                    <p className="mt-1.5 font-heading font-extrabold text-lg text-fire break-all">kashigo.in/quote/{q.id}</p>
                                </div>
                            )}
                        </section>

                        {/* No cash */}
                        <section className="rounded-3xl bg-gradient-to-br from-red-600 to-ember text-white p-6 sm:p-8 flex flex-col sm:flex-row gap-5 sm:items-center shadow-[0_20px_50px_-20px_rgba(220,38,38,0.6)] print:shadow-none">
                            <div className="h-16 w-16 rounded-2xl bg-white/15 grid place-items-center shrink-0">
                                <BadgeIndianRupee size={34} />
                            </div>
                            <div>
                                <p className="font-heading font-extrabold text-xl sm:text-2xl">Please do not pay anything in cash.</p>
                                <p className="mt-1.5 text-white/90 leading-relaxed">
                                    Your ride is paid only through this secure Razorpay link. The boatman, a &ldquo;guide&rdquo; or anyone claiming to be from KashiGo
                                    will <b>never</b> ask you for cash, tips-in-advance or an extra fee. If anyone does, don&apos;t pay — call us on
                                    <a href="tel:+918175966910" className="font-bold underline underline-offset-2"> +91 81759 66910</a>.
                                </p>
                            </div>
                        </section>

                        {/* Carry */}
                        <section>
                            <SectionTitle kicker="03" title="Things to carry" icon={Backpack} />
                            <ul className="grid sm:grid-cols-2 gap-3">
                                {CARRY.map(([t, d]) => (
                                    <li key={t} className="flex gap-3 rounded-2xl bg-white/70 ring-1 ring-sandstone/40 p-4">
                                        <span className="mt-0.5 h-5 w-5 rounded-md border-2 border-fire shrink-0" aria-hidden />
                                        <div>
                                            <p className="font-heading font-bold">{t}</p>
                                            <p className="text-sm text-night/60">{d}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Careful */}
                        <section>
                            <SectionTitle kicker="04" title="Safety & things to be careful about" icon={LifeBuoy} />
                            <div className="grid sm:grid-cols-2 gap-4">
                                {CAREFUL.map(({ icon: Icon, title, body }, i) => (
                                    <div key={title} className={`rounded-2xl p-5 ring-1 ${i === 0 ? "bg-ganga/10 ring-ganga/40" : "bg-white/70 ring-sandstone/40"}`}>
                                        <div className="flex items-center gap-3">
                                            <span className={`h-10 w-10 rounded-xl grid place-items-center ${i === 0 ? "bg-ganga text-white" : "bg-marigold/20 text-fire"}`}>
                                                <Icon size={20} />
                                            </span>
                                            <p className="font-heading font-bold">{title}</p>
                                        </div>
                                        <p className="mt-3 text-sm text-night/70 leading-relaxed">{body}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Payment QR */}
                        <section className="rounded-3xl bg-night text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                            <div className="rounded-2xl bg-white p-4 shrink-0">
                                <div className="h-36 w-36 [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: qr }} />
                            </div>
                            <div className="text-center sm:text-left">
                                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-marigold">{paid ? "Scan to view your booking" : "Scan to pay securely"}</p>
                                <p className="mt-2 font-display text-2xl sm:text-3xl break-all">kashigo.in/quote/{q.id}</p>
                                <p className="mt-2 text-white/65 max-w-md">Opens this quotation on your phone — {q.builder ? "add passengers and extras, then pay" : `pay ${inr(total)}`} by UPI, card or net banking through Razorpay. No cash, ever.</p>
                                <a href={SITE} className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-5 py-2.5 text-sm font-semibold transition-colors">
                                    <Globe size={16} /> More at kashigo.in
                                </a>
                            </div>
                        </section>

                        {/* Sign-off */}
                        <section className="text-center py-6">
                            <p className="font-deva text-4xl sm:text-5xl text-fire">शुभ यात्रा</p>
                            <p className="mt-3 font-display italic text-2xl sm:text-3xl">Have a safe &amp; blessed journey, {q.customer.name.split(" ")[0]} ji.</p>
                            <p className="mt-4 text-night/65 max-w-xl mx-auto leading-relaxed">
                                May the Ganga give you a calm river, {q.ride.slot === "Morning" ? "a golden sunrise and a morning" : q.ride.slot === "Evening" ? "a glowing evening and an hour" : "a bright day and an afternoon"} you&apos;ll remember for a long time.
                                We&apos;ll be waiting for you at {q.ride.ghat}. Har Har Mahadev.
                            </p>
                            <p className="mt-6 font-cursive text-2xl text-night">— Team KashiGo</p>
                        </section>
                    </div>

                    <footer className="px-6 sm:px-10 py-5 bg-parchment-2 border-t border-sandstone/40 flex flex-col sm:flex-row gap-2 justify-between text-xs text-night/55">
                        <p>This quotation is valid for the journey and date above. Prices are in Indian Rupees and include all charges.</p>
                        <p className="flex items-center gap-1.5 shrink-0"><Phone size={12} /> +91 81759 66910 · kashigo.in</p>
                    </footer>
                </article>
            </div>
        </div>
    );
}

function SectionTitle({ kicker, title, icon: Icon }: { kicker: string; title: string; icon?: typeof Clock }) {
    return (
        <div className="flex items-center gap-3 mb-5">
            <span className="font-display italic text-marigold text-2xl">{kicker}</span>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl flex items-center gap-2">
                {Icon && <Icon size={22} className="text-fire" />}
                {title}
            </h2>
            <span className="flex-1 h-px bg-sandstone/50" />
        </div>
    );
}

function Fact({ icon: Icon, label, value, highlight }: { icon: typeof Clock; label: string; value: string; highlight?: boolean }) {
    return (
        <div className={`rounded-2xl p-5 ${highlight ? "bg-gradient-to-br from-fire to-marigold text-night" : "bg-white/70 ring-1 ring-sandstone/40"}`}>
            <Icon size={20} className={highlight ? "text-night" : "text-fire"} />
            <p className={`mt-3 text-[11px] font-bold uppercase tracking-[0.2em] ${highlight ? "text-night/70" : "text-night/45"}`}>{label}</p>
            <p className="mt-1 font-heading font-extrabold text-lg leading-snug">{value}</p>
        </div>
    );
}

function PaidStamp() {
    return (
        <div className="flex justify-center mb-4">
            <span className="rotate-[-6deg] rounded-xl border-4 border-emerald-600 px-6 py-2 font-heading font-extrabold text-3xl tracking-[0.3em] text-emerald-600">PAID</span>
        </div>
    );
}

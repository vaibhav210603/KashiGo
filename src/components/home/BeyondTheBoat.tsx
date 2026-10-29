import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Eyebrow, Reveal, SplitWords } from "@/components/motion/primitives";
import { FIRE_BTN } from "@/components/ui/styles";
import { SERVICES } from "@/lib/services";

// Bento layout: the first service (puja, our newest) gets the big tile.
const SPAN = ["lg:col-span-2 lg:row-span-2 min-h-[26rem] lg:min-h-[36rem]", "min-h-[17rem]", "min-h-[17rem]", "min-h-[17rem]", "min-h-[17rem]"];
const ORDER = ["puja-yajna", "vip-darshan", "quiet-kashi", "hidden-kashi", "kashi-in-a-day"];

// The services beyond the boat: boats stay the headline, this says "and we can do all of Kashi for you".
export default function BeyondTheBoat() {
    const tiles = ORDER.map((id) => SERVICES.find((s) => s.id === id)!);
    return (
        <section id="services" className="grain relative scroll-mt-16 overflow-hidden bg-night py-20 text-white md:py-28">
            <div aria-hidden className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-fire/15 blur-[130px]" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
                <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
                    <div>
                        <Eyebrow className="text-marigold">Beyond the boat</Eyebrow>
                        <h2 className="mt-4 font-display text-5xl font-light leading-[0.95] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
                            <SplitWords text="The river is where we began." className="block" />
                            <SplitWords text="All of Kashi is what we offer." delay={0.2} className="block italic" wordClass="text-fire pr-[0.05em]" />
                        </h2>
                    </div>
                    <Reveal delay={0.15}>
                        <p className="text-lg leading-relaxed text-white/65">The same promise as our boats — one honest price in writing, a local who knows every lane, and nothing to haggle over. Now for darshan, rites, and the quiet Kashi most visitors never see.</p>
                        <Link href="/services" className={`${FIRE_BTN} mt-6 h-13`}>
                            Explore other services <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Reveal>
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {tiles.map((s, i) => (
                        <Reveal key={s.id} delay={i * 0.06} className={`${SPAN[i]} ${i === 0 ? "sm:col-span-2" : ""}`}>
                            <Link href={s.href ?? `/services#${s.id}`} className="group relative flex h-full flex-col justify-end overflow-hidden rounded-[1.75rem] border border-white/10 p-6 sm:p-7">
                                <Image src={s.image} alt="" fill sizes={i === 0 ? "(max-width:1024px) 100vw, 50vw" : "(max-width:640px) 100vw, 25vw"} className="-z-20 object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" />
                                <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/70 to-night/10" />
                                <span aria-hidden className={`absolute right-5 top-3 font-deva leading-none text-white/15 ${i === 0 ? "text-8xl" : "text-6xl"}`}>{s.deva}</span>
                                {s.badge && <span className="absolute left-6 top-6 rounded-full bg-marigold px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-night">{s.badge}</span>}
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <h3 className={`font-display leading-tight ${i === 0 ? "text-4xl sm:text-5xl" : "text-2xl"}`}>{s.name}</h3>
                                        <p className={`mt-2 text-white/70 ${i === 0 ? "max-w-md text-lg" : "text-sm"}`}>{s.tagline}</p>
                                        {i === 0 && (
                                            <ul className="mt-5 flex flex-wrap gap-2">
                                                {s.includes.map((x) => <li key={x} className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">{x}</li>)}
                                            </ul>
                                        )}
                                    </div>
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors group-hover:bg-marigold group-hover:text-night"><ArrowUpRight size={18} /></span>
                                </div>
                            </Link>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

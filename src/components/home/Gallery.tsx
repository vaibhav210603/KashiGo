"use client";

import { useEffect, useRef } from "react";
import { Play } from "lucide-react";
import { Eyebrow, Reveal, SplitWords } from "@/components/motion/primitives";

// Real photos and clips from KashiGo rides (public/gallery). Videos are H.264 with faststart, compressed for the web.
type Item =
    | { kind: "photo"; src: string; alt: string; caption: string; className: string }
    | { kind: "clip"; src: string; poster: string; alt: string; caption: string; className: string };

const ITEMS: Item[] = [
    { kind: "photo", src: "/gallery/lit-bajra-night.jpg", alt: "A bajra boat lit with white lights on the Ganga at night", caption: "Our lit bajra, waiting after dark", className: "col-span-2 aspect-[16/9]" },
    { kind: "clip", src: "/gallery/evening-aarti-group.mp4", poster: "/gallery/evening-aarti-group.jpg", alt: "A group in life jackets filming the ghats from the boat at night", caption: "Evening Aarti ride", className: "row-span-2" },
    { kind: "photo", src: "/gallery/group-aarti-boat.jpg", alt: "A group of guests in life jackets taking photos from the boat at Dashashwamedh at night", caption: "A pilgrim group at Dashashwamedh", className: "aspect-[4/3]" },
    { kind: "clip", src: "/gallery/ghats-from-boat.mp4", poster: "/gallery/ghats-from-boat.jpg", alt: "The ghats gliding past from a boat on the Ganga", caption: "The ghats from the water", className: "aspect-[4/3]" },
];

// Muted loops play only while on screen, so they cost nothing until someone scrolls to them.
function Clip({ src, poster, alt }: { src: string; poster: string; alt: string }) {
    const ref = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        const v = ref.current;
        if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.35 });
        io.observe(v);
        return () => io.disconnect();
    }, []);
    return <video ref={ref} src={src} poster={poster} aria-label={alt} muted loop playsInline preload="none" className="absolute inset-0 h-full w-full object-cover" />;
}

export default function Gallery() {
    return (
        <section aria-labelledby="gallery-title" className="relative overflow-hidden bg-night py-20 md:py-28 text-parchment">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <Eyebrow className="text-marigold">From our boats</Eyebrow>
                <h2 id="gallery-title" className="mt-4 font-display font-light text-5xl sm:text-6xl leading-[0.95] tracking-[-0.03em]">
                    <SplitWords text="Real rides," /> <SplitWords text="real guests." delay={0.15} className="italic" wordClass="text-marigold pr-[0.05em]" />
                </h2>

                <div className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,22rem)_1fr]">
                    {/* The guests' own words, on camera — with sound, so it only plays when they press play. */}
                    <Reveal>
                        <figure className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5">
                            <div className="relative aspect-[9/16]">
                                <video src="/gallery/guest-testimonial.mp4" poster="/gallery/guest-testimonial.jpg" controls playsInline preload="none"
                                    aria-label="Video review: a couple talks about their KashiGo boat ride on the ghat"
                                    className="absolute inset-0 h-full w-full object-cover" />
                            </div>
                            <figcaption className="flex items-center gap-2 px-5 py-4 text-sm text-parchment/70">
                                <Play size={14} className="text-marigold" /> Video review — guests after their boat ride
                            </figcaption>
                        </figure>
                    </Reveal>

                    <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-3 sm:auto-rows-[minmax(0,1fr)]">
                        {ITEMS.map((it, i) => (
                            <Reveal key={it.src} delay={0.05 * i} className={`group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 ${it.className}`}>
                                {it.kind === "photo" ? (
                                    // eslint-disable-next-line @next/next/no-img-element -- already compressed JPEGs in /public
                                    <img src={it.src} alt={it.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                                ) : (
                                    <Clip src={it.src} poster={it.poster} alt={it.alt} />
                                )}
                                <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-4 pt-10 text-sm text-white/90">{it.caption}</span>
                            </Reveal>
                        ))}
                        <Reveal delay={0.25} className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 col-span-2 aspect-[4/3] sm:col-span-3 sm:aspect-[21/9]">
                            {/* eslint-disable-next-line @next/next/no-img-element -- already compressed JPEG in /public */}
                            <img src="/gallery/sunset-couple.jpg" alt="Two guests in life jackets on the boat at sunset over the Ganga" loading="lazy" decoding="async"
                                className="absolute inset-0 h-full w-full object-cover object-[50%_30%] transition-transform duration-700 group-hover:scale-[1.03]" />
                            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-4 pt-10 text-sm text-white/90">Sunset on the Ganga</span>
                        </Reveal>
                    </div>
                </div>
            </div>
        </section>
    );
}

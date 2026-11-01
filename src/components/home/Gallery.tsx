"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

// Real photos and clips from KashiGo rides (public/gallery), the guests' video review among them.
// Laid out as uneven tiles (CSS columns, each tile its own shape) rather than a regular grid.
// Videos are H.264 with faststart, compressed for the web.
type Tile =
    | { kind: "photo"; src: string; alt: string; caption: string; aspect: string; span: string; position?: string }
    | { kind: "clip"; src: string; poster: string; alt: string; caption: string; aspect: string; span: string }
    | { kind: "review"; src: string; poster: string; alt: string; caption: string; aspect: string; span: string };

// Phones and tablets: a column mosaic, each tile its own `aspect` — columns fill top to bottom, so tall and short
// tiles alternate. Desktop: a 4×4 tile grid across the full width; the `span`s below fill it exactly in this order
// (video review, bajra, life jackets / ghats, pilgrim group / puja, Aarti clip, sunset).
const TILES: Tile[] = [
    { kind: "review", src: "/gallery/guest-testimonial.mp4", poster: "/gallery/guest-testimonial.jpg", alt: "Video review: a couple talks about their KashiGo boat ride on the ghat", caption: "Video review", aspect: "aspect-[9/15]", span: "lg:row-span-2" },
    { kind: "photo", src: "/gallery/lit-bajra-night.jpg", alt: "A bajra boat lit with white lights on the Ganga at night", caption: "Our lit bajra after dark", aspect: "aspect-[5/4]", span: "lg:col-span-2" },
    { kind: "photo", src: "/gallery/guests-on-boat-life-jackets.jpg", alt: "Two guests on a KashiGo boat with life jackets, the ghats behind them", caption: "Life jackets on board", aspect: "aspect-[3/5]", span: "lg:row-span-2" },
    { kind: "clip", src: "/gallery/ghats-from-boat.mp4", poster: "/gallery/ghats-from-boat.jpg", alt: "The ghats gliding past from a boat on the Ganga", caption: "The ghats from the water", aspect: "aspect-square", span: "" },
    { kind: "photo", src: "/gallery/group-aarti-boat.jpg", alt: "A group of guests in life jackets taking photos from the boat at Dashashwamedh at night", caption: "A pilgrim group at the Aarti", aspect: "aspect-[4/5]", span: "" },
    { kind: "photo", src: "/gallery/ghat-puja-with-pandit.jpg", alt: "Guests sitting with a pandit for a puja on the ghat by the Ganga", caption: "A puja on the ghat", aspect: "aspect-[4/5]", span: "lg:row-span-2", position: "object-[50%_40%]" },
    { kind: "clip", src: "/gallery/evening-aarti-group.mp4", poster: "/gallery/evening-aarti-group.jpg", alt: "A group in life jackets filming the ghats from the boat at night", caption: "Evening Aarti ride", aspect: "aspect-[3/5]", span: "lg:row-span-2" },
    { kind: "photo", src: "/gallery/sunset-couple.jpg", alt: "Two guests in life jackets on the boat at sunset over the Ganga", caption: "Sunset on the Ganga", aspect: "aspect-[4/5]", span: "lg:col-span-2 lg:row-span-2", position: "object-[50%_30%]" },
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

// The video review has sound, so it waits for a tap; then it plays in place with its controls.
function ReviewClip({ src, poster, alt }: { src: string; poster: string; alt: string }) {
    const [playing, setPlaying] = useState(false);
    if (playing) return <video src={src} poster={poster} aria-label={alt} controls autoPlay playsInline className="absolute inset-0 h-full w-full object-cover" />;
    return (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`Play ${alt}`} className="group/play absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- already compressed JPEG in /public */}
            <img src={poster} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-night shadow-lg transition-transform group-active/play:scale-95">
                <Play size={22} fill="currentColor" className="ml-0.5" />
            </span>
        </button>
    );
}

export default function GalleryMedia() {
    return (
        <div className="mx-auto columns-2 gap-3 sm:max-w-4xl sm:columns-3 sm:gap-4 lg:grid lg:max-w-none lg:grid-flow-dense lg:grid-cols-4 lg:auto-rows-[13.5rem] lg:gap-4">
            {TILES.map((t) => (
                <figure key={t.src} className={`group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl bg-night sm:mb-4 lg:mb-0 lg:aspect-auto ${t.aspect} ${t.span}`}>
                    {t.kind === "photo" ? (
                        // eslint-disable-next-line @next/next/no-img-element -- already compressed JPEGs in /public
                        <img src={t.src} alt={t.alt} loading="lazy" decoding="async" className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${t.position ?? ""}`} />
                    ) : t.kind === "clip" ? (
                        <Clip src={t.src} poster={t.poster} alt={t.alt} />
                    ) : (
                        <ReviewClip src={t.src} poster={t.poster} alt={t.alt} />
                    )}
                    <figcaption className={`pointer-events-none absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${t.kind === "review" ? "bg-marigold text-night" : "bg-night/60 text-white/90"}`}>
                        {t.kind === "review" && <Play size={10} fill="currentColor" />}{t.caption}
                    </figcaption>
                </figure>
            ))}
        </div>
    );
}

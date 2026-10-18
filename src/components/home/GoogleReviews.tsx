import { ArrowUpRight, PenLine } from "lucide-react";
import { getGoogleReviews, GOOGLE_REVIEWS_URL, GOOGLE_WRITE_REVIEW_URL, type GoogleReview } from "@/lib/googleReviews";
import { Eyebrow, Reveal, SplitWords } from "@/components/motion/primitives";
import GoogleG from "@/components/ui/GoogleG";

// Stars filled to the exact rating (e.g. 4.7 → four and a bit).
function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
    const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
    const row = (cls: string) => (
        <span className={`flex ${cls}`}>{Array.from({ length: 5 }, (_, i) => (
            <svg key={i} viewBox="0 0 20 20" width={size} height={size} fill="currentColor" aria-hidden><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.9l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8z" /></svg>
        ))}</span>
    );
    return (
        <span className="relative inline-flex" role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
            {row("text-night/15")}
            <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>{row("text-marigold")}</span>
        </span>
    );
}

function ReviewCard({ r, hidden = false }: { r: GoogleReview; hidden?: boolean }) {
    return (
        <article aria-hidden={hidden || undefined}
            className="relative flex w-[19rem] sm:w-[22rem] shrink-0 flex-col rounded-[1.75rem] border border-night/10 bg-[#fffaf0] p-6 shadow-[0_24px_50px_-35px_rgba(60,30,0,0.55)] transition-transform duration-500 hover:-translate-y-1">
            <span aria-hidden className="absolute right-5 top-2 font-display text-7xl leading-none text-marigold/30">&rdquo;</span>
            <Stars rating={r.rating} />
            <p className="mt-4 flex-1 text-[15px] leading-relaxed text-night/80 line-clamp-6">{r.text}</p>
            <div className="mt-5 flex items-center gap-3 border-t border-night/10 pt-4">
                {r.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Google-hosted avatar, shown as Google provides it
                    <img src={r.photo} alt="" width={40} height={40} loading="lazy" referrerPolicy="no-referrer" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-night font-display text-marigold">{r.author.charAt(0)}</span>
                )}
                <div className="min-w-0 flex-1">
                    {r.authorUrl ? (
                        <a href={r.authorUrl} target="_blank" rel="noopener noreferrer" tabIndex={hidden ? -1 : undefined} className="block truncate font-semibold text-night hover:text-fire">{r.author}</a>
                    ) : <p className="truncate font-semibold text-night">{r.author}</p>}
                    <p className="text-xs text-night/50">{r.when}</p>
                </div>
                <a href={r.url ?? GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" tabIndex={hidden ? -1 : undefined} aria-label={`Read ${r.author}'s review on Google`} className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-night/5">
                    <GoogleG />
                </a>
            </div>
        </article>
    );
}

export default async function GoogleReviews() {
    const data = await getGoogleReviews();

    // No API key yet (or Google unavailable): a simple pointer to the real reviews — never placeholder content.
    if (!data || !data.reviews.length) {
        return (
            <section className="bg-parchment-2 py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    <p className="flex items-center gap-3 font-display text-2xl sm:text-3xl text-night"><GoogleG size={28} /> Read what travellers say about KashiGo on Google.</p>
                    <div className="flex flex-wrap gap-3">
                        <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer"
                            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-night px-6 font-medium text-parchment transition-colors hover:bg-fire hover:text-night">
                            Read our Google reviews <ArrowUpRight size={16} />
                        </a>
                        <a href={GOOGLE_WRITE_REVIEW_URL} target="_blank" rel="noopener noreferrer"
                            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full border border-night/20 px-6 font-medium text-night transition-colors hover:bg-night hover:text-parchment">
                            <PenLine size={16} /> Leave a review
                        </a>
                    </div>
                </div>
            </section>
        );
    }

    const drift = data.reviews.length >= 3;
    return (
        <section aria-labelledby="google-reviews-title" className="relative overflow-hidden bg-parchment-2 py-20 md:py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                    <Eyebrow className="text-fire">Reviews from Google</Eyebrow>
                    <h2 id="google-reviews-title" className="mt-4 font-display font-light text-5xl sm:text-6xl leading-[0.95] tracking-[-0.03em] text-night">
                        <SplitWords text="Loved by travellers" /> <SplitWords text="on Google." delay={0.15} className="italic" wordClass="text-fire-deep pr-[0.05em]" />
                    </h2>
                </div>
                <Reveal delay={0.1}>
                    <div className="flex items-center gap-5 rounded-[1.75rem] border border-night/10 bg-[#fffaf0] p-5 pr-7">
                        <span className="font-display text-6xl leading-none text-night">{data.rating.toFixed(1)}</span>
                        <div>
                            <Stars rating={data.rating} size={20} />
                            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-night/60"><GoogleG size={14} /> {data.count.toLocaleString("en-IN")} Google review{data.count === 1 ? "" : "s"}</p>
                        </div>
                    </div>
                </Reveal>
            </div>

            <div className={`mt-12 ${drift ? "group [mask-image:linear-gradient(to_right,transparent,black_4rem,black_calc(100%-4rem),transparent)]" : "max-w-7xl mx-auto px-4 sm:px-6"}`}>
                {drift ? (
                    <div className="reviews-track flex w-max gap-5 px-2 group-hover:[animation-play-state:paused]">
                        {data.reviews.map((r, i) => <ReviewCard key={`a${i}`} r={r} />)}
                        <span className="reviews-dup contents">{data.reviews.map((r, i) => <ReviewCard key={`b${i}`} r={r} hidden />)}</span>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-5">{data.reviews.map((r, i) => <ReviewCard key={i} r={r} />)}</div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 flex flex-wrap gap-3">
                <a href={data.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full bg-night px-6 font-medium text-parchment transition-colors hover:bg-fire hover:text-night">
                    Read all reviews on Google <ArrowUpRight size={16} />
                </a>
                {data.writeReviewUrl && (
                    <a href={data.writeReviewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full border border-night/20 px-6 font-medium text-night transition-colors hover:bg-night hover:text-parchment">
                        <PenLine size={16} /> Rode with us? Leave a review
                    </a>
                )}
            </div>
        </section>
    );
}

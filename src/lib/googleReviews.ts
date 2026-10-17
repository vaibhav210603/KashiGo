// Server-only. KashiGo's Google Business Profile rating and reviews, from the Google Places API (New).
// Needs GOOGLE_PLACES_API_KEY. The listing is KASHIGO_PLACE_ID (GOOGLE_PLACE_ID can override it).
// Results are cached for a day. Google returns at most 5 reviews ("most relevant").

export type GoogleReview = {
    author: string;
    authorUrl: string | null;
    photo: string | null;
    rating: number;
    text: string;
    when: string;       // "2 weeks ago"
    publishTime: string | null;
    url: string | null; // the review on Google Maps
};

export type GoogleReviews = {
    name: string;
    rating: number;
    count: number;
    mapsUrl: string;
    writeReviewUrl: string | null;
    reviews: GoogleReview[];
};

const API = "https://places.googleapis.com/v1";
const DAY = 60 * 60 * 24;

// KashiGo's own Google Business Profile (B-20/205, Brahma Ghat). Never look it up by name — this is the listing.
export const KASHIGO_PLACE_ID = "ChIJsTBiHZcvjjkRbG3nhTNJC7I";
// The listing's Reviews tab on Google Maps, and Google's official "write a review" link for it.
export const GOOGLE_REVIEWS_URL = "https://www.google.com/maps/place/KashiGo/data=!4m8!3m7!1s0x398e2f971d6230b1:0xb20b493385e76d6c!8m2!3d25.3157706!4d83.018911!9m1!1b1!16s%2Fg%2F11p20z1pfl";
export const GOOGLE_WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${KASHIGO_PLACE_ID}`;

export async function getGoogleReviews(): Promise<GoogleReviews | null> {
    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key) return null;
    try {
        const id = process.env.GOOGLE_PLACE_ID || KASHIGO_PLACE_ID;
        const res = await fetch(`${API}/places/${encodeURIComponent(id)}?languageCode=en`, {
            headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "displayName,rating,userRatingCount,reviews" },
            next: { revalidate: DAY },
        });
        if (!res.ok) {
            console.error("Google reviews fetch failed:", res.status, await res.text().catch(() => ""));
            return null;
        }
        const p = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Places API JSON
        const reviews: GoogleReview[] = (p.reviews ?? []).map((r: any) => ({
            author: r.authorAttribution?.displayName ?? "Google user",
            authorUrl: r.authorAttribution?.uri ?? null,
            photo: r.authorAttribution?.photoUri ?? null,
            rating: Number(r.rating) || 0,
            text: r.text?.text ?? r.originalText?.text ?? "",
            when: r.relativePublishTimeDescription ?? "",
            publishTime: r.publishTime ?? null,
            url: r.googleMapsUri ?? null,
        })).filter((r: GoogleReview) => r.text.trim());
        return {
            name: p.displayName?.text ?? "KashiGo",
            rating: Number(p.rating) || 0,
            count: Number(p.userRatingCount) || 0,
            mapsUrl: GOOGLE_REVIEWS_URL,
            writeReviewUrl: GOOGLE_WRITE_REVIEW_URL,
            reviews,
        };
    } catch (e) {
        console.error("Google reviews error:", e);
        return null;
    }
}

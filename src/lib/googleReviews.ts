// Server-only. KashiGo's Google Business Profile rating and reviews, from the Google Places API (New).
// Needs GOOGLE_PLACES_API_KEY. The listing is KASHIGO_PLACE_ID (GOOGLE_PLACE_ID can override it).
// Results are cached for a day. Google returns at most 5 reviews ("most relevant").
// Without a key (or if Google fails) the section shows GOOGLE_REVIEWS_SNAPSHOT: the real reviews copied from the listing.

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

// The written reviews on the listing as of 21 Oct 2026 (8 reviews, all 5★; the other 3 are stars only).
// Copied verbatim from Google Maps — refresh this when new reviews come in, never edit or invent them.
const snap = (author: string, photo: string, text: string): GoogleReview => ({
    author, authorUrl: null, photo: `https://lh3.googleusercontent.com/${photo}=w72-h72-p-rp-mo-br100`,
    rating: 5, text, when: "October 2026", publishTime: "2026-10-21", url: GOOGLE_REVIEWS_URL,
});
export const GOOGLE_REVIEWS_SNAPSHOT: GoogleReviews = {
    name: "KashiGo",
    rating: 5,
    count: 8,
    mapsUrl: GOOGLE_REVIEWS_URL,
    writeReviewUrl: GOOGLE_WRITE_REVIEW_URL,
    reviews: [
        snap("krishna joshi", "a/ACg8ocJnJ6bo_tzRCWjDgtwqRHl__seUqEdfTgcMjNQNl1O_RiOzTMUz", "Had a excellent boat ride and the person in charge was very informative and jolly."),
        snap("Priya Upadhyay", "a-/ALV-UjV7Be_5Mm_HBY9BX2x41As3tlynHywUkkC__8Xj8OEvD56zt-1J", "Kashigo is a great way to explore Kashi and experience its spiritual charm, culture, and beauty. A wonderful experience for anyone looking to discover the essence of Varanasi. Truly a great place to start your journey of exploring Kashi! ❤️🙏"),
        snap("Devansh Upadhyay", "a-/ALV-UjUbPa2415Xm_IvKGlLVcQu0JI09kaNUql1uogIzGds5-WhYGu_i", "Helped me tour varansi very easily"),
        snap("Priyanshu Bisht", "a-/ALV-UjVN3MM7a91YC8Brl0o_b-1aCPBOS40RuGkRMkNXhhMkZ2vurxs", "Great service!"),
        snap("Gauri Nandan", "a/ACg8ocJWYVBaKeFpi9QXx0o9mGnVxboZD1PeLx4sABVCYTkEd8WUqfg", "Exceptional"),
    ],
};

export async function getGoogleReviews(): Promise<GoogleReviews> {
    const live = await fetchGoogleReviews();
    return live && live.reviews.length ? live : GOOGLE_REVIEWS_SNAPSHOT;
}

async function fetchGoogleReviews(): Promise<GoogleReviews | null> {
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

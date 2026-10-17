// Server-only. KashiGo's Google Business Profile rating and reviews, from the Google Places API (New).
// Needs GOOGLE_PLACES_API_KEY; GOOGLE_PLACE_ID is optional (looked up by name if missing).
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
export const MAPS_SEARCH_URL = "https://www.google.com/maps/search/?api=1&query=KashiGo%20Varanasi";

async function findPlaceId(key: string): Promise<string | null> {
    const res = await fetch(`${API}/places:searchText`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": "places.id,places.displayName" },
        body: JSON.stringify({ textQuery: "KashiGo Varanasi", locationBias: { circle: { center: { latitude: 25.3157, longitude: 83.0189 }, radius: 20000 } } }),
        next: { revalidate: DAY * 7 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Only accept a listing that is actually called KashiGo.
    const hit = (data.places ?? []).find((p: { displayName?: { text?: string } }) => /kashi\s*go/i.test(p.displayName?.text ?? ""));
    return hit?.id ?? null;
}

export async function getGoogleReviews(): Promise<GoogleReviews | null> {
    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key) return null;
    try {
        const id = process.env.GOOGLE_PLACE_ID || (await findPlaceId(key));
        if (!id) return null;
        const res = await fetch(`${API}/places/${encodeURIComponent(id)}?languageCode=en`, {
            headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "displayName,rating,userRatingCount,reviews,googleMapsUri,googleMapsLinks" },
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
            mapsUrl: p.googleMapsUri ?? MAPS_SEARCH_URL,
            writeReviewUrl: p.googleMapsLinks?.writeAReviewUri ?? null,
            reviews,
        };
    } catch (e) {
        console.error("Google reviews error:", e);
        return null;
    }
}

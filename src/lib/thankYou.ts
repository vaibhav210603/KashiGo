// Every successful checkout ends on /thank-you, so ad platforms (Google Ads, Meta) can count a
// purchase by URL. The order details travel in sessionStorage — never in the URL — and the
// page falls back to a generic confirmation when they're missing (refresh in a new tab, etc.).

export type ThankYou = {
    title: string;
    message: string;
    ref?: { label: string; value: string };
    rows?: [string, string][];
    downloads?: { label: string; url: string }[];
    cta?: { label: string; href: string };
};

const KEY = "kashigo:thank-you";

export function goToThankYou(summary: ThankYou) {
    try { sessionStorage.setItem(KEY, JSON.stringify(summary)); } catch { }
    // A full page load, not a client-side push: URL-based conversion tags fire on page load.
    window.location.href = "/thank-you";
}

// Cached by the raw string so repeated reads return the same object (useSyncExternalStore needs that).
let cache: { raw: string; value: ThankYou } | null = null;

export function readThankYou(): ThankYou | null {
    try {
        const raw = sessionStorage.getItem(KEY);
        if (!raw) return null;
        if (cache?.raw !== raw) cache = { raw, value: JSON.parse(raw) as ThankYou };
        return cache.value;
    } catch {
        return null;
    }
}

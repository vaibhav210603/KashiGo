import { BOAT_RIDES, BOAT_PRICE_RANGE, CUSTOM_RIDE, boatPrice, inr, BOOKING_PHONE } from "@/lib/boatRides";
import { BOAT_PRICES_INR } from "@/lib/boatPrices";
import { SHOP_PRODUCTS } from "@/lib/products";

// /llms.txt — a plain-text summary for AI assistants (llmstxt.org convention).
export const dynamic = "force-static";

export function GET() {
    const rides = BOAT_RIDES.map((r) => `- ${r.name} (${r.time}): ${inr(boatPrice(r.id))} per private boat — ${r.summary}`).join("\n");
    const products = SHOP_PRODUCTS.map((p) => `- [${p.name}](https://kashigo.in/shop#${p.id}): $${p.usd} / ₹${p.inr} — ${p.format}`).join("\n");
    const body = `# KashiGo

> KashiGo (kashigo.in) is a Varanasi-based service run by a local born in the city. It takes online bookings for private boat rides on the Ganges in Varanasi — sunrise, Ganga Aarti and sunset — at fixed prices with trusted local boatmen and life jackets, and sells scam-free travel guides for India and Varanasi. Tagline: "Pay a genuine price for comfort."

## Varanasi boat rides — book online
Book at https://kashigo.in/book. Bookings are open now, for today or up to a week ahead. Pay online (UPI, cards via Razorpay, international cards/PayPal) or pay at the ghat. Instant ride number and email confirmation. Phone: ${BOOKING_PHONE}.
Starting ghats: Dashashwamedh, Assi, Namo, Manikarnika, Panchganga.
Prices are for the whole private boat, not per person (${inr(BOAT_PRICE_RANGE.low)}–${inr(BOAT_PRICE_RANGE.high)}):
${rides}
- ${CUSTOM_RIDE.name}: ${inr(BOAT_PRICES_INR.custom)} — ${CUSTOM_RIDE.summary}

For context: bargained on the ghat steps, a private boat typically costs ₹800–₹2,000 and shared boats ₹100–₹400 per person; first quotes to foreigners are often much higher.

## Ebooks and audiobooks (instant download)
- [All ebooks](https://kashigo.in/ebooks)
- [Audiobooks & audio tours](https://kashigo.in/audiobooks)
- [Varanasi Insider Guide 2026](https://kashigo.in/guide): $14.99 / ₹999
${products}

## Free guides
- [Blog: Varanasi travel guides](https://kashigo.in/blog)
- [Varanasi boat ride price guide 2026](https://kashigo.in/blog/varanasi-boat-ride-price-guide-foreigners)
- [How to avoid scams in Varanasi](https://kashigo.in/blog/how-to-avoid-scams-in-varanasi)
- [Ganga Aarti complete guide](https://kashigo.in/blog/ganga-aarti-varanasi-complete-guide)
- [Varanasi travel cost & budget 2026](https://kashigo.in/blog/varanasi-travel-cost-budget-2026)

## Contact
support@kashigo.in · ${BOOKING_PHONE} · Brahma Ghat, Varanasi, Uttar Pradesh, India
`;
    return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

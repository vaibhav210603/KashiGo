// Digital product catalog shown on /shop. Prices here are for display only —
// payment routes resolve the real amount from src/lib/pricing.ts.

export type ShopProductId =
    | "india-scam-proof"
    | "kashi-unveiled"
    | "walk-the-ghats"
    | "scam-proof-audiobook"
    | "complete-bundle";

export type ShopProduct = {
    id: ShopProductId;
    name: string;
    tagline: string;
    format: string;
    cover: string;
    usd: number;
    inr: number;
    compareUsd?: number;
    bullets: string[];
    badge?: string;
};

export const SHOP_PRODUCTS: ShopProduct[] = [
    {
        id: "complete-bundle",
        name: "The Complete Varanasi Bundle",
        tagline: "Everything we make, in one download — save over 50%.",
        format: "3 ebooks (PDF + EPUB) · 90-min audio tour · 2.5-hr audiobook",
        cover: "/shop/complete-bundle.jpg",
        usd: 24.99,
        inr: 1699,
        compareUsd: 50.95,
        badge: "Best value",
        bullets: [
            "Varanasi Insider Guide 2026 ($14.99)",
            "India Scam-Proof field manual ($9.99)",
            "Kashi Unveiled spiritual guide ($9.99)",
            "Walk the Ghats audio tour ($7.99)",
            "India Scam-Proof audiobook ($7.99)",
        ],
    },
    {
        id: "india-scam-proof",
        name: "India Scam-Proof",
        tagline: "The first-timer's field manual — every common tourist scam, the real prices, and the exact words to say.",
        format: "Ebook · 100 pages · PDF + EPUB (Kindle, Apple Books)",
        cover: "/shop/india-scam-proof.jpg",
        usd: 9.99,
        inr: 699,
        badge: "New",
        bullets: [
            "Delhi, Agra, Jaipur, Varanasi, Goa, Mumbai, Rishikesh & Kerala scam maps",
            "Arrival, money, UPI, SIM cards, trains & taxis — done right",
            "Hindi phrase scripts to say no, negotiate and ask prices",
            "Real 2026 price tables + what to do if you do get scammed",
        ],
    },
    {
        id: "kashi-unveiled",
        name: "Kashi Unveiled",
        tagline: "The spiritual traveller's guide to Varanasi — the meaning behind the rituals, temples, river and fire.",
        format: "Ebook · 89 pages · PDF + EPUB",
        cover: "/shop/kashi-unveiled.jpg",
        usd: 9.99,
        inr: 699,
        bullets: [
            "Ganga Aarti decoded, step by step",
            "Manikarnika, moksha and how to witness respectfully",
            "Kashi Vishwanath, Sarnath and the temples that matter",
            "Festivals incl. Dev Deepawali 2026 · yoga & a 3-day spiritual itinerary",
        ],
    },
    {
        id: "walk-the-ghats",
        name: "Walk the Ghats — Audio Tour",
        tagline: "Press play at Assi Ghat and let a local walk you to Manikarnika, story by story.",
        format: "20 MP3 tracks · 90 min · printable route card",
        cover: "/shop/walk-the-ghats.jpg",
        usd: 7.99,
        inr: 499,
        bullets: [
            "18 stops along 3.5 km of riverfront, in walking order",
            "Legends, history and what locals do at each ghat",
            "Works offline on any phone — or as an armchair audiobook",
            "Fair boat price to ride back, built in",
        ],
    },
    {
        id: "scam-proof-audiobook",
        name: "India Scam-Proof — Audiobook",
        tagline: "The full field manual, narrated. Listen on the flight, land prepared.",
        format: "17 MP3 chapters · 2.5 hours · AI-narrated",
        cover: "/shop/scam-proof-audiobook.jpg",
        usd: 7.99,
        inr: 499,
        bullets: [
            "Unabridged — every chapter of the ebook",
            "Perfect for the flight or train",
            "Works offline on any device",
        ],
    },
];

export const LAUNCH_CODE = "LAUNCH40";

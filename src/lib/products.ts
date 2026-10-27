// Digital product catalog shown on /shop. Prices here are for display only —
// payment routes resolve the real amount from src/lib/pricing.ts.

export type ShopProductId =
    | "india-scam-proof"
    | "kashi-unveiled"
    | "walk-the-ghats"
    | "scam-proof-audiobook"
    | "complete-bundle"
    | "guide-trivia";

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
    // Audio products: a free sample to play on the page, and the full track list.
    audio?: { preview: string; previewLabel: string; minutes: number; tracks: [string, string][] };
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
        format: "20 MP3 tracks + chaptered M4B · 90 min · 62-page route card & script",
        cover: "/shop/walk-the-ghats.jpg",
        usd: 7.99,
        inr: 499,
        bullets: [
            "18 stops along 3.5 km of riverfront, in walking order",
            "Legends, history and what locals do at each ghat",
            "Timed for sunrise or the evening Ganga Aarti",
            "Route card PDF with every stop and the full script",
            "One-file audiobook (M4B) with chapters, plus MP3s for any player",
            "Fair boat price to ride back, built in",
        ],
        audio: {
            preview: "/audio/walk-the-ghats-preview.mp3",
            previewLabel: "Play the trailer",
            minutes: 90,
            tracks: [
                ["Trailer", "2:44"],
                ["Welcome to Kashi", "6:55"],
                ["Assi Ghat, Where the City Begins", "5:07"],
                ["Tulsi Ghat, the Poet’s Steps", "5:00"],
                ["Bhadaini to Chet Singh Ghat, the Fort by the Water", "4:57"],
                ["Shivala and Hanuman Ghat, a Little South India", "4:41"],
                ["Harishchandra Ghat, the King Who Kept His Word", "4:44"],
                ["Kedar Ghat, the Mountain Comes to the River", "4:12"],
                ["Narad and Chausatthi Ghats, Gossip and Goddesses", "3:41"],
                ["Darbhanga and Munshi Ghats, Palaces in Stone", "3:51"],
                ["Ahilyabai Ghat, the Queen Who Rebuilt Kashi", "3:48"],
                ["Dashashwamedh Ghat, the Heart of the River", "5:26"],
                ["The Ganga Aarti, a Ceremony of Fire", "4:32"],
                ["Man Mandir Ghat, the Prince Who Measured the Sky", "4:01"],
                ["Meer and Lalita Ghats, a Piece of Nepal", "4:23"],
                ["Manikarnika Ghat, Where Kashi Keeps Its Promise", "6:27"],
                ["Scindia Ghat and the Leaning Temple", "3:38"],
                ["Panchganga Ghat, Where Five Rivers Meet", "4:04"],
                ["Taking a Boat Back South", "4:38"],
                ["What Kashi Gives You", "3:35"],
            ],
        },
    },
    {
        id: "scam-proof-audiobook",
        name: "India Scam-Proof — Audiobook",
        tagline: "The full field manual, narrated. Listen on the flight, land prepared.",
        format: "17 MP3 chapters + chaptered M4B · 2.5 hours · AI-narrated · quick-reference PDF",
        cover: "/shop/scam-proof-audiobook.jpg",
        usd: 7.99,
        inr: 499,
        bullets: [
            "Unabridged — every chapter of the ebook",
            "Quick-reference PDF: Hindi scripts, 2026 price tables, emergency numbers",
            "One-file audiobook (M4B) with chapters, plus MP3s for any player",
            "Perfect for the flight or train — works offline",
        ],
        audio: {
            preview: "/audio/scam-proof-audiobook-preview.mp3",
            previewLabel: "Play a 3-minute sample",
            minutes: 152,
            tracks: [
                ["How to Use This Book", "4:15"],
                ["The One Rule Behind Every Scam", "4:07"],
                ["Arrival", "18:39"],
                ["Money", "14:50"],
                ["Transport", "17:06"],
                ["City-by-City Scam Maps", "34:10"],
                ["Temples and Religious Scams", "8:18"],
                ["Shopping", "6:55"],
                ["Accommodation and Bookings", "4:44"],
                ["Digital Scams, SIM Cards and Visas", "7:58"],
                ["For Women Travellers", "6:11"],
                ["Health and Food Safety", "5:06"],
                ["The Scripts", "5:42"],
                ["The Price Tables", "3:55"],
                ["If You Do Get Scammed", "5:09"],
                ["Your Pre-Departure Checklist", "2:28"],
                ["A Note from Vaibhav", "2:15"],
            ],
        },
    },
];

// The Varanasi Insider Guide at the trivia price — offered on /scam-cheat-sheet to anyone who answers
// the five questions. Not listed on the shelf, so it stays out of SHOP_PRODUCTS.
export const TRIVIA_GUIDE: ShopProduct = {
    id: "guide-trivia",
    name: "Varanasi Insider Guide 2026",
    tagline: "The full guide the cheat sheet comes from — at the trivia price.",
    format: "Ebook · PDF · instant download",
    cover: "/VARANASi.png",
    usd: 5.99,
    inr: 499,
    compareUsd: 14.99,
    bullets: [
        "Every price in the city, all 84 ghats mapped",
        "The exact scripts to shut down each scam",
        "A local's ready-to-use 2-day itinerary",
        "Temple etiquette and a food-safety guide",
    ],
};

// Any product the shared checkout can sell, including the unlisted trivia offer.
export const findShopProduct = (id: string) => (id === TRIVIA_GUIDE.id ? TRIVIA_GUIDE : SHOP_PRODUCTS.find((p) => p.id === id));

export const LAUNCH_CODE = "LAUNCH40";

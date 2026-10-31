// KashiGo's services beyond the boat, for /services and the home page. Safe to import from client and server code.
// Priced on request: each is quoted in writing before anything is paid.

export type Service = {
    id: string;
    name: string;
    deva: string;
    tagline: string;
    detail: string;
    includes: string[];
    image: string;
    href?: string; // has its own page
    badge?: string;
};

export const SERVICES: Service[] = [
    {
        id: "trip-planner",
        name: "Trip Planning",
        deva: "यात्रा योजना",
        tagline: "Your whole Varanasi, planned by a local — and a call away, day and night.",
        detail: "Tell us your dates and who's travelling. We plan each day around the right hours on the river and at the temples, send you only to genuine shops, warn you about every scam on the way, and stay on call 24/7 while you're in Kashi.",
        includes: ["Genuine, authentic shops to visit", "24/7 call assistance — buy only the real thing, from Banarasi sarees up", "Top places to visit", "Top scams to avoid", "VIP privileges, so you never walk in the crowds"],
        image: "/custom_bg.png",
        badge: "Flagship",
    },
    {
        id: "vip-darshan",
        name: "VIP Darshan",
        deva: "दर्शन",
        tagline: "Kashi Vishwanath and the great temples, without the four-hour queue.",
        detail: "We book the temple's own Sugam Darshan slot before you arrive, then walk you in: shoes, phone and bag lockers handled, the right gate, the right hour. If a slot closes, you don't pay.",
        includes: ["Kashi Vishwanath Sugam Darshan", "Kaal Bhairav, Annapurna & Sankat Mochan", "A local escort from your hotel", "Timed to miss the rush"],
        image: "/temple_boat_bg.png",
        badge: "Assured",
    },
    {
        id: "puja-yajna",
        name: "Puja & Yajna",
        deva: "यज्ञ",
        tagline: "Rites performed by learned acharyas — in person, or live from anywhere.",
        detail: "Rudrabhishek, Lakshmi Puja, Maha Mrityunjaya Jaap, Pind Daan and more, with the sankalp spoken in your family's name and the dakshina agreed in writing.",
        includes: ["Learned acharyas of Kashi", "Samagri and setup included", "Join live, or receive the recording", "Prasad posted worldwide"],
        image: "/e_aarti_bg.png",
        href: "/puja",
        badge: "New",
    },
    {
        id: "hidden-kashi",
        name: "Hidden Kashi",
        deva: "रत्न",
        tagline: "The city's gems that most visitors never find.",
        detail: "A private car and a born-in-Banaras storyteller: Sarnath where the Buddha first taught, Ramnagar Fort across the river, the silk weavers of Madanpura, Tulsi Manas and Durga Kund, and the lanes behind the ghats.",
        includes: ["Sarnath & Ramnagar Fort", "Silk weavers' workshops", "Temples of the old lanes", "Private car and local guide"],
        image: "/day_ghat_bg.png",
    },
    {
        id: "quiet-kashi",
        name: "Kashi in Silence",
        deva: "शांति",
        tagline: "A peaceful, crowd-free Kashi — at the hours the city keeps for itself.",
        detail: "A Brahma muhurat boat in stillness, meditation on an empty ghat, the evening aarti from your own bajra away from the crush, and an hour at Sarnath when the stupa is quiet.",
        includes: ["Pre-dawn meditation boat", "Private bajra for the aarti", "Yoga on a quiet ghat", "Sarnath at the still hour"],
        image: "/night.png",
    },
    {
        id: "kashi-in-a-day",
        name: "Kashi in a Day",
        deva: "यात्रा",
        tagline: "The whole pilgrimage, curated into one unhurried day.",
        detail: "Sunrise on the river, darshan at Vishwanath, a short puja on the ghat, lunch in the old city, and the aarti from your own boat — every handover arranged, nothing to bargain.",
        includes: ["Sunrise boat ride", "VIP darshan", "Ganga puja on the ghat", "Aarti from a private boat"],
        image: "/sunrise.png",
    },
];

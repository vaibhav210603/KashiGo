// The gurus and experts people can consult through KashiGo: shown as portraits on the home page and /puja,
// each with a profile page at /experts/[slug]. Safe to import from client and server code.

export type Expert = {
    slug: string;
    name: string;
    nameDeva: string;
    title: string;       // under the portrait: "Vedic Guru" / "Numerologist"
    role: string;        // fuller line on the profile
    quote?: string;      // their own words, shown large on the profile
    icon: string;        // square portrait for the round icons
    portrait: string;    // tall photo for the profile hero
    video?: { src: string; poster: string; captions?: string } | null;
    stats?: { value: string; label: string }[];
    about: string[];
    expertise: { title: string; deva?: string; detail: string }[];
    services?: string[]; // everything else they offer
    credentials?: { title: string; detail: string }[];
    book?: { title: string; subtitle: string; cover: string };
    gallery?: { src: string; caption: string }[];
    website?: string;
};

// Booking a call or an appointment opens the consultation form (/consult) with the expert already chosen.
export const consultHref = (e: Pick<Expert, "slug"> | null, kind: "call" | "appointment") => `/consult?${e ? `expert=${e.slug}&` : ""}type=${kind}`;

const VEDIC_EXPERTISE: Expert["expertise"] = [
    { title: "Vastu", deva: "वास्तु", detail: "Guidance on the layout of your home or workplace, and the remedies when its energy is out of balance." },
    { title: "Kundli", deva: "कुंडली", detail: "Your birth chart read in full — the planets, the timing of what lies ahead, and the remedies it calls for." },
    { title: "Dharma Gyan", deva: "धर्म ज्ञान", detail: "Answers from the scriptures for questions of life, duty and ritual — and which rite suits your need." },
];

export const EXPERTS: Expert[] = [
    {
        slug: "badri-narayan-upadhyay",
        name: "Ramanuj Das Badri Narayan Upadhyay",
        nameDeva: "रामानुज दास बदरी नारायण उपाध्याय",
        title: "Vedic Guru",
        role: "Senior Acharya · KashiGo Anushthan",
        icon: "/puja/badri-narayan-upadhyay-icon.jpg",
        portrait: "/puja/badri-narayan-upadhyay.jpg",
        video: { src: "/puja/acharya-lakshmi-puja.mp4", poster: "/puja/acharya-lakshmi-puja.jpg", captions: "/puja/acharya-lakshmi-puja.en.vtt" },
        about: [
            "A Vedic guru of Kashi, trained in the Vedic and Karmakand traditions of the city, and the senior acharya who guides every KashiGo anushthan.",
            "Sit with Guruji to look at your Vastu, have your kundli read, or ask the questions of dharma that have stayed with you. When a remedy is needed, the rite is performed by learned acharyas in Kashi.",
        ],
        expertise: VEDIC_EXPERTISE,
    },
    {
        slug: "maruti-kinkar-maharaj",
        name: "Maruti Kinkar Maharaj",
        nameDeva: "मारुति किंकर महाराज",
        title: "Vedic Guru",
        role: "Acharya · KashiGo Anushthan",
        icon: "/puja/maruti-kinkar-maharaj-icon.jpg",
        portrait: "/puja/maruti-kinkar-maharaj.jpg",
        video: { src: "/puja/maruti-kinkar-maharaj.mp4", poster: "/puja/maruti-kinkar-maharaj.jpg" },
        about: [
            "A Vedic guru of Kashi and an acharya of the KashiGo Anushthan.",
            "Guidance on Vastu, kundli readings and the knowledge of dharma — listen to Maharaj-ji in the video below.",
        ],
        expertise: VEDIC_EXPERTISE,
    },
    {
        slug: "vibha-upadhyay",
        name: "Vibha Upadhyay",
        nameDeva: "विभा उपाध्याय",
        title: "Numerologist",
        role: "Certified Professional Numerologist",
        quote: "Your numbers don't decide your life. They describe the instrument you were given to play it with.",
        icon: "/experts/vibha-upadhyay/icon.jpg",
        portrait: "/experts/vibha-upadhyay/portrait.jpg",
        video: null, // her video is coming
        stats: [{ value: "8+", label: "years of practice" }, { value: "200+", label: "people guided" }, { value: "14", label: "kinds of reading" }],
        about: [
            "Vibha Upadhyay is a numerologist with over 8 years of practice and more than 200 people guided. She reads charts from the date of birth and the full birth name, and helps people use what they find when they choose a career, a partner, a business name, a phone number or a date.",
            "Her readings are calm and practical. She explains every number she finds, so you leave understanding your own chart — not just a list of predictions.",
        ],
        expertise: [
            { title: "Number correction", detail: "Your mobile number brought in line with your chart, so it supports your money and work instead of draining them." },
            { title: "Name correction", detail: "When the numbers in your name pull against your date of birth, a small change in spelling brings the two back together." },
            { title: "Relationship patterns & prediction", detail: "How two charts meet and where they clash, why the same patterns repeat, and the timing ahead for love and marriage." },
        ],
        services: [
            "Full birth chart reading", "Mobile number correction", "Name correction", "Signature analysis", "House & vehicle numbers",
            "Lo Shu grid & remedies", "Personal year forecast", "Health & wellbeing patterns", "Relationships & compatibility",
            "Career & financial patterns", "Stability & life direction", "Baby name selection", "Business name & brand", "Auspicious dates",
        ],
        credentials: [
            { title: "Certified Professional Numerologist", detail: "Recognised at the Advanced Numerology Convocation 2025" },
            { title: "Advanced Numerology Course", detail: "Completed under Dr. Rohit Gadkari" },
            { title: "Published author", detail: "Numerology: Unlocking Your Spiritual Code" },
        ],
        book: { title: "Numerology", subtitle: "Unlocking Your Spiritual Code", cover: "/experts/vibha-upadhyay/book-cover.jpg" },
        gallery: [
            { src: "/experts/vibha-upadhyay/gallery-01.jpg", caption: "Presenting her book, Numerology: Unlocking Your Spiritual Code" },
            { src: "/experts/vibha-upadhyay/gallery-04.jpg", caption: "Speaking at the Convocation 2025" },
            { src: "/experts/vibha-upadhyay/gallery-03.jpg", caption: "Certified Professional Numerologist" },
            { src: "/experts/vibha-upadhyay/vibha-about.jpg", caption: "At the Advanced Numerology Convocation" },
            { src: "/experts/vibha-upadhyay/gallery-07.jpg", caption: "Book launch on stage" },
            { src: "/experts/vibha-upadhyay/gallery-02.jpg", caption: "Course certificate" },
            { src: "/experts/vibha-upadhyay/gallery-05.jpg", caption: "With fellow graduates" },
            { src: "/experts/vibha-upadhyay/gallery-06.jpg", caption: "Celebrating with the 2025 cohort" },
        ],
        website: "https://vibha-numerology.vercel.app/",
    },
];

export const expertPath = (e: Pick<Expert, "slug">) => `/experts/${e.slug}`;
export const expertBySlug = (slug: string) => EXPERTS.find((e) => e.slug === slug);

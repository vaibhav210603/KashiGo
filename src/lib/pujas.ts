// Puja & Yajna catalogue for /puja. Safe to import from client and server code.
// Dakshina figures are the starting offering for one family; the acharya confirms the final figure on the call.

export type Intent = "prosperity" | "protection" | "planets" | "ancestors" | "family";

export const INTENTS: { id: Intent; label: string }[] = [
    { id: "prosperity", label: "Prosperity" },
    { id: "protection", label: "Health & protection" },
    { id: "planets", label: "Peace & planets" },
    { id: "ancestors", label: "Ancestors" },
    { id: "family", label: "Family & gratitude" },
];

export type Mode = "kashi" | "live" | "behalf";

export const MODES: { id: Mode; title: string; line: string; detail: string }[] = [
    { id: "kashi", title: "In Kashi, with you", line: "Sit for the rite yourself", detail: "You sit as the yajmaan beside the acharya — at the ghat, a temple, or your hotel. We arrange the seat, samagri and the boat if the rite asks for the river." },
    { id: "live", title: "Live, from anywhere", line: "Join on a private video call", detail: "Your name, gotra and sankalp are spoken in Kashi while you watch and take part from home. Prasad and raksha sutra are posted to you." },
    { id: "behalf", title: "On your behalf", line: "We perform it, you receive the recording", detail: "For a time zone that won't allow live, or an elder who can't sit long. The full rite is recorded, and prasad follows by post." },
];

export type Puja = {
    id: string;
    name: string;
    deva: string;
    intents: Intent[];
    deity: string;
    purpose: string;
    duration: string;
    acharyas: number;
    dakshina: number; // INR, starting offering
    modes: Mode[];
    where: string;
    steps: string[];
    seasonal?: { label: string; date: string }; // date: YYYY-MM-DD, IST
};

export const PUJAS: Puja[] = [
    {
        id: "lakshmi-puja",
        name: "Deepavali Lakshmi–Ganesh Puja",
        deva: "लक्ष्मी पूजन",
        intents: ["prosperity", "family"],
        deity: "Maa Lakshmi & Shri Ganesh",
        purpose: "On the dark night of Kartik Amavasya — Kalratri — Lakshmi is invited into the home and the business ledger for the year ahead.",
        duration: "About 2 hours, in the evening muhurat",
        acharyas: 2,
        dakshina: 5100,
        modes: ["kashi", "live", "behalf"],
        where: "Your home or office in Varanasi, or a ghat-side chowki",
        steps: ["Ganesh vandana and sankalp in your family's name", "Kalash sthapana and shodashopachar Lakshmi puja", "Shri Sukta path and blessing of your ledger, keys or account books", "Deep daan and aarti"],
        seasonal: { label: "Deepavali", date: "2026-11-08" },
    },
    {
        id: "rudrabhishek",
        name: "Rudrabhishek",
        deva: "रुद्राभिषेक",
        intents: ["protection", "planets"],
        deity: "Mahadev, the lord of Kashi",
        purpose: "The Rudri is chanted while the Shivling is bathed in Ganga jal, milk, honey and panchamrit — the rite Kashi is known for.",
        duration: "1½ – 2½ hours",
        acharyas: 2,
        dakshina: 5100,
        modes: ["kashi", "live", "behalf"],
        where: "A Shiva temple near the ghats",
        steps: ["Sankalp with your name, gotra and intention", "Ganesh and Gauri puja", "Abhishek through the eleven anuvakas of the Rudri", "Shringar, aarti and prasad"],
    },
    {
        id: "maha-mrityunjaya",
        name: "Maha Mrityunjaya Jaap",
        deva: "महामृत्युंजय जाप",
        intents: ["protection"],
        deity: "Mahadev as Mrityunjaya",
        purpose: "Kept for illness, surgery, a frightening diagnosis or long life for an elder. The mantra is counted in thousands, then completed with a havan.",
        duration: "11,000 jaap over 1–3 days; 1.25 lakh over 7–11 days",
        acharyas: 5,
        dakshina: 21000,
        modes: ["kashi", "live", "behalf"],
        where: "Temple or ashram in Kashi",
        steps: ["Sankalp and a daily start in your name", "Jaap counted on rudraksha by a team of acharyas", "Dashansh havan on the final day", "Prasad, raksha sutra and vibhuti posted to you"],
    },
    {
        id: "navagraha-shanti",
        name: "Navagraha Shanti",
        deva: "नवग्रह शांति",
        intents: ["planets"],
        deity: "The nine grahas",
        purpose: "When the chart is heavy — a Shani dasha, Rahu–Ketu, a run of obstacles — each of the nine planets is offered its own grain, colour and mantra.",
        duration: "About 3 hours",
        acharyas: 2,
        dakshina: 7100,
        modes: ["kashi", "live", "behalf"],
        where: "A ghat-side chowki or temple",
        steps: ["Sankalp, with your birth details if you have them", "Navagraha mandal set with nine grains", "Mantra jaap for each graha", "Havan and purnahuti"],
    },
    {
        id: "pind-daan",
        name: "Pind Daan & Shraddh",
        deva: "पिंडदान",
        intents: ["ancestors"],
        deity: "Your pitrs",
        purpose: "Kashi is where the soul is said to find moksha. Rice pinds are offered so those who went before you are at peace — often done in Pitru Paksha or after a death in the family.",
        duration: "2 – 3 hours",
        acharyas: 1,
        dakshina: 5100,
        modes: ["kashi", "behalf"],
        where: "Pishachmochan Kund or the Ganga at Manikarnika",
        steps: ["Sankalp naming the departed and three generations", "Tarpan with til and Ganga jal", "Pind daan", "Brahmin bhojan and daan, done in your name"],
    },
    {
        id: "satyanarayan-katha",
        name: "Satyanarayan Katha",
        deva: "सत्यनारायण कथा",
        intents: ["family", "prosperity"],
        deity: "Bhagwan Vishnu",
        purpose: "The katha for a new home, a wedding, a child, a new job — or simply to say thank you. The whole family can sit together.",
        duration: "About 2 hours",
        acharyas: 1,
        dakshina: 3100,
        modes: ["kashi", "live", "behalf"],
        where: "Your home, hotel or a ghat",
        steps: ["Ganesh, Navagraha and Kalash puja", "The five chapters of the katha", "Havan (optional) and aarti", "Panjiri and panchamrit prasad"],
    },
    {
        id: "ganga-puja",
        name: "Ganga Puja & Deep Daan",
        deva: "गंगा पूजन",
        intents: ["family", "ancestors"],
        deity: "Maa Ganga",
        purpose: "A short, personal puja on the steps of the river at dusk, ending with a leaf-boat of lamps you set on the water yourself. A gentle first rite for anyone new to Kashi.",
        duration: "About 45 minutes, at sunset",
        acharyas: 1,
        dakshina: 1100,
        modes: ["kashi"],
        where: "Assi, Dashashwamedh or Kedar Ghat",
        steps: ["Sankalp at the water's edge", "Ganga stuti and offering of flowers, milk and chunri", "Deep daan on the river", "Tilak and prasad — then stay for the aarti from your boat, if you like"],
    },
    {
        id: "kaal-sarp-shanti",
        name: "Kaal Sarp Dosh Shanti",
        deva: "कालसर्प शांति",
        intents: ["planets", "protection"],
        deity: "Mahadev & the Nag devtas",
        purpose: "For a chart where every planet sits between Rahu and Ketu. A Rudrabhishek, the Nag puja and a havan are done in one sitting.",
        duration: "About 3 hours",
        acharyas: 2,
        dakshina: 7100,
        modes: ["kashi", "live", "behalf"],
        where: "A Shiva temple near the ghats",
        steps: ["Sankalp with your birth details", "Rahu–Ketu and Nag puja with silver nag–nagin", "Rudrabhishek", "Havan and visarjan in the Ganga"],
    },
];

// Spoken by the senior acharya who guides KashiGo's rites. `photo` is a path under /public, e.g. "/puja/badri-narayan-upadhyay.jpg".
export const ACHARYA_WORD = {
    chaupai: "सेवत तोहि सुलभ फल चारी।",
    source: "श्री रामचरितमानस — गोस्वामी तुलसीदास",
    hindi: "दीपावली पर धन, समृद्धि, व्यापार में उन्नति और जीवन में सफलता की कामना से माता लक्ष्मी की पूजा करते हैं। इसके लिए रामचरितमानस में श्री तुलसीदास जी ने बहुत ही सुंदर चौपाई लिखी है — ‘सेवत तोहि सुलभ फल चारी।’ कालरात्रि में माता लक्ष्मी की विशेष पूजा करके धन-समृद्धि की कामना की पूर्ति होती है। यह सभी अनुष्ठान किसी योग्य आचार्य या सिद्ध पुरुष के द्वारा करने पर शत प्रतिशत मनोवांछित लाभ मिलता ही मिलता है।",
    english: "On Deepavali we worship Maa Lakshmi for wealth, prosperity, growth in business and success in life. Tulsidas put it beautifully in the Ramcharitmanas — “Those who serve you, all four fruits of life come easily.” A special Lakshmi puja on Kalratri fulfils the wish for abundance; and when such rites are performed by a learned acharya, the heart's wish is answered.",
    closing: "जय श्रीमन नारायण",
    name: "Ramanuj Das Badri Narayan Upadhyay",
    nameDeva: "रामानुज दास बदरी नारायण उपाध्याय",
    photo: "/puja/badri-narayan-upadhyay.jpg" as string | null,
    // His spoken message, shown in place of the photo until `until` (IST) — it names the Deepavali date, so it retires after it.
    // Hindi subtitles are burned in; English captions are the .vtt track.
    video: {
        src: "/puja/acharya-lakshmi-puja.mp4",
        poster: "/puja/acharya-lakshmi-puja.jpg",
        captions: "/puja/acharya-lakshmi-puja.en.vtt",
        duration: 50,
        uploaded: "2026-10-29",
        until: "2026-11-08",
        puja: "lakshmi-puja",
    } as { src: string; poster: string; captions: string; duration: number; uploaded: string; until: string; puja: string } | null,
};

// Short video bytes from the acharyas who perform the rites. Add an entry per video dropped in /public/puja.
export const ACHARYA_BYTES: { name: string; role: string; video: string; poster?: string }[] = [];

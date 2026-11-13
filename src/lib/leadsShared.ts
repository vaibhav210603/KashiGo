// Leads CRM — the parts safe for both client and server: statuses, the free-text parser the WhatsApp bot uses,
// and the ready-to-send WhatsApp messages for a client. Database access lives in src/lib/leads.ts.
import { formatPhone, normalizePhone } from "@/lib/phone";

export const STATUSES = ["new", "contacted", "quoted", "follow_up", "booked", "lost"] as const;
export type LeadStatus = (typeof STATUSES)[number];
export const STATUS_LABEL: Record<LeadStatus, string> = {
    new: "New", contacted: "Contacted", quoted: "Quoted", follow_up: "Follow-up", booked: "Booked", lost: "Lost",
};
// Days until the next nudge after moving to a status (null clears it).
export const FOLLOW_UP_DAYS: Record<LeadStatus, number | null> = { new: 0, contacted: 1, quoted: 2, follow_up: 2, booked: null, lost: null };

export const SOURCES = ["whatsapp", "call", "instagram", "website", "referral", "walk_in", "other"] as const;
export type LeadSource = (typeof SOURCES)[number];
export const SOURCE_LABEL: Record<LeadSource, string> = {
    whatsapp: "WhatsApp", call: "Call", instagram: "Instagram", website: "Website", referral: "Referral", walk_in: "Walk-in", other: "Other",
};

export type LeadEvent = { at: string; by: string; text: string };
export type Lead = {
    id: number; name: string; phone: string | null; source: LeadSource; interest: string; travel_date: string | null;
    pax: number | null; notes: string; status: LeadStatus; amount_inr: number | null; follow_up_on: string | null;
    added_by: string; history: LeadEvent[]; created_at: string; updated_at: string;
};
export type LeadDraft = Partial<Pick<Lead, "name" | "phone" | "source" | "interest" | "travel_date" | "pax" | "notes" | "amount_inr">>;

// Words a worker might type for each status, in English and Hindi/Hinglish.
const STATUS_WORDS: [RegExp, LeadStatus][] = [
    [/^(new|naya)$/i, "new"],
    [/^(contacted|called|baat|baat\s*hui|replied|spoke|talked|contact)$/i, "contacted"],
    [/^(quoted|quote|price\s*sent|rate\s*bheja|quotation)$/i, "quoted"],
    [/^(follow|follow[\s-]?up|followup|later|baad\s*me|baad\s*mein|remind)$/i, "follow_up"],
    [/^(booked|book|confirmed|confirm|done|paid|pakka|won)$/i, "booked"],
    [/^(lost|cancel|cancelled|not\s*interested|nahi|dead|spam)$/i, "lost"],
];
export function statusFromWord(w: string): LeadStatus | null {
    const s = w.trim().replace(/[.!]+$/, "");
    return STATUS_WORDS.find(([re]) => re.test(s))?.[1] ?? null;
}

/* ───────────── dates (all in India time) ───────────── */

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
export function todayIST(): string {
    return new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);
}
export function addDays(iso: string, n: number): string {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
}
const iso = (y: number, m: number, d: number) => {
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d ? dt.toISOString().slice(0, 10) : null;
};
// A day/month with no year means the next time that date comes round.
const upcoming = (m: number, d: number) => {
    const today = todayIST();
    const y = Number(today.slice(0, 4));
    const first = iso(y, m, d);
    return first && first >= today ? first : iso(y + 1, m, d);
};
const MONTH_RE = "(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*";

// Finds one travel date in free text. Returns the ISO date and the exact text it came from.
export function findDate(text: string): { date: string; match: string } | null {
    const t = text.toLowerCase();
    let m: RegExpMatchArray | null;
    if ((m = t.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/))) { const d = iso(+m[1], +m[2], +m[3]); if (d) return { date: d, match: m[0] }; }
    if ((m = t.match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s*(?:of\\s*)?${MONTH_RE}\\.?(?:,?\\s*(\\d{4}))?\\b`)))) {
        const mon = MONTHS.indexOf(m[2].slice(0, 3)) + 1;
        const d = m[3] ? iso(+m[3], mon, +m[1]) : upcoming(mon, +m[1]);
        if (d) return { date: d, match: m[0] };
    }
    if ((m = t.match(new RegExp(`\\b${MONTH_RE}\\.?\\s*(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s*(\\d{4}))?\\b`)))) {
        const mon = MONTHS.indexOf(m[1].slice(0, 3)) + 1;
        const d = m[3] ? iso(+m[3], mon, +m[2]) : upcoming(mon, +m[2]);
        if (d) return { date: d, match: m[0] };
    }
    if ((m = t.match(/\b(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?\b/))) {
        const y = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : 0;
        const d = y ? iso(y, +m[2], +m[1]) : upcoming(+m[2], +m[1]);
        if (d) return { date: d, match: m[0] };
    }
    if ((m = t.match(/\b(today|aaj|tonight)\b/))) return { date: todayIST(), match: m[0] };
    if ((m = t.match(/\b(tomorrow|tmrw|tmr)\b/))) return { date: addDays(todayIST(), 1), match: m[0] };
    if ((m = t.match(/\b(day after tomorrow|parso)\b/))) return { date: addDays(todayIST(), 2), match: m[0] };
    return null;
}

export const dateLabel = (d: string | null | undefined, withDay = false) =>
    d ? new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", { ...(withDay ? { weekday: "short" } : {}), day: "numeric", month: "short", timeZone: "UTC" }) : "";

/* ───────────── free-text → lead ───────────── */

const LABELS: [RegExp, keyof LeadDraft | "skip"][] = [
    [/^(name|naam|customer|client|guest)$/i, "name"],
    [/^(phone|mobile|mob|number|no|contact|whatsapp|wa|ph)$/i, "phone"],
    [/^(date|travel\s*date|tarikh|when|arrival)$/i, "travel_date"],
    [/^(people|persons|pax|guests|members|log|adults|group)$/i, "pax"],
    [/^(ride|interest|service|wants|looking\s*for|package|trip|query|enquiry|inquiry|for)$/i, "interest"],
    [/^(source|from|via)$/i, "source"],
    [/^(amount|budget|price|quote|rate|total)$/i, "amount_inr"],
    [/^(note|notes|remark|remarks|comment)$/i, "notes"],
];

function sourceFrom(t: string): LeadSource | null {
    if (/\b(insta|instagram|ig|dm)\b/i.test(t)) return "instagram";
    if (/\b(call|called|phone call|calling|missed call)\b/i.test(t)) return "call";
    if (/\b(website|site|web|form|google)\b/i.test(t)) return "website";
    if (/\b(referral|referred|reference|ref)\b/i.test(t)) return "referral";
    if (/\b(walk[\s-]?in|ghat par|at the ghat)\b/i.test(t)) return "walk_in";
    if (/\b(whatsapp|wa)\b/i.test(t)) return "whatsapp";
    return null;
}

const FILLER = /^(insta|instagram|ig|dm|lead|new|call|called|calling|website|site|web|whatsapp|wa|enquiry|inquiry|query|client|customer|guest|from|via|ref|referral|mr|mrs|ms|sir|madam|ji)$/i;
const PAX_RE = /\b(\d{1,3})\s*(?:people|persons?|pax|guests?|log|logon|logo|adults?|members?|ppl|pple|jan|ppl\.)\b/i;
const AMOUNT_RE = /(?:₹|\brs\.?|\binr)\s*([\d,]{3,9})|\b([\d,]{3,9})\s*(?:rs|rupees|\/-)/i;
const PHONE_RE = /(?:\+|\b)\d[\d\s-]{7,16}\d\b/g;

// Turns whatever a worker pastes or types ("Rahul 98765 43210 evening aarti 4 people 20 Dec, called") into lead fields.
// Labelled lines ("Name: …", "Date: …") win over guesses. Unrecognised words become the interest; the raw text is kept in notes.
export function parseLeadText(raw: string): LeadDraft {
    const text = raw.replace(/\r/g, "").trim();
    const out: LeadDraft = {};
    let rest = text;

    for (const line of text.split("\n")) {
        const m = line.match(/^\s*[*_-]*\s*([a-z][a-z\s]{0,18}?)\s*[*_]*\s*[:=\-–]\s*(.+)$/i);
        if (!m) continue;
        const key = LABELS.find(([re]) => re.test(m[1].trim()))?.[1];
        if (!key || key === "skip") continue;
        const v = m[2].trim();
        if (key === "phone") out.phone = normalizePhone(v) ?? out.phone;
        else if (key === "travel_date") out.travel_date = findDate(v)?.date ?? out.travel_date;
        else if (key === "pax") out.pax = Number(v.match(/\d{1,3}/)?.[0]) || out.pax;
        else if (key === "amount_inr") out.amount_inr = Number(v.replace(/[^\d]/g, "")) || out.amount_inr;
        else if (key === "source") out.source = sourceFrom(v) ?? "other";
        else if (key === "name") out.name = v.slice(0, 80);
        else if (key === "interest") out.interest = v.slice(0, 120);
        else continue;
        rest = rest.replace(line, " ");
    }

    if (!out.phone) {
        for (const m of rest.matchAll(PHONE_RE)) {
            const p = normalizePhone(m[0]);
            if (p) { out.phone = p; break; }
        }
    }
    // Name: the words before the number on the first line, e.g. "Rahul Sharma 98765 43210 …".
    if (!out.name) {
        const firstLine = rest.split("\n").find((l) => l.trim()) ?? "";
        const before = firstLine.split(/(?:\+|\b)\d[\d\s-]{7,16}\d\b/)[0];
        const words = before.replace(/[^\p{L}\s.']/gu, " ").trim().split(/\s+/).filter((w) => w && !FILLER.test(w));
        if (words.length && words.length <= 4) out.name = words.join(" ");
    }
    rest = rest.replace(PHONE_RE, " ");

    if (!out.travel_date) { const d = findDate(rest); if (d) { out.travel_date = d.date; rest = rest.replace(new RegExp(d.match.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&"), "i"), " "); } }
    if (!out.pax) { const m = rest.match(PAX_RE); if (m) { out.pax = Number(m[1]); rest = rest.replace(m[0], " "); } }
    if (!out.amount_inr) { const m = rest.match(AMOUNT_RE); if (m) { out.amount_inr = Number((m[1] || m[2]).replace(/,/g, "")); rest = rest.replace(m[0], " "); } }
    if (!out.source) out.source = sourceFrom(text) ?? undefined;

    if (!out.interest) {
        let left = rest;
        if (out.name) left = left.replace(out.name, " ");
        left = left
            .replace(/\b(called|calling|call|via|from|insta(gram)?|ig|dm|website|whatsapp|wa|referral|on|for|wants?|enquiry|inquiry|lead|new|budget|price|rate)\b/gi, " ")
            .replace(/[,;|]+/g, " ").replace(/\s+/g, " ").trim();
        if (left.length >= 3) out.interest = left.slice(0, 120);
    }
    if (text.length > 0) out.notes = text.slice(0, 1000);
    return out;
}

/* ───────────── WhatsApp messages for a client ───────────── */

export const KASHIGO_PHONE = "+91 81759 66910";
export const KASHIGO_SITE = "https://kashigo.in";
// Set NEXT_PUBLIC_GOOGLE_REVIEW_URL to the "Ask for reviews" link from Google Business Profile.
export const REVIEW_URL = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || "https://www.google.com/search?q=KashiGo+Varanasi+reviews";

export type MsgLang = "en" | "hi";
export type MessageKey = "first_reply" | "details" | "quote" | "follow_up" | "confirmed" | "day_before" | "review" | "lost";
export const MESSAGE_LABEL: Record<MessageKey, string> = {
    first_reply: "First reply", details: "Ask for details", quote: "Send quote", follow_up: "Follow-up nudge",
    confirmed: "Booking confirmed", day_before: "Day-before reminder", review: "Ask for review", lost: "Keep in touch",
};
// Which message fits a lead's current status first.
export const MESSAGES_FOR: Record<LeadStatus, MessageKey[]> = {
    new: ["first_reply", "details", "quote"],
    contacted: ["details", "quote", "follow_up"],
    quoted: ["follow_up", "quote", "confirmed"],
    follow_up: ["follow_up", "quote", "lost"],
    booked: ["confirmed", "day_before", "review"],
    lost: ["lost", "follow_up"],
};

const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export function clientMessage(key: MessageKey, lead: Pick<Lead, "name" | "travel_date" | "pax" | "interest" | "amount_inr">, lang: MsgLang = "en"): string {
    const first = (lead.name || "").trim().split(/\s+/)[0] || "";
    const hi = lang === "hi";
    const greet = hi ? `नमस्ते${first ? ` ${first} जी` : ""} 🙏` : `Namaste${first ? ` ${first} ji` : ""} 🙏`;
    const when = lead.travel_date ? dateLabel(lead.travel_date, true) : "";
    const what = lead.interest || (hi ? "काशी नाव यात्रा" : "your Kashi boat ride");
    const ppl = lead.pax ? (hi ? `${lead.pax} लोगों` : `${lead.pax} ${lead.pax === 1 ? "person" : "people"}`) : "";
    const price = lead.amount_inr ? rupees(lead.amount_inr) : "";
    // Asks only for what we don't know yet.
    const ask = (intro: string, qs: (string | false)[]) => {
        const left = qs.filter(Boolean) as string[];
        return left.length ? `${intro}\n${left.map((q, i) => `${i + 1}. ${q}`).join("\n")}` : "";
    };
    const sign = hi ? `— टीम KashiGo\n📞 ${KASHIGO_PHONE}` : `— Team KashiGo\n📞 ${KASHIGO_PHONE}`;

    const en: Record<MessageKey, string[]> = {
        first_reply: [
            greet,
            `Thank you for reaching out to KashiGo! We'd love to plan ${what} for you${when ? ` on ${when}` : ""}.`,
            ask("Could you share:", [!lead.travel_date && "Your date of visit", !lead.pax && "Number of people", !lead.interest && "Morning (sunrise) or evening (Ganga Aarti)?"]),
            `We'll send you one clear price in writing — nothing to pay until you say yes.`,
            sign,
        ],
        details: [
            greet,
            `To plan this properly, please tell us${when ? "" : " your date,"} how many people${ppl ? ` (we noted ${ppl})` : ""}, and whether you prefer a private boat or a shared one.`,
            `You can see all our rides here: ${KASHIGO_SITE}`,
            sign,
        ],
        quote: [
            greet,
            `Here's your plan for ${what}${when ? ` on ${when}` : ""}${ppl ? ` for ${ppl}` : ""}:`,
            price ? `💰 Total: *${price}* (all inclusive)` : `💰 Total: *₹____* (all inclusive)`,
            `✅ Private boat with a local boatman\n✅ Pickup point & timing shared a day before\n✅ Free reschedule if the weather turns`,
            `A small token confirms your boat — the rest is paid on the day. Shall I lock it for you?`,
            sign,
        ],
        follow_up: [
            greet,
            `Just checking in about ${what}${when ? ` on ${when}` : ""}. Boats for the aarti fill up quickly around this time, so I wanted to make sure you get a good spot.`,
            `Shall I hold one for you? Happy to answer any questions.`,
            sign,
        ],
        confirmed: [
            greet,
            `Your booking is confirmed ✅`,
            [when && `📅 ${when}`, ppl && `👥 ${ppl}`, `🛶 ${what}`, price && `💰 ${price}`].filter(Boolean).join("\n"),
            `We'll WhatsApp you the exact meeting point and time a day before. Har Har Mahadev!`,
            sign,
        ],
        day_before: [
            greet,
            `See you ${when ? `on ${when}` : "tomorrow"}! 🌅`,
            `📍 Meeting point: ____________\n⏰ Please reach by: ____\n📞 Your boatman: ____`,
            `Carry a light shawl for the river breeze. Message us anytime if you're running late.`,
            sign,
        ],
        review: [
            greet,
            `Thank you for riding with KashiGo — we hope Kashi stays with you for a long time 🙏`,
            `If you enjoyed it, a quick Google review would mean a lot to our boatmen: ${REVIEW_URL}`,
            sign,
        ],
        lost: [
            greet,
            `No problem at all! Whenever you plan your Kashi trip, just message us here — we'll be happy to help with boats, darshan or a full itinerary.`,
            sign,
        ],
    };
    const hiT: Record<MessageKey, string[]> = {
        first_reply: [
            greet,
            `KashiGo से संपर्क करने के लिए धन्यवाद! हम आपकी ${what} ${when ? `${when} को ` : ""}प्लान करना चाहेंगे।`,
            ask("कृपया बताइए:", [!lead.travel_date && "आप किस तारीख को आ रहे हैं", !lead.pax && "कितने लोग होंगे", !lead.interest && "सुबह (सूर्योदय) या शाम (गंगा आरती)?"]),
            `हम आपको एक साफ़ कीमत लिखकर भेजेंगे — जब तक आप हाँ न कहें, कोई पेमेंट नहीं।`,
            sign,
        ],
        details: [
            greet,
            `सही प्लान बनाने के लिए बताइए${when ? "" : " तारीख,"} कितने लोग${ppl ? ` (हमने ${ppl} नोट किया है)` : ""}, और प्राइवेट नाव चाहिए या शेयर्ड?`,
            `हमारी सारी राइड यहाँ देखें: ${KASHIGO_SITE}`,
            sign,
        ],
        quote: [
            greet,
            `आपकी ${what}${when ? `, ${when}` : ""}${ppl ? `, ${ppl} के लिए` : ""} का प्लान:`,
            price ? `💰 कुल: *${price}* (सब शामिल)` : `💰 कुल: *₹____* (सब शामिल)`,
            `✅ लोकल नाविक के साथ प्राइवेट नाव\n✅ मिलने की जगह और समय एक दिन पहले भेजेंगे\n✅ मौसम खराब हो तो फ्री में तारीख बदलें`,
            `छोटा सा टोकन देकर नाव पक्की करें — बाकी उसी दिन। क्या मैं आपके लिए बुक कर दूँ?`,
            sign,
        ],
        follow_up: [
            greet,
            `${what}${when ? ` (${when})` : ""} के बारे में पूछना था। इन दिनों आरती की नावें जल्दी भर जाती हैं, इसलिए आपके लिए अच्छी जगह पक्की करना चाहते हैं।`,
            `क्या मैं एक नाव आपके लिए रोक दूँ? कोई भी सवाल हो तो पूछिए।`,
            sign,
        ],
        confirmed: [
            greet,
            `आपकी बुकिंग पक्की है ✅`,
            [when && `📅 ${when}`, ppl && `👥 ${ppl}`, `🛶 ${what}`, price && `💰 ${price}`].filter(Boolean).join("\n"),
            `मिलने की सही जगह और समय हम एक दिन पहले WhatsApp कर देंगे। हर हर महादेव!`,
            sign,
        ],
        day_before: [
            greet,
            `${when ? `${when} को` : "कल"} मिलते हैं! 🌅`,
            `📍 मिलने की जगह: ____________\n⏰ कृपया पहुँचें: ____\n📞 आपके नाविक: ____`,
            `नदी पर हवा ठंडी होती है, हल्की शॉल साथ रखें। देर हो रही हो तो हमें मैसेज कर दें।`,
            sign,
        ],
        review: [
            greet,
            `KashiGo के साथ यात्रा करने के लिए धन्यवाद 🙏 उम्मीद है काशी आपको हमेशा याद रहेगी।`,
            `अगर अच्छा लगा हो तो एक छोटा सा Google review हमारे नाविकों के लिए बहुत मायने रखता है: ${REVIEW_URL}`,
            sign,
        ],
        lost: [
            greet,
            `कोई बात नहीं! जब भी काशी आने का प्लान बने, यहीं मैसेज कर दीजिए — नाव, दर्शन या पूरा प्लान, सब में मदद करेंगे।`,
            sign,
        ],
    };
    return (hi ? hiT : en)[key].filter(Boolean).join("\n\n");
}

// wa.me link that opens a chat with the client with the message already typed.
export const waLink = (phone: string | null | undefined, text: string) =>
    `https://wa.me/${phone ? phone.replace(/\D/g, "") : ""}?text=${encodeURIComponent(text)}`;

export const leadLine = (l: Pick<Lead, "id" | "name" | "phone" | "status" | "travel_date" | "pax" | "interest">) =>
    `#${l.id} ${l.name || "(no name)"}${l.phone ? ` · ${formatPhone(l.phone)}` : ""} · ${STATUS_LABEL[l.status]}` +
    `${l.travel_date ? ` · ${dateLabel(l.travel_date)}` : ""}${l.pax ? ` · ${l.pax} pax` : ""}${l.interest ? ` · ${l.interest}` : ""}`;

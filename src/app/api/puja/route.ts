import { NextResponse } from "next/server";
import { createTransporter, simpleEmail } from "@/lib/mailer";
import { rateLimited } from "@/lib/rateLimit";
import { normalizePhone, formatPhone } from "@/lib/phone";
import { MODES, PUJAS } from "@/lib/pujas";

// Plain text only: strips control characters and HTML-significant characters, caps the length.
const clean = (v: unknown, max = 100) => String(v ?? "").replace(/[\u0000-\u001f\u007f<>]/g, " ").trim().slice(0, max);
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// A sankalp request: no payment here — the acharya calls, fixes the muhurat and confirms the dakshina.
export async function POST(req: Request) {
    if (rateLimited(req, "puja", 5, 10 * 60 * 1000)) return NextResponse.json({ success: false, message: "Too many requests — please wait a few minutes." }, { status: 429 });
    try {
        const b = await req.json();
        const puja = PUJAS.find((p) => p.id === b?.puja);
        const mode = MODES.find((m) => m.id === b?.mode && puja?.modes.includes(m.id));
        const name = clean(b?.name, 80);
        const phone = normalizePhone(clean(b?.phone, 24));
        const email = clean(b?.email, 120);
        const date = /^\d{4}-\d{2}-\d{2}$/.test(String(b?.date ?? "")) ? String(b.date) : "";
        const family = clean(b?.family, 300);
        const gotra = clean(b?.gotra, 60);
        const sankalp = clean(b?.sankalp, 600);
        if (!puja || !mode) return NextResponse.json({ success: false, message: "Please choose a rite and how you'll take part." }, { status: 400 });
        if (!name || !phone) return NextResponse.json({ success: false, message: "Please add your name and a WhatsApp number we can call." }, { status: 400 });
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ success: false, message: "That email doesn't look right." }, { status: 400 });

        const owner = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
        if (!owner) return NextResponse.json({ success: false, message: "Requests are offline right now — please WhatsApp us." }, { status: 503 });
        const when = date ? new Date(`${date}T00:00:00+05:30`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }) : "Acharyaji to suggest a muhurat";
        const t = createTransporter();
        await t.sendMail({
            from: `"KashiGo Puja" <${owner}>`,
            to: owner,
            replyTo: email || undefined,
            subject: `Sankalp request: ${puja.name} — ${name} — ${mode.title}`,
            text: [
                `Rite: ${puja.name} (from ${inr(puja.dakshina)})`,
                `Taking part: ${mode.title}`,
                `Preferred date: ${when}`,
                `Yajmaan: ${name}`,
                `Family names: ${family || "—"}`,
                `Gotra: ${gotra || "not known (use Kashyap)"}`,
                `Sankalp: ${sankalp || "—"}`,
                `Phone/WhatsApp: ${formatPhone(phone)}  https://wa.me/${phone.slice(1)}`,
                `Email: ${email || "—"}`,
            ].join("\n"),
        });
        if (email) {
            try {
                await t.sendMail({
                    from: `"KashiGo" <${owner}>`,
                    to: email,
                    subject: `Your sankalp for ${puja.name} has reached Kashi`,
                    html: simpleEmail({
                        preheader: "An acharya will call you within a day to fix the muhurat and dakshina.",
                        heading: `Pranam, ${name.split(" ")[0]}`,
                        paragraphs: [
                            `Your request for <b>${puja.name}</b> (${mode.title.toLowerCase()}) has reached us in Kashi.`,
                            `Within a day an acharya will call you on <b>${formatPhone(phone)}</b> to confirm the muhurat${date ? ` around <b>${when}</b>` : ""}, your gotra and the exact sankalp, and to agree the dakshina in writing. Nothing is paid until then.`,
                            `Questions in the meantime? Call or WhatsApp <a href="tel:+918175966910">+91 81759 66910</a>. Jai Shriman Narayan.`,
                        ],
                    }),
                });
            } catch (e) {
                console.error("Puja customer mail failed:", e);
            }
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Puja request error:", error);
        return NextResponse.json({ success: false, message: "We couldn't send that — please WhatsApp us instead." }, { status: 500 });
    }
}

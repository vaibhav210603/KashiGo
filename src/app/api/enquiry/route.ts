import { NextResponse } from "next/server";
import { createTransporter, simpleEmail } from "@/lib/mailer";
import { rateLimited } from "@/lib/rateLimit";
import { normalizePhone, formatPhone } from "@/lib/phone";
import { SERVICES } from "@/lib/services";

// Plain text only: strips control characters and HTML-significant characters, caps the length.
const clean = (v: unknown, max = 100) => String(v ?? "").replace(/[\u0000-\u001f\u007f<>]/g, " ").trim().slice(0, max);

// A request for one of the services beyond the boat. No payment: we quote in writing first.
export async function POST(req: Request) {
    if (rateLimited(req, "enquiry", 5, 10 * 60 * 1000)) return NextResponse.json({ success: false, message: "Too many requests — please wait a few minutes." }, { status: 429 });
    try {
        const b = await req.json();
        const service = SERVICES.find((s) => s.id === b?.service);
        const name = clean(b?.name, 80);
        const phone = normalizePhone(clean(b?.phone, 24));
        const email = clean(b?.email, 120);
        const date = /^\d{4}-\d{2}-\d{2}$/.test(String(b?.date ?? "")) ? String(b.date) : "";
        const guests = Math.min(50, Math.max(1, Math.trunc(Number(b?.guests)) || 1));
        const note = clean(b?.note, 600);
        if (!service) return NextResponse.json({ success: false, message: "Please choose a service." }, { status: 400 });
        if (!name || !phone) return NextResponse.json({ success: false, message: "Please add your name and a WhatsApp number we can reach." }, { status: 400 });
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ success: false, message: "That email doesn't look right." }, { status: 400 });

        const owner = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
        if (!owner) return NextResponse.json({ success: false, message: "Requests are offline right now — please WhatsApp us." }, { status: 503 });
        const when = date ? new Date(`${date}T00:00:00+05:30`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }) : "Flexible";
        const t = createTransporter();
        await t.sendMail({
            from: `"KashiGo Services" <${owner}>`,
            to: owner,
            replyTo: email || undefined,
            subject: `Service request: ${service.name} — ${name} — ${guests} guest${guests === 1 ? "" : "s"}`,
            text: [
                `Service: ${service.name}`,
                `Date: ${when}`,
                `Guests: ${guests}`,
                `Name: ${name}`,
                `Note: ${note || "—"}`,
                `Phone/WhatsApp: ${formatPhone(phone)}  https://wa.me/${phone.slice(1)}`,
                `Email: ${email || "—"}`,
            ].join("\n"),
        });
        if (email) {
            try {
                await t.sendMail({
                    from: `"KashiGo" <${owner}>`,
                    to: email,
                    subject: `We've got your request for ${service.name}`,
                    html: simpleEmail({
                        preheader: "We'll send you a written quote on WhatsApp shortly.",
                        heading: `Namaste, ${name.split(" ")[0]}`,
                        paragraphs: [
                            `Thank you for asking about <b>${service.name}</b>${date ? ` on <b>${when}</b>` : ""} for ${guests} guest${guests === 1 ? "" : "s"}.`,
                            `We'll WhatsApp you on <b>${formatPhone(phone)}</b> with a plan and one price in writing — usually within a few hours. Nothing is paid until you say yes.`,
                            `Questions? Call or WhatsApp <a href="tel:+918175966910">+91 81759 66910</a>. Har Har Mahadev.`,
                        ],
                    }),
                });
            } catch (e) {
                console.error("Enquiry customer mail failed:", e);
            }
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Enquiry error:", error);
        return NextResponse.json({ success: false, message: "We couldn't send that — please WhatsApp us instead." }, { status: 500 });
    }
}

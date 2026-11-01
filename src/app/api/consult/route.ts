import { NextResponse } from "next/server";
import { newConsultationId, saveConsultation, type Consultation } from "@/lib/consultations";
import { EXPERTS } from "@/lib/experts";
import { CONSULT_PER_MINUTE_INR } from "@/lib/pujas";
import { createTransporter, simpleEmail } from "@/lib/mailer";
import { rateLimited } from "@/lib/rateLimit";

const clean = (v: FormDataEntryValue | null, max: number) => String(v ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, max);
const MAX_PALM_BYTES = 6 * 1024 * 1024;

// A consultation request: birth details and a photo of the right palm, saved for the experts (admin → Consultancy).
export async function POST(req: Request) {
    if (rateLimited(req, "consult", 6, 10 * 60 * 1000)) return NextResponse.json({ success: false, message: "Too many requests — please try again in a few minutes." }, { status: 429 });
    try {
        const f = await req.formData();
        const expert = EXPERTS.find((e) => e.slug === clean(f.get("expert"), 60));
        const kind = clean(f.get("kind"), 20) === "call" ? "call" : "appointment";
        const name = clean(f.get("name"), 80);
        const dob = clean(f.get("dob"), 10);
        const birthPlace = clean(f.get("birthPlace"), 120);
        const birthTime = clean(f.get("birthTime"), 5);
        const phone = clean(f.get("phone"), 20);
        const email = clean(f.get("email"), 120).toLowerCase();
        const question = clean(f.get("question"), 1000);
        const palm = f.get("palm");

        const problem =
            !expert ? "Choose who you'd like to consult." :
            name.length < 2 ? "Add your full name." :
            !/^\d{4}-\d{2}-\d{2}$/.test(dob) || Number.isNaN(Date.parse(dob)) || dob > new Date().toISOString().slice(0, 10) ? "Add your date of birth." :
            birthPlace.length < 2 ? "Add your place of birth." :
            birthTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(birthTime) ? "Check your time of birth, or leave it empty." :
            phone.replace(/\D/g, "").length < 8 ? "Add a phone number we can call." :
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Add your email." :
            !(palm instanceof File) || palm.size === 0 ? "Add a photo of your right palm." :
            !/^image\/(jpeg|png|webp)$/.test(palm.type) ? "The palm photo should be a JPG, PNG or WebP image." :
            palm.size > MAX_PALM_BYTES ? "That photo is too large — please choose one under 6 MB." : null;
        if (problem || !expert || !(palm instanceof File)) return NextResponse.json({ success: false, message: problem }, { status: 400 });

        const bytes = Buffer.from(await palm.arrayBuffer());
        const c: Omit<Consultation, "palm"> = {
            id: newConsultationId(), created_at: new Date().toISOString(), kind, expert: expert.slug, expertName: expert.name,
            name, dob, birthPlace, birthTime, phone, email, question,
        };

        // Save first; the emails are a copy (and the owner's has the palm attached).
        let saveError: string | null = null;
        await saveConsultation(c, { bytes, type: palm.type }).catch((e: Error) => { saveError = e.message; console.error("Consultation not saved:", e); });

        const owner = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
        const label = kind === "call" ? `call (₹${CONSULT_PER_MINUTE_INR}/min)` : "appointment";
        if (owner) {
            const t = createTransporter();
            await Promise.all([
                t.sendMail({
                    from: `"KashiGo Consultations" <${owner}>`, to: owner, replyTo: email,
                    subject: `${saveError ? "⚠️ " : ""}Consultation ${c.id}: ${label} with ${expert.name} — ${name}`,
                    text: [
                        `Request: ${c.id} (${label})`, `Expert: ${expert.name}`, `Name: ${name}`,
                        `Date of birth: ${dob}`, `Time of birth: ${birthTime || "not known"}`, `Place of birth: ${birthPlace}`,
                        `Phone: ${phone}`, `Email: ${email}`, ...(question ? [`Question: ${question}`] : []),
                        ...(saveError ? [``, `NOT SAVED to Supabase (${saveError}) — this email is the only copy.`] : [``, `Saved — see /admin → Consultancy.`]),
                    ].join("\n"),
                    attachments: [{ filename: `${c.id}-right-palm.${palm.type.split("/")[1].replace("jpeg", "jpg")}`, content: bytes, contentType: palm.type }],
                }).catch((e) => console.error("Consultation owner mail failed:", e)),
                t.sendMail({
                    from: `"KashiGo" <${owner}>`, to: email,
                    subject: `We've received your request — ${expert.name}`,
                    html: simpleEmail({
                        preheader: `We'll call you on ${phone} to fix a time.`,
                        heading: `Thank you, ${name.split(" ")[0]}`,
                        paragraphs: [
                            `We've received your request for ${kind === "call" ? "a call" : "an appointment"} with <b>${expert.name}</b> (reference ${c.id}).`,
                            `We'll call you on <b>${phone.replace(/[<>&]/g, "")}</b> to fix a time.${kind === "call" ? ` Calls are charged ₹${CONSULT_PER_MINUTE_INR} per minute — and you pay only if satisfied.` : " You pay only if satisfied."}`,
                            `Need us sooner? Call or WhatsApp <a href="tel:+918175966910">+91 81759 66910</a>.`,
                        ],
                    }),
                }).catch((e) => console.error("Consultation customer mail failed:", e)),
            ]);
        }
        if (saveError && !owner) return NextResponse.json({ success: false, message: "We couldn't save your request — please call +91 81759 66910." }, { status: 500 });
        return NextResponse.json({ success: true, id: c.id });
    } catch (e) {
        console.error("Consultation error:", e);
        return NextResponse.json({ success: false, message: "Something went wrong — please try again or call +91 81759 66910." }, { status: 500 });
    }
}

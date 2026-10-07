import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createTransporter, simpleEmail } from "@/lib/mailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
    }

    if (!name || name.trim().length < 1) {
      return NextResponse.json({ message: "Name is required." }, { status: 400 });
    }

    const { error } = await supabase
      .from("email_leads")
      .insert([{ name: name.trim(), email: email.trim(), created_at: new Date().toISOString() }]);

    if (error && !error.message.includes("duplicate")) {
      console.error("Email leads Supabase error:", error);
      return NextResponse.json({ message: "Could not save. Please try again." }, { status: 500 });
    }

    // Deliver the free cheat sheet right away (Email 1 of the welcome sequence).
    // Best-effort: a mail failure must not lose the lead.
    try {
      const first = name.trim().split(" ")[0];
      await createTransporter().sendMail({
        from: `"Vaibhav from KashiGo" <${process.env.SMTP_USER}>`,
        to: email.trim(),
        replyTo: process.env.SMTP_USER,
        subject: "Your Varanasi scam cheat sheet (open before you land)",
        html: simpleEmail({
          preheader: "The 9 that get almost every first-timer — and the one-line move for each.",
          heading: `Here's your cheat sheet, ${first}`,
          paragraphs: [
            "Good instinct getting this before your trip. I grew up in the lanes of Varanasi, and I've watched travellers lose their whole first morning — and a few thousand rupees — to scams that all run on the same trick: you not knowing the real price yet.",
            "If you read one thing today, make it scam #1. The boat quote you'll get at the ghat is a test. A private sunrise boat for 2–4 people is about ₹800–1,500 an hour — agree the <b>total</b> and the <b>duration</b> before you step in.",
            "Planning more of India? Everything else I've written — ebooks and an audio walking tour of the ghats — is at <a href=\"https://kashigo.in/shop\" style=\"color:#f97316;\">kashigo.in/shop</a>. Use code <b>INSIDER20</b> for 20% off as a thank-you for joining.",
          ],
          links: [{ label: "Download the Varanasi Scam Cheat Sheet (PDF)", url: "https://kashigo.in/Varanasi-Scam-Cheat-Sheet.pdf" }],
        }),
      });
    } catch (mailErr) {
      console.error("Cheat sheet email failed:", mailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email leads route error:", err);
    return NextResponse.json({ message: "Unexpected error." }, { status: 500 });
  }
}

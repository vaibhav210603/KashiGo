import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
    }

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert([{ email, subscribed_at: new Date().toISOString() }]);

    // Treat duplicate email as success so we don't leak whether an email exists
    if (error && !error.message.includes("duplicate")) {
      console.error("Newsletter Supabase error:", error);
      return NextResponse.json({ message: "Could not save subscription." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Newsletter route error:", err);
    return NextResponse.json({ message: "Unexpected error." }, { status: 500 });
  }
}

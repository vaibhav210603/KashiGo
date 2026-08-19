import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email leads route error:", err);
    return NextResponse.json({ message: "Unexpected error." }, { status: 500 });
  }
}

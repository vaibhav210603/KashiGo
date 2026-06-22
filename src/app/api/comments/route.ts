import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function GET() {
  const { data, error } = await supabase
    .from("comments")
    .select("id, name, location, message, rating, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function POST(req: Request) {
  try {
    const { name, location, message, rating } = await req.json();

    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json({ success: false, message: "Name and message are required." }, { status: 400 });
    }

    const parsedRating = Number(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ success: false, message: "Rating must be between 1 and 5." }, { status: 400 });
    }

    const { error } = await supabase.from("comments").insert([{
      name: name.trim().slice(0, 100),
      location: location?.trim().slice(0, 100) || null,
      message: message.trim().slice(0, 1000),
      rating: parsedRating,
    }]);

    if (error) {
      return NextResponse.json({ success: false, message: "Failed to save comment." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: "Unexpected error." }, { status: 500 });
  }
}

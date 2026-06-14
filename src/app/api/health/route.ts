import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Keep-alive / health endpoint.
// A real query against Postgres resets Supabase's free-tier inactivity timer,
// preventing the project from being paused. Hit this on a schedule (see the
// GitHub Actions workflow at .github/workflows/supabase-keepalive.yml).

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// Never cache — every request must actually touch the database.
export const dynamic = "force-dynamic";

export async function GET() {
  // A lightweight HEAD count touches Postgres without transferring rows.
  // Even if RLS blocks the read, the query still reaches the database,
  // which is all that's needed to keep the project awake.
  const { error } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({
    ok: true,
    db: error ? "reached" : "ok",
    timestamp: new Date().toISOString(),
  });
}

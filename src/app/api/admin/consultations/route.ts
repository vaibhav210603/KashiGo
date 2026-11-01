import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminApi";
import { listConsultations } from "@/lib/consultations";

export const dynamic = "force-dynamic";

// Every consultation request, newest first, with an hour-long link to each palm photo.
export async function GET(req: Request) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    try {
        return NextResponse.json({ requests: await listConsultations() });
    } catch (e) {
        return NextResponse.json({ error: `Couldn't read consultation requests: ${(e as Error).message}` }, { status: 502 });
    }
}

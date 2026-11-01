// Server-only. Consultation requests for the gurus and experts (/consult): saved in a private Supabase
// Storage bucket — the details as JSON and the right-palm photo next to it — so no database migration is
// needed. The owner also gets an email with the palm attached, so nothing is lost if Supabase is down.
import crypto from "crypto";
import { hasServiceRole, supabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET = "consultations";

export type Consultation = {
    id: string;
    created_at: string;
    kind: "call" | "appointment";
    expert: string;       // slug from lib/experts
    expertName: string;
    name: string;
    dob: string;          // YYYY-MM-DD
    birthPlace: string;
    birthTime: string;    // HH:MM, or "" if not known
    phone: string;
    email: string;
    question: string;
    palm: string;         // object path in the bucket
};

let bucketReady = false;
async function ensureBucket() {
    if (bucketReady) return;
    const db = supabaseAdmin();
    const { error } = await db.storage.getBucket(BUCKET);
    if (error) {
        const made = await db.storage.createBucket(BUCKET, { public: false, fileSizeLimit: "8MB" });
        if (made.error && !/already exists/i.test(made.error.message)) throw new Error(`Couldn't create the ${BUCKET} storage bucket: ${made.error.message}`);
    }
    bucketReady = true;
}

export const newConsultationId = () => `CN-${crypto.randomInt(0, 1_000_000).toString().padStart(6, "0")}`;

// Saves the request and its palm photo. Request files are named by time so the newest sort first.
export async function saveConsultation(c: Omit<Consultation, "palm">, palm: { bytes: Buffer; type: string }): Promise<Consultation> {
    if (!hasServiceRole()) throw new Error("Storage isn't configured (SUPABASE_SERVICE_ROLE_KEY).");
    await ensureBucket();
    const db = supabaseAdmin().storage.from(BUCKET);
    const stamp = String(9_999_999_999_999 - Date.parse(c.created_at)).padStart(13, "0"); // reverse time: newest first in listings
    const ext = palm.type === "image/png" ? "png" : palm.type === "image/webp" ? "webp" : "jpg";
    const record: Consultation = { ...c, palm: `palms/${c.id}.${ext}` };
    const up = await db.upload(record.palm, palm.bytes, { contentType: palm.type, upsert: false });
    if (up.error) throw new Error(`Palm photo upload failed: ${up.error.message}`);
    const saved = await db.upload(`requests/${stamp}-${c.id}.json`, Buffer.from(JSON.stringify(record, null, 2)), { contentType: "application/json", upsert: false });
    if (saved.error) throw new Error(`Saving the request failed: ${saved.error.message}`);
    return record;
}

// Newest first, each with a short-lived link to its palm photo.
export async function listConsultations(limit = 200): Promise<(Consultation & { palmUrl: string | null })[]> {
    if (!hasServiceRole()) throw new Error("Storage isn't configured (SUPABASE_SERVICE_ROLE_KEY).");
    await ensureBucket();
    const db = supabaseAdmin().storage.from(BUCKET);
    const { data: files, error } = await db.list("requests", { limit, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(error.message);
    const records = await Promise.all((files ?? []).filter((f) => f.name.endsWith(".json")).map(async (f) => {
        const { data } = await db.download(`requests/${f.name}`);
        if (!data) return null;
        try { return JSON.parse(await data.text()) as Consultation; } catch { return null; }
    }));
    const ok = records.filter((r): r is Consultation => r !== null);
    const signed = ok.length ? await db.createSignedUrls(ok.map((r) => r.palm), 60 * 60) : { data: [] as { signedUrl: string }[] };
    return ok.map((r, i) => ({ ...r, palmUrl: signed.data?.[i]?.signedUrl ?? null }));
}

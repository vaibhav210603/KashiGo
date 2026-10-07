// Best-effort in-memory rate limiter (per server instance). Good enough to stop
// casual abuse of public form endpoints that send email or write to the DB.

const buckets = new Map<string, number[]>();

export function rateLimited(req: Request, key: string, max: number, windowMs: number): boolean {
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
    const id = `${key}:${ip}`;
    const now = Date.now();
    const hits = (buckets.get(id) || []).filter((t) => now - t < windowMs);
    hits.push(now);
    buckets.set(id, hits);
    if (buckets.size > 5000) buckets.clear();
    return hits.length > max;
}

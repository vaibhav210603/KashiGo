import { NextResponse } from "next/server";
import { getAmountUSD } from "@/lib/pricing";
import { rateLimited } from "@/lib/rateLimit";

// Validates a discount code server-side so codes never ship in the client bundle.
export async function POST(req: Request) {
    if (rateLimited(req, "coupon", 20, 10 * 60 * 1000)) {
        return NextResponse.json({ valid: false, message: "Too many attempts. Try again later." }, { status: 429 });
    }
    try {
        const { product, code } = await req.json();
        const base = getAmountUSD(String(product));
        const discounted = getAmountUSD(String(product), String(code || ""));
        if (base === null || discounted === null || !code || discounted >= base) {
            return NextResponse.json({ valid: false });
        }
        return NextResponse.json({ valid: true, rate: Number((1 - discounted / base).toFixed(2)) });
    } catch {
        return NextResponse.json({ valid: false }, { status: 400 });
    }
}

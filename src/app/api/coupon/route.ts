import { NextResponse } from "next/server";
import { rateLimited } from "@/lib/rateLimit";
import { getSession } from "@/lib/auth";
import { quote } from "@/lib/coupons";

// Checks a discount code for the logged-in customer, server-side, so codes never ship in the client bundle.
export async function POST(req: Request) {
    if (rateLimited(req, "coupon", 20, 10 * 60 * 1000)) {
        return NextResponse.json({ valid: false, message: "Too many attempts. Try again later." }, { status: 429 });
    }
    try {
        const { product, code } = await req.json();
        if (!code) return NextResponse.json({ valid: false });
        const session = await getSession(req);
        if (!session) return NextResponse.json({ valid: false, needsLogin: true, message: "Log in to use a code." }, { status: 401 });
        const q = await quote(String(product), String(code), session.email);
        if (!q.ok) return NextResponse.json({ valid: false, message: q.message });
        return NextResponse.json({ valid: true, rate: Number((1 - q.price.inr / q.base.inr).toFixed(2)), inr: q.price.inr, usd: q.price.usd });
    } catch {
        return NextResponse.json({ valid: false }, { status: 400 });
    }
}

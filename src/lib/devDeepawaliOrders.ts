// Server-only. Dev Deepawali shared-boat bookings paid through Razorpay (in full, or a 50% advance).
// Each booking is its own Razorpay order (receipt "dd_<booking id>"), priced here from today's India date —
// the browser's amount is never used. Razorpay is the source of truth for the admin list.
import crypto from "crypto";
import { razorpay } from "@/lib/quotePayments";
import { istNow } from "@/lib/boatRides";
import { DD_MAX_PEOPLE, DEV_DEEPAWALI_DATE, ddSplit, ddTotal, seatPriceOn, type DdPay } from "@/lib/devDeepawali";
import type { OrderRecord } from "@/lib/orderMail";

const clean = (v: unknown, max: number) => String(v ?? "").replace(/[\u0000-\u001f\u007f<>|]/g, "").trim().slice(0, max);

export type DdBooking = {
    id: string; name: string; phone: string; email: string; people: number; passengers: string[];
    pay: DdPay; perInr: number; totalInr: number; onlineInr: number; dueInr: number;
};

// The booking as the customer filled it in, cleaned and priced. A list of problems if it can't be booked.
export function priceBooking(body: any): { booking: DdBooking } | { problem: string } {
    const today = istNow().iso;
    if (today > DEV_DEEPAWALI_DATE) return { problem: "Bookings for Dev Deepawali 2026 have closed." };
    const name = clean(body?.name, 80);
    const phone = clean(body?.phone, 20);
    const email = clean(body?.email, 120).toLowerCase();
    const people = Math.trunc(Number(body?.people));
    const passengers = (Array.isArray(body?.passengers) ? body.passengers : []).map((p: unknown) => clean(p, 60)).slice(0, DD_MAX_PEOPLE - 1);
    const pay: DdPay = "full"; // 100% online payment only — no 50% advance
    if (name.length < 2) return { problem: "Add the lead passenger's name." };
    if (phone.replace(/\D/g, "").length < 8) return { problem: "Add a phone number so we can call you with your boarding details." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { problem: "Add your email — your confirmation goes there." };
    if (!(people >= 1 && people <= DD_MAX_PEOPLE)) return { problem: `Seats can be booked for 1 to ${DD_MAX_PEOPLE} people at a time.` };
    if (passengers.length !== people - 1 || passengers.some((p: string) => !p)) return { problem: "Add a name for every passenger." };
    const perInr = seatPriceOn(today);
    const totalInr = ddTotal(perInr, people); // seat packs: every 3 seats at the Trio price
    const { online, atGhat } = ddSplit(totalInr, pay);
    const id = `DD-${crypto.randomInt(0, 1_000_000).toString().padStart(6, "0")}`;
    return { booking: { id, name, phone, email, people, passengers, pay, perInr, totalInr, onlineInr: online, dueInr: atGhat } };
}

export const ddReceipt = (id: string) => `dd_${id}`;

export async function createDdOrder(b: DdBooking) {
    return razorpay().orders.create({
        amount: b.onlineInr * 100,
        currency: "INR",
        receipt: ddReceipt(b.id),
        notes: {
            kind: "dev-deepawali", booking: b.id, name: b.name, phone: b.phone, email: b.email,
            people: String(b.people), passengers: b.passengers.join(", ").slice(0, 250),
            pay: b.pay, per: String(b.perInr), total: String(b.totalInr), due: String(b.dueInr),
        },
    });
}

// A paid Dev Deepawali order, in the shape the admin list and the order emails use.
export function ddRecord(order: any, payment: any): OrderRecord {
    const n = order?.notes ?? {};
    const due = Number(n.due) || 0;
    const passengers = [n.name, ...String(n.passengers ?? "").split(",").map((s: string) => s.trim()).filter(Boolean)];
    return {
        v: 1,
        kind: "boat",
        key: String(n.booking),
        created_at: new Date(Number(payment?.created_at ?? order?.created_at ?? Date.now() / 1000) * 1000).toISOString(),
        product: "dev-deepawali",
        name: String(n.name ?? ""),
        customer_email: String(n.email || payment?.email || "").toLowerCase() || null,
        phone: String(n.phone || payment?.contact || ""),
        email: String(n.email || payment?.email || ""),
        payment_mode: due ? "cod" : "online_domestic",
        payment_status: due ? "advance" : "paid",
        payment_ref: String(payment?.id ?? ""),
        amount: Number(payment?.amount ?? order?.amount ?? 0) / 100,
        credits_used: 0,
        coupon: null,
        notes: [`Dev Deepawali shared boat · ${n.people} seat${n.people === "1" ? "" : "s"} · ₹${Number(n.total).toLocaleString("en-IN")} (seat ₹${Number(n.per).toLocaleString("en-IN")})`, `Passengers: ${passengers.join(", ")}`, due ? `Collect ₹${due.toLocaleString("en-IN")} at the ghat` : "Paid in full", "Boarding ghat & time: call to confirm"].join(" · "),
        ghat: "To be confirmed on call",
        ride_date: DEV_DEEPAWALI_DATE,
        time_of_day: "Evening, Dev Deepawali",
        guests: Number(n.people) || passengers.length,
    };
}

export type DdAdminRow = OrderRecord & { passengers: string[]; perInr: number; totalInr: number; dueInr: number; pay: DdPay };

// Every paid Dev Deepawali booking, newest first, straight from Razorpay.
export async function listDdBookings(): Promise<DdAdminRow[]> {
    if (!process.env.RAZORPAY_KEY_SECRET) return [];
    const rz = razorpay();
    const paid: any[] = [];
    for (let skip = 0; skip < 1000; skip += 100) {
        const page: any = await rz.orders.all({ count: 100, skip } as any);
        const items: any[] = page?.items ?? [];
        paid.push(...items.filter((o) => o.status === "paid" && String(o.receipt ?? "").startsWith("dd_")));
        if (items.length < 100) break;
    }
    const rows = await Promise.all(paid.map(async (o) => {
        const pays: any = await rz.orders.fetchPayments(o.id);
        const p = (pays?.items ?? []).find((x: any) => x.status === "captured") ?? (pays?.items ?? [])[0];
        const n = o.notes ?? {};
        return {
            ...ddRecord(o, p),
            passengers: [n.name, ...String(n.passengers ?? "").split(",").map((s: string) => s.trim()).filter(Boolean)],
            perInr: Number(n.per) || 0, totalInr: Number(n.total) || 0, dueInr: Number(n.due) || 0, pay: (n.pay === "advance" ? "advance" : "full") as DdPay,
        };
    }));
    return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

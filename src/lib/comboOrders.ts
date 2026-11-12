// Server-only. Ride + consultation bookings (/ride-and-consult), paid in full through Razorpay.
// Each booking is its own Razorpay order (receipt "combo_<booking id>"), priced here with comboPrice() —
// the browser's amount is never used. Razorpay is the source of truth for the admin list.
import crypto from "crypto";
import { razorpay } from "@/lib/quotePayments";
import { BOAT_RIDES, BOOKING_WINDOW_DAYS, GHATS, addDaysIso, bookingTimeProblem, istNow, noticeFor, rideStartMinutes, toMinutes, type BoatRideId } from "@/lib/boatRides";
import { CONCERNS, CONSULT_ONLY_MINUTES, MEET_DAYS, MEET_LEAD_MINUTES, MEET_SLOTS, comboPrice, slotLabel, type ComboPlan } from "@/lib/combo";
import { EXPERTS } from "@/lib/experts";
import type { OrderRecord } from "@/lib/orderMail";

const clean = (v: unknown, max: number) => String(v ?? "").replace(/[\u0000-\u001f\u007f<>|]/g, "").trim().slice(0, max);
export const MAX_COMBO_GUESTS = 12;

export type ComboBooking = {
    id: string; plan: ComboPlan; name: string; phone: string; email: string;
    rideId: BoatRideId | ""; rideDate: string; guests: number; ghat: string;
    expert: string; expertName: string; minutes: number; meetDate: string; meetTime: string; concerns: string[];
    dob: string; birthTime: string; birthPlace: string;
    boatInr: number; noticeInr: number; guestInr: number; consultInr: number; totalInr: number;
};

// The booking as the customer filled it in, cleaned and priced — or what's missing.
export function priceCombo(body: any): { booking: ComboBooking } | { problem: string } {
    const now = istNow();
    const plan: ComboPlan = body?.plan === "consult" ? "consult" : "combo";
    const name = clean(body?.name, 80);
    const phone = clean(body?.phone, 20);
    const email = clean(body?.email, 120).toLowerCase();
    const expert = EXPERTS.find((e) => e.slug === clean(body?.expert, 60));
    const minutes = plan === "consult" ? CONSULT_ONLY_MINUTES : Number(body?.minutes) === 45 ? 45 : 30;
    const concerns = (Array.isArray(body?.concerns) ? body.concerns : []).map((c: unknown) => clean(c, 60)).filter((c: string) => (CONCERNS as readonly string[]).includes(c));
    const meetDate = clean(body?.meetDate, 10);
    const meetTime = clean(body?.meetTime, 5);
    const dob = clean(body?.dob, 10);
    const birthTime = clean(body?.birthTime, 5);
    const birthPlace = clean(body?.birthPlace, 120);

    let rideId: BoatRideId | "" = "";
    let rideDate = "", ghat = "", guests = 0, noticePct = 0;
    if (plan === "combo") {
        const ride = BOAT_RIDES.find((r) => r.id === body?.rideId);
        if (!ride) return { problem: "Choose your boat ride." };
        rideId = ride.id;
        rideDate = clean(body?.rideDate, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(rideDate) || rideDate > addDaysIso(now.iso, BOOKING_WINDOW_DAYS - 1)) return { problem: "Choose the date of your boat ride." };
        const timeProblem = bookingTimeProblem(rideDate, rideStartMinutes(rideId), now);
        if (timeProblem) return { problem: timeProblem };
        guests = Math.trunc(Number(body?.guests));
        if (!(guests >= 1 && guests <= MAX_COMBO_GUESTS)) return { problem: `A boat takes 1 to ${MAX_COMBO_GUESTS} passengers.` };
        ghat = clean(body?.ghat, 60);
        if (!GHATS.includes(ghat)) return { problem: "Choose the ghat you'll start from." };
        noticePct = noticeFor(rideDate, rideStartMinutes(rideId), now).pct;
    }

    if (!expert) return { problem: "Choose the guru you'd like to talk to." };
    if (!concerns.length) return { problem: "Pick at least one thing you'd like to ask about." };
    const lastMeetDay = addDaysIso(now.iso, MEET_DAYS - 1);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(meetDate) || meetDate < now.iso || meetDate > lastMeetDay || !(MEET_SLOTS as readonly string[]).includes(meetTime)) return { problem: "Choose a date and time for your Google Meet." };
    if (meetDate === now.iso && toMinutes(meetTime) < now.minutes + MEET_LEAD_MINUTES) return { problem: "That Meet slot is too soon — please pick a later time." };
    if (name.length < 2) return { problem: "Add your full name." };
    if (phone.replace(/\D/g, "").length < 8) return { problem: "Add a phone number we can call." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { problem: "Add your email — your Meet link goes there." };
    if (dob && (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || dob > now.iso)) return { problem: "Check your date of birth, or leave it empty." };
    if (birthTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(birthTime)) return { problem: "Check your time of birth, or leave it empty." };

    const q = comboPrice({ plan, rideId, guests, noticePct, minutes });
    const id = `KC-${crypto.randomInt(0, 1_000_000).toString().padStart(6, "0")}`;
    return { booking: { id, plan, name, phone, email, rideId, rideDate, guests, ghat, expert: expert.slug, expertName: expert.name, minutes, meetDate, meetTime, concerns, dob, birthTime, birthPlace, ...q } };
}

export const comboReceipt = (id: string) => `combo_${id}`;

export async function createComboOrder(b: ComboBooking) {
    return razorpay().orders.create({
        amount: b.totalInr * 100,
        currency: "INR",
        receipt: comboReceipt(b.id),
        notes: {
            kind: "ride-consult", booking: b.id, plan: b.plan, name: b.name, phone: b.phone, email: b.email,
            ride: b.plan === "combo" ? [b.rideId, b.rideDate, b.guests, b.ghat].join("|") : "",
            meet: [b.expert, b.minutes, b.meetDate, b.meetTime].join("|"),
            topics: b.concerns.join(", ").slice(0, 250),
            birth: [b.dob, b.birthTime, b.birthPlace].join("|").slice(0, 250),
            prices: [b.boatInr, b.noticeInr, b.guestInr, b.consultInr].join("|"),
            total: String(b.totalInr),
        },
    });
}

// The order's notes, read back into named fields.
export function comboNotes(order: any) {
    const n = order?.notes ?? {};
    const [rideId = "", rideDate = "", guests = "0", ghat = ""] = String(n.ride ?? "").split("|");
    const [expert = "", minutes = "0", meetDate = "", meetTime = ""] = String(n.meet ?? "").split("|");
    const [dob = "", birthTime = "", birthPlace = ""] = String(n.birth ?? "").split("|");
    const [boatInr = 0, noticeInr = 0, guestInr = 0, consultInr = 0] = String(n.prices ?? "").split("|").map(Number);
    const ride = BOAT_RIDES.find((r) => r.id === rideId);
    return {
        booking: String(n.booking ?? ""), plan: (n.plan === "consult" ? "consult" : "combo") as ComboPlan,
        name: String(n.name ?? ""), phone: String(n.phone ?? ""), email: String(n.email ?? ""),
        rideId, rideName: ride?.name ?? "", rideTime: ride?.time ?? "", rideDate, guests: Number(guests) || 0, ghat,
        expert, expertName: EXPERTS.find((e) => e.slug === expert)?.name ?? expert, minutes: Number(minutes) || 0, meetDate, meetTime,
        meetLabel: meetTime ? slotLabel(meetTime) : "",
        concerns: String(n.topics ?? "").split(",").map((s) => s.trim()).filter(Boolean),
        dob, birthTime, birthPlace, boatInr, noticeInr, guestInr, consultInr, totalInr: Number(n.total) || 0,
    };
}

// A paid combo, in the shape the Orders list and the order emails use (the boat ride part; null for a session alone).
export function comboRideRecord(order: any, payment: any): OrderRecord | null {
    const c = comboNotes(order);
    if (c.plan !== "combo") return null;
    return {
        v: 1,
        kind: "boat",
        key: c.booking,
        created_at: new Date(Number(payment?.created_at ?? order?.created_at ?? Date.now() / 1000) * 1000).toISOString(),
        product: c.rideId,
        name: c.name,
        customer_email: (c.email || payment?.email || "").toLowerCase() || null,
        phone: c.phone || String(payment?.contact ?? ""),
        email: c.email || String(payment?.email ?? ""),
        payment_mode: "online_domestic",
        payment_status: "paid",
        payment_ref: String(payment?.id ?? ""),
        amount: Number(payment?.amount ?? order?.amount ?? 0) / 100,
        credits_used: 0,
        coupon: null,
        notes: `Ride + consultation combo · ${c.minutes}-min Google Meet with ${c.expertName} on ${c.meetDate} at ${c.meetLabel} · ${c.concerns.join(", ")}`,
        ghat: c.ghat,
        ride_date: c.rideDate,
        time_of_day: c.rideTime,
        guests: c.guests,
    };
}

export type ComboAdminRow = ReturnType<typeof comboNotes> & { created_at: string; amount: number; payment_ref: string };

// Every paid ride + consultation booking, newest first, straight from Razorpay.
export async function listComboBookings(): Promise<ComboAdminRow[]> {
    if (!process.env.RAZORPAY_KEY_SECRET) return [];
    const rz = razorpay();
    const paid: any[] = [];
    for (let skip = 0; skip < 1000; skip += 100) {
        const page: any = await rz.orders.all({ count: 100, skip } as any);
        const items: any[] = page?.items ?? [];
        paid.push(...items.filter((o) => o.status === "paid" && String(o.receipt ?? "").startsWith("combo_")));
        if (items.length < 100) break;
    }
    const rows = await Promise.all(paid.map(async (o) => {
        const pays: any = await rz.orders.fetchPayments(o.id);
        const p = (pays?.items ?? []).find((x: any) => x.status === "captured") ?? (pays?.items ?? [])[0];
        return {
            ...comboNotes(o),
            created_at: new Date(Number(p?.created_at ?? o.created_at) * 1000).toISOString(),
            amount: Number(p?.amount ?? o.amount) / 100,
            payment_ref: String(p?.id ?? ""),
        };
    }));
    return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

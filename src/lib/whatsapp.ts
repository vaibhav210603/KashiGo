// Server-only: sends messages from the KashiGo leads bot through the WhatsApp Cloud API (Meta).
// Env: WHATSAPP_TOKEN (permanent system-user token), WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_APP_SECRET (verifies webhooks),
// WHATSAPP_VERIFY_TOKEN (any string, also typed into Meta's webhook setup), WHATSAPP_ALLOWED_NUMBERS (team phones).
import crypto from "crypto";

const GRAPH = "https://graph.facebook.com/v21.0";

export const whatsappConfigured = () => Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

// Only the team's own phones may use the bot. "919876543210, +91 81759 66910" → digit strings.
export function isTeamNumber(waId: string): boolean {
    const allowed = (process.env.WHATSAPP_ALLOWED_NUMBERS || "").split(/[,\s]+/).map((n) => n.replace(/\D/g, "")).filter(Boolean)
        .map((n) => (n.length === 10 ? `91${n}` : n));
    return allowed.includes(waId.replace(/\D/g, ""));
}

// Meta signs each webhook body with the app secret. Without a secret configured we can't check, so we refuse.
export function validSignature(rawBody: string, header: string | null): boolean {
    const secret = process.env.WHATSAPP_APP_SECRET;
    if (!secret || !header?.startsWith("sha256=")) return false;
    const want = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const got = header.slice(7);
    return got.length === want.length && crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want));
}

async function send(payload: Record<string, unknown>): Promise<string | null> {
    const res = await fetch(`${GRAPH}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { console.error("WhatsApp send failed:", res.status, JSON.stringify(data)); return null; }
    return data?.messages?.[0]?.id ?? null;
}

export const sendText = (to: string, body: string) =>
    send({ to, type: "text", text: { body: body.slice(0, 4096), preview_url: false } });

export type ListRow = { id: string; title: string; description?: string };
// A message with a "choose" button that opens a list of up to 10 options.
export const sendList = (to: string, body: string, button: string, rows: ListRow[]) =>
    send({
        to, type: "interactive",
        interactive: {
            type: "list",
            body: { text: body.slice(0, 1024) },
            action: {
                button: button.slice(0, 20),
                sections: [{ title: "Options", rows: rows.slice(0, 10).map((r) => ({ id: r.id.slice(0, 200), title: r.title.slice(0, 24), ...(r.description ? { description: r.description.slice(0, 72) } : {}) })) }],
            },
        },
    });

export const markRead = (messageId: string) => send({ status: "read", message_id: messageId });

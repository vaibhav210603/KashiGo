// The KashiGo leads bot. The team forwards / types enquiries to the bot's WhatsApp number; each one lands in
// /admin → Leads. Setup steps: docs/whatsapp-leads-bot.md.
//
// What a worker can send:
//   • any text with a phone number      → new lead ("Rahul 98765 43210 evening aarti 4 people 20 Dec, called")
//   • a shared contact card             → new lead
//   • a reply to a lead message         → "booked" / "quoted 4500" / "msg" / any note
//   • "23 booked", "23 note …", "23 msg", "23 date 20 dec", "23 pax 4", "23 ₹4500"
//   • "list" (today's summary), "find rahul", "help"
import { NextResponse } from "next/server";
import { addLead, getLead, leadForBotMessage, linkBotMessage, listLeads, updateLead } from "@/lib/leads";
import {
    clientMessage, dateLabel, findDate, leadLine, MESSAGE_LABEL, MESSAGES_FOR, parseLeadText, STATUS_LABEL, STATUSES,
    statusFromWord, todayIST, waLink, type Lead, type MessageKey, type MsgLang,
} from "@/lib/leadsShared";
import { isTeamNumber, markRead, sendList, sendText, validSignature, whatsappConfigured } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Meta's one-time webhook check.
export async function GET(req: Request) {
    const p = new URL(req.url).searchParams;
    const want = process.env.WHATSAPP_VERIFY_TOKEN;
    if (want && p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === want) return new Response(p.get("hub.challenge") ?? "", { status: 200 });
    return new Response("Forbidden", { status: 403 });
}

const seen = new Set<string>(); // Meta retries deliveries; the same message is handled once per instance.

/* eslint-disable @typescript-eslint/no-explicit-any -- webhook JSON from Meta */
export async function POST(req: Request) {
    const raw = await req.text();
    if (!validSignature(raw, req.headers.get("x-hub-signature-256"))) return new Response("Bad signature", { status: 401 });
    if (!whatsappConfigured()) return NextResponse.json({ ok: true });
    let body: any;
    try { body = JSON.parse(raw); } catch { return NextResponse.json({ ok: true }); }

    for (const entry of body?.entry ?? []) {
        for (const change of entry?.changes ?? []) {
            const v = change?.value;
            const names = new Map<string, string>((v?.contacts ?? []).map((c: any) => [c.wa_id, c.profile?.name ?? ""]));
            for (const msg of v?.messages ?? []) {
                if (!msg?.id || seen.has(msg.id)) continue;
                seen.add(msg.id);
                if (seen.size > 2000) seen.clear();
                const from = String(msg.from ?? "");
                if (!isTeamNumber(from)) continue; // strangers get no reply at all
                const by = names.get(from) || `+${from}`;
                try {
                    await markRead(msg.id);
                    await handle(msg, from, by);
                } catch (e) {
                    console.error("Leads bot error:", e);
                    const m = (e as Error).message || "";
                    await sendText(from, `⚠️ Couldn't save that: ${m}${/leads|schema cache|does not exist/i.test(m) ? "\n(Run supabase/leads.sql in Supabase first.)" : ""}`);
                }
            }
        }
    }
    // Always 200 so Meta doesn't keep retrying.
    return NextResponse.json({ ok: true });
}

async function handle(msg: any, from: string, by: string) {
    if (msg.type === "interactive") {
        const id = msg.interactive?.list_reply?.id ?? msg.interactive?.button_reply?.id ?? "";
        return onChoice(id, from, by);
    }
    if (msg.type === "contacts") {
        for (const c of msg.contacts ?? []) {
            const phone = c.phones?.[0]?.wa_id ? `+${c.phones[0].wa_id}` : c.phones?.[0]?.phone;
            const name = c.name?.formatted_name || c.name?.first_name || "";
            if (!phone) { await sendText(from, `That contact (${name || "no name"}) has no phone number.`); continue; }
            const { lead, created } = await addLead({ name, phone, source: "whatsapp" }, by);
            await sendLeadCard(from, lead, created ? "✅ New lead saved" : "🔁 Already a lead — updated");
        }
        return;
    }
    if (msg.type !== "text") return sendText(from, `I can read text and contact cards. Send *help* to see what I can do.`);

    const text = String(msg.text?.body ?? "").trim();
    const lower = text.toLowerCase();

    // A reply to one of the bot's messages about a lead acts on that lead.
    const ctx = msg.context?.id ? await leadForBotMessage(msg.context.id) : null;
    if (ctx) return leadCommand(ctx, text, from, by);

    if (/^(help|hi|hello|hey|menu|start|\?|namaste)$/i.test(lower)) return sendText(from, HELP);
    if (/^(list|today|summary|aaj|pending|status|report|leads)$/i.test(lower)) return sendSummary(from);
    const find = text.match(/^(?:find|search|dhundo)\s+(.+)$/i);
    if (find) return sendFind(from, find[1]);

    const cmd = text.match(/^#?(\d{1,7})(?:\s+([\s\S]+))?$/);
    if (cmd) {
        const lead = await getLead(Number(cmd[1]));
        if (!lead) return sendText(from, `No lead #${cmd[1]}. Send *list* to see open leads.`);
        if (!cmd[2]) return sendLeadCard(from, lead, "📋 Lead");
        return leadCommand(lead, cmd[2].trim(), from, by);
    }

    const draft = parseLeadText(text);
    if (!draft.phone) {
        return sendText(from, `I couldn't find a phone number in that, so nothing was saved.\n\nSend it like:\n_Rahul 98765 43210 evening aarti 4 people 20 Dec_\nor share their contact card. Send *help* for more.`);
    }
    const { lead, created } = await addLead({ source: "whatsapp", ...draft }, by);
    return sendLeadCard(from, lead, created ? "✅ New lead saved" : "🔁 Already a lead — updated");
}

// "booked", "quoted 4500", "msg", "msg hi", "note …", "date 20 dec", "pax 4", "₹4500", or a free note.
async function leadCommand(lead: Lead, text: string, from: string, by: string) {
    const [first, ...restWords] = text.split(/\s+/);
    const rest = restWords.join(" ");
    const word = first.toLowerCase();

    const msgCmd = text.match(/^(msg|message|template|text|sandesh)(?:\s+(hi|hindi|en|english))?$/i);
    if (msgCmd) return sendClientMessage(from, lead, MESSAGES_FOR[lead.status][0], /^hi/i.test(msgCmd[2] ?? "") ? "hi" : "en");

    // Two-word statuses first ("follow up", "not interested", "baat hui").
    const two = statusFromWord(text.split(/\s+/).slice(0, 2).join(" "));
    const status = two ?? statusFromWord(first);
    if (status) {
        const after = two ? text.split(/\s+/).slice(2).join(" ") : rest;
        const amount = Number(after.match(/(?:₹|rs\.?\s*)?([\d,]{3,9})/i)?.[1]?.replace(/,/g, "")) || undefined;
        const note = after.replace(/(?:₹|rs\.?\s*)?[\d,]{3,9}/i, "").trim();
        const updated = await updateLead(lead.id, { status, ...(amount ? { amount_inr: amount } : {}) }, by, note || undefined);
        return sendLeadCard(from, updated, `👍 #${lead.id} → ${STATUS_LABEL[status]}${updated.follow_up_on ? ` · next follow-up ${dateLabel(updated.follow_up_on)}` : ""}`);
    }
    if (/^(date|tarikh)$/i.test(word)) {
        const d = findDate(rest);
        if (!d) return sendText(from, `Didn't understand that date. Try _${lead.id} date 20 Dec_.`);
        return sendLeadCard(from, await updateLead(lead.id, { travel_date: d.date }, by), `📅 Date set to ${dateLabel(d.date, true)}`);
    }
    if (/^(pax|people|log|guests)$/i.test(word) && /^\d+$/.test(rest)) return sendLeadCard(from, await updateLead(lead.id, { pax: Number(rest) }, by), `👥 ${rest} people`);
    const amt = text.match(/^(?:₹|rs\.?|amount|price|quote)\s*([\d,]{2,9})$/i);
    if (amt) return sendLeadCard(from, await updateLead(lead.id, { amount_inr: Number(amt[1].replace(/,/g, "")) }, by), `💰 Amount saved`);
    if (/^(name|naam)$/i.test(word) && rest) return sendLeadCard(from, await updateLead(lead.id, { name: rest }, by), `✏️ Name saved`);
    if (/^(ride|interest|for)$/i.test(word) && rest) return sendLeadCard(from, await updateLead(lead.id, { interest: rest }, by), `✏️ Interest saved`);

    const note = /^note$/i.test(word) ? rest : text;
    await updateLead(lead.id, {}, by, note);
    const id = await sendText(from, `📝 Note added to #${lead.id} ${lead.name}`);
    if (id) await linkBotMessage(lead.id, id);
}

async function onChoice(id: string, from: string, by: string) {
    const [kind, idStr, arg] = id.split(":");
    const lead = await getLead(Number(idStr));
    if (!lead) return sendText(from, `That lead no longer exists.`);
    if (kind === "s" && STATUSES.includes(arg as never)) {
        const status = arg as Lead["status"];
        const updated = await updateLead(lead.id, { status }, by);
        return sendLeadCard(from, updated, `👍 #${lead.id} → ${STATUS_LABEL[status]}${updated.follow_up_on ? ` · next follow-up ${dateLabel(updated.follow_up_on)}` : ""}`);
    }
    if (kind === "m") {
        const [key, lang] = (arg || "").split("|") as [MessageKey, MsgLang];
        return sendClientMessage(from, lead, key in MESSAGE_LABEL ? key : MESSAGES_FOR[lead.status][0], lang === "hi" ? "hi" : "en");
    }
}

// The message for the client on its own (so it can be forwarded as-is), then a link that opens their chat with it typed.
async function sendClientMessage(from: string, lead: Lead, key: MessageKey, lang: MsgLang) {
    const text = clientMessage(key, lead, lang);
    await sendText(from, `👇 ${MESSAGE_LABEL[key]} for ${lead.name || `#${lead.id}`} — forward the next message, or tap the link to send it from your own WhatsApp.`);
    await sendText(from, text);
    if (lead.phone) {
        const id = await sendText(from, `Open ${lead.name || "their"} chat with this typed:\n${waLink(lead.phone, text)}`);
        if (id) await linkBotMessage(lead.id, id);
    }
}

async function sendLeadCard(from: string, lead: Lead, heading: string) {
    const lines = [
        heading,
        "",
        `*#${lead.id} ${lead.name || "(no name)"}*`,
        lead.phone ? `📞 ${lead.phone}` : null,
        lead.interest ? `🛶 ${lead.interest}` : null,
        lead.travel_date ? `📅 ${dateLabel(lead.travel_date, true)}` : null,
        lead.pax ? `👥 ${lead.pax} people` : null,
        lead.amount_inr ? `💰 ₹${lead.amount_inr.toLocaleString("en-IN")}` : null,
        `Status: *${STATUS_LABEL[lead.status]}*`,
        "",
        `Tap *Update* to change status or get a message for the client. Or just reply to this with a note.`,
    ].filter((l): l is string => l !== null);
    const rows = [
        ...STATUSES.filter((s) => s !== lead.status && s !== "new").map((s) => ({ id: `s:${lead.id}:${s}`, title: `→ ${STATUS_LABEL[s]}` })),
        ...MESSAGES_FOR[lead.status].slice(0, 2).map((k) => ({ id: `m:${lead.id}:${k}|en`, title: `💬 ${MESSAGE_LABEL[k]}`, description: "Ready-to-send message (English)" })),
        { id: `m:${lead.id}:${MESSAGES_FOR[lead.status][0]}|hi`, title: `💬 हिंदी मैसेज`, description: `${MESSAGE_LABEL[MESSAGES_FOR[lead.status][0]]} in Hindi` },
    ];
    const id = await sendList(from, lines.join("\n"), "Update", rows);
    if (id) await linkBotMessage(lead.id, id);
}

async function sendSummary(from: string) {
    const all = await listLeads(1000);
    const today = todayIST();
    const isToday = (iso: string) => new Date(new Date(iso).getTime() + 5.5 * 3600_000).toISOString().slice(0, 10) === today;
    const open = all.filter((l) => l.status !== "booked" && l.status !== "lost");
    const due = open.filter((l) => l.follow_up_on && l.follow_up_on <= today);
    const counts = STATUSES.map((s) => `${STATUS_LABEL[s]}: ${all.filter((l) => l.status === s).length}`).join(" · ");
    const text = [
        `📊 *KashiGo leads* — ${dateLabel(today, true)}`,
        `New today: *${all.filter((l) => isToday(l.created_at)).length}* · Booked today: *${all.filter((l) => l.status === "booked" && isToday(l.updated_at)).length}*`,
        counts,
        ``,
        due.length ? `⏰ *Follow up now (${due.length})*` : `✅ No follow-ups due.`,
        ...due.slice(0, 15).map((l) => leadLine(l)),
        due.length > 15 ? `…and ${due.length - 15} more in /admin` : "",
        ``,
        `Reply with e.g. _${due[0]?.id ?? 12} booked_ or _${due[0]?.id ?? 12} msg_`,
    ].filter((l) => l !== "").join("\n");
    await sendText(from, text);
}

async function sendFind(from: string, q: string) {
    const needle = q.toLowerCase().trim();
    const digits = needle.replace(/\D/g, "");
    const hits = (await listLeads(1000)).filter((l) => l.name.toLowerCase().includes(needle) || (digits.length >= 4 && (l.phone ?? "").includes(digits))).slice(0, 10);
    await sendText(from, hits.length ? hits.map((l) => leadLine(l)).join("\n") + `\n\nSend the number (e.g. _${hits[0].id}_) to open one.` : `No lead matches “${q}”.`);
}

const HELP = `🛶 *KashiGo leads bot*

*Add a lead* — send their details in any order:
_Rahul 98765 43210 evening aarti 4 people 20 Dec, called_
or forward their message, or share their contact card.

*Update a lead* — reply to my message about it, or use its number:
• _23 contacted_ · _23 quoted 4500_ · _23 booked_ · _23 lost_ · _23 follow up_
• _23 note wants a bigger boat_
• _23 date 22 Dec_ · _23 pax 6_ · _23 ₹5200_

*Message for the client* — _23 msg_ (or _23 msg hindi_), then forward it.

*See leads* — _list_ (today's summary & follow-ups) · _find rahul_ · _23_

Everything shows up in kashigo.in/admin → Leads.`;

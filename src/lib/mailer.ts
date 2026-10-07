import nodemailer from "nodemailer";

export function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

// Plain, personal-looking email shell (renders well in Gmail / Apple Mail).
export function simpleEmail(opts: { preheader: string; heading: string; paragraphs: string[]; links?: { label: string; url: string }[]; footer?: string }) {
    const links = (opts.links || [])
        .map((l) => `<tr><td style="padding:6px 0;"><a href="${esc(l.url)}" style="display:block;background:#f97316;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;font-size:15px;">⬇ ${esc(l.label)}</a></td></tr>`)
        .join("");
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f6f1e9;font-family:Georgia,'Times New Roman',serif;">
<span style="display:none;max-height:0;overflow:hidden;">${esc(opts.preheader)}</span>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1e9;padding:32px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;">
<tr><td style="background:#1b1714;padding:22px 32px;"><span style="color:#f97316;font:700 20px Arial,sans-serif;letter-spacing:2px;">KASHIGO</span></td></tr>
<tr><td style="padding:32px;">
<h1 style="margin:0 0 18px;font:700 24px Arial,sans-serif;color:#1b1714;">${esc(opts.heading)}</h1>
${opts.paragraphs.map((p) => `<p style="margin:0 0 16px;color:#3b342e;font-size:16px;line-height:1.65;">${p}</p>`).join("")}
${links ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;">${links}</table>` : ""}
<p style="margin:18px 0 0;color:#3b342e;font-size:16px;">— Vaibhav, KashiGo<br/><span style="color:#8a8178;font-size:14px;">Varanasi</span></p>
</td></tr>
<tr><td style="background:#faf6ef;padding:18px 32px;color:#8a8178;font:12px Arial,sans-serif;">${opts.footer || "You're receiving this because you asked for it at kashigo.in. Just reply to this email if you have any question — I read every one."}</td></tr>
</table></td></tr></table></body></html>`;
}

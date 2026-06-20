import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import path from "path";

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

export async function POST(req: Request) {
  try {
    const { name, email, phone, paymentId, region, amount } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const currency = region === "global" ? "USD" : "INR";
    const pdfPath = path.join(process.cwd(), "public", "India_Tour_Guide_2026.pdf");

    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"KashiGo" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your All India Tour Guide 2026 — KashiGo",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">

          <tr>
            <td style="background:#0f172a;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#f97316;font-size:28px;font-weight:800;letter-spacing:-0.5px;">KashiGo</h1>
              <p style="margin:6px 0 0;color:#94a3b8;font-size:13px;">All India Tour Guide 2026</p>
            </td>
          </tr>

          <tr>
            <td style="background:#fff7ed;border-bottom:1px solid #fed7aa;padding:16px 40px;text-align:center;">
              <p style="margin:0;color:#ea580c;font-size:14px;font-weight:600;">🎉 Your guide is attached — ready to download!</p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;color:#1e293b;font-size:16px;">Hi <strong>${name}</strong>,</p>
              <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                Thank you for getting the <strong>All India Tour Guide 2026</strong>. Your PDF is attached to this email — download it and you're good to go, even offline.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">What's inside</p>
                    <p style="margin:0 0 8px;color:#1e293b;font-size:14px;">🍛 &nbsp;Eat well, don't get sick — safe spots, what to avoid</p>
                    <p style="margin:0 0 8px;color:#1e293b;font-size:14px;">🛡️ &nbsp;Scam shields — exact scripts to dodge every common trap</p>
                    <p style="margin:0;color:#1e293b;font-size:14px;">🗺️ &nbsp;Routes that actually work — city-by-city day plans</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Payment reference</p>
                    <p style="margin:0 0 4px;color:#1e293b;font-size:15px;font-weight:700;font-family:monospace;">${paymentId}</p>
                    <p style="margin:0;color:#94a3b8;font-size:12px;">${currency} ${amount} · Keep this for your records</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">
                Need anything? WhatsApp or call us 24×7 — details below.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;color:#94a3b8;font-size:13px;">24×7 support · WhatsApp · Call / Text</p>
              <p style="margin:0;color:#0f172a;font-size:14px;font-weight:600;">support@kashigo.in</p>
            </td>
          </tr>

          <tr>
            <td style="background:#0f172a;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#475569;font-size:12px;">© ${new Date().getFullYear()} KashiGo · Varanasi, India</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
      attachments: [
        {
          filename: "All_India_Tour_Guide_2026_KashiGo.pdf",
          path: pdfPath,
        },
      ],
    });

    // also notify the business
    await transporter.sendMail({
      from: `"KashiGo" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: `India Guide purchase — ${name} (${email})`,
      text: `New purchase:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nRegion: ${region}\nAmount: ${currency} ${amount}\nPayment ID: ${paymentId}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("India Guide email error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

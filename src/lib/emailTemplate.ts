import fs from 'fs';
import path from 'path';

export const getBookingEmailTemplate = async (data: any, rideId: string) => {
    const paymentModeText = data.paymentMode === 'cod' ? 'Cash on Delivery' : 'Online';

    try {
        // Read the HTML file statically relative to the project root
        // process.cwd() is reliable in Next.js Server Components / API routes
        const templatePath = path.join(process.cwd(), 'email-preview.html');
        let htmlContent = fs.readFileSync(templatePath, 'utf8');

        // Replace the placeholders with actual data
        htmlContent = htmlContent.replace('{{PASSENGER_NAME}}', data.passengerDetails?.name || 'Customer');
        htmlContent = htmlContent.replace('{{RIDE_ID}}', rideId);
        htmlContent = htmlContent.replace('{{GHAT}}', data.ghat || '');
        htmlContent = htmlContent.replace('{{TIME_OF_DAY}}', data.timeOfDay || '');
        htmlContent = htmlContent.replace('{{BOAT_TYPE}}', data.boatType || '');
        htmlContent = htmlContent.replace('{{RIDE_DATE}}', data.rideDate || '');
        htmlContent = htmlContent.replace('{{PASSENGERS_COUNT}}', data.passengerDetails?.passengersCount || '1');
        htmlContent = htmlContent.replace('{{AMOUNT}}', data.amount || '0');
        htmlContent = htmlContent.replace('{{PAYMENT_MODE}}', paymentModeText);

        return htmlContent;
    } catch (error) {
        console.error("Failed to read email template file:", error);
        throw new Error("Could not process email template");
    }
};

export const getRefundEmailTemplate = ({
    name,
    amount,
    razorpayPaymentId,
}: {
    name: string;
    email: string;
    amount: number;
    razorpayPaymentId: string;
}): string => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Refund Notice – KashiGo</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#f97316;font-size:28px;font-weight:800;letter-spacing:-0.5px;">KashiGo</h1>
              <p style="margin:6px 0 0;color:#94a3b8;font-size:13px;">Sacred River Experiences, Varanasi</p>
            </td>
          </tr>

          <!-- Alert Banner -->
          <tr>
            <td style="background:#fef2f2;border-bottom:1px solid #fecaca;padding:16px 40px;text-align:center;">
              <p style="margin:0;color:#dc2626;font-size:14px;font-weight:600;">⚠️ Important Notice Regarding Your Payment</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;color:#1e293b;font-size:16px;">Dear <strong>${name}</strong>,</p>
              <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                Thank you for choosing <strong>KashiGo</strong>. Your payment of <strong style="color:#f97316;">₹${amount}</strong> was successfully received — however, due to a temporary technical issue on our end, we were <strong>unable to confirm your booking</strong> at this time.
              </p>
              <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7;">
                We sincerely apologize for this inconvenience. <strong>Your money is completely safe</strong> and a full refund will be processed within <strong style="color:#16a34a;">5–7 working days</strong> to your original payment method.
              </p>

              <!-- Payment Reference Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Razorpay Payment Reference</p>
                    <p style="margin:0;color:#1e293b;font-size:16px;font-weight:700;font-family:monospace;">${razorpayPaymentId}</p>
                    <p style="margin:8px 0 0;color:#94a3b8;font-size:12px;">Please keep this for your records</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#475569;font-size:14px;line-height:1.6;">
                If you do not receive your refund within 7 working days, please contact us with your payment reference above.
              </p>
            </td>
          </tr>

          <!-- Support -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;color:#94a3b8;font-size:13px;">Need help? We're here for you.</p>
              <p style="margin:0;color:#0f172a;font-size:14px;font-weight:600;">support@kashigo.com</p>
            </td>
          </tr>

          <!-- Footer -->
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
  `.trim();
};


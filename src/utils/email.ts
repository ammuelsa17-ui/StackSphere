/**
 * Email delivery utility.
 * Sends email receipts with invoice attachments using Nodemailer with a mock fallback.
 */

interface SendReceiptOptions {
  email: string;
  name: string;
  planName: string;
  amount: number;
  currency: string;
  invoicePath: string; // public/invoices/invoice-*.pdf
}

export async function sendReceiptEmail(options: SendReceiptOptions) {
  const { email, name, planName, amount, currency, invoicePath } = options;

  let nodemailerInstance: any = null;
  try {
    nodemailerInstance = require("nodemailer");
  } catch (err) {
    nodemailerInstance = null;
  }

  // Load environment configurations
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || "2525", 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  const from = process.env.EMAIL_FROM || "noreply@stacksphere.com";

  const emailSubject = `StackSphere Membership Upgrade: ${planName} Plan`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
      <h2 style="color: #4f46e5; border-bottom: 2px solid #f3f4f6; padding-bottom: 12px;">StackSphere Subscription Invoice</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Thank you for upgrading your StackSphere membership! Your transaction has been processed successfully.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f9fafb;">
          <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Item</th>
          <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">Amount</th>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${planName} Plan Subscription (Monthly)</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">$${amount.toFixed(2)} ${currency.toUpperCase()}</td>
        </tr>
        <tr style="font-weight: bold;">
          <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">Total Paid:</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right; color: #4f46e5;">$${amount.toFixed(2)} ${currency.toUpperCase()}</td>
        </tr>
      </table>

      <p>Your subscription privileges are now active. We have attached your PDF invoice receipt to this email.</p>
      <p>Best regards,<br/><strong>The StackSphere Team</strong></p>
    </div>
  `;

  // Attempt real SMTP mail delivery if nodemailer and environment variables are present
  if (nodemailerInstance && host && user && pass) {
    try {
      const transporter = nodemailerInstance.createTransport({
        host,
        port,
        auth: { user, pass },
      });

      const pathModule = require("path");
      const attachmentPath = pathModule.join(process.cwd(), "public", invoicePath);

      await transporter.sendMail({
        from,
        to: email,
        subject: emailSubject,
        html: emailHtml,
        attachments: [
          {
            filename: pathModule.basename(attachmentPath),
            path: attachmentPath,
          },
        ],
      });

      console.log(`[EMAIL RECEIPT] Receipt email dispatched successfully to "${email}".`);
      return { success: true, method: "smtp" };
    } catch (err: any) {
      console.warn("SMTP mail delivery failed, falling back to mock logger:", err.message);
    }
  }

  // Developer mock environment fallback
  console.log(
    `[MOCK EMAIL RECEIPT] Sent receipt email to "${email}" for ${planName} ($${amount.toFixed(2)} ${currency.toUpperCase()}) with invoice attachment: "${invoicePath}"`
  );
  return { success: true, method: "mock" };
}

/**
 * Production Email Delivery Utility
 * Supports SMTP delivery (Nodemailer) with in-memory Buffer attachment support
 * for serverless environments (e.g. Vercel).
 */

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; path?: string; content?: Buffer; contentType?: string }>;
}

export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, html, attachments } = options;

  let nodemailerInstance: any = null;
  try {
    nodemailerInstance = require("nodemailer");
  } catch (err) {
    nodemailerInstance = null;
  }

  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || "587", 10);
  const rawUser = process.env.EMAIL_USER || process.env.SMTP_USER || "";
  const rawPass = process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || "";

  const user = rawUser.trim().replace(/^["']|["']$/g, "");
  const pass = rawPass.trim().replace(/^["']|["']$/g, "").replace(/\s+/g, "");
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || `StackSphere <${user || "noreply@stacksphere.com"}>`;

  const isProduction = process.env.NODE_ENV === "production";

  // Production Mode Enforcement
  if (isProduction && (!user || !pass)) {
    throw new Error(
      "Email Delivery Failed: SMTP environment variables (EMAIL_USER, EMAIL_PASS) are not configured in production mode."
    );
  }

  // Bypass real SMTP dispatch for dummy test domains to avoid bounce emails
  if (to.endsWith("@example.com") || to.includes("@example")) {
    if (!isProduction) {
      console.log(`[MOCK EMAIL DISPATCH] Mocked email "${subject}" to test user "${to}".`);
    }
    return { success: true, method: "mock" };
  }

  // Real SMTP Mail Dispatch
  if (nodemailerInstance && user && pass) {
    try {
      const isGmailConfig = host.includes("gmail") || user.endsWith("@gmail.com");

      const transportOptions = isGmailConfig
        ? {
            service: "gmail",
            auth: { user, pass },
          }
        : {
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
          };

      const transporter = nodemailerInstance.createTransport(transportOptions);

      await transporter.sendMail({
        from,
        to,
        subject,
        html,
        attachments,
      });

      console.log(`[SMTP EMAIL DISPATCH SUCCESS] Sent email "${subject}" with ${attachments?.length || 0} attachment(s) to "${to}".`);
      return { success: true, method: "smtp" };
    } catch (err: any) {
      console.error(`[SMTP MAIL DISPATCH ERROR] ${err.message}`);
      if (isProduction) {
        throw new Error(`SMTP Mail Delivery Error: ${err.message}`);
      }
    }
  }

  // Development Mock Mode
  console.log(`[MOCK EMAIL DISPATCH] Sent email to "${to}" | Subject: "${subject}"`);
  return { success: true, method: "mock" };
}

export interface SendReceiptOptions {
  email: string;
  name: string;
  planName: string;
  amount: number;
  currency: string;
  pdfBuffer?: Buffer;
  invoicePath?: string;
}

export async function sendReceiptEmail(options: SendReceiptOptions) {
  const { email, name, planName, amount, currency, pdfBuffer, invoicePath } = options;

  const emailSubject = `StackSphere Membership Upgrade: ${planName} Plan Invoice`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #4f46e5; border-bottom: 2px solid #f3f4f6; padding-bottom: 12px; margin-top: 0;">StackSphere Official Invoice</h2>
      <p style="color: #374151;">Hello <strong>${name}</strong>,</p>
      <p style="color: #374151;">Thank you for upgrading your StackSphere membership! Your transaction has been processed successfully.</p>
      
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <h3 style="margin-top: 0; color: #111827;">Subscription Summary</h3>
        <p style="margin: 4px 0; color: #4b5563;"><strong>Purchased Plan:</strong> ${planName}</p>
        <p style="margin: 4px 0; color: #4b5563;"><strong>Amount Paid:</strong> ₹${amount} ${currency.toUpperCase()}</p>
        <p style="margin: 4px 0; color: #059669;"><strong>Status:</strong> Completed & Active ✅</p>
      </div>

      <p style="color: #374151;">Your official PDF invoice is attached to this email for your accounting records.</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="font-size: 12px; color: #6b7280; text-align: center;">
        © 2026 StackSphere Inc. All rights reserved.
      </p>
    </div>
  `;

  const attachments = pdfBuffer
    ? [
        {
          filename: `StackSphere-Invoice-${planName}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ]
    : invoicePath
    ? [
        {
          filename: `StackSphere-Invoice-${planName}.pdf`,
          path: invoicePath,
        },
      ]
    : [];

  return sendEmail({
    to: email,
    subject: emailSubject,
    html: emailHtml,
    attachments,
  });
}

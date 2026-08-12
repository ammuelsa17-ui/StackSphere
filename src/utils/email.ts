/**
 * Production Email Delivery Utility
 * Supports SMTP delivery (Nodemailer) with explicit production error reporting
 * and a clearly labelled development mock mode.
 */

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; path: string }>;
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

  const user = rawUser.trim();
  const pass = rawPass.trim().replace(/\s+/g, "");
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || `StackSphere <${user || "noreply@stacksphere.com"}>`;

  const isProduction = process.env.NODE_ENV === "production";

  // Production Mode Enforcement
  if (isProduction && (!host || !user || !pass)) {
    throw new Error(
      "Email Delivery Failed: SMTP environment variables (SMTP_USER, EMAIL_USER, SMTP_PASS, EMAIL_PASS) are not configured in production mode."
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
  if (nodemailerInstance && host && user && pass) {
    try {
      const transporter = nodemailerInstance.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      await transporter.sendMail({
        from,
        to,
        subject,
        html,
        attachments,
      });

      if (!isProduction) {
        console.log(`[SMTP EMAIL DISPATCH] Sent email "${subject}" to "${to}" successfully.`);
      }
      return { success: true, method: "smtp" };
    } catch (err: any) {
      if (isProduction) {
        throw new Error(`SMTP Mail Delivery Error: ${err.message}`);
      }
      console.warn(`[SMTP DISPATCH WARN] ${err.message}. Falling back to dev mock logger.`);
    }
  }

  // Development Mock Mode
  console.log(`[MOCK EMAIL DISPATCH] Sent email to "${to}" | Subject: "${subject}"`);
  return { success: true, method: "mock" };
}

interface SendReceiptOptions {
  email: string;
  name: string;
  planName: string;
  amount: number;
  currency: string;
  invoicePath: string; // e.g. public/invoices/invoice-*.pdf
}

export async function sendReceiptEmail(options: SendReceiptOptions) {
  const { email, name, planName, amount, currency, invoicePath } = options;

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

  const pathModule = require("path");
  const fsModule = require("fs");
  let attachmentPath = invoicePath;
  if (!fsModule.existsSync(attachmentPath)) {
    const cleanRelative = invoicePath.replace(/^\//, "");
    attachmentPath = pathModule.join(process.cwd(), "public", cleanRelative);
  }

  const attachments = [
    {
      filename: pathModule.basename(attachmentPath),
      path: attachmentPath,
    },
  ];

  return sendEmail({
    to: email,
    subject: emailSubject,
    html: emailHtml,
    attachments,
  });
}

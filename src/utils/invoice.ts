import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

interface InvoiceData {
  orderId: string;
  date: string;
  planName: string;
  amount: number;
  currency: string;
  email: string;
  name: string;
}

/**
 * Generates a standard, valid PDF document stream buffer for an invoice.
 * Completely dependency-free to ensure 100% build compatibility and zero network requirements.
 */
export function generateInvoicePDF(data: InvoiceData): Buffer {
  const { orderId, date, planName, amount, currency, email, name } = data;

  // Define PDF body content lines
  const lines = [
    "BT",
    "/F1 20 Tf",
    "50 780 Td",
    "(STACKSPHERE INVOICE) Tj",
    "ET",
    "BT",
    "/F1 10 Tf",
    "50 750 Td",
    `(Invoice ID: ${orderId}) Tj`,
    "0 -15 Td",
    `(Date: ${date}) Tj`,
    "0 -15 Td",
    `(Payment Method: Stripe Card Payment) Tj`,
    "0 -15 Td",
    `(Status: PAID) Tj`,
    "ET",
    "BT",
    "/F1 12 Tf",
    "50 680 Td",
    "(Bill To:) Tj",
    "ET",
    "BT",
    "/F1 10 Tf",
    "50 660 Td",
    `(Name: ${name}) Tj`,
    "0 -15 Td",
    `(Email: ${email}) Tj`,
    "ET",
    "BT",
    "/F1 12 Tf",
    "50 600 Td",
    "(Order Summary:) Tj",
    "ET",
    "BT",
    "/F1 10 Tf",
    "50 580 Td",
    `(Description                               Qty    Amount) Tj`,
    "0 -15 Td",
    `(---------------------------------------------------------------------) Tj`,
    "0 -15 Td",
    `(${planName.padEnd(42)} 1      $${amount.toFixed(2)} ${currency.toUpperCase()}) Tj`,
    "0 -20 Td",
    `(---------------------------------------------------------------------) Tj`,
    "0 -15 Td",
    `(Total Paid:                                      $${amount.toFixed(2)} ${currency.toUpperCase()}) Tj`,
    "ET",
    "BT",
    "/F1 9 Tf",
    "50 480 Td",
    "(Thank you for upgrading your StackSphere account!) Tj",
    "0 -12 Td",
    "(If you have any questions, please contact support@stacksphere.com) Tj",
    "ET",
  ];

  // Convert content lines into a single page content stream
  const contentStream = lines.join("\n") + "\n";
  const streamLength = contentStream.length;

  // Build basic PDF cross-referenced object map structure
  const pdfParts: string[] = [];
  pdfParts.push("%PDF-1.4\n");

  // 1: Catalog
  const obj1Offset = pdfParts.join("").length;
  pdfParts.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  // 2: Pages
  const obj2Offset = pdfParts.join("").length;
  pdfParts.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

  // 3: Page Definition (Size A4: 595.28 x 841.89)
  const obj3Offset = pdfParts.join("").length;
  pdfParts.push(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /MediaBox [0 0 595.28 841.89] /Contents 4 0 R >>\nendobj\n"
  );

  // 4: Content Stream definition
  const obj4Offset = pdfParts.join("").length;
  pdfParts.push(`4 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}endstream\nendobj\n`);

  // Cross-reference table
  const xrefOffset = pdfParts.join("").length;
  pdfParts.push(
    `xref\n0 5\n0000000000 65535 f \n${String(obj1Offset).padStart(10, "0")} 00000 n \n${String(
      obj2Offset
    ).padStart(10, "0")} 00000 n \n${String(obj3Offset).padStart(10, "0")} 00000 n \n${String(
      obj4Offset
    ).padStart(10, "0")} 00000 n \n`
  );

  // Trailer
  pdfParts.push(
    `trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
  );

  return Buffer.from(pdfParts.join(""), "binary");
}

/**
 * Saves a generated invoice PDF to public/invoices directory.
 */
export function saveInvoicePDF(orderId: string, pdfBuffer: Buffer): string {
  const publicDir = join(process.cwd(), "public");
  const invoicesDir = join(publicDir, "invoices");

  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }
  if (!existsSync(invoicesDir)) {
    mkdirSync(invoicesDir, { recursive: true });
  }

  const filename = `invoice-${orderId}.pdf`;
  const filePath = join(invoicesDir, filename);

  writeFileSync(filePath, pdfBuffer);

  return `/invoices/${filename}`;
}

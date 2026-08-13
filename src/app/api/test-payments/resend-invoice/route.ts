import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { generateInvoicePDF } from "@/utils/invoice";
import { sendReceiptEmail } from "@/utils/email";

/**
 * POST /api/test-payments/resend-invoice
 * Idempotently regenerates and emails the PDF invoice for the user's latest completed transaction.
 * Does NOT alter plan state, does NOT create new transactions, does NOT fake payments.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized access. Please log in." },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User profile could not be found." },
        { status: 404 }
      );
    }

    // Locate the latest completed transaction for this user
    const tx = await Transaction.findOne({ userId }).sort({ createdAt: -1 });
    if (!tx) {
      return NextResponse.json(
        { error: "No transaction records found for this account." },
        { status: 404 }
      );
    }

    // 1. Test generateInvoicePDF (produce non-empty PDF Buffer)
    const pdfBuffer = generateInvoicePDF({
      orderId: tx._id.toString(),
      date: new Date(tx.createdAt || Date.now()).toLocaleDateString(),
      planName: tx.planName || user.subscriptionPlan || "Bronze",
      amount: tx.amount || 100,
      currency: tx.currency || "INR",
      email: user.email,
      name: user.name || "Subscriber",
    });

    const isPdfValid = Buffer.isBuffer(pdfBuffer) && pdfBuffer.length > 0 && pdfBuffer.toString("binary").startsWith("%PDF-");

    if (!isPdfValid) {
      return NextResponse.json(
        { error: "PDF generation failed: Invalid or empty PDF Buffer created." },
        { status: 500 }
      );
    }

    // 2. Dispatch receipt email with PDF Buffer attachment
    const emailResult = await sendReceiptEmail({
      email: user.email,
      name: user.name || "Subscriber",
      planName: tx.planName || user.subscriptionPlan || "Bronze",
      amount: tx.amount || 100,
      currency: tx.currency || "INR",
      pdfBuffer,
    });

    return NextResponse.json({
      success: true,
      message: "PDF invoice generated and receipt email dispatched successfully.",
      pdfSize: pdfBuffer.length,
      emailMethod: emailResult.method,
      transactionId: tx._id.toString(),
      planName: tx.planName,
    });
  } catch (err: any) {
    console.error("Resend Invoice API Error:", err);
    return NextResponse.json(
      { error: `Failed to resend invoice email: ${err.message}` },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  try {
    const rawUser = process.env.EMAIL_USER || process.env.SMTP_USER || "";
    const rawPass = process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || "";
    const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || "587", 10);

    const user = rawUser.trim();
    const pass = rawPass.trim().replace(/\s+/g, "");

    const isGmailConfig = host.includes("gmail") || user.endsWith("@gmail.com");

    const diagnostics = {
      hasUser: Boolean(user),
      hasPass: Boolean(pass),
      userEnvKeyUsed: process.env.EMAIL_USER ? "EMAIL_USER" : process.env.SMTP_USER ? "SMTP_USER" : "NONE",
      passEnvKeyUsed: process.env.EMAIL_PASS ? "EMAIL_PASS" : process.env.SMTP_PASS ? "SMTP_PASS" : process.env.EMAIL_PASSWORD ? "EMAIL_PASSWORD" : "NONE",
      host,
      port,
      isGmailConfig,
      userDomain: user.includes("@") ? user.split("@")[1] : "invalid",
      passLength: pass.length,
    };

    if (!user || !pass) {
      return NextResponse.json({
        success: false,
        error: "Missing SMTP user or password environment variables.",
        diagnostics,
      }, { status: 400 });
    }

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
          connectTimeout: 10000,
        };

    const transporter = nodemailer.createTransport(transportOptions as any);

    try {
      await transporter.verify();
      return NextResponse.json({
        success: true,
        message: "SMTP Transporter verified successfully! Authentication passed.",
        diagnostics,
      });
    } catch (verifyErr: any) {
      return NextResponse.json({
        success: false,
        error: verifyErr.message,
        diagnostics,
      }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}

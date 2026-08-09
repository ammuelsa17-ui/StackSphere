/**
 * Reusable SMS Dispatch Service.
 * Supports production Twilio/SMS provider with explicit production error reporting
 * and a clearly labelled development mock mode.
 */

interface SendSmsOptions {
  to: string;
  message: string;
}

import { normalizePhone } from "./validation";

export async function sendSms(options: SendSmsOptions) {
  const { to, message } = options;
  const destination = normalizePhone(to) || to;

  const isProduction = process.env.NODE_ENV === "production";
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER || "+18005550199";

  // Production Enforcement Check - Return structured error instead of throwing
  if (isProduction && (!accountSid || !authToken)) {
    return {
      success: false,
      method: "twilio",
      error: true,
      errorCode: "MISSING_CREDENTIALS",
      errorMessage: "Production SMS provider credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) are missing on Vercel environment.",
    };
  }

  // Real Twilio API Call if credentials present
  if (accountSid && authToken) {
    try {
      let twilioModule: any = null;
      try {
        twilioModule = require("twilio");
      } catch (err) {
        twilioModule = null;
      }

      if (twilioModule) {
        const client = twilioModule(accountSid, authToken);
        const msgResult = await client.messages.create({
          body: message,
          from: fromNumber,
          to: destination,
        });

        if (!isProduction) {
          console.log(`[TWILIO SMS DISPATCH] Sent SMS to "${destination}" successfully (SID: ${msgResult.sid}, Status: ${msgResult.status}).`);
        }
        return {
          success: true,
          method: "twilio",
          sid: msgResult.sid,
          status: msgResult.status,
        };
      } else {
        return {
          success: false,
          method: "twilio",
          error: true,
          errorCode: "MODULE_NOT_FOUND",
          errorMessage: "Twilio package module is not installed.",
        };
      }
    } catch (err: any) {
      console.warn(`[SMS DISPATCH WARN] ${err.message}.`);
      return {
        success: false,
        method: "twilio",
        error: true,
        errorCode: err.code || err.status || "UNKNOWN",
        errorMessage: err.message || "Twilio SMS dispatch failed.",
      };
    }
  }

  // Development Mock Mode (Do not log raw OTP codes in production)
  if (!isProduction) {
    console.log(`[MOCK SMS DISPATCH] Sent SMS to "${to}" | Message: "${message}"`);
  }
  return { success: true, method: "mock" };
}

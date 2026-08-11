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

/**
 * Sends a registration phone OTP via Twilio Verify API v2 service.
 */
export async function sendTwilioVerifyOtp(phoneNumber: string) {
  const destination = normalizePhone(phoneNumber) || phoneNumber;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken) {
    return {
      success: false,
      errorCode: "MISSING_CREDENTIALS",
      errorMessage: "Twilio account SID or auth token is missing on server environment.",
    };
  }

  if (!verifyServiceSid) {
    return {
      success: false,
      errorCode: "MISSING_VERIFY_SERVICE",
      errorMessage: "TWILIO_VERIFY_SERVICE_SID environment variable is missing.",
    };
  }

  try {
    let twilioModule: any = null;
    try {
      twilioModule = require("twilio");
    } catch {
      twilioModule = null;
    }

    if (!twilioModule) {
      return {
        success: false,
        errorCode: "MODULE_NOT_FOUND",
        errorMessage: "Twilio package module is not installed.",
      };
    }

    const client = twilioModule(accountSid, authToken);
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({
        to: destination,
        channel: "sms",
      });

    return {
      success: true,
      sid: verification.sid,
      status: verification.status,
    };
  } catch (err: any) {
    return {
      success: false,
      errorCode: err.code || err.status || "VERIFY_SEND_FAILED",
      errorMessage: err.message || "Twilio Verify dispatch failed.",
    };
  }
}

/**
 * Checks a registration phone OTP code via Twilio Verify API v2 service.
 */
export async function checkTwilioVerifyOtp(phoneNumber: string, code: string) {
  const destination = normalizePhone(phoneNumber) || phoneNumber;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !verifyServiceSid) {
    return {
      approved: false,
      errorCode: "MISSING_CONFIG",
      errorMessage: "Twilio Verify service configuration is incomplete.",
    };
  }

  try {
    let twilioModule: any = null;
    try {
      twilioModule = require("twilio");
    } catch {
      twilioModule = null;
    }

    if (!twilioModule) {
      return {
        approved: false,
        errorCode: "MODULE_NOT_FOUND",
        errorMessage: "Twilio package module is not installed.",
      };
    }

    const client = twilioModule(accountSid, authToken);
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({
        to: destination,
        code,
      });

    const isApproved = verificationCheck.status === "approved";
    return {
      approved: isApproved,
      status: verificationCheck.status,
      errorCode: isApproved ? null : "NOT_APPROVED",
      errorMessage: isApproved ? null : "Verification code was not approved.",
    };
  } catch (err: any) {
    return {
      approved: false,
      errorCode: err.code || err.status || "VERIFY_CHECK_FAILED",
      errorMessage: err.message || "Failed to verify code.",
    };
  }
}

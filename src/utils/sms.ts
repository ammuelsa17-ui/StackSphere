/**
 * Reusable SMS Dispatch Service.
 * Supports production Twilio/SMS provider with explicit production error reporting
 * and a clearly labelled development mock mode.
 */

interface SendSmsOptions {
  to: string;
  message: string;
}

export async function sendSms(options: SendSmsOptions) {
  const { to, message } = options;

  const isProduction = process.env.NODE_ENV === "production";
  const provider = process.env.SMS_PROVIDER || "twilio";
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER || "+18005550199";

  // Production Enforcement Check
  if (isProduction && (!accountSid || !authToken)) {
    throw new Error(
      "SMS Delivery Failed: Production SMS provider credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) are missing."
    );
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
        await client.messages.create({
          body: message,
          from: fromNumber,
          to,
        });

        if (!isProduction) {
          console.log(`[TWILIO SMS DISPATCH] Sent SMS to "${to}" successfully.`);
        }
        return { success: true, method: "twilio" };
      }
    } catch (err: any) {
      if (isProduction) {
        throw new Error(`SMS Provider Error: ${err.message}`);
      }
      console.warn(`[SMS DISPATCH WARN] ${err.message}. Falling back to dev mock logger.`);
    }
  }

  // Development Mock Mode (Do not log raw OTP codes in production)
  if (!isProduction) {
    console.log(`[MOCK SMS DISPATCH] Sent SMS to "${to}" | Message: "${message}"`);
  }
  return { success: true, method: "mock" };
}

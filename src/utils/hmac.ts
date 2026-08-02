import crypto from "crypto";

const OTP_SECRET = process.env.OTP_HASH_SECRET || "stacksphere_otp_secret_key_2026_fallback";

/**
 * Computes an HMAC-SHA256 hash for an OTP string using server-side OTP_HASH_SECRET.
 */
export function hashOtp(code: string): string {
  return crypto.createHmac("sha256", OTP_SECRET).update(code.trim()).digest("hex");
}

/**
 * Timing-safe verification comparing a candidate OTP string against a stored hash.
 */
export function verifyOtpHash(candidateCode: string, storedHash: string): boolean {
  if (!candidateCode || !storedHash) return false;
  const candidateHash = hashOtp(candidateCode);
  
  const bufferCandidate = Buffer.from(candidateHash, "utf8");
  const bufferStored = Buffer.from(storedHash, "utf8");

  if (bufferCandidate.length !== bufferStored.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferCandidate, bufferStored);
}

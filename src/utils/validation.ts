import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";

/**
 * Utility functions for strict input validation and data sanitization.
 * Prevents XSS, NoSQL Injection, and enforces strict formats.
 */

/**
 * Sanitizes input values to prevent NoSQL injection and basic HTML/XSS injection.
 * Strips HTML tags and ensures the value is returned as a trimmed string.
 */
export function sanitizeString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  
  let str = String(value).trim();
  str = str.replace(/<[^>]*>/g, "");
  return str;
}

/**
 * Validates Email Address format strictly.
 */
export function validateEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Normalizes any valid international phone number to E.164 format.
 * Returns empty string for empty input, normalized E.164 string if valid, or null if invalid.
 */
export function normalizePhone(
  phone: unknown,
  defaultCountry: CountryCode = "IN"
): string | null {
  if (phone === null || phone === undefined || phone === "") return "";
  if (typeof phone !== "string") return null;

  const raw = phone.trim();
  if (!raw) return "";

  // Attempt parse using libphonenumber-js
  const parsed = parsePhoneNumberFromString(raw, defaultCountry);
  if (parsed && parsed.isValid()) {
    return parsed.number; // Returns E.164 format e.g. +919876543210, +12025550123
  }

  return null;
}

/**
 * Validates Phone Number format strictly using libphonenumber-js.
 * Allows E.164 formats, spaces, hyphens, parentheses, and local 10-digit numbers.
 */
export function validatePhone(
  phone: unknown,
  defaultCountry: CountryCode = "IN"
): boolean {
  if (phone === null || phone === undefined || phone === "") return true;
  if (typeof phone !== "string") return false;

  const normalized = normalizePhone(phone, defaultCountry);
  return normalized !== null;
}

/**
 * Validates Password strength strictly.
 * Rules: At least 6 characters, must contain at least one letter and one number.
 */
export function validatePassword(password: unknown): boolean {
  if (typeof password !== "string") return false;
  if (password.length < 6) return false;
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return hasLetter && hasNumber;
}

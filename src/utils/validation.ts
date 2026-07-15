/**
 * Utility functions for strict input validation and data sanitization.
 * Prevents XSS, NoSQL Injection, and enforces strict formats.
 */

/**
 * Sanitizes input values to prevent NoSQL injection and basic HTML/XSS injection.
 * Strips HTML tags and ensures the value is returned as a trimmed string.
 * @param value Input value
 */
export function sanitizeString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  
  // Cast to string
  let str = String(value).trim();
  
  // Basic HTML sanitization (strip script tags and HTML tags)
  str = str.replace(/<[^>]*>/g, "");
  
  return str;
}

/**
 * Validates Email Address format strictly.
 * @param email Input email
 */
export function validateEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates Phone Number format strictly.
 * Allows E.164 formats, empty string, or standard numeric strings.
 * @param phone Input phone number
 */
export function validatePhone(phone: unknown): boolean {
  if (phone === null || phone === undefined || phone === "") return true;
  if (typeof phone !== "string") return false;
  
  // Regex supporting standard international numbers (e.g., +15551234567 or 15551234567)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.trim());
}

/**
 * Validates Password strength strictly.
 * Rules: At least 6 characters, must contain at least one letter and one number.
 * @param password Input password
 */
export function validatePassword(password: unknown): boolean {
  if (typeof password !== "string") return false;
  if (password.length < 6) return false;
  
  // Must contain at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return hasLetter && hasNumber;
}

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
 * Password Policy Requirements for New Account Registration:
 * - Minimum 12 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export interface PasswordRequirementStatus {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isValid: boolean;
  firstMissingError: string | null;
}

export function checkPasswordRequirements(password: unknown): PasswordRequirementStatus {
  if (typeof password !== "string") {
    return {
      hasMinLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecial: false,
      isValid: false,
      firstMissingError: "Password is required.",
    };
  }

  const hasMinLength = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  let firstMissingError: string | null = null;
  if (!hasMinLength) {
    firstMissingError = "Password must contain at least 12 characters.";
  } else if (!hasUppercase) {
    firstMissingError = "Add at least one uppercase letter.";
  } else if (!hasLowercase) {
    firstMissingError = "Add at least one lowercase letter.";
  } else if (!hasNumber) {
    firstMissingError = "Add at least one number.";
  } else if (!hasSpecial) {
    firstMissingError = "Add at least one special character.";
  }

  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  return {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
    isValid,
    firstMissingError,
  };
}

export function validatePassword(password: unknown): boolean {
  return checkPasswordRequirements(password).isValid;
}

/**
 * Calculates password strength level: Weak, Fair, Strong, Very Strong.
 */
export interface PasswordStrengthResult {
  score: number; // 0..4
  label: "Weak" | "Fair" | "Strong" | "Very Strong";
  colorClass: string;
  widthPercent: number;
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return { score: 0, label: "Weak", colorClass: "bg-neutral-300 dark:bg-neutral-700", widthPercent: 0 };
  }

  const reqs = checkPasswordRequirements(password);
  let score = 0;

  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (reqs.hasUppercase && reqs.hasLowercase) score += 1;
  if (reqs.hasNumber && reqs.hasSpecial) score += 1;

  if (!reqs.isValid && score > 2) {
    score = 2; // Cap at Fair if missing mandatory requirements
  }

  if (score <= 1) {
    return { score: 1, label: "Weak", colorClass: "bg-rose-500", widthPercent: 25 };
  } else if (score === 2) {
    return { score: 2, label: "Fair", colorClass: "bg-amber-500", widthPercent: 50 };
  } else if (score === 3) {
    return { score: 3, label: "Strong", colorClass: "bg-emerald-500", widthPercent: 75 };
  } else {
    return { score: 4, label: "Very Strong", colorClass: "bg-indigo-500", widthPercent: 100 };
  }
}

/**
 * Generates a cryptographically secure random strong password using Web Crypto API.
 * Guarantees uppercase, lowercase, numbers, and special characters.
 * Length default: 18 characters (16-20 range).
 */
export function generateCryptographicPassword(length: number = 18): string {
  const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowers = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%^&*()_+-=[]{}|";
  const allChars = uppers + lowers + numbers + symbols;

  // Use browser/node Web Crypto API (never Math.random)
  const getRandomIndex = (max: number): number => {
    const array = new Uint32Array(1);
    if (typeof window !== "undefined" && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      const { webcrypto } = require("crypto");
      webcrypto.getRandomValues(array);
    }
    return array[0] % max;
  };

  // Ensure at least one character of each mandatory pool
  const passwordChars: string[] = [
    uppers[getRandomIndex(uppers.length)],
    lowers[getRandomIndex(lowers.length)],
    numbers[getRandomIndex(numbers.length)],
    symbols[getRandomIndex(symbols.length)],
  ];

  // Fill remainder with random characters from all pools
  for (let i = passwordChars.length; i < length; i++) {
    passwordChars.push(allChars[getRandomIndex(allChars.length)]);
  }

  // Cryptographically shuffle the array
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = getRandomIndex(i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join("");
}


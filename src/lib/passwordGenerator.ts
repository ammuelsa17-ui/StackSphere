import crypto from "crypto";

/**
 * Generates a random password of a given length consisting only of alphabetical letters (A-Z, a-z).
 * Satisfies the Day 29 requirement: "Create custom random password generator (letters only)".
 *
 * @param length Length of the generated password (default: 12)
 * @returns A secure random letters-only string
 */
export function generateLettersOnlyPassword(length: number = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const charsLength = chars.length;
  let result = "";

  // Securely generate random bytes to select characters
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % charsLength;
    result += chars.charAt(randomIndex);
  }

  return result;
}

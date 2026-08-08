import { getCountries, getCountryCallingCode, CountryCode } from "libphonenumber-js";

export interface CountryInfo {
  code: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
}

/**
 * Converts a 2-letter ISO country code into a unicode flag emoji.
 * e.g., 'IN' -> '🇮🇳', 'US' -> '🇺🇸', 'GB' -> '🇬🇧'
 */
export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

/**
 * Dynamically generates the complete international country list for all 240+ ISO countries/territories.
 * Keeps India (IN) at index 0 as the default.
 */
function generateAllCountries(): CountryInfo[] {
  const countryCodes = getCountries();
  const list: CountryInfo[] = [];

  for (const code of countryCodes) {
    try {
      const dialCode = `+${getCountryCallingCode(code)}`;
      const name = regionNames.of(code) || code;
      const flag = getFlagEmoji(code);

      list.push({
        code,
        name,
        dialCode,
        flag,
      });
    } catch {
      // Ignore any unsupported codes
    }
  }

  // Sort alphabetically by country name
  list.sort((a, b) => a.name.localeCompare(b.name));

  // Find India and place it at index 0
  const indiaIndex = list.findIndex((c) => c.code === "IN");
  if (indiaIndex > 0) {
    const [india] = list.splice(indiaIndex, 1);
    list.unshift(india);
  }

  return list;
}

export const ALL_COUNTRIES: CountryInfo[] = generateAllCountries();
export const DEFAULT_COUNTRY: CountryInfo = ALL_COUNTRIES[0]; // India (+91)

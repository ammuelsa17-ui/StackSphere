/**
 * Utility functions to parse browser, operating system (OS), and device type 
 * from the HTTP User-Agent header.
 */

/**
 * Parses the Operating System from the User-Agent string.
 * @param ua Raw User-Agent string
 */
export function parseOS(ua: string): string {
  if (!ua) return "Unknown";
  const lowercaseUa = ua.toLowerCase();

  if (lowercaseUa.includes("win")) return "Windows";
  if (lowercaseUa.includes("macintosh") || lowercaseUa.includes("mac os x")) return "macOS";
  if (lowercaseUa.includes("linux")) return "Linux";
  if (lowercaseUa.includes("android")) return "Android";
  if (lowercaseUa.includes("iphone") || lowercaseUa.includes("ipad") || lowercaseUa.includes("ipod")) return "iOS";

  return "Unknown";
}

/**
 * Parses the Browser name from the User-Agent string.
 * @param ua Raw User-Agent string
 */
export function parseBrowser(ua: string): string {
  if (!ua) return "Unknown";
  const lowercaseUa = ua.toLowerCase();

  // Edge must be checked before Chrome/Safari
  if (lowercaseUa.includes("edg/")) return "Microsoft Edge";
  // Chrome must be checked before Safari
  if (lowercaseUa.includes("chrome") || lowercaseUa.includes("crios")) return "Chrome";
  if (lowercaseUa.includes("safari")) return "Safari";
  if (lowercaseUa.includes("firefox") || lowercaseUa.includes("fxios")) return "Firefox";
  if (lowercaseUa.includes("msie") || lowercaseUa.includes("trident/")) return "Internet Explorer";
  if (lowercaseUa.includes("opera") || lowercaseUa.includes("opr/")) return "Opera";

  return "Other";
}

/**
 * Parses the Device Type from the User-Agent string.
 * @param ua Raw User-Agent string
 */
export function parseDeviceType(ua: string): string {
  if (!ua) return "Desktop";
  const lowercaseUa = ua.toLowerCase();

  // Tablet checks
  if (lowercaseUa.includes("ipad")) {
    return "Tablet";
  }
  
  // Some Android user agents contain "android" but not "mobile" (usually tablets)
  if (lowercaseUa.includes("android") && !lowercaseUa.includes("mobile")) {
    return "Tablet";
  }

  // Mobile checks
  if (
    lowercaseUa.includes("mobi") ||
    lowercaseUa.includes("iphone") ||
    lowercaseUa.includes("ipod") ||
    lowercaseUa.includes("webos") ||
    lowercaseUa.includes("blackberry") ||
    lowercaseUa.includes("iemobile") ||
    lowercaseUa.includes("opera mini")
  ) {
    return "Mobile";
  }

  // Fallback to desktop
  return "Desktop";
}

/**
 * Centralized Shared Time Gate Helper
 * Enforces the 10:00 AM - 11:00 AM IST Payment Window policy across frontend UI & backend APIs.
 * 
 * TEMPORARY TEST SESSION: Currently returns true for live end-to-end deadline testing.
 * RESTORATION METHOD: Revert to Intl.DateTimeFormat Asia/Kolkata hour === 10 for final submission.
 */
export function isPaymentWindowOpen(bypassTimeGate: boolean = false): boolean {
  if (bypassTimeGate) return true;

  // TEMPORARY TEST MODE: Opened for live manual deadline testing session
  return true;
}

/**
 * Strict Production Time Gate Evaluator using native Intl.DateTimeFormat Asia/Kolkata
 */
export function isStrictProductionPaymentWindowOpen(): boolean {
  try {
    const istHourStr = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hour12: false,
    }).format(new Date());
    const istHour = parseInt(istHourStr, 10);
    return istHour === 10;
  } catch (err) {
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const istTime = new Date(utcTime + 3600000 * 5.5);
    return istTime.getHours() === 10;
  }
}

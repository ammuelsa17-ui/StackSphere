/**
 * Centralized Shared Time Gate Helper
 * Strictly enforces the 10:00 AM - 11:00 AM IST Payment Window policy across frontend UI & backend APIs.
 * 
 * Uses native Intl.DateTimeFormat with Asia/Kolkata timezone to ensure 100% precision
 * on any server worldwide.
 */
export function isPaymentWindowOpen(bypassTimeGate: boolean = false): boolean {
  if (bypassTimeGate) return true;

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

export function isStrictProductionPaymentWindowOpen(): boolean {
  return isPaymentWindowOpen(false);
}

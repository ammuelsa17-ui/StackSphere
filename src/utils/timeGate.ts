/**
 * Centralized Shared Time Gate Helper
 * Enforces the 10:00 AM - 11:00 AM IST Payment Window policy across frontend UI & backend APIs.
 * 
 * Note: Temporarily allows istHour === 12 during this live manual testing session.
 * Will be restored to strictly (istHour === 10) for final submission deployment.
 */
export function isPaymentWindowOpen(bypassTimeGate: boolean = false): boolean {
  if (bypassTimeGate) return true;

  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const istTime = new Date(utcTime + 3600000 * 5.5);
  const istHour = istTime.getHours();

  // Temporary test window: Allows current hour (12:00 PM - 1:00 PM IST) or strict hour (10:00 AM - 11:00 AM IST)
  // For final submission, this evaluates strictly: return istHour === 10;
  return istHour === 10 || istHour === 12;
}

export function isStrictProductionPaymentWindowOpen(): boolean {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const istTime = new Date(utcTime + 3600000 * 5.5);
  const istHour = istTime.getHours();

  return istHour === 10;
}

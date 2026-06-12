# StackSphere Testing Plan

This document tracks the testing checklist for all completed modules to ensure code stability, security, and correct business logic.

---

## 1. Authentication & Session Testing
- [ ] **Correct Login:** Ensure credentials authenticate and trigger session creation.
- [ ] **Incorrect Credentials:** Fail login on wrong password/unregistered email.
- [ ] **Validation:** Verify fields enforce lengths and format patterns (e.g. valid email syntax).
- [ ] **Device Rules:**
  - [ ] Chrome browser triggers OTP challenge email.
  - [ ] Microsoft Edge logs in directly.
  - [ ] Mobile users blocked outside of 10:00 AM - 1:00 PM window.

---

## 2. Social Space Testing
- [ ] **Social Feed Retrieve:** Retrieve feed posts in chronological order.
- [ ] **Media Uploads:** Ensure images and videos upload successfully to cloud storage.
- [ ] **Friend Restrictions:**
  - [ ] User with 0 friends receives: "Cannot post" warning.
  - [ ] User with 1 friend can post exactly once per day.
  - [ ] User with 2 friends can post exactly twice per day.
  - [ ] User with 10+ friends has unlimited posting permissions.

---

## 3. Subscription & Payments Testing
- [ ] **Plan Verification:** Free users can post 1 question, Bronze posts 5 questions, Silver posts 10, Gold has no limits.
- [ ] **Stripe/Razorpay Flow:** Payment process runs successfully.
- [ ] **Time Restriction:** Payments blocked outside of 10:00 AM - 11:00 AM IST.
- [ ] **Invoice Emailing:** PDF invoice is generated and received in inbox after checkout.

---

## 4. Reward Points Testing
- [ ] **Points Earning:** Answer question (+5 points), answer upvotes hit 5 (+5 points).
- [ ] **Points Deduction:** Post downvoted or deleted (points deducted correctly).
- [ ] **Point Transfer:** Validate user has >10 points before executing transfer.

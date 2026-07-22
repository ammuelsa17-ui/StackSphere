# StackSphere Testing Plan

This document tracks the testing checklist for all completed modules to ensure code stability, security, and correct business logic.

---

## 1. Authentication & Session Testing
- [x] **Correct Login:** Ensure credentials authenticate and trigger session creation.
- [x] **Incorrect Credentials:** Fail login on wrong password/unregistered email.
- [x] **Validation:** Verify fields enforce lengths and format patterns (e.g. valid email syntax).
- [x] **Device Rules:**
  - [x] Chrome browser triggers OTP challenge email.
  - [x] Microsoft Edge logs in directly.
  - [x] Mobile users blocked outside of 10:00 AM - 1:00 PM window.
- [x] **Input Sanitization:** All auth endpoints strip HTML tags and validate inputs with centralised utilities.
- [x] **Sensitive Field Protection:** Security fields hidden from default database queries.
- [x] **Security Headers:** Protected routes return X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy headers.
- [x] **Client-Side Validation:** RegisterForm and ForgotPasswordForm enforce password complexity (letters + numbers) before submission.

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
- [x] **Stripe/Razorpay Flow:** Payment process runs successfully.
- [ ] **Time Restriction:** Payments blocked outside of 10:00 AM - 11:00 AM IST.
- [ ] **Invoice Emailing:** PDF invoice is generated and received in inbox after checkout.

---

## 4. Reward Points Testing
- [ ] **Points Earning:** Answer question (+5 points), answer upvotes hit 5 (+5 points).
- [ ] **Points Deduction:** Post downvoted or deleted (points deducted correctly).
- [ ] **Point Transfer:** Validate user has >10 points before executing transfer.

---

## 5. Password Recovery & Security Testing
- [x] **Forgot Password OTP (Email):** Check that request generates a 6-digit numeric OTP and reset token.
- [x] **Forgot Password OTP (Phone):** Verify user search and OTP dispatch by phone number.
- [x] **OTP Verification Rules:**
  - [x] Reject invalid 6-digit codes.
  - [x] Reject expired verification codes.
  - [x] Clear verification fields upon successful validation.
- [x] **Rate Limiting:** Ensure password reset requests are limited to one per 24 hours per user.
- [x] **Password Generator:** Verify that generated passwords include both letters and numbers.
- [x] **Reset Password API Completion:** Verify new passwords can be set successfully and reset tokens are invalidated.
- [x] **Strict Password Validation:** Reject passwords missing letters or numbers at both client and server.

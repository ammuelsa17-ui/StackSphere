# StackSphere Security Policy

This document outlines the security procedures, protocols, and precautions implemented in StackSphere.

---

## 1. Credentials Hashing
* All passwords are encrypted using **bcrypt** (with a salt round factor of 10–12) before saving to the database.
* Passwords must never be stored in plaintext.
* Passwords must meet minimum complexity requirements: at least 6 characters, containing both letters and numbers.

---

## 2. API Protection & Security Middleware
* API routes are protected using middleware that verifies user sessions.
* **Access Control:** Enforce time-restrictions for mobile logins (restricted to 10:00 AM - 1:00 PM) directly in the API layer.
* Enforce payment gateway time checks (payments only accepted between 10:00 AM and 11:00 AM IST).
* **Chrome OTP Challenge:** Login attempts from Chrome browsers require a 6-digit verification code sent to the user's email.
* **Microsoft Edge Bypass:** Edge browser logins proceed directly without OTP.

---

## 3. Data Sanitization & Input Checks
* Enforce input sanitization using the `sanitizeString` utility to strip HTML tags and prevent NoSQL/XSS injection.
* Strict schema validation is applied via Mongoose before saving documents.
* All API endpoints validate inputs using centralised validators (`validateEmail`, `validatePhone`, `validatePassword`).

---

## 4. Sensitive Field Protection
* Security-sensitive fields (`password`, `resetPasswordToken`, `resetPasswordExpires`, `verificationCode`, `verificationCodeExpires`, `lastForgotPasswordRequestedAt`) are hidden from default database queries using Mongoose `select: false`.
* Routes that require these fields must explicitly use `.select("+fieldName")`.

---

## 5. Security Response Headers
* The following HTTP security headers are applied to all protected routes via middleware:
  - `X-Content-Type-Options: nosniff` — Prevents MIME type sniffing.
  - `X-Frame-Options: DENY` — Prevents clickjacking by blocking iframe embedding.
  - `X-XSS-Protection: 1; mode=block` — Enables legacy browser XSS filters.
  - `Referrer-Policy: strict-origin-when-cross-origin` — Limits referrer data leakage.
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()` — Restricts dangerous browser APIs.

---

## 6. Environment Variables & Secret Safety
* Secrets (such as SMTP mailer passwords, Stripe api keys, Razorpay secret keys, and database passwords) must only reside in `.env.local` files on production.
* `.env.local` is listed in `.gitignore` to prevent leaking keys onto public repositories.
* Use `.env.example` to log mock keys for developers.

# StackSphere Security Policy

This document outlines the security procedures, protocols, and precautions implemented in StackSphere.

---

## 1. Credentials Hashing
* All passwords are encrypted using **bcrypt** (with a salt round factor of 10) before saving to the database.
* Passwords must never be stored in plaintext.

---

## 2. API Protection & Security Middleware
* API routes are protected using middleware that verifies user sessions.
* **Access Control:** Enforce time-restrictions for mobile logins (restricted to 10:00 AM - 1:00 PM) directly in the API layer.
* Enforce payment gateway time checks (payments only accepted between 10:00 AM and 11:00 AM IST).

---

## 3. Data Sanitization & Input Checks
* Enforce input sanitization using standard validators to prevent NoSQL and SQL injection attacks.
* Strict schema validation is applied via Mongoose before saving documents.

---

## 4. Environment Variables & Secret Safety
* Secrets (such as SMTP mailer passwords, Stripe api keys, Razorpay secret keys, and database passwords) must only reside in `.env.local` files on production.
* `.env.local` is listed in `.gitignore` to prevent leaking keys onto public repositories.
* Use `.env.example` to log mock keys for developers.

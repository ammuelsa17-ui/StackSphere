# StackSphere Portfolio Summary

This document serves as a reference for resume building, LinkedIn highlights, and internship project presentations.

---

## 📋 Project Overview
**StackSphere** is a high-performance community Q&A and social networking platform. It combines standard forum functionalities (similar to Stack Overflow) with modern, real-time social space features, subscription models, point systems, multi-language localization, and login security auditing.

---

## 🛠 Key Features & Solving Real Problems

### 1. Social Interactions & Spam Controls
* **Feature:** Social Space Feed with Posting Limits.
* **Problem Solved:** Keeps community interaction high while preventing spam. Posts are restricted relative to user friend count.

### 2. Subscription plans & Monetization
* **Feature:** Stripe/Razorpay payment gateway integration with question limits based on tiers.
* **Problem Solved:** Enforces subscription paywalls with payment time-restrictions (10:00 AM - 11:00 AM IST) for secure transaction logging.

### 3. Password Reset Security
* **Feature:** Random Password generator and daily forgot password request limits.
* **Problem Solved:** Prevents brute force reset attempts and provides immediate secure resets using letters only.

### 4. Reward & Points System
* **Feature:** Automated point awards for contribution (+5 for answers, +5 on upvote milestones), deductions on downvotes, and point transfers.
* **Problem Solved:** Incentivizes meaningful user participation and contribution.

### 5. Multi-Language & Security Verifications
* **Feature:** 6-language switcher with email/SMS OTP verification on language updates.
* **Problem Solved:** Localizes content globally while enforcing access verification during settings updates.

### 6. Security Logs & Device Restraints
* **Feature:** Access history logging and browser/device auth rules (Chrome email OTP; Microsoft Edge no-OTP; Mobile time-restrictions).
* **Problem Solved:** Protects user accounts from suspicious active logins and session hijack attempts.

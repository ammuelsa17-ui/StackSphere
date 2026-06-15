# StackSphere Project Blueprint

This document acts as the permanent guide and roadmap for the development of **StackSphere** (internship & portfolio project).

---

## 📋 Project Goal
Develop **StackSphere**, a Stack Overflow + social community platform built using Next.js, TypeScript, Tailwind CSS, MongoDB, and Mongoose.

---

## 🛠 Currently Completed Work
* Next.js project setup completed (TypeScript + Tailwind CSS + App Router).
* Professional folder architecture created.
* MongoDB connection with cached singleton pattern implemented in `src/lib/mongodb.ts`.
* Core Mongoose models defined (`User`, `Post`, `Comment`, `Subscription`, `Transaction`, `Reward`) under `src/models/`.
* Reusable layout UI completed (Navbar, Sidebar, Footer, and responsive root layout wrappers).

---

## ⚖️ Development Rules
1. **Folder Compliance:** Always follow the structured folders (`src/app/`, `/components/`, `/models/`, `/lib/`, `/utils/`).
2. **Strict TypeScript:** Write clean TypeScript code and avoid using `any` unless absolutely necessary.
3. **Efficiency:** Reuse components and avoid creating redundant files.
4. **AI Assistance Rules:** Explain every major implementation and architectural decision before coding.
5. **Stability:** Do not remove existing working features. Prioritize clean architecture, documentation, and maintainability.

---

## 🗺️ Next Development Phases

### Phase 1: Authentication System
* **User Registration:**
  * Collect Name, Username, Email, Phone number, and Password.
  * Encrypt passwords using bcrypt and save user records to MongoDB.
* **User Login:**
  * Validate email/password credentials.
  * Setup session handling and return clean error messages.
* **Forgot Password:**
  * Dedicated forgot password page and API route.
  * Restrict requests to once per day.
  * Generate a random password containing only letters (uppercase/lowercase, no numbers, no special characters).

### Phase 2: API Development (`src/app/api/`)
Build modular endpoint directories:
* `api/auth/`
* `api/users/`
* `api/posts/`
* `api/subscriptions/`
* `api/rewards/`
* `api/uploads/`

### Phase 3: Internship Task Modules
1. **Social Posting System:** Image/video uploads, likes/comments/shares, and friend-count based posting limits.
2. **Subscription System:** Free, Bronze, Silver, and Gold plans, Stripe/Razorpay test checkout, and daily question limits.
3. **Reward Points:** Points awarded on answers (+5) and upvotes (+5), points deducted on downvotes/deletions, and points transfers between users (>10 points required).
4. **Multi-language System:** Translation for 6 languages. Enforce email OTP verification before switching to French, and mobile number OTP for other languages.
5. **Login Tracking & Restraints:** Log browser, OS, device, and IP address. Chrome requires email OTP to log in; Edge does not. Mobile logins restricted to 10:00 AM - 1:00 PM.

---

## 📖 Documentation & Presentation Standards
* Update `README.md`, `task.md`, and write `progress/day-x.md` logs after every completed day.
* Build StackSphere as a high-quality, maintainable prototype ready to present to an engineering review team.

# StackSphere System Architecture

This document describes the design and flow of the **StackSphere** community Q&A + social platform.

---

## 1. High-Level Architecture
StackSphere is built as a full-stack Next.js application using the App Router. The client-side (frontend) and server-side (backend APIs) are colocated in the same project codebase.

```text
[ Client (Browser) ]
       │
       ▼ (HTTP Requests / APIs / HTML)
[ Next.js Server (App Router & Serverless API Routes) ]
  ├── Middleware (Auth, Security, IP Logging, Time Restrictions)
  └── Services (Auth handler, Emailer, Payment, Upload storage)
       │
       ▼ (TCP connection via Mongoose)
[ MongoDB Database ]
```

---

## 2. Core Flows

### 2.1 Authentication Flow
* NextAuth.js or JWT-based authentication handles logins.
* **Security Middleware:** Detects browser type during login. Google Chrome triggers email OTP verification; Microsoft Edge bypasses OTP.

### 2.2 Social Space Flow
* Users publish posts (text, images, or videos).
* The backend enforces posting limits based on the user's friend count (queried from MongoDB).

### 2.3 Payments & Subscription Flow
* Users purchase plans (Bronze, Silver, Gold) via Stripe or Razorpay.
* **Time Restrictions:** Payments are allowed only between 10:00 AM and 11:00 AM IST. Webhooks verify success.
* Once verified, an invoice is generated and emailed to the user via SMTP/Nodemailer.

### 2.4 Reward Points Flow
* Points are automatically awarded or deducted based on actions (answering questions, receiving upvotes/downvotes).
* Point transfers between users are validated on the server side (users must have >10 points).

---

## 3. Deployment & Hosting
* **Frontend/Backend:** Hosted on Vercel for automatic deployment on Git pushes.
* **Database:** Hosted on MongoDB Atlas.
* **Media Assets:** Hosted on Cloudinary, AWS S3, or Supabase Storage.

# StackSphere User Flows

This document maps the user journeys for core operations inside StackSphere.

---

## 1. New User Registration & Onboarding Flow
```text
  [ Start: Landing Page ]
            │
            ▼
    [ Register Form ] ──► (Validate Email / Password strength)
            │
            ▼
   [ Account Creation ] ──► (Create MongoDB record & default settings)
            │
            ▼
    [ Login Screen ] ──► (Requires Chrome email OTP if using Google Chrome)
            │
            ▼
   [ Profile Onboarding ] ◄── (Optionally fill details / Profile photo)
```

---

## 2. Subscription Payment Flow
```text
  [ View Pricing Plans ]
            │
            ▼
    [ Select Plan ]
            │
            ▼
[ Gateway Checkout Form ] ◄── (Razorpay / Stripe integration)
            │
            ▼
  [ Webhook Verification ] ──► (Verify amount, status & time: 10AM-11AM IST)
            │
            ▼
 [ Subscription Active ] ◄── (Upgrade database state)
            │
            ▼
 [ Email Invoice Dispatch ] ──► (Automated PDF invoice sent to inbox)
```

---

## 3. Forgot Password Flow
```text
  [ Forgot Password Page ]
            │
            ▼
 [ Request Email/Phone ] ◄── (Check if already requested today)
            │
            ▼
    [ OTP Dispatch ]
            │
            ▼
  [ Generate Password ] ──► (Create random letter-only password)
            │
            ▼
 [ Save to Database ] ──► (User receives secure credential in mailbox)
```

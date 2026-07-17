# Day 34 Progress Log

**Day:** 34  
**Date:** July 17, 2026  

---

### 📝 Tasks Completed
* **Sensitive Field Hiding**: Applied `select: false` to all security-sensitive fields in the User Mongoose schema (`resetPasswordToken`, `resetPasswordExpires`, `verificationCode`, `verificationCodeExpires`, `lastForgotPasswordRequestedAt`) to prevent accidental exposure in API responses.
* **Explicit Field Selection**: Updated all auth API routes (`forgot-password`, `verify-code`, `reset-password`, `auth.ts authorize`) to explicitly `.select("+fieldName")` only the hidden fields they require.
* **Input Sanitization Coverage**: Extended sanitization and validation to the `forgot-password`, `verify-code`, and `reset-password` routes using the centralised validation utility.
* **Strict Password Validation on Reset**: Applied `validatePassword` (letters + numbers requirement) to the reset-password endpoint.
* **HTTP Security Headers**: Added `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, and `Permissions-Policy` security response headers to the authentication middleware.
* **Security Policy Documentation**: Expanded `docs/security-policy.md` with complete coverage of all implemented protections (field hiding, OTP challenges, headers, input sanitization, environment variable safety).
* **Test Fixes**: Updated reset password test to use passwords satisfying the new strict validation rules.

---

### 💻 Implementation Details
* **Mongoose `select: false`**: This ensures that hidden fields are never returned in standard queries (e.g., `User.findById()` for profile pages), protecting tokens and OTP codes from being leaked via API endpoints that don't need them.
* **Security Headers**: Applied via Next.js middleware on all protected routes. These headers defend against clickjacking, MIME sniffing, and XSS attacks in legacy browsers.

---

### ⏭️ Next Steps
* Day 35: Complete authentication module review.

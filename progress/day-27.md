# Day 27 Progress Log

**Day:** 27  
**Date:** July 8, 2026  

---

### 📝 Tasks Completed
* Extended `src/models/User.ts` database schema to support password recovery operations by adding `resetPasswordToken` and `resetPasswordExpires`.
* Implemented the forgot-password handler route at `src/app/api/auth/forgot-password/route.ts` (`POST /api/auth/forgot-password`):
  - Validates user email matches a database record.
  - Generates secure random hex token (32 bytes).
  - Configures 1-hour expiration timestamp.
  - Saves details to the user profile and exposes the token in payload.
* Implemented the reset-password handler route at `src/app/api/auth/reset-password/route.ts` (`POST /api/auth/reset-password`):
  - Validates credentials, token format, and token active status.
  - Rejects queries if token has expired or is invalid.
  - Encrypts updated credentials using `bcryptjs`.
  - Clears reset details on user profile upon success.
* Integrated integration tests directly into `src/app/api/test-auth/route.ts` verifying all recovery cases. Checked off **16 out of 16 tests passing**.
* Compiled and built the project cleanly via Next.js validation checks.

---

### 💻 Implementation Details
* **Cryptographic Tokens:** Using Node's standard `crypto.randomBytes(32).toString("hex")` generates values suitable for links without formatting concerns. Expiry dates are evaluated using `$gt: new Date()`.
* Pushed all updates to Git under the commit: *"Day 27: Implemented password reset API"*.

---

### ⏭️ Next Steps
* Day 28: Add email/phone verification flow.

# Day 51 Progress Log

**Day:** 51  
**Date:** July 31, 2026  

---

### 📝 Tasks Completed
* **Forgot Password Pure Letters Generator**: Updated `ForgotPasswordForm.tsx` password generator to output 12 purely alphabetical letters (uppercase/lowercase, no digits or special characters) and adjusted client-side validation rules.
* **Backend Reset Password Validation**: Modified `/api/auth/reset-password` API route to validate and accept letters-only passwords of length $\ge 6$.
* **Exact Friend Posting Limits**: Updated the post creation API route `/api/posts/create` to enforce:
  * 0 friends: blocked
  * 1 friend: 1 post/day
  * 2 to 10 friends: 2 posts/day
  * More than 10 friends (11 or more): unlimited posting
* **IST Mobile Login Restriction Timezone**: Configured timezone-resilient hour validation in `src/lib/auth.ts` to convert server local clock to Indian Standard Time (IST), protecting the 10:00 AM - 1:00 PM IST window.
* **E2E Test Updates**: Refactored `/api/test-auth` and `/api/test-social` E2E test scripts asserting correct letters-only resets, IST login hours, and the exact friend limits. All tests pass successfully.

---

### 💻 Implementation Details
* **IST Calculation:** Computes timezone offsets using `getTimezoneOffset()` and adds the `5.5 * 3600000` ms difference for IST.
* **Mongoose Friend Limit Check:** Friend-based limits count published documents relative to UTC midnight.

---

### ⏭️ Next Steps
* Day 52 — Create point transfer UI & search input.

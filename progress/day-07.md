# Day 7 Progress Log

**Day:** 7  
**Date:** June 18, 2026  

---

### 📝 Tasks Completed
* Created Mongoose schema and model at `src/models/LoginHistory.ts` to log user logins.
* Created a lightweight User-Agent header parser at `src/utils/userAgent.ts` to extract Browser, OS, and Device Type details.
* Modified the CredentialsProvider `authorize` logic in `src/lib/auth.ts` to extract client IP and User-Agent headers, forwarding them to the session.
* Implemented `signIn` callback in `src/lib/auth.ts` to automatically record a successful user authentication history event in MongoDB.
* Wrapped application structure inside `NextAuthSessionProvider` in `src/app/layout.tsx`.
* Refactored `src/components/common/Navbar.tsx` into a client component to show dynamic session user greeting, dashboard access, and sign-out controls.
* Developed the `/dashboard` page displaying real-time points, plan, and member since timestamp.
* Developed the `/login-history` security audit page with a device type indicator list and timestamp sorting.
* Ran and completed Next.js production build check.

---

### 💻 Implementation Details
* Structured model: `LoginHistory` includes `userId`, `email`, `ipAddress`, `userAgent`, `browser`, `os`, `deviceType`, and `loginTime` keys.
* Structured parsing: regular expression and substring matches to extract OS (macOS, Windows, iOS, Linux, Android), Browser (Chrome, Microsoft Edge, Safari, Firefox, Opera, Internet Explorer), and Device categories (Mobile, Tablet, Desktop).
* Session variables: JWT cookies are kept slim, carrying only base attributes (`id`, `email`, `name`). Detail querying is done live on server component pages.
* Pushed all updates to GitHub under the commit: *"Day 07: Implemented login tracking and session configuration"*.

---

### ⚠️ Challenges Faced
* TypeScript compile checks threw an error on `session.user` properties inside page components as NextAuth's default `session.user` schema lacks the `id` field.

---

### 💡 Solutions
* Refined the validation to check if both `session` and `session.user` are defined and safely cast `session.user` to `any` to allow standard compilation of `id` fields.

---

### ⏭️ Next Steps
* Day 8: Create the User Profile page and render user information.

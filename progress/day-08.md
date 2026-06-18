# Day 8 Progress Log

**Day:** 8  
**Date:** June 19, 2026  

---

### 📝 Tasks Completed
* Added `avatarUrl` to User Mongoose model (`src/models/User.ts`) to support future profile images.
* Implemented profile update API endpoint (`src/app/api/user/update/route.ts`) with authentication validation, data sanitation, and error handling.
* Created reusable `ProfileCard` server component (`src/components/profile/ProfileCard.tsx`) to display name initials avatar, plan, points, and account join date.
* Developed `EditProfileForm` client component (`src/components/profile/EditProfileForm.tsx`) for interactive profile updates.
* Created the main `/profile` route page (`src/app/profile/page.tsx`) server component integrating profile visual cards, edit controls, and activity placeholder panels.
* Performed production build check to ensure compiler compliance.

---

### 💻 Implementation Details
* **Server vs Client separation:** `/profile/page.tsx` is kept as a Server Component for direct Mongoose data queries, while `EditProfileForm.tsx` is implemented as a Client Component to handle React states, validation feedback, and fetch updates.
* **Initials Avatar:** Generates dynamic initials from the user's name and applies a character-derived gradient combination.
* **Activity Grid Placeholders:** Integrated cards for forum QA metrics, social posts, and login log redirection buttons.
* Pushed all updates to GitHub under the commit: *"Day 08: Implemented User Profile page and update API"*.

---

### ⚠️ Challenges Faced
* Accessing user fields dynamically requires casting standard NextAuth types to `any` to prevent compilation errors inside server components.

---

### 💡 Solutions
* Applied simple typescript type casting (`session.user as any`) to fetch variables like `id` and `phoneNumber` cleanly.

---

### ⏭️ Next Steps
* Day 9: Perform end-to-end testing on the authentication flow and resolve setup issues.

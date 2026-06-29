# Day 17 Progress Log

**Day:** 17  
**Date:** June 29, 2026  

---

### 📝 Tasks Completed
* Created the backend comment posting route `POST /api/comments/create` at `src/app/api/comments/create/route.ts` supporting session authentication, post validation, comments count increments, and populated author logs.
* Created the backend comment retrieval route `GET /api/comments` at `src/app/api/comments/route.ts` to chronologically load replies (oldest first) linked to specific post IDs.
* Modified the frontend `PostCard.tsx` client component to fetch comment threads upon toolbar button clicks, display replies in a scrollable container drawer, and compose/submit replies to the database while refreshing the UI feed.
* Documented post comment specs inside `docs/api-documentation.md`.
* Compiled and built the project cleanly via Next.js validation checks.

---

### 💻 Implementation Details
* **Thread Layout:** Employed sub-grid flex configurations in `PostCard.tsx` to display comment threads underneath the main post, matching profile name plan styles.
* **DB-to-UI Sync:** Hooked the creation endpoint to increment `Post.commentsCount` atomically in MongoDB, keeping client count badges aligned with real database entries.
* Pushed all updates to Git under the commit: *"Day 17: Added commenting system (post comments, display comment lists)"*.

---

### ⚠️ Challenges Faced
* Ensuring that comments are loaded only when the user chooses to expand the comment drawer (avoiding excessive initial server loads).

---

### 💡 Solutions
* Wired comments loading logic inside the expanding trigger callback (`handleCommentButtonClick`), initiating network queries only when `showComments` transitions to true and state arrays are empty.

---

### ⏭️ Next Steps
* Day 18: Add sharing functionality for posts.

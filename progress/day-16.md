# Day 16 Progress Log

**Day:** 16  
**Date:** June 28, 2026  

---

### 📝 Tasks Completed
* Created the backend endpoint `POST /api/posts/like` at `src/app/api/posts/like/route.ts` with NextAuth user authentication, post validation, and toggles (push/filter) for user ID arrays in the `likes` field.
* Integrated the like toggle function into the `PostCard.tsx` client component, modifying `handleLike` to run optimistic updates (instantly updating the button highlight state and incrementing/decrementing counts) and executing rollback routines on fetch errors.
* Documented `POST /api/posts/like` payload structures and return format properties in `docs/api-documentation.md`.
* Compiled and built the project cleanly via Next.js validation checks.

---

### 💻 Implementation Details
* **Optimistic Performance:** Configured the post liking interaction bar client-side to instantly visual-toggle states and counter states, avoiding wait delays during network latencies.
* **Array Atomic Sanitation:** Structured Mongoose document filters to add or filter out user ObjectId string mappings without leaving duplicate array references.
* Pushed all updates to Git under the commit: *"Day 16: Added like and unlike functionality to posts"*.

---

### ⚠️ Challenges Faced
* Ensuring that client UI rollbacks are triggered safely when the API encounters server errors.

---

### 💡 Solutions
* Saved the initial states (`liked` and `likesCount`) before starting the fetch request, restoring these variables inside a try-catch error block.

---

### ⏭️ Next Steps
* Day 17: Add commenting system (post comments, display comment lists).

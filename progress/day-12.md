# Day 12 Progress Log

**Day:** 12  
**Date:** June 23, 2026  

---

### 📝 Tasks Completed
* Created the backend endpoint `POST /api/posts/create` with user authorization validation (NextAuth session checks), payload sanitation, and Mongoose database insertion rules.
* Updated `src/app/social/page.tsx` server route to dynamically fetch existing posts from MongoDB on load, sorting by `createdAt` in descending order, populating the author user references, and passing them down as page props.
* Integrated frontend feed controller `src/components/social/SocialFeed.tsx` with the new endpoint, modifying page state transitions to make live POST requests when creating posts and dynamically prepending the database response to the active view list.
* Compiled and built the project cleanly via Next.js validation checks.

---

### 💻 Implementation Details
* **REST API Conventions:** Implemented a standard `POST` handler under `/api/posts/create` protecting endpoint entries from guest users and validating schemas before creation.
* **Component-Level Consistency:** Kept the visual mock-up posts as beautiful fallbacks in the case of empty database search results, ensuring high-fidelity presentation for both fresh test instances and active database logs.
* Pushed all updates to Git under the commit: *"Day 12: Implemented text-based post creation backend and frontend"*.

---

### ⚠️ Challenges Faced
* Ensuring that MongoDB document ObjectId references and nested subscription fields map cleanly to the TypeScript types expected by client presenter components.

---

### 💡 Solutions
* Conducted structured mapping routines within the server page component (`src/app/social/page.tsx`) to sanitize and serialize Mongo documents into clean JSON properties before passing them across the client boundary.

---

### ⏭️ Next Steps
* Day 13: Create image and video upload UI and handling.

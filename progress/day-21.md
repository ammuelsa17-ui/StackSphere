# Day 21 Progress Log

**Day:** 21  
**Date:** July 2, 2026  

---

### 📝 Tasks Completed
* Implemented daily posting restrictions in `src/app/api/posts/create/route.ts` based on active user friend count:
  - 0 friends: Blocked from posting (HTTP 403 Forbidden).
  - 1 friend: Restricted to 1 post per day maximum (HTTP 403 Forbidden).
  - 2 friends: Restricted to 2 posts per day maximum (HTTP 403 Forbidden).
  - 3+ friends: Restricted to 5 posts per day maximum (standard platform limit).
* Implemented backend upload restrictions in `src/app/api/uploads/route.ts` restricting Free plan users from uploading media (only Bronze, Silver, Gold plan subscribers can upload).
* Updated the `CreatePostCard.tsx` client component to intercept media attachment triggers (Image, Video, + Premium Photo) for Free plan users, rendering descriptive premium upgrade prompts.
* Connected `currentUser` down from `SocialFeed.tsx` to `CreatePostCard.tsx` to handle frontend plan evaluations.
* Compiled and built the project cleanly via Next.js validation checks.

---

### 💻 Implementation Details
* **Start-of-Day Calendar Limits:** Post counters evaluate database records using standard UTC day limits starting at `00:00:00.000 Z`.
* Pushed all updates to Git under the commit: *"Day 21: Implemented friend-based posting restrictions"*.

---

### ⏭️ Next Steps
* Day 22: Complete Phase 2 Review & prepare for Q&A System.

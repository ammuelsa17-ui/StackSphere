# Day 18 Progress Log

**Day:** 18  
**Date:** June 30, 2026  

---

### 📝 Tasks Completed
* Created the backend post share increment endpoint `POST /api/posts/share` at `src/app/api/posts/share/route.ts` which authorizes session cookies, validates post target IDs, and increments the database `sharesCount` atomically.
* Modified the frontend `PostCard.tsx` client component to capture share button click triggers:
  - Generates the post's deep-link URL: `${window.location.origin}/social/posts/${post.id}`.
  - Copies the link to the user's system clipboard using `navigator.clipboard.writeText(...)`.
  - Dispatches the API request to increment share metrics.
  - Renders a floating, bouncing tooltip overlay toast ("Link copied!") that fades out automatically after 2 seconds.
* Documented share API endpoints inside `docs/api-documentation.md`.
* Compiled and built the project cleanly via Next.js validation checks.

---

### 💻 Implementation Details
* **Micro-Animations:** Wired a relative container on the share button wrapper, placing an absolute-positioned bounding box with Tailwind/CSS bounce utilities to render the clipboard confirmation badge.
* **API Resiliency:** Structured client increment actions optimistically, restoring original count states if the update query rejects on the server.
* Pushed all updates to Git under the commit: *"Day 18: Added sharing functionality for posts"*.

---

### ⚠️ Challenges Faced
* Preventing layout shifts during absolute element toggles inside flex components.

---

### 💡 Solutions
* Absolute positioned the tooltip overlay (`absolute bottom-full left-1/2 -translate-x-1/2`) relative to the wrap container, avoiding any structural resizing inside the toolbar grid.

---

### ⏭️ Next Steps
* Day 19: Create friend request system (send, accept, reject requests).

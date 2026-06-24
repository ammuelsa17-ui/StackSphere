# Day 13 Progress Log

**Day:** 13  
**Date:** June 24, 2026  

---

### 📝 Tasks Completed
* Created the local uploads directory `public/uploads/` to hold user-submitted media files.
* Created the backend uploads endpoint `POST /api/uploads` at `src/app/api/uploads/route.ts` with NextAuth user validation, file size limits (5MB for images, 20MB for videos), and local storage saving.
* Updated `src/components/social/CreatePostCard.tsx` to handle real file inputs, initiate async POST uploads to `/api/uploads` upon file selection, display uploading progress feedback spinner/status, preview the resulting uploaded media URL, and disable form interactions while uploading.
* Compiled and built the project cleanly via Next.js validation checks.

---

### 💻 Implementation Details
* **Security & Payload Verification:** Implemented file type validations checking that files start with `image/` or `video/` and validating sizes against bounds before storage.
* **UX Feedback:** Introduced an `isUploading` state with visual spinners and descriptive text in the post creation card, giving immediate and detailed feedback during large media transfers.
* Pushed all updates to Git under the commit: *"Day 13: Created image and video upload UI and handling"*.

---

### ⚠️ Challenges Faced
* Preventing invalid file formats from triggering incomplete upload states on the client.

---

### 💡 Solutions
* Conducted validation checks both client-side and server-side, returning explicit validation errors (like unsupported format or oversized files) and resetting preview card states cleanly on failure.

---

### ⏭️ Next Steps
* Day 14: Connect media upload storage handling with the backend database.

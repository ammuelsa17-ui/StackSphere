# Day 14 Progress Log

**Day:** 14  
**Date:** June 25, 2026  

---

### 📝 Tasks Completed
* Created the Mongoose database schema model `Upload` at `src/models/Upload.ts` to represent uploaded file metadata records (uploader reference, filename, original name, type, size, url, and associated post reference).
* Modified `src/app/api/uploads/route.ts` to log file details to MongoDB in the `uploads` collection upon successful filesystem storage write.
* Updated `src/app/api/posts/create/route.ts` to search for uploaded media URLs owned by the current session author, and link the upload record to the newly created `Post` ID via `associatedPost` updates.
* Documented the new collection design and relationship linkages in the database design guide (`docs/database-design.md`).
* Verified error-free compilation of Next.js production builds.

---

### 💻 Implementation Details
* **Media Ownership Validation:** Hooked the post creation controller to query only the active user's upload logs, preventing malicious users from linking or hijacking other members' uploaded assets.
* **Metadata Normalization:** Populated the `associatedPost` field on database writes, bridging loose filesystem paths with specific, trackable posts inside the relational layout.
* Pushed all updates to Git under the commit: *"Day 14: Connected media upload storage handling with the backend database"*.

---

### ⚠️ Challenges Faced
* Preventing post creation database updates from raising errors if matching upload records do not exist (e.g. for mock files or external Unsplash image URLs).

---

### 💡 Solutions
* Implemented try-catch blocks inside the post creation API route during the upload record lookup. The database lookup fails gracefully without crashing the core post creation flow if a non-local URL is attached.

---

### ⏭️ Next Steps
* Day 15: Implement post feed retrieval API (retrieve posts in chronological order).

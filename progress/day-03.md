# Day 3 Progress Log

**Day:** 3  
**Date:** June 14, 2026  

---

### 📝 Tasks Completed
* Designed the database schemas for all major entities.
* Created Mongoose models:
  * `User` (Authentication credentials, phone number, points ledger, friends list, active subscription tier).
  * `Post` (Social space posts, author, content, media url, media type, likes).
  * `Comment` (Post replies with parent post reference, author, content).
  * `Subscription` (Subscription metadata).
  * `Transaction` (Payment details and checkout transaction logs).
  * `Reward` (Points transaction ledger for tracking point rewards and transfers).
* Verified Next.js build compilation.

---

### 💻 Implementation Details
* Implemented the schemas under `/src/models` using standard Mongoose syntax.
* Configured User model schema validation (email match regex, name trimming, hidden passwords using `select: false`).
* Resolved Next.js compile errors by verifying cache checks on compiling models: `mongoose.models.Model || mongoose.model('Model', Schema)`.
* Pushed all changes under the commit: *"Day 3: Designed database schemas and created Mongoose models"*.

---

### ⚠️ Challenges Faced
* Prevent re-compilation model errors when files hot-reload on the server.

---

### 💡 Solutions
* Leveraged Mongoose's cache object (`mongoose.models.ModelName || model(...)`) to ensure the serverless functions reuse the already-compiled models.

---

### ⏭️ Next Steps
* Day 4: Set up reusable UI layouts (Navbar, Sidebar, Layout components) in `src/components/common/`.

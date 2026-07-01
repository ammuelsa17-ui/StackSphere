# Day 19 Progress Log

**Day:** 19  
**Date:** July 1, 2026  

---

### 📝 Tasks Completed
* Created the `FriendRequest` Mongoose schema model at `src/models/FriendRequest.ts` including sender/receiver user pointers and pending/accepted/rejected state validation checks.
* Developed the user search API endpoint `GET /api/users/search` to find platform users, query MongoDB with regex searches, and annotate results with custom friendship state labels (`none`, `sent`, `received`, `friends`).
* Developed the send friend request API endpoint `POST /api/friends/request` enforcing rules to prevent self-requests, duplicate invites, or requests to existing friends.
* Compiled and built the project cleanly via Next.js validation checks.

---

### 💻 Implementation Details
* **Relationship Annotations:** Handled relationships server-side, fetching all active user request records in a single query and mapping relationship statuses before returning to the client (minimizing client-side calculations).
* Pushed all updates to Git under the commit: *"Day 19 & 20: Implemented friend request system and friend list management UI"*.

---

### ⏭️ Next Steps
* Day 20: Implement friend list management UI and backend.

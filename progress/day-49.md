# Day 49 Progress Log

**Day:** 49  
**Date:** July 31, 2026  

---

### 📝 Tasks Completed
* **Downvote Points Deduction**: Deducts **2 points** from answer author on answer downvotes inside `/api/answers/[id]/downvote`.
* **Removal Points Deduction**: Reverses original answer creation reward (**-5 points**) and upvote bonus (**-5 points**) on answer deletion inside `/api/answers/[id]/delete`.
* **Transaction logging**: Stores matching log records with `action: "answer_downvoted"` and `action: "answer_removed"`.

---

### 💻 Implementation Details
* **Balance Bounds Protection**: Points balance deduction calculations use `Math.max(0, points)` to prevent negative balances.

---

### ⏭️ Next Steps
* Day 50 — Create points dashboard UI on user profile.

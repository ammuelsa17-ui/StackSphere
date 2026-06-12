# StackSphere Feature Checklist

Every feature implemented must pass through this completion checklist before being merged to main or considered done.

---

## 📋 Feature Sign-off Checklist

- [ ] **Requirement Analysis:** Understand details, limits, and edge cases.
- [ ] **Database Setup:** Design models, verify fields, and create Mongoose schemas in `/models`.
- [ ] **Backend API:** Create the Next.js API route, write backend handler, and check endpoints.
- [ ] **Frontend UI:** Build components in `/components`, pages in `/app`, and implement loading and empty states.
- [ ] **Validation:** Enforce validation rules on both client and API handlers.
- [ ] **Error Handling:** Wrap logic in `try/catch`, return standard JSON responses, and display clean user-friendly alerts.
- [ ] **Responsive Design:** Verify the layouts adjust correctly on mobile, tablet, and desktop screens.
- [ ] **Testing:** Test edge cases (such as user having 0, 1, or 10+ friends for post limits).
- [ ] **Documentation:** Update API docs, database docs, `README.md`, and log the daily tracker entries.
- [ ] **Git Commit:** Code changes committed using standard git commit messages (`feat: ...`, `fix: ...`, `docs: ...`).

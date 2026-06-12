# StackSphere Development Guidelines

These guidelines are followed by the development team (including AI assistants) to ensure code quality, security, and maintainability.

---

## 1. Feature-by-Feature Development
We do not build the entire application at once. We follow this order:
1. Project setup
2. Database architecture
3. Authentication
4. User profiles
5. Social features
6. Question & answer system
7. Subscription system
8. Reward system
9. Language system
10. Security features
11. Testing
12. Deployment

Complete and test each module before moving to the next.

---

## 2. Code Quality Standards
* Use TypeScript strictly.
* Avoid using `any` unless absolutely necessary.
* Create reusable components and keep them small and maintainable.
* Use meaningful variable and function names.
* Add comments for complex business logic.
* Handle all errors properly (use try/catch, log errors, return user-friendly error codes).
* Add loading states, empty states, and success/error notifications.

---

## 3. UI/UX Instructions
Create a modern SaaS-style interface:
* Fully responsive design for mobile, tablet, and desktop.
* Clean dashboard layout with consistent spacing and typography.
* Smooth animations and accessible components.
* Use modern cards, modal dialogs, toast notifications, skeleton loading, and validation messages.

---

## 4. Database Instructions
* Design database relationships first.
* Example:
  ```
  User
   ├── Posts
   ├── Friends
   ├── Comments
   ├── Rewards
   ├── Subscription
   └── Login History
  ```
* Ensure proper indexing, data validation, secure queries, and avoid unnecessary DB roundtrips.

---

## 5. Security Instructions
* Hash all passwords using bcrypt.
* Sanitize user input to prevent XSS and SQL/NoSQL injection.
* Protect APIs with authentication middleware and authorization checks.
* Never expose API keys, DB credentials, or secret tokens.

---

## 6. Testing Instructions
Test every feature after completion:
* Normal user flow, invalid inputs, edge cases, and error handling.
* Example: For posting, test user with 0 friends, 1 friend, 10+ friends, and users exceeding daily posting limits.

---

## 7. Documentation Instructions
* Keep `README.md` updated with the project overview, features, installation, screenshots, tech stack, and future improvements.
* Update `task.md` after every completed day using the format:
  ```
  Day:
  Completed:
  Files Changed:
  Problems:
  Solutions:
  Next Task:
  ```

---

## 8. Git Instructions
Create commits regularly. Conventional commit format:
* `feat: Added user authentication system`
* `fix: Resolved upload validation issue`
* `docs: Updated project documentation`

---

## 9. AI Assistance Rules
* Explain what each major file does.
* Explain architecture decisions and dependencies.
* Mention possible improvements.
* Ask before making major architectural changes.

---

## 10. Final Deployment Requirements
* Production build check.
* Remove unused files.
* Environment setup guide in README.
* Demo video preparation, screenshots, and live deployment link.

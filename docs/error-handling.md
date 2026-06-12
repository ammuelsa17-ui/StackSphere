# StackSphere Error Handling Guidelines

This document details error handling guidelines to maintain code stability and user-friendly interface responses.

---

## 1. User Interface Feedback Rules
* **No Unhandled Crashes:** Always wrap layouts or critical sections in React Error Boundaries.
* **Informative Messages:** Instead of showing generic errors like `Error 500`, show clean responses:
  * *Example:* *"We are unable to complete your request. Please try again later."*
* **Active Loading States:** Provide spinners, skeletons, or disabled button states during network requests.
* **Toast Alerts:** Display toast notifications for both successes (e.g., *"Post published successfully!"*) and failures (e.g., *"Failed to publish post: missing content"*).

---

## 2. API Response Standard
Every API router response must return a consistent JSON payload:

### 2.1 Success Format
```json
{
  "success": true,
  "data": { ... }
}
```

### 2.2 Error Format
```json
{
  "success": false,
  "error": "Short readable error code",
  "message": "User-friendly description of what went wrong"
}
```
* Always log errors on the server console using standard logging for debugging.

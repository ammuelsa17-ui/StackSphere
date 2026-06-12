# StackSphere Development Progress Tracker

This file tracks the day-by-day progress of the **StackSphere** Q&A + Social platform project over the 60-day internship timeline.

---

## 📊 Summary
* **Current Day**: Day 2
* **Overall Progress**: 3.3% (2/60 Days Completed)
* **Status**: In Progress

---

## 📝 60-Day Checklist

### Phase 1: Project Setup & Architecture
- [x] **Day 1**: Create project folder, initialize Next.js with TS/Tailwind CSS, and set up basic environment.
- [x] **Day 2**: Setup Git repository, create folder structure, and add project roadmap/documentation.
- [ ] **Day 3**: Install backend dependencies and set up MongoDB connection.
- [ ] **Day 4**: Design database schemas and create User, Post, Comment, and Subscription models.
- [ ] **Day 5**: Setup reusable UI layout components (Navbar, Sidebar, Layout).
- [ ] **Day 6**: Configure auth structure and build Login/Registration UI pages.
- [ ] **Day 7**: Implement user registration API with validation and password encryption.
- [ ] **Day 8**: Implement login API and set up user session handling.
- [ ] **Day 9**: Create the User Profile page and render user information.
- [ ] **Day 10**: Perform end-to-end testing on the authentication flow and resolve setup issues.

### Phase 2: Social Space Development
- [ ] **Day 11**: Design social feed UI and create post card components.
- [ ] **Day 12**: Implement text-based post creation backend and frontend.
- [ ] **Day 13**: Create image and video upload UI and handling.
- [ ] **Day 14**: Connect media upload storage handling with the backend database.
- [ ] **Day 15**: Implement post feed retrieval API (retrieve posts in chronological order).
- [ ] **Day 16**: Add like and unlike functionality to posts.
- [ ] **Day 17**: Add commenting system (post comments, display comment lists).
- [ ] **Day 18**: Add sharing functionality for posts.
- [ ] **Day 19**: Create friend request system (send, accept, reject requests).
- [ ] **Day 20**: Implement friend list management UI and backend.
- [ ] **Day 21**: Implement friend-based posting restrictions:
  - 0 friends: Cannot post.
  - 1 friend: Post once per day.
  - 2 friends: Post twice per day.
  - 10+ friends: Post without restrictions.
- [ ] **Day 22**: Test social features.
- [ ] **Day 23**: Improve responsiveness of social space layouts.
- [ ] **Day 24**: Optimize API response times and payloads.
- [ ] **Day 25**: Perform bug fixes and code cleanup for the social space.

### Phase 3: Password Recovery & Security
- [ ] **Day 26**: Create Forgot Password page UI.
- [ ] **Day 27**: Implement password reset API.
- [ ] **Day 28**: Add email/phone verification flow.
- [ ] **Day 29**: Create custom random password generator (letters only).
- [ ] **Day 30**: Add limitation: only one reset request per day.
- [ ] **Day 31**: Test password recovery workflow.
- [ ] **Day 32**: Enhance authentication security measures.
- [ ] **Day 33**: Add strict input validation rules.
- [ ] **Day 34**: Clean up security issues.
- [ ] **Day 35**: Complete authentication module review.

### Phase 4: Subscription & Payment System
- [ ] **Day 36**: Create subscription plans UI (Free, Bronze, Silver, Gold).
- [ ] **Day 37**: Integrate Stripe or Razorpay developer libraries.
- [ ] **Day 38**: Implement payment checkout flow.
- [ ] **Day 39**: Create payment verification webhook/endpoint.
- [ ] **Day 40**: Manage active subscription states on the User model.
- [ ] **Day 41**: Enforce subscription-based question limits:
  - Free: 1 question/day
  - Bronze: 5 questions/day
  - Silver: 10 questions/day
  - Gold: Unlimited questions
- [ ] **Day 42**: Add automated PDF invoice/receipt generation.
- [ ] **Day 43**: Integrate email delivery for sending purchase receipts.
- [ ] **Day 44**: Implement payment time restriction (Payments allowed only 10:00 AM - 11:00 AM IST).
- [ ] **Day 45**: Run tests on the payment workflow.

### Phase 5: Reward System
- [ ] **Day 46**: Add points field to User model.
- [ ] **Day 47**: Implement answer reward logic (+5 points per answer).
- [ ] **Day 48**: Add upvote reward logic (+5 points when answer hits 5 upvotes).
- [ ] **Day 49**: Add downvote/removal points deduction logic.
- [ ] **Day 50**: Create points dashboard UI on user profile.
- [ ] **Day 51**: Create point transfer UI & search input.
- [ ] **Day 52**: Enforce transfer restriction (Sender must have > 10 points).

### Phase 6: Multi-language System
- [ ] **Day 53**: Setup i18next/localization setup.
- [ ] **Day 54**: Create language switcher dropdown in header.
- [ ] **Day 55**: Create translations for English, Spanish, Hindi, Portuguese, Chinese, French.
- [ ] **Day 56**: Add OTP switching verification (French = Email OTP; Others = Mobile OTP).
- [ ] **Day 57**: Run tests on multi-language switching.

### Phase 7: Login Tracking & Final Security
- [ ] **Day 58**: Add login tracking (log Browser, OS, Device type, IP Address in user history).
- [ ] **Day 59**: Enforce authentication restrictions:
  - Chrome: Email OTP verification required.
  - Microsoft Edge/IE: Login directly without OTP.
  - Mobile: Logins restricted to 10:00 AM - 1:00 PM.

### Phase 8: Final Testing & Deployment
- [ ] **Day 60**: Run full end-to-end testing, clear bugs, write final documentation, deploy, and submit.

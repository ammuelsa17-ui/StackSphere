# StackSphere – Community Q&A + Social Platform

StackSphere is a Full Stack Web Development project built for the ElevanceSkills Internship. It is a modern clone of Stack Overflow with integrated community and social features.

---

## 🛠 Technology Stack (Beginner-Friendly)
* **Frontend (User Interface)**: React.js with Next.js (App Router)
* **Styling (Design)**: Tailwind CSS (for responsive styling)
* **Backend (Server & APIs)**: Next.js API Routes (Serverless Functions)
* **Database**: MongoDB (via Mongoose for data models)
* **Payments**: Razorpay or Stripe (for subscription plans)
* **Icons**: Lucide React (for UI icons)

---

## 📅 60-Day Full Stack Development Plan

### Phase 1: Project Setup & Architecture
* **Day 1**: Create project folder. Initialize Next.js project with TypeScript and Tailwind CSS. Configure basic development environment. *(Completed)*
* **Day 2**: Setup Git repository. Create professional folder structure. Configure environment variables. *(Completed)*
* **Day 3**: Install required dependencies. Setup MongoDB connection. Create database configuration files.
* **Day 4**: Design database architecture. Create User, Post, Comment, Subscription models.
* **Day 5**: Setup reusable UI components. Create Navbar, Sidebar, Layout components.
* **Day 6**: Configure authentication structure. Create login and registration pages.
* **Day 7**: Implement user registration API. Add password encryption and validation.
* **Day 8**: Implement login functionality. Setup user sessions.
* **Day 9**: Create user profile page. Add profile information display.
* **Day 10**: Test authentication flow. Fix setup-related issues.

### Phase 2: Social Space Development
* **Day 11**: Design social feed UI. Create post card components.
* **Day 12**: Implement post creation feature. Add text-based posts.
* **Day 13**: Create image/video upload functionality.
* **Day 14**: Connect media storage with backend.
* **Day 15**: Implement post feed retrieval API.
* **Day 16**: Add like functionality.
* **Day 17**: Add commenting system.
* **Day 18**: Add sharing functionality.
* **Day 19**: Create friend request system.
* **Day 20**: Implement friend list management.
* **Day 21**: Add friend-based posting restrictions (0 friends: no post; 1 friend: 1 post/day; 2 friends: 2 posts/day; 10+ friends: unlimited).
* **Day 22**: Test social features.
* **Day 23**: Improve social UI responsiveness.
* **Day 24**: Optimize API responses.
* **Day 25**: Fix social module bugs.

### Phase 3: Password Recovery & Security
* **Day 26**: Create Forgot Password page.
* **Day 27**: Implement password reset API.
* **Day 28**: Add email/phone verification.
* **Day 29**: Create random password generator.
* **Day 30**: Add daily password reset restriction.
* **Day 31**: Test password recovery flow.
* **Day 32**: Improve authentication security.
* **Day 33**: Add input validation.
* **Day 34**: Fix security issues.
* **Day 35**: Complete authentication module review.

### Phase 4: Subscription & Payment System
* **Day 36**: Create subscription plans UI (Free, Bronze, Silver, Gold).
* **Day 37**: Setup Razorpay/Stripe integration.
* **Day 38**: Implement payment checkout.
* **Day 39**: Create payment verification system.
* **Day 40**: Add subscription status management.
* **Day 41**: Implement question posting limits.
* **Day 42**: Add invoice generation.
* **Day 43**: Add email receipt system.
* **Day 44**: Add payment time restriction (10 AM - 11 AM IST).
* **Day 45**: Test payment workflow.

### Phase 5: Reward System
* **Day 46**: Add points field to User model.
* **Day 47**: Implement answer reward system (+5 points per answer).
* **Day 48**: Add upvote reward logic (5 upvotes = +5 points).
* **Day 49**: Add downvote/removal deduction logic.
* **Day 50**: Create points dashboard.
* **Day 51**: Create point transfer feature.
* **Day 52**: Add transfer restrictions (Only users with >10 points).

### Phase 6: Multi-language System
* **Day 53**: Setup i18next/localization.
* **Day 54**: Add language switcher.
* **Day 55**: Add translations (English, Spanish, Hindi, Portuguese, Chinese, French).
* **Day 56**: Add OTP verification for language changes.
* **Day 57**: Test multilingual system.

### Phase 7: Login Tracking & Final Security
* **Day 58**: Add login history tracking (Browser, OS, Device, IP Address).
* **Day 59**: Implement device-based authentication rules (Chrome: email OTP; Microsoft Edge/IE: no OTP; Mobile: 10 AM - 1 PM access only).

### Phase 8: Final Testing & Deployment
* **Day 60**: Complete end-to-end testing, fix bugs, deploy application, and submit the final project.

---

## 🚀 How to Run the Project Locally
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

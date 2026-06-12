# StackSphere Deployment Checklist

Follow this checklist prior to pushing the production build live on Vercel or Netlify.

---

## 🚀 Pre-Deployment Verification

### 1. Build Verification
- [ ] Run production build locally (`npm run build`) and verify it completes without errors or TypeScript warnings.
- [ ] Check console warnings and eliminate any unused imports or variables.

### 2. Environment Variables Configured
- [ ] Ensure all key configurations in `.env.example` are set up in the Vercel project settings (e.g., `MONGODB_URI`, `NEXTAUTH_SECRET`, Stripe/Razorpay keys, email SMTP credentials).
- [ ] Double-check that no private files (such as `.env` or `.env.local`) are tracked or pushed to the GitHub repository.

### 3. Database Connection
- [ ] Verify production MongoDB Atlas connection.
- [ ] Verify IP whitelist settings in MongoDB Atlas (allow access from anywhere or configure serverless integrations).

### 4. Integration Verification
- [ ] Test User Authentication in the production domain.
- [ ] Run a test payment check (use Stripe/Razorpay sandbox keys).
- [ ] Ensure the email delivery system (invoice SMTP server) is successfully connected.

### 5. UI/UX Verification
- [ ] Perform a mobile-responsiveness pass (check layout on iPhone, Android, and Tablet views).
- [ ] Verify all error boundary pages (like a custom `404` or `500` page) render correctly and elegantly.

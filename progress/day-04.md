# Day 4 Progress Log

**Day:** 4  
**Date:** June 15, 2026  

---

### 📝 Tasks Completed
* Setup reusable UI layout components (Navbar, Sidebar, Footer) inside `/src/components/common/`.
* Updated the main Next.js layout (`src/app/layout.tsx`) to globally render the Navbar and Sidebar.
* Enabled fully responsive views (mobile/tablet/desktop layouts).
* Verified page layouts and built the project without any compilation warnings.

---

### 💻 Implementation Details
* Developed the **Navbar** (`Navbar.tsx`) containing logo routing, explore Globe, and mock authentication links.
* Developed the **Sidebar** (`Sidebar.tsx`) housing navigation links to future routes (Home, Forum, Social Feed, Subscription, Login History, Settings).
* Developed the **Footer** (`Footer.tsx`) with copyright branding and secondary links.
* Refactored the core Next.js root layout wrapper (`layout.tsx`) to implement the master layout grid layout.
* Pushed all updates to GitHub under the commit: *"Day 04: Added reusable layout UI components and root wrapper"*.

---

### ⚠️ Challenges Faced
* Preventing left and right navigation layouts from overlapping the content column on mobile/tablet screen widths.

---

### 💡 Solutions
* Leveraged Tailwind CSS breakpoints (`hidden md:block`, `md:pl-64`, etc.) to dynamically slide/collapse navigation panels and stack columns vertically on smaller screens.

---

### ⏭️ Next Steps
* Day 5: Configure authentication structure and build Login/Registration UI pages.

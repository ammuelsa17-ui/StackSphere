# StackSphere UI Guidelines

This document details the UI styling guidelines for maintaining visual consistency across screen sizes.

---

## 1. Visual Aesthetics & Design System
We follow a modern, professional SaaS-style dark/light interface:
* **Primary Color Palette:** Tailored HSL theme colors (Sleek slate dark colors with indigo highlights).
* **Typography:** Outfit / Inter font sizes.
* **Layout Structure:** Clean dashboard design containing consistent sidebars, side panels, and central feeds.

---

## 2. Responsive Breakpoints
* **Mobile (up to 768px):** Hide the left and right sidebars. Re-align pages as single columns. Convert Navbar into a clean mobile layout with a hamburger menu dropdown.
* **Tablet (768px - 1024px):** Render the left sidebar (icon/compact mode) and hide the right sidebar. Feed page is a single column.
* **Desktop (1024px+):** Render the full left navigation panel, central feed, and right recommendation/widgets sidebars.

---

## 3. Reusable Component Conventions
* **Cards:** Use rounded card containers (`rounded-xl` or `rounded-2xl`) with subtle hover transitions and shadows.
* **Modals:** Center modal dialog overlays with smooth transition animations. Include a background blur (`backdrop-blur-sm`).
* **Skeletons:** Provide clean gray placeholder skeletons when components load data asynchronously.

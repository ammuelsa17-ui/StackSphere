# StackSphere Accessibility Guidelines

To ensure the platform is usable by all individuals, we adhere to basic Web Content Accessibility Guidelines (WCAG).

---

## 1. Semantics & HTML Elements
* Always use native HTML5 semantic tags (e.g. `<header>`, `<main>`, `<nav>`, `<footer>`, `<section>`, `<article>`) instead of using only generic `<div>` wrappers.
* Ensure headings follow a logical order (`<h1>` for main title, followed by `<h2>`, `<h3>` etc.). Never skip heading levels.

---

## 2. Keyboard Navigation
* All interactive items (links, buttons, form inputs, pricing cards) must be focusable using keyboard navigation (`Tab` keys).
* Interactive items must render a clear visual focus ring highlight (`focus-visible:ring-2` in Tailwind) when active.

---

## 3. Alt Text & Aria Labels
* All images and uploads must contain descriptive `alt` tags.
* Reusable components (like icons, theme selectors, or close buttons) should use `aria-label` to provide context for screen readers.

---

## 4. Forms & Inputs
* Every form input must have a corresponding `<label>` tag or an explicit `id` and `htmlFor` connection.
* Display validation error messages clearly with text description (never rely only on color codes).

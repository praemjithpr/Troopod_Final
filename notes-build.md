# Purelane Shopify Conversion — Build Notes

## Submission Quick Reference
- **Subject**: `AI Product Engineer Assignment - [Your Name]`
- **Recipient**: `nj@troopod.io`
- **Dev Store URL**: `[Insert Store URL, e.g. https://purelane-demo.myshopify.com]`
- **Dev Store Storefront Password**: `[Insert Storefront Password]`
- **GitHub Repository**: `https://github.com/praemjithpr/Troopod_Final`
- **Metafield Definitions**: Included in [`metafields-schema.json`](file:///c:/Users/PRAEMJITH%20P%20R/Downloads/Tropod/metafields-schema.json)
- **Seed Products Data**: Included in [`products-seed-data.json`](file:///c:/Users/PRAEMJITH%20P%20R/Downloads/Tropod/products-seed-data.json)

---

## 1. Prototype Code Audit (What Was Flagged)

While `purelane-homepage.html` is visually striking with dynamic water caustics, glassmorphism gradients, and smooth scroll reveals, it possessed critical flaws that prevented it from running on production Shopify:

- **Hardcoded Content & Hardcoded Asset Paths**: Product names, pricing, review counts, discount tags, and product images were hardcoded strings or embedded inline SVG/data-URI strings. A merchant's marketing team could not modify catalog details without developer intervention.
- **Monolithic Scripting**: All interactive components (hero stage slider, reviews marquee, scroll observer, mousemove parallax) were lumped into a single inline IIFE script. When sections are added, removed, or reordered in the Shopify Theme Editor (`shopify:section:load`), monolithic scripts break because DOM elements disappear and re-render dynamically.
- **Accessibility & Keyboard Gaps**: Interactive elements lacked semantic HTML structures, keyboard focus indicators were broken on glass cards, and animations failed to observe user preferences (`prefers-reduced-motion: reduce`).
- **Mobile Responsive Breakpoints**: Horizontal rails (`#combos` and `#shop`) suffered from overflow layout shifts on 375px screens due to fixed pixel width cards (`width: 302px`, `width: 284px`) without fluid aspect-ratio constraints.

---

## 2. Technical Decisions & Code Refactoring

### A. Architecture & Section Framing (Shopify Dawn Compliance)
- **Modular Sections**: Converted the prototype into 5 core Liquid sections (`purelane-hero.liquid`, `purelane-shop.liquid`, `purelane-combos.liquid`, `purelane-bundles.liquid`, `purelane-reviews.liquid`) plus 9 supporting sections (`purelane-ingredients`, `purelane-proof`, `purelane-pillars`, etc.).
- **Flexible Schema & Presets**: Every section includes full JSON schema settings (headings, subheadings, CTA buttons, collection pickers) and block presets so non-technical marketers can customize content from the Shopify Theme Editor.

### B. Dynamic Product Integration & Edge Cases
- **Reusable Card Snippet (`purelane-card-product.liquid`)**: Built a modular product card snippet that integrates with native Liquid `product` objects while gracefully handling edge cases:
  1. **Sold Out Products**: Evaluates `card_product.available`. Automatically renders a "Sold out" pill badge and disables the Add to Cart button.
  2. **Products Without Images**: Automatically renders a clean, styled SVG bottle fallback if `card_product.featured_media` is null.
  3. **Very Long Titles**: Implements line-clamping (`-webkit-line-clamp: 2`) with standard height containment so long titles never distort card alignment or break grid layouts.
  4. **AJAX Cart Integration**: Uses standard Shopify cart form inputs (`name="id"`, `type="submit"`) for seamless drawer cart compatibility.

### C. JS Engine & Theme Editor Resiliency (`purelane-theme.js`)
- Refactored JS interactions into a re-initializable engine attached to `DOMContentLoaded` and Shopify Theme Editor events:
  ```javascript
  document.addEventListener('shopify:section:load', function (e) {
    initPurelaneEngine(e.target);
  });
  ```
- **Accessibility**: Added full `prefers-reduced-motion` detection that pauses caustics, marquee loops, and hero stage transitions for users who request reduced motion.

---

## 3. What I Would Do With More Time

1. **Metaobject-Driven Custom Bundle Builder**: Build a full reactive AJAX Bundle Builder drawer allowing customers to pick any 2, 3, or 5 products with live price calculation and automated Shopify bundle discount application.
2. **WebP Image Asset Pipeline**: Convert inline data URIs and raw PNGs into responsive WebP images served directly from Shopify's CDN (`image_url: width: ...`) with explicit `srcset` sizes for optimized Core Web Vitals (LCP < 1.2s).
3. **Automated E2E Playwright Suite**: Implement cross-browser test automation verifying responsive breakpoint layouts down to 320px and testing AJAX cart additions.

---

## 4. AI Workflow Reflection & Systematization

### A. What Was Delegated
* **Scaffolding & File Conversions**: Migrating pure CSS rules and static HTML sections into standard Shopify template and sections liquid structure.
* **Shopify Settings Schemas**: Drafting dynamic block models, options, and default preset definitions in the JSON schema fields of each section.
* **Database Seed Generation**: Compiling the `products-seed-data.json` array containing diverse testing edge-cases (out-of-stock items, missing thumbnails, extremely long titles).

### B. Where the AI Failed & Where I Caught It
* **Multi-Style Tag Extraction**: The initial CSS extractor regex parsed only the first `<style>` tag, missing the second override stylesheet block containing the official light-mode brand colors. This rendered the store in a dark purple template. I identified this by searching for style tags in the raw prototype and merged both stylesheets together to restore the correct sunlit pale-mint/lavender theme.
* **Naming Case Discrepancy**: The custom Shopify cart drawer was originally unstyled and static due to a mismatch between camelCase element IDs (`purelaneCartDrawer`) in Liquid and kebab-case queries (`purelane-cart-drawer`) in JavaScript. I caught this by inspecting the DOM, matching the IDs, and updating the JS script to run properly.
* **Shopify Schema Validation Warnings**: Pushing empty default text strings (`"default": ""`) on text inputs generated compiler errors during Shopify CLI syncing. I resolved this by removing the optional `"default"` parameters entirely to satisfy Shopify's schema validator.

### C. What I Would Systematize Next Time
* **Pre-Compilation Parsing Pipeline**: Standardize a script that automatically concatenates all CSS/JS tags from static mockups before starting theme generation to prevent missing style assets.
* **Unified ID Mapping Schema**: Maintain a strict naming dictionary for all custom elements, classes, and IDs (e.g., lowercase kebab-case for all layouts) to enforce 100% agreement between CSS, JS, and HTML layers.
* **Pre-Flight Theme Checker**: Integrate the `@shopify/theme-check` CLI utility directly into the local environment to catch schema discrepancies and liquid syntax errors before running remote pushes.

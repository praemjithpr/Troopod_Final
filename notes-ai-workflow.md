# Purelane Shopify Conversion — AI Workflow Notes

## 1. What Was Delegated to AI

- **Design Token & CSS Extraction**: Delegated parsing of the raw 151KB `purelane-homepage.html` to extract typography rules, HSL/HEX color custom properties (`--ink`, `--paper`, `--brand`, `--accent`), glassmorphism backdrop filters, and media query breakpoints (375px, 600px, 760px, 900px, 1024px, 1180px).
- **Liquid Section & Schema Generation**: Delegated structural conversion of raw HTML sections into Shopify Liquid sections with complete schema JSON objects (settings, blocks, presets).
- **SVG & Asset Extraction**: Delegated extraction and modularization of complex inline SVG assets (water caustics, botanical ingredient line art, trust badges) into clean Liquid snippets (`purelane-scenes.liquid`, `purelane-card-product.liquid`).

---

## 2. Failure Points & Human-in-the-Loop Interventions

1. **SVG Gradient ID Collisions in Repeatable Snippets**:
   - *Failure*: When rendering multiple product cards on the same page using SVG fallbacks, AI generated static gradient IDs (`id="gTAPb"`). Because IDs were identical across cards, SVG gradients cross-referenced and rendered incorrectly.
   - *Correction*: Refactored SVG gradient IDs to use dynamic product IDs (`id="gPureb_{{ card_product.id | default: 'fallback' }}"`).
2. **Shopify Theme Editor Event Unbinding**:
   - *Failure*: Naïve AI-generated JS initialized animations only on window load. Re-ordering or updating sections in Shopify Theme Editor destroyed event listeners and stopped sliders/marquees.
   - *Correction*: Re-architected JS engine to hook into `shopify:section:load` and `shopify:section:select` lifecycle events.
3. **Liquid Schema String Escaping**:
   - *Failure*: AI generated default JSON schema values containing unescaped double quotes and raw HTML string breaks.
   - *Correction*: Sanitized schema defaults and ensured strict valid JSON structures across all `.liquid` sections.

---

## 3. Systematizing for 20+ Client Projects

If scaling this delivery model to 20+ DTC brand migrations per month, I would establish the following automation infrastructure:

1. **AST-Based HTML to Liquid Converter CLI**: Build a CLI utility (Node.js/AST parser) that ingests raw HTML prototypes, identifies repeated DOM nodes, extracts CSS custom properties, and generates Liquid section schemas automatically.
2. **Shopify Dev Store Provisioning Script**: A automated script utilizing Shopify Admin API / GraphQL to instantly seed new client dev stores with standard product edge cases (sold out, no image, long title), custom metafield definitions, and collection hierarchies in seconds.
3. **Purelane Component Library**: Package recurring UI patterns (Glassmorphism containers, SVG marquee rails, tiered bundle pickers) into a reusable Shopify theme extension library.

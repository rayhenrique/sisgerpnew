# SISGERP Landing Page — Page Design Specs (Desktop-first)

## Global Styles
- Layout: Flexbox for alignment; CSS Grid for feature/footers; container-centered sections.
- Breakpoints (Tailwind defaults): base/mobile, `md`, `lg`, `xl`.
- Container: `max-w-6xl` (or `max-w-7xl`) with `px-4 md:px-6 lg:px-8`.
- Typography: Inter/system-ui; H1 ~40–56px desktop (`text-4xl lg:text-6xl`), body 16–18px.
- Color tokens (suggested, mapped to Tailwind CSS variables):
  - Background: `bg-background`, Surface: `bg-card`, Text: `text-foreground`, Muted: `text-muted-foreground`
  - Primary CTA: `bg-primary text-primary-foreground` + hover `hover:bg-primary/90`
  - Borders: `border-border`, Focus ring: `focus-visible:ring-ring`
- Components: Prefer shadcn/ui primitives (Button, Sheet, Separator) + Lucide icons.

## Landing Page (/)

### Meta Information
- Title: SISGERP — Modern management for your operations
- Description: SISGERP helps you organize workflows with clarity and speed.
- Open Graph: `og:title`, `og:description`, `og:type=website`

### Page Structure
1. Navbar (sticky)
2. Hero (with angled bottom edge)
3. Features (card grid)
4. Benefits (split section)
5. CTA band
6. Footer

### 1) Navbar (Sticky)
- Layout: `sticky top-0 z-50` with subtle border + translucent background (`bg-background/80 backdrop-blur`).
- Left: Logo mark + “SISGERP” wordmark.
- Center/right (desktop `lg`): horizontal links to `#features`, `#benefits`, `#cta`.
- Right: primary Button (CTA) + optional secondary ghost Button.
- Mobile (`<lg`): hamburger IconButton opens shadcn `Sheet` from right; Sheet contains same links + CTA.
- States: active/hover link underline; keyboard focus rings; Sheet closes on link click.

### 2) Hero (Angled Edge)
- Layout: two-column at `lg` (left text, right visual); stacked on mobile.
- Content:
  - H1 headline (clear value prop)
  - Supporting paragraph (1–2 lines)
  - CTA row: Primary Button + Secondary Button (outline)
  - Optional “Highlights” mini-row (3 items max) using Lucide icons
- Angled bottom edge (visual requirement):
  - Use an absolutely-positioned decorative element at the hero bottom (e.g., SVG polygon or `clip-path`) to create a diagonal/angled cut; ensure it does not overlap text.
  - Maintain contrast and readability; decorative layer should be `aria-hidden`.

### 3) Features Section (#features)
- Layout: responsive Grid: 1 col (mobile) → 2 cols (`md`) → 3 cols (`lg`).
- Each feature card:
  - Lucide icon in a subtle icon container
  - Feature title
  - 1–2 line description
  - Optional small “Learn more” text link (no extra route required; can be omitted)

### 4) Benefits Section (#benefits)
- Layout: split section at `lg` (text left, supporting visual right); stacked on mobile.
- Text block:
  - Section heading + short intro
  - Bullet list (3–6 bullets) with check icons (Lucide)
- Visual block:
  - Placeholder illustration area (card with gradient, or screenshot placeholder) sized to keep layout balanced.

### 5) CTA Section (#cta)
- Layout: full-width band with container-centered content; card-like surface.
- Content:
  - Short headline + reassurance copy
  - Primary Button (single, highly prominent)
- Behavior: CTA button links to configured destination (placeholder allowed in draft).

### 6) Footer
- Layout: Grid: 1 col (mobile) → 2–4 cols (desktop) depending on content.
- Content:
  - Brand + one-line descriptor
  - Section links повтор (Features/Benefits/CTA)
  - Copyright line
- Styling: top border, muted text, comfortable vertical padding.

### Accessibility & Responsiveness
- Use semantic headings (H1 once; H2 per section), `nav` landmark, and skip-to-content link.
- Maintain minimum tap targets (44px), visible focus states, and adequate contrast.
- Ensure hero angle does not cause layout shift; test at `320px` width and large desktop.

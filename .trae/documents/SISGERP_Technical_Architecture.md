## 1.Architecture design
```mermaid
graph TD
  A["User Browser"] --> B["React Frontend Application"]
  B --> C["UI Layer (Tailwind + shadcn/ui + Lucide)"]

  subgraph "Frontend Layer"
    B
    C
  end
```

## 2.Technology Description
- Frontend: React@18 + TypeScript + Next.js (App Router)
- UI/Styling: tailwindcss@3 + shadcn/ui + lucide-react
- Backend: None (static marketing landing page)

## 3.Route definitions
| Route | Purpose |
|-------|---------|
| / | Landing page (navbar + hero with angled edge + features + benefits + CTA + footer) |

Notes:
- Section navigation uses hash anchors (e.g., /#features, /#benefits, /#cta) rather than separate routes.

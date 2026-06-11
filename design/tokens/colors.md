# Color tokens — Yango Deli Internal Platform

Source of truth for color decisions. Maps semantic roles to the Yango Deli brand
(see `Yango_Deli_Design_Language_Guide.md`). Reserve the brand yellow for primary
actions, active states, and key highlights — never for generic decoration
(60-30-10: ~60% neutral surface, ~30% structure/neutral, ~10% brand accent).

## Semantic roles

| Token | Light value | Usage |
|-------|-------------|-------|
| `color-bg-surface` | `#FFFFFF` | Default surface / cards |
| `color-bg-subtle` | `#F5F5F7` | Grouped content, page background, kanban columns |
| `color-fg-default` | `#0F1115` | Primary text (near-black) |
| `color-fg-muted` | `#6B7280` | Secondary text, metadata |
| `color-accent-primary` | `#FFCC00` | Primary CTA, active nav, key highlights |
| `color-accent-primary-hover` | `#E6B800` | Hover for primary |
| `color-accent-on` | `#0F1115` | Text/icon on yellow (dark for AA contrast) |
| `color-border-subtle` | `#E5E7EB` | Neutral borders, dividers |
| `color-border-critical` | `#EF4444` | Destructive actions, error borders |
| `color-success` | `#16A34A` | Success / hired |
| `color-warning` | `#F59E0B` | Warning / on-hold |
| `color-info` | `#3B82F6` | Info |

## Recruitment stage colors

Stage badges are semantic, not rainbow decoration (see `STAGE_COLORS` in
`frontend/src/types/recruitment.ts`):

`new`=gray · `contacted`=blue · `screening`=yellow · `interview_scheduled`=orange ·
`interview_done`=purple · `offer_sent`=teal · `hired`=green · `rejected`=red ·
`irrelevant`=slate · `on_hold`=amber

## Rules

- Brand yellow `#FFCC00` always pairs with near-black text/icons for WCAG AA contrast.
- Never convey state by color alone — pair with label, icon, or shape.
- No auto-generated gradients or per-component novel shadows; use the subtle token shadow.

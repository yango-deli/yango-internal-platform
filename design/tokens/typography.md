# Typography tokens — Yango Deli Internal Platform

Clean sans-serif (Inter) with strong weight contrast between headings and body.
1.25 ratio scale; body text minimum 14px (prefer 16px). Supports HE (RTL), EN, RU.

| Role | Size / line-height | Tailwind | Weight |
|------|--------------------|----------|--------|
| `heading-xl` | 30 / 36 | `text-3xl` | `font-bold` |
| `heading-l` | 24 / 32 | `text-2xl` | `font-semibold` |
| `heading-m` | 20 / 28 | `text-xl` | `font-semibold` |
| `heading-s` | 16 / 24 | `text-base` | `font-semibold` |
| `body` | 14 / 20 | `text-sm` | `font-normal` |
| `body-lg` | 16 / 24 | `text-base` | `font-normal` |
| `caption` | 12 / 16 | `text-xs` | `font-medium` |

## Rules

- One `h1` per page; keep a strict h1 → h2 → h3 order.
- Prices/numbers prominent; use the `₪` symbol where money is shown (per brand guide).
- Avoid truncating important info; if unavoidable, reveal full content via tooltip/detail.
- RTL: use logical properties (`ms-*`, `me-*`, `start/end`) instead of left/right.

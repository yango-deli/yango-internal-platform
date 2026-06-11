# Spacing tokens — Yango Deli Internal Platform

8px grid. Use Tailwind spacing utilities that map to these steps; never invent
ad-hoc pixel values.

| Token | px | Tailwind | Usage |
|-------|----|----------|-------|
| `space-0.5` | 4 | `1` | tight internal padding only |
| `space-1` | 8 | `2` | inline gaps, icon spacing, chip padding |
| `space-2` | 12 | `3` | compact card padding |
| `space-3` | 16 | `4` | standard padding, card gaps |
| `space-4` | 24 | `6` | section padding |
| `space-5` | 32 | `8` | large section gaps |
| `space-6` | 48 | `12` | page-level spacing |

## Radii

- Cards / surfaces: `rounded-xl` (12px) — guide specifies 12–20px.
- Chips / badges / pills: `rounded-full`.
- Inputs / buttons: `rounded-lg`.

## Rhythm

- More space between sections than between items inside a section.
- Group related controls; align repeated rows on consistent vertical lanes.

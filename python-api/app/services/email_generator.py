"""
Generates a Hebrew supplier email proposal.
Text is RTL; returns a plain UTF-8 string.
"""
from __future__ import annotations

from datetime import date


def generate_hebrew_email(
    tier_results: list,
    brand_summary: list,
    supplier_name: str,
    contact_name: str,
    date_range: dict[str, str],
) -> str:
    # Pick best tier for the cost summary (highest uplift, largest basket value tier)
    best = max(
        tier_results,
        key=lambda r: (r.uplift_rate, r.final_activity_cost),
        default=None,
    )

    # Build tier table text (supplier-facing — no baseline counts)
    tier_lines = []
    type_label = {"basket_value": "לפי ערך סל", "units": "לפי כמות פריטים"}
    uplift_label = lambda r: f"+{int(r.uplift_rate * 100)}%"

    current_type = None
    for r in sorted(tier_results, key=lambda x: (x.tier_type, x.uplift_rate)):
        if r.tier_type != current_type:
            current_type = r.tier_type
            tier_lines.append(f"\n  {type_label.get(r.tier_type, r.tier_type)}:")
        tier_lines.append(
            f"  • {r.tier} | עלייה {uplift_label(r)} | {int(r.forecasted_redemptions):,} מימושים צפויים | "
            f"עלות כוללת: {int(r.final_activity_cost):,} ₪"
        )

    tier_table = "\n".join(tier_lines)

    # Brand summary
    brand_lines = []
    for b in sorted(brand_summary, key=lambda x: x.gmv, reverse=True)[:10]:
        brand_lines.append(f"  • {b.brand}: {int(b.quantity):,} יחידות | {int(b.gmv):,} ₪ GMV")
    brand_table = "\n".join(brand_lines) if brand_lines else "  (אין נתונים)"

    # Cost block using best tier
    if best:
        cost_block = (
            f"• עלות תפעול קבועה: {int(best.fixed_operational_cost):,} ₪\n"
            f"• תקציב משלוחים: {int(best.forecasted_redemptions):,} מימושים × 15 ₪ = {int(best.delivery_budget):,} ₪\n"
            f"• סה\"כ: {int(best.final_activity_cost):,} ₪"
        )
    else:
        cost_block = "• אין נתונים זמינים"

    month_year = date.today().strftime("%B %Y")
    contact = contact_name or "שלום"

    email = f"""\
Subject: הצעת פעילות ממומנת – {supplier_name} x Yango Deli

שלום {contact},

בהמשך לשיחתנו, מצ"ב הצעת פעילות ממומנת עבור {supplier_name}:

🎯 מבנה הפעילות המוצע:
{tier_table}

📊 נתוני מכר – {month_year} (תקופה: {date_range.get('from', '')} – {date_range.get('to', '')}):
{brand_table}

💰 עלות פעילות סופית (תרחיש מייצג):
{cost_block}

נשמח לשמוע את תגובתכם ולהתקדם לביצוע.

בברכה,
צוות Yango Deli
"""

    return email

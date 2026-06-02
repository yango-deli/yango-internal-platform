import json
from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import JSONResponse
from app.dependencies import verify_internal_request
from app.services.simulation_engine import SimulationEngine

router = APIRouter()


@router.post("/simulate", dependencies=[Depends(verify_internal_request)])
async def run_simulation(
    file: UploadFile = File(...),
    basket_value_col: str = Form("L"),
    order_id_col: str = Form("D"),
    brand_col: str = Form("B"),
    quantity_col: str = Form("E"),
    gmv_col: str = Form("F"),
    date_col: str = Form("A"),
    uplift_rates: str = Form("[0.3, 0.5]"),
    basket_tiers_value: str = Form("[25, 30, 35]"),
    basket_tiers_units: str = Form("[2, 3]"),
    delivery_cost_per_order: float = Form(15.0),
    fixed_operational_cost: float = Form(5000.0),
    lookback_days: int = Form(14),
    supplier_name: str = Form(""),
    contact_name: str = Form(""),
):
    content = await file.read()

    config = {
        "basket_value_col": basket_value_col,
        "order_id_col": order_id_col,
        "brand_col": brand_col,
        "quantity_col": quantity_col,
        "gmv_col": gmv_col,
        "date_col": date_col,
        "uplift_rates": json.loads(uplift_rates),
        "basket_tiers_value": json.loads(basket_tiers_value),
        "basket_tiers_units": json.loads(basket_tiers_units),
        "delivery_cost_per_order": delivery_cost_per_order,
        "fixed_operational_cost": fixed_operational_cost,
        "lookback_days": lookback_days,
        "supplier_name": supplier_name,
        "contact_name": contact_name,
    }

    engine = SimulationEngine(content, config)
    output = engine.run()

    return JSONResponse({
        "tierResults": [
            {
                "tierType": r.tier_type,
                "tier": r.tier,
                "upliftRate": r.uplift_rate,
                "forecastedRedemptions": r.forecasted_redemptions,
                "deliveryBudget": r.delivery_budget,
                "fixedOperationalCost": r.fixed_operational_cost,
                "finalActivityCost": r.final_activity_cost,
            }
            for r in output.tier_results
        ],
        "brandSummary": [
            {
                "brand": b.brand,
                "quantity": b.quantity,
                "gmv": b.gmv,
            }
            for b in output.brand_summary
        ],
        "emailText": output.email_text,
        "xlsxBase64": output.xlsx_base64,
        "dateRangeUsed": output.date_range_used,
        "totalOrdersAnalyzed": output.total_orders_analyzed,
    })

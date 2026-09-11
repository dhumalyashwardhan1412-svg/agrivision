from typing import Dict, Any, Optional, List
from app.schemas.profit import (
    ProfitCalculationRequest,
    ProfitCalculationResponse,
    CostBreakdownSchema,
    WhatIfRequest,
    WhatIfComparisonResponse,
    MultiScenarioRequest,
    MultiScenarioResponse,
    ScenarioItem
)

class ProfitService:
    # Agronomic benchmark averages per acre (INR) for major crops
    CROP_BENCHMARKS = {
        "Tomato": {
            "seed": 4500.0,
            "fertilizer": 6000.0,
            "organic_manure": 3000.0,
            "labour": 8500.0,
            "irrigation": 2500.0,
            "equipment": 3500.0,
            "electricity_fuel": 1800.0,
            "protection": 3200.0,
            "transportation": 2000.0,
            "packaging": 2000.0,
            "other": 1000.0,
            "avg_yield_kg": 12000.0,
            "avg_price_per_kg": 18.0
        },
        "Wheat": {
            "seed": 2200.0,
            "fertilizer": 4200.0,
            "organic_manure": 1800.0,
            "labour": 4500.0,
            "irrigation": 2000.0,
            "equipment": 3800.0,
            "electricity_fuel": 1500.0,
            "protection": 1200.0,
            "transportation": 1500.0,
            "packaging": 800.0,
            "other": 800.0,
            "avg_yield_kg": 2100.0,
            "avg_price_per_kg": 24.5
        },
        "Rice": {
            "seed": 1800.0,
            "fertilizer": 5000.0,
            "organic_manure": 2000.0,
            "labour": 7500.0,
            "irrigation": 3500.0,
            "equipment": 4000.0,
            "electricity_fuel": 2000.0,
            "protection": 2200.0,
            "transportation": 1800.0,
            "packaging": 1000.0,
            "other": 1000.0,
            "avg_yield_kg": 2600.0,
            "avg_price_per_kg": 28.0
        },
        "Cotton": {
            "seed": 3200.0,
            "fertilizer": 5500.0,
            "organic_manure": 2500.0,
            "labour": 8000.0,
            "irrigation": 2200.0,
            "equipment": 3200.0,
            "electricity_fuel": 1500.0,
            "protection": 4500.0,
            "transportation": 1800.0,
            "packaging": 1200.0,
            "other": 1000.0,
            "avg_yield_kg": 1100.0,
            "avg_price_per_kg": 72.0
        },
        "Potato": {
            "seed": 12000.0,
            "fertilizer": 6500.0,
            "organic_manure": 3500.0,
            "labour": 7000.0,
            "irrigation": 2800.0,
            "equipment": 4500.0,
            "electricity_fuel": 2000.0,
            "protection": 3000.0,
            "transportation": 3500.0,
            "packaging": 2500.0,
            "other": 1200.0,
            "avg_yield_kg": 10000.0,
            "avg_price_per_kg": 15.0
        },
        "Onion": {
            "seed": 5000.0,
            "fertilizer": 5500.0,
            "organic_manure": 2800.0,
            "labour": 8500.0,
            "irrigation": 2200.0,
            "equipment": 3000.0,
            "electricity_fuel": 1600.0,
            "protection": 2800.0,
            "transportation": 2500.0,
            "packaging": 2000.0,
            "other": 1000.0,
            "avg_yield_kg": 9500.0,
            "avg_price_per_kg": 22.0
        },
        "Maize": {
            "seed": 2000.0,
            "fertilizer": 4000.0,
            "organic_manure": 1800.0,
            "labour": 4000.0,
            "irrigation": 1800.0,
            "equipment": 2800.0,
            "electricity_fuel": 1200.0,
            "protection": 1500.0,
            "transportation": 1500.0,
            "packaging": 800.0,
            "other": 600.0,
            "avg_yield_kg": 3000.0,
            "avg_price_per_kg": 21.0
        },
        "Mustard": {
            "seed": 1200.0,
            "fertilizer": 3200.0,
            "organic_manure": 1500.0,
            "labour": 3500.0,
            "irrigation": 1500.0,
            "equipment": 2500.0,
            "electricity_fuel": 1000.0,
            "protection": 1400.0,
            "transportation": 1200.0,
            "packaging": 700.0,
            "other": 500.0,
            "avg_yield_kg": 900.0,
            "avg_price_per_kg": 58.0
        }
    }

    @classmethod
    def calculate_profit(cls, req: ProfitCalculationRequest) -> ProfitCalculationResponse:
        area = max(0.1, req.area_acres)
        crop_name = req.crop_name or "Tomato"
        
        # Get baseline or generic default
        bench = cls.CROP_BENCHMARKS.get(crop_name, cls.CROP_BENCHMARKS["Tomato"])
        
        # Calculate itemized costs for the total area
        seed_cost = req.seed_cost_inr if req.seed_cost_inr is not None else (bench["seed"] * area)
        fert_cost = req.fertilizer_cost_inr if req.fertilizer_cost_inr is not None else (bench["fertilizer"] * area)
        manure_cost = req.organic_manure_cost_inr if req.organic_manure_cost_inr is not None else (bench.get("organic_manure", 2000.0) * area)
        labour_cost = req.labour_cost_inr if req.labour_cost_inr is not None else (bench["labour"] * area)
        irrig_cost = req.irrigation_cost_inr if req.irrigation_cost_inr is not None else (bench["irrigation"] * area)
        equip_cost = req.equipment_cost_inr if req.equipment_cost_inr is not None else (bench["equipment"] * area)
        elec_cost = req.electricity_fuel_cost_inr if req.electricity_fuel_cost_inr is not None else (bench["electricity_fuel"] * area)
        prot_cost = req.crop_protection_cost_inr if req.crop_protection_cost_inr is not None else (bench["protection"] * area)
        trans_cost = req.transportation_cost_inr if req.transportation_cost_inr is not None else (bench["transportation"] * area)
        pack_cost = req.packaging_cost_inr if req.packaging_cost_inr is not None else (bench["packaging"] * area)
        other_cost = req.other_costs_inr if req.other_costs_inr is not None else (bench["other"] * area)

        total_cost = (
            seed_cost + fert_cost + manure_cost + labour_cost + irrig_cost +
            equip_cost + elec_cost + prot_cost + trans_cost +
            pack_cost + other_cost
        )

        expected_yield = req.expected_yield_kg if req.expected_yield_kg is not None else (bench["avg_yield_kg"] * area)
        selling_price = req.expected_selling_price_per_kg if req.expected_selling_price_per_kg is not None else bench["avg_price_per_kg"]
        
        expected_revenue = expected_yield * selling_price
        estimated_profit = expected_revenue - total_cost

        profit_margin = (estimated_profit / expected_revenue * 100.0) if expected_revenue > 0 else 0.0
        roi = (estimated_profit / total_cost * 100.0) if total_cost > 0 else 0.0

        break_even_price = (total_cost / expected_yield) if expected_yield > 0 else 0.0
        break_even_yield = (total_cost / selling_price) if selling_price > 0 else 0.0

        if roi >= 70:
            rating = "Highly Profitable"
        elif roi >= 35:
            rating = "Good Profit Potential"
        elif roi >= 10:
            rating = "Moderate Return"
        else:
            rating = "Low Margin / High Market Risk"

        insights = [
            f"Break-even selling price is ₹{break_even_price:.2f}/kg. Any mandi price above this earns net profit.",
            f"Minimum harvest yield needed to cover all input costs is {break_even_yield:.1f} kg ({break_even_yield/100:.1f} quintals).",
            f"Labour ({labour_cost/total_cost*100:.1f}%) and Fertilizers/Manure ({(fert_cost+manure_cost)/total_cost*100:.1f}%) represent the highest operational cost components."
        ]

        cost_breakdown = CostBreakdownSchema(
            seed_cost_inr=round(seed_cost, 2),
            fertilizer_cost_inr=round(fert_cost, 2),
            organic_manure_cost_inr=round(manure_cost, 2),
            labour_cost_inr=round(labour_cost, 2),
            irrigation_cost_inr=round(irrig_cost, 2),
            equipment_cost_inr=round(equip_cost, 2),
            electricity_fuel_cost_inr=round(elec_cost, 2),
            crop_protection_cost_inr=round(prot_cost, 2),
            transportation_cost_inr=round(trans_cost, 2),
            packaging_cost_inr=round(pack_cost, 2),
            other_costs_inr=round(other_cost, 2),
            total_cost_inr=round(total_cost, 2)
        )

        return ProfitCalculationResponse(
            crop_name=crop_name,
            area_acres=round(area, 2),
            is_estimate=True,
            cost_breakdown=cost_breakdown,
            expected_yield_kg=round(expected_yield, 2),
            expected_selling_price_per_kg=round(selling_price, 2),
            expected_revenue_inr=round(expected_revenue, 2),
            estimated_profit_inr=round(estimated_profit, 2),
            profit_margin_percent=round(profit_margin, 2),
            return_on_investment_roi_percent=round(roi, 2),
            break_even_price_per_kg=round(break_even_price, 2),
            break_even_yield_kg=round(break_even_yield, 2),
            profitability_rating=rating,
            insights=insights
        )

    @classmethod
    def calculate_what_if(cls, req: WhatIfRequest) -> WhatIfComparisonResponse:
        current_res = cls.calculate_profit(req.current)
        what_if_res = cls.calculate_profit(req.what_if)

        profit_change = what_if_res.estimated_profit_inr - current_res.estimated_profit_inr
        revenue_change = what_if_res.expected_revenue_inr - current_res.expected_revenue_inr
        cost_change = what_if_res.cost_breakdown.total_cost_inr - current_res.cost_breakdown.total_cost_inr
        roi_change = what_if_res.return_on_investment_roi_percent - current_res.return_on_investment_roi_percent
        
        profit_change_pct = (
            (profit_change / abs(current_res.estimated_profit_inr) * 100.0)
            if current_res.estimated_profit_inr != 0
            else 0.0
        )

        if profit_change > 0:
            verdict = f"Positive Outcome: Projections show a net gain of ₹{abs(profit_change):,.0f} (+{abs(profit_change_pct):.1f}%) under these adjusted parameters."
        elif profit_change < 0:
            verdict = f"Caution: Assumptions indicate an estimated profit reduction of ₹{abs(profit_change):,.0f} ({profit_change_pct:.1f}%). Input costs or lower price press margins."
        else:
            verdict = "Neutral: Both scenarios result in identical estimated net earnings."

        return WhatIfComparisonResponse(
            current_plan=current_res,
            what_if_plan=what_if_res,
            profit_change_inr=round(profit_change, 2),
            revenue_change_inr=round(revenue_change, 2),
            cost_change_inr=round(cost_change, 2),
            roi_change_percent=round(roi_change, 2),
            profit_change_percent=round(profit_change_pct, 2),
            summary_verdict=verdict,
            is_estimate=True,
            disclaimer="All values are ESTIMATED scenario projections based on farmer assumptions and do not constitute guaranteed income."
        )

    @classmethod
    def calculate_scenarios(cls, req: MultiScenarioRequest) -> MultiScenarioResponse:
        base_req = ProfitCalculationRequest(
            crop_name=req.crop_name,
            area_acres=req.area_acres,
            seed_cost_inr=req.seed_cost_inr,
            fertilizer_cost_inr=req.fertilizer_cost_inr,
            organic_manure_cost_inr=req.organic_manure_cost_inr,
            labour_cost_inr=req.labour_cost_inr,
            irrigation_cost_inr=req.irrigation_cost_inr,
            equipment_cost_inr=req.equipment_cost_inr,
            electricity_fuel_cost_inr=req.electricity_fuel_cost_inr,
            crop_protection_cost_inr=req.crop_protection_cost_inr,
            transportation_cost_inr=req.transportation_cost_inr,
            packaging_cost_inr=req.packaging_cost_inr,
            other_costs_inr=req.other_costs_inr,
            expected_yield_kg=req.expected_yield_kg,
            expected_selling_price_per_kg=req.expected_selling_price_per_kg
        )
        expected_calc = cls.calculate_profit(base_req)

        # Conservative Scenario (Adverse weather, price dip -15%, yield -20%, cost +5%)
        cons_yield = expected_calc.expected_yield_kg * 0.80
        cons_price = max(1.0, expected_calc.expected_selling_price_per_kg * 0.85)
        cons_cost = expected_calc.cost_breakdown.total_cost_inr * 1.05
        cons_revenue = cons_yield * cons_price
        cons_profit = cons_revenue - cons_cost
        cons_margin = (cons_profit / cons_revenue * 100.0) if cons_revenue > 0 else 0.0
        cons_roi = (cons_profit / cons_cost * 100.0) if cons_cost > 0 else 0.0

        # Best Case Scenario (Favorable weather, yield +25%, premium mandi rate +20%, cost standard)
        best_yield = expected_calc.expected_yield_kg * 1.25
        best_price = expected_calc.expected_selling_price_per_kg * 1.20
        best_cost = expected_calc.cost_breakdown.total_cost_inr * 0.98 # slight efficiency savings
        best_revenue = best_yield * best_price
        best_profit = best_revenue - best_cost
        best_margin = (best_profit / best_revenue * 100.0) if best_revenue > 0 else 0.0
        best_roi = (best_profit / best_cost * 100.0) if best_cost > 0 else 0.0

        return MultiScenarioResponse(
            crop_name=req.crop_name,
            area_acres=req.area_acres,
            conservative=ScenarioItem(
                name="Conservative",
                tagline="Adverse Weather & Market Dip (Low Yield -20%, Lower Price -15%)",
                assumed_yield_kg=round(cons_yield, 2),
                assumed_price_per_kg=round(cons_price, 2),
                total_cost_inr=round(cons_cost, 2),
                expected_revenue_inr=round(cons_revenue, 2),
                estimated_profit_inr=round(cons_profit, 2),
                profit_margin_percent=round(cons_margin, 2),
                roi_percent=round(cons_roi, 2),
                risk_level="High Market Stress Tested"
            ),
            expected=ScenarioItem(
                name="Expected",
                tagline="Normal Agronomic Norms & Average APMC Mandi Rates",
                assumed_yield_kg=round(expected_calc.expected_yield_kg, 2),
                assumed_price_per_kg=round(expected_calc.expected_selling_price_per_kg, 2),
                total_cost_inr=round(expected_calc.cost_breakdown.total_cost_inr, 2),
                expected_revenue_inr=round(expected_calc.expected_revenue_inr, 2),
                estimated_profit_inr=round(expected_calc.estimated_profit_inr, 2),
                profit_margin_percent=round(expected_calc.profit_margin_percent, 2),
                roi_percent=round(expected_calc.return_on_investment_roi_percent, 2),
                risk_level="Balanced Risk"
            ),
            best_case=ScenarioItem(
                name="Best Case",
                tagline="Peak Yield (+25%) & Premium Grade-A Wholesale Rate (+20%)",
                assumed_yield_kg=round(best_yield, 2),
                assumed_price_per_kg=round(best_price, 2),
                total_cost_inr=round(best_cost, 2),
                expected_revenue_inr=round(best_revenue, 2),
                estimated_profit_inr=round(best_profit, 2),
                profit_margin_percent=round(best_margin, 2),
                roi_percent=round(best_roi, 2),
                risk_level="Optimal Conditions"
            ),
            is_estimate=True,
            disclaimer="All scenario projections are ESTIMATED based on market ranges and subject to weather and crop conditions."
        )

profit_service = ProfitService()

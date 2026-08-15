from typing import Dict, Any, Optional
from app.schemas.profit import ProfitCalculationRequest, ProfitCalculationResponse, CostBreakdownSchema

class ProfitService:
    # Agronomic benchmark averages per acre (INR) for major crops
    CROP_BENCHMARKS = {
        "Tomato": {
            "seed": 4500.0,
            "fertilizer": 6000.0,
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
        labour_cost = req.labour_cost_inr if req.labour_cost_inr is not None else (bench["labour"] * area)
        irrig_cost = req.irrigation_cost_inr if req.irrigation_cost_inr is not None else (bench["irrigation"] * area)
        equip_cost = req.equipment_cost_inr if req.equipment_cost_inr is not None else (bench["equipment"] * area)
        elec_cost = req.electricity_fuel_cost_inr if req.electricity_fuel_cost_inr is not None else (bench["electricity_fuel"] * area)
        prot_cost = req.crop_protection_cost_inr if req.crop_protection_cost_inr is not None else (bench["protection"] * area)
        trans_cost = req.transportation_cost_inr if req.transportation_cost_inr is not None else (bench["transportation"] * area)
        pack_cost = req.packaging_cost_inr if req.packaging_cost_inr is not None else (bench["packaging"] * area)
        other_cost = req.other_costs_inr if req.other_costs_inr is not None else (bench["other"] * area)

        total_cost = (
            seed_cost + fert_cost + labour_cost + irrig_cost +
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
            f"Labour ({labour_cost/total_cost*100:.1f}%) and Fertilizers ({fert_cost/total_cost*100:.1f}%) represent the highest operational cost components."
        ]

        cost_breakdown = CostBreakdownSchema(
            seed_cost_inr=round(seed_cost, 2),
            fertilizer_cost_inr=round(fert_cost, 2),
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

profit_service = ProfitService()

from pydantic import BaseModel
from typing import Optional, Dict

class CostBreakdownSchema(BaseModel):
    seed_cost_inr: float
    fertilizer_cost_inr: float
    labour_cost_inr: float
    irrigation_cost_inr: float
    equipment_cost_inr: float
    electricity_fuel_cost_inr: float
    crop_protection_cost_inr: float
    transportation_cost_inr: float
    packaging_cost_inr: float
    other_costs_inr: float
    total_cost_inr: float

class ProfitCalculationRequest(BaseModel):
    crop_id: Optional[int] = None
    crop_name: Optional[str] = "Tomato"
    area_acres: float = 1.0
    
    # Custom cost overrides (if null, auto-calculated based on agronomist benchmark data)
    seed_cost_inr: Optional[float] = None
    fertilizer_cost_inr: Optional[float] = None
    labour_cost_inr: Optional[float] = None
    irrigation_cost_inr: Optional[float] = None
    equipment_cost_inr: Optional[float] = None
    electricity_fuel_cost_inr: Optional[float] = None
    crop_protection_cost_inr: Optional[float] = None
    transportation_cost_inr: Optional[float] = None
    packaging_cost_inr: Optional[float] = None
    other_costs_inr: Optional[float] = None
    
    # Revenue simulation params
    expected_yield_kg: Optional[float] = None
    expected_selling_price_per_kg: Optional[float] = None

class ProfitCalculationResponse(BaseModel):
    crop_name: str
    area_acres: float
    is_estimate: bool = True
    disclaimer: str = "All values are realistic estimates based on agro-climatic norms and market benchmarks. Actual yields and prices fluctuate."
    
    cost_breakdown: CostBreakdownSchema
    expected_yield_kg: float
    expected_selling_price_per_kg: float
    expected_revenue_inr: float
    estimated_profit_inr: float
    profit_margin_percent: float
    return_on_investment_roi_percent: float
    break_even_price_per_kg: float
    break_even_yield_kg: float
    
    # Profitability Rating
    profitability_rating: str # Highly Profitable, Moderate, Low Margin, High Risk
    insights: list[str]

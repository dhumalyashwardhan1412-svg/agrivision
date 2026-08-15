from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class CropRequirementResponse(BaseModel):
    id: int
    ideal_ph_min: float
    ideal_ph_max: float
    ideal_n_min: float
    ideal_n_max: float
    ideal_p_min: float
    ideal_p_max: float
    ideal_k_min: float
    ideal_k_max: float
    compatible_soil_types: str
    ideal_temp_min_c: float
    ideal_temp_max_c: float
    ideal_rainfall_min_mm: float
    ideal_rainfall_max_mm: float
    water_requirement_mm: float

    class Config:
        from_attributes = True

class CropResponse(BaseModel):
    id: int
    name: str
    scientific_name: Optional[str]
    category: str
    variety: Optional[str]
    image_url: Optional[str]
    description: Optional[str]
    duration_days: int
    growing_season: str
    water_need_level: str
    labor_intensity: str
    avg_yield_per_acre_kg: float
    benchmark_cost_per_acre_inr: float
    benchmark_market_price_per_kg: float
    organic_suitability: str
    risk_level: str
    requirements: Optional[CropRequirementResponse] = None

    class Config:
        from_attributes = True

class CropRecommendationResponse(BaseModel):
    id: int
    farm_id: int
    crop_id: int
    crop: CropResponse
    overall_suitability_score: float
    soil_score: float
    climate_score: float
    water_score: float
    market_score: float
    profit_score: float
    risk_score: float
    estimated_cost_inr: float
    estimated_revenue_inr: float
    estimated_profit_inr: float
    roi_percentage: float
    break_even_price_per_kg: float
    scoring_breakdown_json: Optional[Dict[str, Any]] = None
    ai_explanation: Optional[str] = None
    advantages: Optional[str] = None
    risk_factors: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

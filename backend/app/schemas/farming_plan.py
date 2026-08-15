from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.farming_plan import FarmingMethodology
from app.schemas.crop import CropResponse

class FarmingStageSchema(BaseModel):
    stage_name: str
    day_start: int
    day_end: int
    key_objectives: str
    activities: List[str]
    inputs_required: List[str]
    cost_estimate_inr: float
    precautions: List[str]

class FarmingPlanCreate(BaseModel):
    farm_id: int
    crop_id: int
    methodology: FarmingMethodology = FarmingMethodology.MODERN
    target_area_acres: float = 1.0

class FarmingPlanResponse(BaseModel):
    id: int
    farm_id: int
    crop_id: int
    title: str
    methodology: FarmingMethodology
    target_area_acres: float
    total_estimated_cost_inr: float
    expected_yield_kg: float
    expected_revenue_inr: float
    estimated_net_profit_inr: float
    roi_percent: float
    schedule_stages_json: List[Dict[str, Any]]
    fertilizer_schedule: Optional[str]
    irrigation_schedule: Optional[str]
    pest_disease_management: Optional[str]
    harvest_guidelines: Optional[str]
    equipment_needed: Optional[str]
    notes: Optional[str]
    created_at: datetime
    crop: Optional[CropResponse] = None

    class Config:
        from_attributes = True

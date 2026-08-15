from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from app.models.soil import SoilSourceType

class SoilTestCreateLab(BaseModel):
    farm_id: int
    nitrogen: float # kg/ha
    phosphorus: float # kg/ha
    potassium: float # kg/ha
    ph: float # 0 - 14
    electrical_conductivity: Optional[float] = 0.5 # dS/m
    organic_carbon: Optional[float] = 0.65 # %
    moisture_percentage: Optional[float] = 22.0 # %
    soil_texture: Optional[str] = "Loamy"
    zinc_ppm: Optional[float] = 1.2
    iron_ppm: Optional[float] = 5.4
    sulfur_ppm: Optional[float] = 12.0
    lab_name: Optional[str] = "District Soil Testing Laboratory"
    notes: Optional[str] = None

class SoilTestCreateAI(BaseModel):
    farm_id: int
    image_url: Optional[str] = None
    visual_color_tone: Optional[str] = "Dark Brown / Blackish"
    visual_texture_notes: Optional[str] = "Fine granular loam with visible organic humus"
    visual_moisture_level: Optional[str] = "Moderately Moist"
    visual_cracking_observed: Optional[str] = "None"
    notes: Optional[str] = "Estimated from on-field topsoil photographic observation"

class SoilTestResponse(BaseModel):
    id: int
    farm_id: int
    source_type: SoilSourceType
    nitrogen: Optional[float] = None
    phosphorus: Optional[float] = None
    potassium: Optional[float] = None
    ph: Optional[float] = None
    electrical_conductivity: Optional[float] = None
    organic_carbon: Optional[float] = None
    moisture_percentage: Optional[float] = None
    soil_texture: Optional[str] = None
    zinc_ppm: Optional[float] = None
    iron_ppm: Optional[float] = None
    sulfur_ppm: Optional[float] = None
    lab_name: Optional[str] = None
    image_url: Optional[str] = None
    visual_color_tone: Optional[str] = None
    visual_texture_notes: Optional[str] = None
    visual_moisture_level: Optional[str] = None
    visual_cracking_observed: Optional[str] = None
    health_grade: str
    npk_status: Optional[str]
    recommendations_summary: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class SoilAnalysisResult(BaseModel):
    soil_test_id: int
    health_grade: str
    npk_balance: Dict[str, Any]
    ph_status: str
    fertility_index: float # 0 - 100
    organic_matter_status: str
    deficiencies: list[str]
    amendments_recommended: list[str]

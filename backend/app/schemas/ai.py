from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class AIChatRequest(BaseModel):
    message: str
    farm_id: Optional[int] = None
    language: Optional[str] = "en" # en, hi, pa, etc.
    context_data: Optional[Dict[str, Any]] = None

class AIChatResponse(BaseModel):
    response: str
    suggested_actions: List[str] = []
    source: str = "AgriVision AI Assistant"

class CropDiagnosisResponse(BaseModel):
    id: Optional[int] = None
    detected_crop: str
    health_status: str # Healthy, Mild Leaf Infection, Severe Blight, Nutrient Chlorosis
    condition_name: str
    confidence_percentage: float
    symptoms_observed: str
    organic_solution: str
    chemical_treatment: str
    preventive_measures: str
    image_url: Optional[str] = None
    disclaimer: str = "AI-assisted visual screening only. For critical infestations or laboratory confirmation, consult your nearest Krishi Vigyan Kendra (KVK)."
    created_at: Optional[datetime] = None

class SoilObservationResponse(BaseModel):
    id: Optional[int] = None
    visual_color_tone: str
    estimated_soil_type: str
    moisture_estimate: str
    organic_humus_appearance: str
    potential_challenges: List[str]
    preliminary_advice: str
    image_url: Optional[str] = None
    disclaimer: str = "Photographic soil estimation only. It cannot replace a chemical laboratory NPK & pH soil test."

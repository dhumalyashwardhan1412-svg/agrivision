from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.database import Base

class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    analysis_type = Column(String(100), nullable=False) # CROP_DISEASE_DIAGNOSIS, SOIL_OBSERVATION, CROP_SUITABILITY, AGRI_ASSISTANT
    
    # Image & Diagnosis info
    image_url = Column(String(500), nullable=True)
    detected_crop = Column(String(100), nullable=True)
    health_status = Column(String(100), nullable=True) # Healthy, Moderate Infection, Severe Infestation, Nutrient Deficient
    condition_name = Column(String(200), nullable=True) # e.g. "Early Blight (Alternaria solani)", "Powdery Mildew", "Healthy Crop"
    confidence_percentage = Column(Float, default=85.0)
    
    # Actionable agricultural advice
    symptoms_observed = Column(Text, nullable=True)
    organic_solution = Column(Text, nullable=True)
    chemical_treatment = Column(Text, nullable=True)
    preventive_measures = Column(Text, nullable=True)
    disclaimer = Column(Text, default="AI-assisted visual screening only. For critical infestations or legal verification, consult a certified laboratory or Krishi Vigyan Kendra.")
    
    # Chat / Raw response context
    prompt_query = Column(Text, nullable=True)
    ai_response_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    farm = relationship("Farm", back_populates="ai_analyses")

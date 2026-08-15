from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database.database import Base

class FarmingMethodology(str, enum.Enum):
    ORGANIC = "ORGANIC"
    CONVENTIONAL = "CONVENTIONAL"
    MODERN = "MODERN"

class FarmingPlan(Base):
    __tablename__ = "farming_plans"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    title = Column(String(255), nullable=False)
    methodology = Column(Enum(FarmingMethodology), default=FarmingMethodology.MODERN, nullable=False)
    target_area_acres = Column(Float, default=1.0)
    
    # Financial summary
    total_estimated_cost_inr = Column(Float, nullable=False)
    expected_yield_kg = Column(Float, nullable=False)
    expected_revenue_inr = Column(Float, nullable=False)
    estimated_net_profit_inr = Column(Float, nullable=False)
    roi_percent = Column(Float, default=0.0)
    
    # Detailed timeline and schedules (stored as JSON arrays of stages)
    # Each stage has: stage_name, day_start, day_end, activities, inputs_required, cost_inr, precautions
    schedule_stages_json = Column(JSON, nullable=False)
    
    # Specific management guidelines
    fertilizer_schedule = Column(Text, nullable=True)
    irrigation_schedule = Column(Text, nullable=True)
    pest_disease_management = Column(Text, nullable=True)
    harvest_guidelines = Column(Text, nullable=True)
    equipment_needed = Column(Text, nullable=True)
    
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    farm = relationship("Farm", back_populates="farming_plans")
    crop = relationship("Crop", back_populates="farming_plans")

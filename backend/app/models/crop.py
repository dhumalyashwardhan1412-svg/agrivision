from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.database import Base

class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    scientific_name = Column(String(150), nullable=True)
    category = Column(String(100), nullable=False) # Cereal, Vegetable, Fruit, Pulse, Cash Crop, Oilseed, Spice
    variety = Column(String(150), nullable=True)
    image_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    duration_days = Column(Integer, default=120)
    growing_season = Column(String(100), default="Kharif") # Kharif, Rabi, Zaid, Year-round
    water_need_level = Column(String(50), default="Medium") # Low, Medium, High, Very High
    labor_intensity = Column(String(50), default="Medium") # Low, Medium, High
    avg_yield_per_acre_kg = Column(Float, default=2000.0)
    benchmark_cost_per_acre_inr = Column(Float, default=25000.0)
    benchmark_market_price_per_kg = Column(Float, default=30.0)
    organic_suitability = Column(String(50), default="High")
    risk_level = Column(String(50), default="Moderate") # Low, Moderate, High

    # Relationships
    requirements = relationship("CropRequirement", back_populates="crop", uselist=False, cascade="all, delete-orphan")
    recommendations = relationship("CropRecommendation", back_populates="crop", cascade="all, delete-orphan")
    farming_plans = relationship("FarmingPlan", back_populates="crop", cascade="all, delete-orphan")
    listings = relationship("CropListing", back_populates="crop", cascade="all, delete-orphan")

class CropRequirement(Base):
    __tablename__ = "crop_requirements"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), unique=True, nullable=False)
    
    # Soil requirements
    ideal_ph_min = Column(Float, default=6.0)
    ideal_ph_max = Column(Float, default=7.5)
    ideal_n_min = Column(Float, default=100.0)
    ideal_n_max = Column(Float, default=250.0)
    ideal_p_min = Column(Float, default=20.0)
    ideal_p_max = Column(Float, default=60.0)
    ideal_k_min = Column(Float, default=120.0)
    ideal_k_max = Column(Float, default=350.0)
    compatible_soil_types = Column(String(255), default="Loamy, Sandy Loam, Clay Loam, Black")
    
    # Climate requirements
    ideal_temp_min_c = Column(Float, default=18.0)
    ideal_temp_max_c = Column(Float, default=32.0)
    ideal_rainfall_min_mm = Column(Float, default=400.0)
    ideal_rainfall_max_mm = Column(Float, default=1000.0)
    sunlight_hours = Column(Float, default=6.0)
    water_requirement_mm = Column(Float, default=500.0)

    crop = relationship("Crop", back_populates="requirements")

class CropRecommendation(Base):
    __tablename__ = "crop_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    
    # Score breakdown (0 - 100)
    overall_suitability_score = Column(Float, nullable=False)
    soil_score = Column(Float, nullable=False)
    climate_score = Column(Float, nullable=False)
    water_score = Column(Float, nullable=False)
    market_score = Column(Float, nullable=False)
    profit_score = Column(Float, nullable=False)
    risk_score = Column(Float, nullable=False)
    
    # Financial estimates
    estimated_cost_inr = Column(Float, nullable=False)
    estimated_revenue_inr = Column(Float, nullable=False)
    estimated_profit_inr = Column(Float, nullable=False)
    roi_percentage = Column(Float, nullable=False)
    break_even_price_per_kg = Column(Float, nullable=False)
    
    # Explanation
    scoring_breakdown_json = Column(JSON, nullable=True)
    ai_explanation = Column(Text, nullable=True)
    advantages = Column(Text, nullable=True)
    risk_factors = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    farm = relationship("Farm", back_populates="recommendations")
    crop = relationship("Crop", back_populates="recommendations")

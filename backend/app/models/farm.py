from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.database import Base

class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmer_profiles.id"), nullable=False)
    name = Column(String(255), nullable=False)
    location_name = Column(String(255), nullable=False)
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    village = Column(String(100), nullable=True)
    total_area_acres = Column(Float, nullable=False, default=1.0)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    elevation_meters = Column(Float, default=250.0)
    primary_soil_type = Column(String(100), default="Loamy") # Alluvial, Black, Red, Laterite, Clay, Sandy, Loamy
    water_source = Column(String(100), default="Borewell") # Canal, Borewell, River, Rainfed, Pond
    irrigation_system = Column(String(100), default="Drip") # Drip, Sprinkler, Flood, Furrow, Rainfed
    budget_inr = Column(Float, default=50000.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    farmer = relationship("FarmerProfile", back_populates="farms")
    soil_tests = relationship("SoilTest", back_populates="farm", cascade="all, delete-orphan")
    recommendations = relationship("CropRecommendation", back_populates="farm", cascade="all, delete-orphan")
    farming_plans = relationship("FarmingPlan", back_populates="farm", cascade="all, delete-orphan")
    activities = relationship("FarmingActivity", back_populates="farm", cascade="all, delete-orphan")
    ai_analyses = relationship("AIAnalysis", back_populates="farm", cascade="all, delete-orphan")

class LandParcel(Base):
    __tablename__ = "land_parcels"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    parcel_name = Column(String(100), nullable=False)
    area_acres = Column(Float, nullable=False)
    current_crop = Column(String(100), nullable=True)
    sowing_date = Column(DateTime, nullable=True)
    expected_harvest_date = Column(DateTime, nullable=True)

class FarmingActivity(Base):
    __tablename__ = "farming_activities"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    title = Column(String(255), nullable=False)
    activity_type = Column(String(100), nullable=False) # Sowing, Irrigation, Fertilization, Pesticide, Weeding, Harvesting, Soil Test
    description = Column(Text, nullable=True)
    cost_inr = Column(Float, default=0.0)
    scheduled_date = Column(DateTime, nullable=False)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    farm = relationship("Farm", back_populates="activities")

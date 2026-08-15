from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database.database import Base

class SoilSourceType(str, enum.Enum):
    LABORATORY = "LABORATORY"
    IMAGE_ESTIMATE = "IMAGE_ESTIMATE"

class SoilTest(Base):
    __tablename__ = "soil_tests"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    source_type = Column(Enum(SoilSourceType), default=SoilSourceType.LABORATORY, nullable=False)
    
    # Laboratory parameters (mg/kg or ppm or kg/ha or rating)
    nitrogen = Column(Float, nullable=True) # kg/ha (Typical: 100 - 400)
    phosphorus = Column(Float, nullable=True) # kg/ha (Typical: 10 - 80)
    potassium = Column(Float, nullable=True) # kg/ha (Typical: 100 - 500)
    ph = Column(Float, nullable=True) # pH (Typical: 5.5 - 8.5)
    electrical_conductivity = Column(Float, nullable=True) # dS/m (EC: 0.1 - 2.0)
    organic_carbon = Column(Float, nullable=True) # % (Typical: 0.2 - 1.5)
    moisture_percentage = Column(Float, nullable=True) # %
    soil_texture = Column(String(100), nullable=True) # Sandy, Clay, Loamy, Silt Loam, Clay Loam, Black Cotton
    zinc_ppm = Column(Float, nullable=True)
    iron_ppm = Column(Float, nullable=True)
    sulfur_ppm = Column(Float, nullable=True)
    
    # Laboratory metadata
    lab_name = Column(String(255), nullable=True)
    sample_depth_cm = Column(Float, default=15.0)
    test_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Image visual observations (if IMAGE_ESTIMATE)
    image_url = Column(String(500), nullable=True)
    visual_color_tone = Column(String(100), nullable=True) # Dark Brown, Reddish, Greyish, Black
    visual_texture_notes = Column(Text, nullable=True)
    visual_moisture_level = Column(String(100), nullable=True) # Dry, Moderately Moist, Waterlogged
    visual_cracking_observed = Column(String(100), nullable=True) # None, Slight, High Cracking
    
    # Qualitative interpretations
    health_grade = Column(String(20), default="Good") # Excellent, Good, Moderate, Poor, Degraded
    npk_status = Column(String(100), nullable=True) # e.g. "Low Nitrogen, Optimal Phosphorus, High Potassium"
    recommendations_summary = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    farm = relationship("Farm", back_populates="soil_tests")

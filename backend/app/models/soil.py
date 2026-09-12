from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Text,
    Enum,
)
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

    farm_id = Column(
        Integer,
        ForeignKey("farms.id"),
        nullable=False
    )

    source_type = Column(
        Enum(SoilSourceType),
        default=SoilSourceType.LABORATORY,
        nullable=False
    )

    # ============================
    # Laboratory Parameters
    # ============================

    # kg/ha
    nitrogen = Column(Float, nullable=True)

    # kg/ha
    phosphorus = Column(Float, nullable=True)

    # kg/ha
    potassium = Column(Float, nullable=True)

    # Soil pH
    ph = Column(Float, nullable=True)

    # dS/m
    electrical_conductivity = Column(Float, nullable=True)

    # %
    organic_carbon = Column(Float, nullable=True)

    # %
    moisture_percentage = Column(Float, nullable=True)

    # Sandy, Clay, Loamy, Silt Loam, etc.
    soil_texture = Column(String(100), nullable=True)

    zinc_ppm = Column(Float, nullable=True)
    iron_ppm = Column(Float, nullable=True)
    sulfur_ppm = Column(Float, nullable=True)

    # ============================
    # Laboratory Metadata
    # ============================

    lab_name = Column(
        String(255),
        nullable=True
    )

    sample_depth_cm = Column(
        Float,
        default=15.0
    )

    test_date = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    # ============================
    # Image-based Soil Analysis
    # ============================

    image_url = Column(
        String(500),
        nullable=True
    )

    visual_color_tone = Column(
        String(100),
        nullable=True
    )

    visual_texture_notes = Column(
        Text,
        nullable=True
    )

    visual_moisture_level = Column(
        String(100),
        nullable=True
    )

    visual_cracking_observed = Column(
        String(100),
        nullable=True
    )

    # ============================
    # Soil Health Interpretation
    # ============================

    # Example:
    # "Grade A (Prime Fertile)"
    health_grade = Column(
        String(100),
        default="Good",
        nullable=True
    )

    # Example:
    # N: Low (245 kg/ha) |
    # P: Optimal (22.5 kg/ha) |
    # K: Optimal (195 kg/ha)
    npk_status = Column(
        Text,
        nullable=True
    )

    recommendations_summary = Column(
        Text,
        nullable=True
    )

    notes = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    # ============================
    # Relationships
    # ============================

    farm = relationship(
        "Farm",
        back_populates="soil_tests"
    )
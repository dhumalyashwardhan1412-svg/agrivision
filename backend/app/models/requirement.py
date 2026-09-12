from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database.database import Base

class RequirementStatus(str, enum.Enum):
    OPEN = "OPEN"
    NEGOTIATING = "NEGOTIATING"
    PARTIALLY_FULFILLED = "PARTIALLY_FULFILLED"
    FULFILLED = "FULFILLED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"

class BuyerRequirement(Base):
    __tablename__ = "buyer_requirements"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("customer_profiles.id"), nullable=False)
    title = Column(String(255), nullable=False) # e.g. "Looking for 50 Qtl Premium Sharbati Wheat"
    crop_name = Column(String(100), nullable=False)
    variety = Column(String(100), nullable=True)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), default="Quintal", nullable=False) # kg, Quintal, Ton, Box
    min_quality_grade = Column(String(50), default="Grade A (Standard)")
    target_price = Column(Float, nullable=False)
    price_unit = Column(String(50), default="₹/Quintal", nullable=False)
    required_date = Column(DateTime, nullable=True)
    delivery_preference = Column(String(100), default="Farmer Farmgate Pickup") # Farmgate Pickup, Buyer Warehouse Delivery
    location_city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(RequirementStatus), default=RequirementStatus.OPEN, nullable=False)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    buyer = relationship("CustomerProfile")
    offers = relationship("Offer", back_populates="requirement", cascade="all, delete-orphan")

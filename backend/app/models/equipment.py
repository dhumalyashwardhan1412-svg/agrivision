from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.database import Base

class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False) # e.g. "Mahindra 575 DI Tractor 45 HP", "Laser Land Leveler", "DJI Agras T40 Drone"
    category = Column(String(100), nullable=False) # Tractor, Harvester, Drone Sprayer, Rotavator, Seed Drill, Power Tiller, Drip Automation Kit
    brand = Column(String(100), nullable=True)
    power_hp = Column(Float, nullable=True)
    daily_rental_rate_inr = Column(Float, nullable=False, default=1200.0)
    hourly_rate_inr = Column(Float, default=300.0)
    purchase_price_estimate_inr = Column(Float, default=450000.0)
    description = Column(Text, nullable=True)
    specifications_json = Column(JSON, nullable=True)
    image_url = Column(String(500), nullable=True)
    is_available_for_rent = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    rentals = relationship("EquipmentRental", back_populates="equipment", cascade="all, delete-orphan")

class EquipmentRental(Base):
    __tablename__ = "equipment_rentals"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=True)
    farmer_id = Column(Integer, ForeignKey("farmer_profiles.id"), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    total_days = Column(Integer, default=1)
    daily_rate_applied = Column(Float, nullable=False)
    total_cost_inr = Column(Float, nullable=False)
    status = Column(String(50), default="ACTIVE") # REQUESTED, CONFIRMED, ACTIVE, COMPLETED, CANCELLED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    equipment = relationship("Equipment", back_populates="rentals")
    shop = relationship("Shop", back_populates="rentals")

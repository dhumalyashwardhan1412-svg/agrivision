from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database.database import Base

class OfferStatus(str, enum.Enum):
    PENDING = "PENDING"
    COUNTERED = "COUNTERED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class NegotiationActionType(str, enum.Enum):
    OFFER_MADE = "OFFER_MADE"
    COUNTERED = "COUNTERED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"

class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    offer_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. "OFF-A1B2C3D4"
    requirement_id = Column(Integer, ForeignKey("buyer_requirements.id"), nullable=True)
    listing_id = Column(Integer, ForeignKey("crop_listings.id"), nullable=True)
    buyer_id = Column(Integer, ForeignKey("customer_profiles.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("farmer_profiles.id"), nullable=False)
    produce_name = Column(String(100), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), default="Quintal", nullable=False)
    offered_price = Column(Float, nullable=False)
    price_unit = Column(String(50), default="₹/Quintal", nullable=False)
    delivery_preference = Column(String(100), default="Pickup from Farm")
    location = Column(String(200), nullable=True)
    message = Column(Text, nullable=True)
    status = Column(Enum(OfferStatus), default=OfferStatus.PENDING, nullable=False)
    expires_at = Column(DateTime, nullable=True)
    accepted_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    requirement = relationship("BuyerRequirement", back_populates="offers")
    listing = relationship("CropListing")
    buyer = relationship("CustomerProfile")
    farmer = relationship("FarmerProfile")
    negotiations = relationship("OfferNegotiation", back_populates="offer", order_by="OfferNegotiation.created_at.asc()", cascade="all, delete-orphan")

class OfferNegotiation(Base):
    __tablename__ = "offer_negotiations"

    id = Column(Integer, primary_key=True, index=True)
    offer_id = Column(Integer, ForeignKey("offers.id"), nullable=False)
    sender_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sender_role = Column(String(50), nullable=False) # FARMER or CUSTOMER
    action_type = Column(Enum(NegotiationActionType), nullable=False)
    offered_price = Column(Float, nullable=False)
    quantity = Column(Float, nullable=False)
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    offer = relationship("Offer", back_populates="negotiations")
    sender = relationship("User")

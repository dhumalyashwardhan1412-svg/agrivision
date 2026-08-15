from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database.database import Base

class ListingStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SOLD_OUT = "SOLD_OUT"
    DRAFT = "DRAFT"
    CLOSED = "CLOSED"

class CropListing(Base):
    __tablename__ = "crop_listings"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmer_profiles.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=True)
    title = Column(String(255), nullable=False) # e.g. "Farm Fresh Organic Hybrid Tomatoes", "Grade-A Sharbati Wheat"
    crop_name = Column(String(100), nullable=False)
    category = Column(String(100), default="Vegetables") # Vegetables, Fruits, Grains, Pulses, Spices, Oilseeds
    variety = Column(String(100), nullable=True)
    quantity_available = Column(Float, nullable=False)
    unit = Column(String(50), default="kg") # kg, Quintal, Box, Crate
    price_per_unit = Column(Float, nullable=False)
    min_order_quantity = Column(Float, default=1.0)
    harvest_date = Column(DateTime, nullable=True)
    is_organic = Column(Boolean, default=False)
    quality_grade = Column(String(50), default="Grade A (Export/Premium)")
    location_city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    image_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    status = Column(Enum(ListingStatus), default=ListingStatus.ACTIVE, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    farmer = relationship("FarmerProfile", back_populates="crop_listings")
    crop = relationship("Crop", back_populates="listings")
    reviews = relationship("Review", back_populates="listing", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="listing")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("crop_listings.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, default=5) # 1 - 5 stars
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    listing = relationship("CropListing", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews_written")

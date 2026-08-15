from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database.database import Base

class UserRole(str, enum.Enum):
    FARMER = "FARMER"
    CUSTOMER = "CUSTOMER"
    SHOPKEEPER = "SHOPKEEPER"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone_number = Column(String(50), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.FARMER, nullable=False)
    is_active = Column(Boolean, default=True)
    avatar_url = Column(String(500), nullable=True)
    address = Column(String(500), nullable=True)
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Profile relationships
    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    customer_profile = relationship("CustomerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    shopkeeper_profile = relationship("ShopkeeperProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    # Generic user entities
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    reviews_written = relationship("Review", back_populates="reviewer", cascade="all, delete-orphan")

class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    total_land_area = Column(Float, default=0.0) # in acres
    farming_experience_years = Column(Integer, default=0)
    primary_crops = Column(String(500), nullable=True)
    irrigation_source = Column(String(200), nullable=True) # Canal, Tubewell, Rainfed, Drip
    organic_certified = Column(Boolean, default=False)
    kisan_credit_card = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="farmer_profile")
    farms = relationship("Farm", back_populates="farmer", cascade="all, delete-orphan")
    crop_listings = relationship("CropListing", back_populates="farmer", cascade="all, delete-orphan")
    orders_received = relationship("Order", back_populates="farmer", cascade="all, delete-orphan")

class CustomerProfile(Base):
    __tablename__ = "customer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    preferred_payment_method = Column(String(100), default="Cash on Delivery")
    delivery_address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="customer_profile")
    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")

class ShopkeeperProfile(Base):
    __tablename__ = "shopkeeper_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    business_license_number = Column(String(100), nullable=True)
    gstin = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="shopkeeper_profile")
    shops = relationship("Shop", back_populates="owner", cascade="all, delete-orphan")

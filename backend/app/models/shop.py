from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.database import Base

class Shop(Base):
    __tablename__ = "shops"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("shopkeeper_profiles.id"), nullable=False)
    shop_name = Column(String(255), nullable=False)
    shop_type = Column(String(100), default="Agri Inputs & Machinery") # Seeds & Fertilizer, Farm Equipment, Soil Clinic, Multi-brand Agri-Store
    address = Column(String(500), nullable=False)
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    pincode = Column(String(20), nullable=True)
    latitude = Column(Float, nullable=False, default=28.6139) # default Delhi / Punjab / Haryana region
    longitude = Column(Float, nullable=False, default=77.2090)
    contact_phone = Column(String(50), nullable=False)
    email = Column(String(100), nullable=True)
    rating = Column(Float, default=4.8)
    verified = Column(Boolean, default=True)
    opening_hours = Column(String(100), default="08:00 AM - 08:00 PM")
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("ShopkeeperProfile", back_populates="shops")
    products = relationship("ShopProduct", back_populates="shop", cascade="all, delete-orphan")
    rentals = relationship("EquipmentRental", back_populates="shop", cascade="all, delete-orphan")

class ShopProduct(Base):
    __tablename__ = "shop_products"

    id = Column(Integer, primary_key=True, index=True)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # Seeds, Fertilizer, Bio-fertilizer, Pesticide, Herbicide, Irrigation, Tools
    brand = Column(String(100), nullable=True)
    price = Column(Float, nullable=False)
    unit = Column(String(50), default="Pack") # kg, Litre, 50kg Bag, Unit, Pack
    stock_quantity = Column(Integer, default=100)
    is_organic = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    shop = relationship("Shop", back_populates="products")

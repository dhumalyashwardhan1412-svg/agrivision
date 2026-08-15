from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database.database import Base

class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    PACKED = "PACKED"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(100), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customer_profiles.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("farmer_profiles.id"), nullable=True) # Direct farmer purchase
    total_amount_inr = Column(Float, nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    
    # Shipping info
    delivery_name = Column(String(255), nullable=False)
    delivery_phone = Column(String(50), nullable=False)
    delivery_address = Column(Text, nullable=False)
    delivery_city = Column(String(100), nullable=False)
    delivery_pincode = Column(String(20), nullable=False)
    
    # Payment info
    payment_method = Column(String(100), default="Cash on Delivery") # Cash on Delivery, UPI / Net Banking
    payment_status = Column(String(50), default="PENDING") # PENDING, PAID, REFUNDED
    tracking_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    customer = relationship("CustomerProfile", back_populates="orders")
    farmer = relationship("FarmerProfile", back_populates="orders_received")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    listing_id = Column(Integer, ForeignKey("crop_listings.id"), nullable=True)
    item_title = Column(String(255), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), default="kg")
    unit_price = Column(Float, nullable=False)
    subtotal_inr = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    listing = relationship("CropListing", back_populates="order_items")

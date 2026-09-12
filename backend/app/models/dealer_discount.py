from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database.database import Base

class DiscountType(str, enum.Enum):
    PERCENTAGE = "PERCENTAGE"
    FIXED_AMOUNT = "FIXED_AMOUNT"

class DealerDiscount(Base):
    __tablename__ = "dealer_discounts"

    id = Column(Integer, primary_key=True, index=True)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("shop_products.id"), nullable=False)
    title = Column(String(255), nullable=False) # e.g. "Kharif Sowing Season Special 15% OFF"
    discount_type = Column(Enum(DiscountType), default=DiscountType.PERCENTAGE, nullable=False)
    discount_value = Column(Float, nullable=False) # 15.0 (%) or 150.0 (₹)
    min_quantity = Column(Integer, default=1)
    max_discount_inr = Column(Float, nullable=True) # cap on total discount
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    shop = relationship("Shop")
    product = relationship("ShopProduct")

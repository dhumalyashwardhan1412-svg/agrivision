from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database.database import Base

class ReviewType(str, enum.Enum):
    FARMER_TO_BUYER = "FARMER_TO_BUYER"
    BUYER_TO_FARMER = "BUYER_TO_FARMER"
    CUSTOMER_TO_DEALER = "CUSTOMER_TO_DEALER"

class TransactionReview(Base):
    __tablename__ = "transaction_reviews"

    id = Column(Integer, primary_key=True, index=True)
    review_type = Column(Enum(ReviewType), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    offer_id = Column(Integer, ForeignKey("offers.id"), nullable=True)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False) # 1 - 5 stars
    category_ratings = Column(JSON, nullable=True) # e.g. {"communication": 5, "product_quality": 4, "delivery": 5, "pricing": 5}
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    reviewer = relationship("User", foreign_keys=[reviewer_id])
    target_user = relationship("User", foreign_keys=[target_user_id])
    order = relationship("Order")
    offer = relationship("Offer")
    shop = relationship("Shop")

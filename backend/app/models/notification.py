from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database.database import Base

class NotificationPriority(str, enum.Enum):
    INFO = "INFO"
    SUCCESS = "SUCCESS"
    WARNING = "WARNING"
    URGENT = "URGENT"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    user_role = Column(String(50), nullable=True) # FARMER, CUSTOMER, SHOPKEEPER, ADMIN
    notification_type = Column(String(100), default="SYSTEM", index=True) # SCHEME, OFFER, NEGOTIATION, ORDER, REVIEW, STOCK, SYSTEM, SYNC
    category = Column(String(100), default="SYSTEM") # for backwards-compatibility
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    related_entity_type = Column(String(100), nullable=True) # Offer, GovernmentScheme, Order, ShopProduct, TransactionReview
    related_entity_id = Column(String(100), nullable=True)
    action_url = Column(String(255), nullable=True)
    link_url = Column(String(255), nullable=True) # alias for action_url for backwards-compatibility
    is_read = Column(Boolean, default=False, index=True)
    priority = Column(String(20), default="INFO") # INFO, SUCCESS, WARNING, URGENT
    event_key = Column(String(255), nullable=True, index=True) # unique key to deduplicate alerts
    metadata_json = Column(JSON, nullable=True)
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="notifications")

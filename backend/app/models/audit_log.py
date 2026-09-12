from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_name = Column(String(255), nullable=True)
    user_role = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False) # e.g. "USER_VERIFIED", "USER_SUSPENDED", "SCHEME_CREATED"
    entity_type = Column(String(100), nullable=False) # "USER", "SCHEME", "PRODUCT", "OFFER", "ORDER"
    entity_id = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    before_state = Column(JSON, nullable=True)
    after_state = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User")

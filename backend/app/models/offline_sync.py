from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database.database import Base

class SyncStatus(str, enum.Enum):
    PENDING = "PENDING"
    SYNCING = "SYNCING"
    SYNCED = "SYNCED"
    FAILED = "FAILED"
    CONFLICT = "CONFLICT"

class OfflineSyncRecord(Base):
    __tablename__ = "offline_sync_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_role = Column(String(50), nullable=False)
    client_session_id = Column(String(100), nullable=True)
    sync_item_type = Column(String(100), nullable=False) # e.g. "SAVE_SCHEME", "REQUIREMENT_DRAFT", "CLIENT_PING"
    client_item_id = Column(String(100), nullable=True)
    payload = Column(JSON, nullable=True)
    status = Column(Enum(SyncStatus), default=SyncStatus.SYNCED, nullable=False)
    retry_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_offline_at = Column(DateTime, nullable=True)
    synced_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")

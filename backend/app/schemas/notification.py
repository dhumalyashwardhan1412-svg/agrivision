from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    user_role: Optional[str] = None
    notification_type: str = "SYSTEM"
    category: str = "SYSTEM"
    title: str
    message: str
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[str] = None
    action_url: Optional[str] = None
    link_url: Optional[str] = None
    is_read: bool = False
    priority: str = "INFO"
    event_key: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None
    read_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UnreadCountResponse(BaseModel):
    unread_count: int

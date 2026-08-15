from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    category: str
    is_read: bool
    link_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

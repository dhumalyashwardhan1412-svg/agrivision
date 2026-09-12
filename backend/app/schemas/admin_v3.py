from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.user import UserRole, UserAccountStatus, UserVerificationStatus

class AdminUserItemResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone_number: Optional[str] = None
    role: UserRole
    status: UserAccountStatus
    verification_status: UserVerificationStatus
    verified_at: Optional[datetime] = None
    verification_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    warning_count: int
    state: Optional[str] = None
    district: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserVerificationActionRequest(BaseModel):
    notes: Optional[str] = None
    rejection_reason: Optional[str] = None

class UserStatusActionRequest(BaseModel):
    reason: str
    duration_days: Optional[int] = None # For temporary suspensions

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    user_role: Optional[str] = None
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    description: str
    before_state: Optional[Dict[str, Any]] = None
    after_state: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class OfflineSyncMonitorItem(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    user_role: str
    client_session_id: Optional[str] = None
    sync_item_type: str
    client_item_id: Optional[str] = None
    status: str
    retry_count: int
    error_message: Optional[str] = None
    created_offline_at: Optional[datetime] = None
    synced_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class OfflineSyncStatsResponse(BaseModel):
    total_sync_events: int
    pending_syncs: int
    successful_syncs: int
    failed_syncs: int
    conflicts: int
    last_sync_timestamp: Optional[datetime] = None
    records: List[OfflineSyncMonitorItem] = []

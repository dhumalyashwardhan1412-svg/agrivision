from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models.user import UserRole, UserAccountStatus, ModerationActionType, ReportStatus

class UserModerationSummary(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    phone_number: Optional[str] = None
    role: UserRole
    status: UserAccountStatus
    warning_count: int
    suspension_until: Optional[datetime] = None
    blocked_at: Optional[datetime] = None
    blocked_reason: Optional[str] = None
    is_active: bool
    state: Optional[str] = None
    district: Optional[str] = None
    created_at: datetime
    listings_count: int = 0
    orders_count: int = 0
    reports_received_count: int = 0

    class Config:
        from_attributes = True

class WarnUserRequest(BaseModel):
    user_id: int
    reason: str
    description: Optional[str] = None

class SuspendUserRequest(BaseModel):
    user_id: int
    duration_days: int = 7 # 1, 3, 7, 30, or custom
    reason: str
    description: Optional[str] = None

class BlockUserRequest(BaseModel):
    user_id: int
    reason: str
    description: Optional[str] = None

class UnblockUserRequest(BaseModel):
    user_id: int
    reason: Optional[str] = "Admin reviewed and reinstated account."

class ModerationActionResponse(BaseModel):
    id: int
    user_id: int
    admin_id: int
    action: ModerationActionType
    reason: str
    description: Optional[str] = None
    created_at: datetime
    expires_at: Optional[datetime] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    admin_name: Optional[str] = None

    class Config:
        from_attributes = True

class CreateReportRequest(BaseModel):
    reported_user_id: int
    reason: str # Spam, Fraud/Scam, Fake Product, Misleading Information, Harassment, Suspicious Activity, Duplicate Account, Other
    description: Optional[str] = None

class UpdateReportStatusRequest(BaseModel):
    status: ReportStatus
    admin_notes: Optional[str] = None

class UserReportResponse(BaseModel):
    id: int
    reporter_id: int
    reported_user_id: int
    reason: str
    description: Optional[str] = None
    status: ReportStatus
    admin_id: Optional[int] = None
    admin_notes: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None
    reporter_name: Optional[str] = None
    reporter_email: Optional[str] = None
    reported_user_name: Optional[str] = None
    reported_user_email: Optional[str] = None
    reported_user_role: Optional[str] = None

    class Config:
        from_attributes = True

class ModerationStatsResponse(BaseModel):
    total_users: int
    active_users: int
    warned_users: int
    suspended_users: int
    blocked_users: int
    pending_reports: int
    resolved_reports: int

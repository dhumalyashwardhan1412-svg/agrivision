from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import require_role
from app.models.user import User, UserRole, UserAccountStatus, UserVerificationStatus
from app.models.scheme import GovernmentScheme, GovernmentType, SchemeCategory
from app.models.audit_log import AuditLog
from app.models.offline_sync import OfflineSyncRecord, SyncStatus
from app.schemas.admin_v3 import (
    AdminUserItemResponse,
    UserVerificationActionRequest,
    UserStatusActionRequest,
    AuditLogResponse,
    OfflineSyncStatsResponse,
    OfflineSyncMonitorItem
)
from app.schemas.scheme import (
    SchemeResponse,
    SchemeCreate,
    SchemeUpdate
)
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/admin", tags=["Admin Control Center"])

# -------------------------------------------------------------
# 1. User Management & Verification
# -------------------------------------------------------------

@router.get("/users", response_model=List[AdminUserItemResponse])
def list_admin_users(
    role: Optional[UserRole] = None,
    status_filter: Optional[UserAccountStatus] = None,
    verification_filter: Optional[UserVerificationStatus] = None,
    q: Optional[str] = None,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    query = db.query(User)

    if role:
        query = query.filter(User.role == role)
    if status_filter:
        query = query.filter(User.status == status_filter)
    if verification_filter:
        query = query.filter(User.verification_status == verification_filter)
    if q:
        search_fmt = f"%{q}%"
        query = query.filter(
            (User.full_name.ilike(search_fmt)) |
            (User.email.ilike(search_fmt)) |
            (User.phone_number.ilike(search_fmt)) |
            (User.district.ilike(search_fmt))
        )

    users = query.order_by(User.created_at.desc()).all()
    return users

@router.post("/users/{user_id}/verify", response_model=AdminUserItemResponse)
def verify_user(
    user_id: int,
    action_in: UserVerificationActionRequest,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.verification_status = UserVerificationStatus.VERIFIED
    user.verified_by_id = current_user.id
    user.verified_at = datetime.now(timezone.utc)
    user.verification_notes = action_in.notes or "Profile & credentials verified by Admin"
    user.rejection_reason = None

    db.commit()
    db.refresh(user)

    log_audit_event(
        db=db,
        action="VERIFY_USER",
        target_type="User",
        user_id=current_user.id,
        target_id=user.id,
        details={"user_email": user.email, "role": user.role.value, "notes": user.verification_notes}
    )

    return user

@router.post("/users/{user_id}/reject-verification", response_model=AdminUserItemResponse)
def reject_user_verification(
    user_id: int,
    action_in: UserVerificationActionRequest,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.verification_status = UserVerificationStatus.REJECTED
    user.verified_by_id = current_user.id
    user.verified_at = datetime.now(timezone.utc)
    user.rejection_reason = action_in.rejection_reason or "Submitted documentation or profile details do not meet verification criteria"

    db.commit()
    db.refresh(user)

    log_audit_event(
        db=db,
        action="REJECT_USER_VERIFICATION",
        target_type="User",
        user_id=current_user.id,
        target_id=user.id,
        details={"user_email": user.email, "reason": user.rejection_reason}
    )

    return user

@router.post("/users/{user_id}/suspend", response_model=AdminUserItemResponse)
def suspend_user(
    user_id: int,
    action_in: UserStatusActionRequest,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.role == UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot suspend an administrator")

    user.status = UserAccountStatus.SUSPENDED
    user.blocked_reason = action_in.reason
    days = action_in.duration_days or 7
    user.suspension_until = datetime.now(timezone.utc) + timedelta(days=days)

    db.commit()
    db.refresh(user)

    log_audit_event(
        db=db,
        action="SUSPEND_USER",
        target_type="User",
        user_id=current_user.id,
        target_id=user.id,
        details={"user_email": user.email, "reason": action_in.reason, "duration_days": days}
    )

    return user

@router.post("/users/{user_id}/activate", response_model=AdminUserItemResponse)
def activate_user(
    user_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.status = UserAccountStatus.ACTIVE
    user.suspension_until = None
    user.blocked_reason = None

    db.commit()
    db.refresh(user)

    log_audit_event(
        db=db,
        action="ACTIVATE_USER",
        target_type="User",
        user_id=current_user.id,
        target_id=user.id,
        details={"user_email": user.email}
    )

    return user

# -------------------------------------------------------------
# 2. Scheme Manager (CRUD + Verification)
# -------------------------------------------------------------

@router.get("/schemes", response_model=List[SchemeResponse])
def admin_list_schemes(
    category: Optional[SchemeCategory] = None,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    query = db.query(GovernmentScheme)
    if category:
        query = query.filter(GovernmentScheme.category == category)
    schemes = query.order_by(GovernmentScheme.created_at.desc()).all()
    return [SchemeResponse.from_orm(s) for s in schemes]

@router.post("/schemes", response_model=SchemeResponse, status_code=status.HTTP_201_CREATED)
def admin_create_scheme(
    scheme_in: SchemeCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    scheme = GovernmentScheme(**scheme_in.dict())
    scheme.is_verified = True
    scheme.last_verified_date = datetime.now(timezone.utc)
    db.add(scheme)
    db.commit()
    db.refresh(scheme)

    log_audit_event(
        db=db,
        action="CREATE_SCHEME",
        target_type="GovernmentScheme",
        user_id=current_user.id,
        target_id=scheme.id,
        details={"name": scheme.name, "code": scheme.scheme_code}
    )

    return SchemeResponse.from_orm(scheme)

@router.put("/schemes/{scheme_id}", response_model=SchemeResponse)
def admin_update_scheme(
    scheme_id: int,
    scheme_update: SchemeUpdate,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    scheme = db.query(GovernmentScheme).filter(GovernmentScheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found")

    data = scheme_update.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(scheme, k, v)
    
    scheme.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(scheme)

    log_audit_event(
        db=db,
        action="UPDATE_SCHEME",
        target_type="GovernmentScheme",
        user_id=current_user.id,
        target_id=scheme.id,
        details={"name": scheme.name}
    )

    return SchemeResponse.from_orm(scheme)

@router.post("/schemes/{scheme_id}/verify", response_model=SchemeResponse)
def admin_verify_scheme(
    scheme_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    scheme = db.query(GovernmentScheme).filter(GovernmentScheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found")

    scheme.is_verified = True
    scheme.last_verified_date = datetime.now(timezone.utc)
    db.commit()
    db.refresh(scheme)

    return SchemeResponse.from_orm(scheme)

@router.delete("/schemes/{scheme_id}")
def admin_delete_scheme(
    scheme_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    scheme = db.query(GovernmentScheme).filter(GovernmentScheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found")

    name = scheme.name
    db.delete(scheme)
    db.commit()

    log_audit_event(
        db=db,
        action="DELETE_SCHEME",
        target_type="GovernmentScheme",
        user_id=current_user.id,
        target_id=scheme_id,
        details={"name": name}
    )

    return {"message": f"Scheme '{name}' deleted successfully"}

# -------------------------------------------------------------
# 3. System-wide Audit Logs
# -------------------------------------------------------------

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))
    if entity_type:
        query = query.filter(AuditLog.entity_type.ilike(f"%{entity_type}%"))

    logs = query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()

    results = []
    for log_item in logs:
        user_name = log_item.user_name or (log_item.user.full_name if log_item.user else "System")
        user_role = log_item.user_role or (log_item.user.role.value if log_item.user else "SYSTEM")

        results.append(AuditLogResponse(
            id=log_item.id,
            user_id=log_item.user_id,
            user_name=user_name,
            user_role=user_role,
            action=log_item.action,
            entity_type=log_item.entity_type,
            entity_id=log_item.entity_id,
            description=log_item.description,
            before_state=log_item.before_state,
            after_state=log_item.after_state,
            ip_address=log_item.ip_address,
            created_at=log_item.created_at
        ))
    return results

# -------------------------------------------------------------
# 4. Offline Sync Monitor
# -------------------------------------------------------------

@router.get("/offline-sync", response_model=OfflineSyncStatsResponse)
def get_offline_sync_stats(
    status_filter: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    total = db.query(OfflineSyncRecord).count()
    pending = db.query(OfflineSyncRecord).filter(OfflineSyncRecord.status == SyncStatus.PENDING).count()
    successful = db.query(OfflineSyncRecord).filter(OfflineSyncRecord.status == SyncStatus.SYNCED).count()
    failed = db.query(OfflineSyncRecord).filter(OfflineSyncRecord.status == SyncStatus.FAILED).count()

    latest = db.query(OfflineSyncRecord).order_by(OfflineSyncRecord.created_at.desc()).first()

    query = db.query(OfflineSyncRecord)
    if status_filter:
        try:
            s_enum = SyncStatus(status_filter.upper())
            query = query.filter(OfflineSyncRecord.status == s_enum)
        except ValueError:
            pass

    records = query.order_by(OfflineSyncRecord.created_at.desc()).limit(limit).all()

    record_items = []
    for r in records:
        u_name = r.user.full_name if r.user else "Unknown"
        u_role = r.user.role.value if r.user else "USER"
        record_items.append(OfflineSyncMonitorItem(
            id=r.id,
            user_id=r.user_id,
            user_name=u_name,
            user_role=u_role,
            client_session_id=None,
            sync_item_type=r.action_type,
            client_item_id=r.client_mutation_id,
            status=r.status.value,
            retry_count=r.retry_count,
            error_message=r.error_message,
            created_offline_at=r.created_at,
            synced_at=r.synced_at or r.created_at,
            created_at=r.created_at
        ))

    return OfflineSyncStatsResponse(
        total_sync_events=total,
        pending_syncs=pending,
        successful_syncs=successful,
        failed_syncs=failed,
        conflicts=0,
        last_sync_timestamp=latest.created_at if latest else None,
        records=record_items
    )

@router.post("/offline-sync/{record_id}/retry")
def retry_offline_sync(
    record_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    record = db.query(OfflineSyncRecord).filter(OfflineSyncRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")

    record.status = SyncStatus.PENDING
    record.retry_count = 0
    record.error_message = None
    db.commit()

    return {"message": "Sync record queued for retry", "record_id": record.id}

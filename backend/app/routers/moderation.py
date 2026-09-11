from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from app.database.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import (
    User, UserRole, UserAccountStatus,
    ModerationAction, ModerationActionType,
    UserReport, ReportStatus
)
from app.models.listing import CropListing
from app.models.order import Order
from app.models.notification import Notification
from app.schemas.moderation import (
    UserModerationSummary,
    WarnUserRequest,
    SuspendUserRequest,
    BlockUserRequest,
    UnblockUserRequest,
    ModerationActionResponse,
    CreateReportRequest,
    UpdateReportStatusRequest,
    UserReportResponse,
    ModerationStatsResponse
)

router = APIRouter(prefix="/moderation", tags=["Admin User Moderation & Safety"])

@router.get("/stats", response_model=ModerationStatsResponse)
def get_moderation_overview_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    total = db.query(User).count()
    active = db.query(User).filter(User.status == UserAccountStatus.ACTIVE).count()
    warned = db.query(User).filter(User.status == UserAccountStatus.WARNED).count()
    suspended = db.query(User).filter(User.status == UserAccountStatus.SUSPENDED).count()
    blocked = db.query(User).filter(User.status == UserAccountStatus.BLOCKED).count()
    pending_reports = db.query(UserReport).filter(UserReport.status == ReportStatus.PENDING).count()
    resolved_reports = db.query(UserReport).filter(UserReport.status == ReportStatus.RESOLVED).count()

    return ModerationStatsResponse(
        total_users=total,
        active_users=active,
        warned_users=warned,
        suspended_users=suspended,
        blocked_users=blocked,
        pending_reports=pending_reports,
        resolved_reports=resolved_reports
    )

@router.get("/users", response_model=List[UserModerationSummary])
def list_users_for_moderation(
    search: Optional[str] = None,
    role_filter: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    query = db.query(User)

    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                User.full_name.ilike(s),
                User.email.ilike(s),
                User.phone_number.ilike(s),
                User.state.ilike(s),
                User.district.ilike(s)
            )
        )

    if role_filter and role_filter != "ALL":
        try:
            r = UserRole(role_filter)
            query = query.filter(User.role == r)
        except ValueError:
            pass

    if status_filter and status_filter != "ALL":
        try:
            st = UserAccountStatus(status_filter)
            query = query.filter(User.status == st)
        except ValueError:
            pass

    users = query.order_by(User.created_at.desc()).all()

    result = []
    for u in users:
        # Calculate related counts
        listings_count = db.query(CropListing).filter(CropListing.farmer_id == u.id).count() if u.farmer_profile else 0
        orders_count = db.query(Order).filter(
            or_(Order.customer_id == u.id, Order.farmer_id == u.id)
        ).count()
        reports_count = db.query(UserReport).filter(UserReport.reported_user_id == u.id).count()

        result.append(UserModerationSummary(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            phone_number=u.phone_number,
            role=u.role,
            status=u.status,
            warning_count=u.warning_count,
            suspension_until=u.suspension_until,
            blocked_at=u.blocked_at,
            blocked_reason=u.blocked_reason,
            is_active=u.is_active,
            state=u.state,
            district=u.district,
            created_at=u.created_at,
            listings_count=listings_count,
            orders_count=orders_count,
            reports_received_count=reports_count
        ))

    return result

@router.post("/warn", response_model=ModerationActionResponse)
def warn_user(
    req: WarnUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    target = db.query(User).filter(User.id == req.user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.role == UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Cannot apply moderation actions to administrator accounts.")

    target.warning_count += 1
    if target.status == UserAccountStatus.ACTIVE:
        target.status = UserAccountStatus.WARNED

    action_record = ModerationAction(
        user_id=target.id,
        admin_id=current_user.id,
        action=ModerationActionType.WARNING,
        reason=req.reason,
        description=req.description,
        created_at=datetime.now(timezone.utc)
    )
    db.add(action_record)

    # Issue notification to user
    notif = Notification(
        user_id=target.id,
        title="Account Policy Warning",
        message=f"Your account has received an administrative warning: {req.reason}. Please adhere to AgriVision marketplace guidelines.",
        category="WARNING",
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(action_record)

    return ModerationActionResponse(
        id=action_record.id,
        user_id=target.id,
        admin_id=current_user.id,
        action=action_record.action,
        reason=action_record.reason,
        description=action_record.description,
        created_at=action_record.created_at,
        user_name=target.full_name,
        user_email=target.email,
        admin_name=current_user.full_name
    )

@router.post("/suspend", response_model=ModerationActionResponse)
def suspend_user(
    req: SuspendUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    target = db.query(User).filter(User.id == req.user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.role == UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Cannot suspend administrator accounts.")

    days = max(1, req.duration_days)
    expires_at = datetime.now(timezone.utc) + timedelta(days=days)

    target.status = UserAccountStatus.SUSPENDED
    target.suspension_until = expires_at
    target.blocked_reason = req.reason

    action_record = ModerationAction(
        user_id=target.id,
        admin_id=current_user.id,
        action=ModerationActionType.SUSPENSION,
        reason=req.reason,
        description=req.description,
        created_at=datetime.now(timezone.utc),
        expires_at=expires_at
    )
    db.add(action_record)

    # Issue notification
    notif = Notification(
        user_id=target.id,
        title=f"Account Suspended for {days} Days",
        message=f"Your account access has been temporarily suspended until {expires_at.strftime('%Y-%m-%d %H:%M UTC')}. Reason: {req.reason}",
        category="SUSPENSION",
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(action_record)

    return ModerationActionResponse(
        id=action_record.id,
        user_id=target.id,
        admin_id=current_user.id,
        action=action_record.action,
        reason=action_record.reason,
        description=action_record.description,
        created_at=action_record.created_at,
        expires_at=action_record.expires_at,
        user_name=target.full_name,
        user_email=target.email,
        admin_name=current_user.full_name
    )

@router.post("/block", response_model=ModerationActionResponse)
def block_user(
    req: BlockUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    target = db.query(User).filter(User.id == req.user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.role == UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Cannot block administrator accounts.")

    target.status = UserAccountStatus.BLOCKED
    target.blocked_at = datetime.now(timezone.utc)
    target.blocked_reason = req.reason
    target.suspension_until = None

    action_record = ModerationAction(
        user_id=target.id,
        admin_id=current_user.id,
        action=ModerationActionType.BLOCK,
        reason=req.reason,
        description=req.description,
        created_at=datetime.now(timezone.utc)
    )
    db.add(action_record)
    db.commit()
    db.refresh(action_record)

    return ModerationActionResponse(
        id=action_record.id,
        user_id=target.id,
        admin_id=current_user.id,
        action=action_record.action,
        reason=action_record.reason,
        description=action_record.description,
        created_at=action_record.created_at,
        user_name=target.full_name,
        user_email=target.email,
        admin_name=current_user.full_name
    )

@router.post("/unblock", response_model=ModerationActionResponse)
def unblock_user(
    req: UnblockUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    target = db.query(User).filter(User.id == req.user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    target.status = UserAccountStatus.ACTIVE
    target.blocked_at = None
    target.blocked_reason = None
    target.suspension_until = None

    action_record = ModerationAction(
        user_id=target.id,
        admin_id=current_user.id,
        action=ModerationActionType.UNBLOCK,
        reason=req.reason or "Reinstated by administrator.",
        created_at=datetime.now(timezone.utc)
    )
    db.add(action_record)

    notif = Notification(
        user_id=target.id,
        title="Account Reinstated",
        message="Your AgriVision account has been reinstated to active status. Thank you for your cooperation.",
        category="SYSTEM",
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(action_record)

    return ModerationActionResponse(
        id=action_record.id,
        user_id=target.id,
        admin_id=current_user.id,
        action=action_record.action,
        reason=action_record.reason,
        description=action_record.description,
        created_at=action_record.created_at,
        user_name=target.full_name,
        user_email=target.email,
        admin_name=current_user.full_name
    )

@router.get("/history", response_model=List[ModerationActionResponse])
def get_moderation_history(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    actions = (
        db.query(ModerationAction)
        .order_by(ModerationAction.created_at.desc())
        .limit(limit)
        .all()
    )

    results = []
    for a in actions:
        target = db.query(User).filter(User.id == a.user_id).first()
        admin = db.query(User).filter(User.id == a.admin_id).first()
        results.append(ModerationActionResponse(
            id=a.id,
            user_id=a.user_id,
            admin_id=a.admin_id,
            action=a.action,
            reason=a.reason,
            description=a.description,
            created_at=a.created_at,
            expires_at=a.expires_at,
            user_name=target.full_name if target else "Unknown",
            user_email=target.email if target else "Unknown",
            admin_name=admin.full_name if admin else "System Admin"
        ))
    return results

# =======================================================
# USER REPORTING SYSTEM (Available to all users + Admin)
# =======================================================

@router.post("/reports", response_model=UserReportResponse)
def report_user(
    req: CreateReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if req.reported_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot file a report against your own account.")

    target = db.query(User).filter(User.id == req.reported_user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Reported user not found.")

    report = UserReport(
        reporter_id=current_user.id,
        reported_user_id=target.id,
        reason=req.reason,
        description=req.description,
        status=ReportStatus.PENDING,
        created_at=datetime.now(timezone.utc)
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return UserReportResponse(
        id=report.id,
        reporter_id=current_user.id,
        reported_user_id=target.id,
        reason=report.reason,
        description=report.description,
        status=report.status,
        created_at=report.created_at,
        reporter_name=current_user.full_name,
        reporter_email=current_user.email,
        reported_user_name=target.full_name,
        reported_user_email=target.email,
        reported_user_role=target.role.value
    )

@router.get("/reports", response_model=List[UserReportResponse])
def list_user_reports(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    query = db.query(UserReport)
    if status_filter and status_filter != "ALL":
        try:
            st = ReportStatus(status_filter)
            query = query.filter(UserReport.status == st)
        except ValueError:
            pass

    reports = query.order_by(UserReport.created_at.desc()).all()
    results = []
    for r in reports:
        reporter = db.query(User).filter(User.id == r.reporter_id).first()
        reported = db.query(User).filter(User.id == r.reported_user_id).first()
        results.append(UserReportResponse(
            id=r.id,
            reporter_id=r.reporter_id,
            reported_user_id=r.reported_user_id,
            reason=r.reason,
            description=r.description,
            status=r.status,
            admin_id=r.admin_id,
            admin_notes=r.admin_notes,
            created_at=r.created_at,
            resolved_at=r.resolved_at,
            reporter_name=reporter.full_name if reporter else "Unknown",
            reporter_email=reporter.email if reporter else "Unknown",
            reported_user_name=reported.full_name if reported else "Unknown",
            reported_user_email=reported.email if reported else "Unknown",
            reported_user_role=reported.role.value if reported else "Unknown"
        ))
    return results

@router.patch("/reports/{report_id}/status", response_model=UserReportResponse)
def update_report_status(
    report_id: int,
    req: UpdateReportStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    report = db.query(UserReport).filter(UserReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.status = req.status
    report.admin_id = current_user.id
    report.admin_notes = req.admin_notes
    if req.status in [ReportStatus.RESOLVED, ReportStatus.REJECTED]:
        report.resolved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(report)

    reporter = db.query(User).filter(User.id == report.reporter_id).first()
    reported = db.query(User).filter(User.id == report.reported_user_id).first()

    return UserReportResponse(
        id=report.id,
        reporter_id=report.reporter_id,
        reported_user_id=report.reported_user_id,
        reason=report.reason,
        description=report.description,
        status=report.status,
        admin_id=report.admin_id,
        admin_notes=report.admin_notes,
        created_at=report.created_at,
        resolved_at=report.resolved_at,
        reporter_name=reporter.full_name if reporter else "Unknown",
        reporter_email=reporter.email if reporter else "Unknown",
        reported_user_name=reported.full_name if reported else "Unknown",
        reported_user_email=reported.email if reported else "Unknown",
        reported_user_role=reported.role.value if reported else "Unknown"
    )

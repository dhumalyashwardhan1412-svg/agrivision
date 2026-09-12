from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from app.models.audit_log import AuditLog
from app.models.user import User

SENSITIVE_KEYS = {"password", "hashed_password", "token", "access_token", "refresh_token", "secret"}

def sanitize_details(details: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not details:
        return None
    sanitized = {}
    for k, v in details.items():
        if any(s in k.lower() for s in SENSITIVE_KEYS):
            sanitized[k] = "[REDACTED]"
        elif isinstance(v, dict):
            sanitized[k] = sanitize_details(v)
        else:
            sanitized[k] = v
    return sanitized

def log_audit_event(
    db: Session,
    action: str,
    target_type: str,
    user_id: Optional[int] = None,
    target_id: Optional[int] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
) -> AuditLog:
    """
    Safely records an audit entry. Never logs credentials or secrets.
    """
    clean_details = sanitize_details(details)
    
    u_name = None
    u_role = None
    if user_id:
        user_obj = db.query(User).filter(User.id == user_id).first()
        if user_obj:
            u_name = user_obj.full_name
            u_role = user_obj.role.value if hasattr(user_obj.role, "value") else str(user_obj.role)

    audit = AuditLog(
        user_id=user_id,
        user_name=u_name,
        user_role=u_role,
        action=action,
        entity_type=target_type,
        entity_id=str(target_id) if target_id is not None else None,
        description=f"{action} on {target_type}",
        after_state=clean_details,
        ip_address=ip_address,
        created_at=datetime.now(timezone.utc)
    )
    db.add(audit)
    try:
        db.commit()
        db.refresh(audit)
    except Exception:
        db.rollback()
        raise
    return audit

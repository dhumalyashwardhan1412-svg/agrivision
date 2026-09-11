from typing import Generator, Optional, List
from datetime import datetime, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import decode_access_token
from app.models.user import User, UserRole, UserAccountStatus

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id_str: str = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception
    
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account")

    # Account Moderation Status Verification
    if user.status == UserAccountStatus.BLOCKED:
        reason_text = f" Reason: {user.blocked_reason}" if user.blocked_reason else ""
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Your AgriVision account has been permanently blocked.{reason_text} Please contact support."
        )

    if user.status == UserAccountStatus.SUSPENDED:
        now_utc = datetime.now(timezone.utc)
        if user.suspension_until:
            susp_until = user.suspension_until.replace(tzinfo=timezone.utc) if user.suspension_until.tzinfo is None else user.suspension_until
            if now_utc < susp_until:
                formatted_until = susp_until.strftime("%Y-%m-%d %H:%M UTC")
                reason_text = f" Reason: {user.blocked_reason}" if user.blocked_reason else ""
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Your account is temporarily suspended until {formatted_until}.{reason_text} Please contact support if you believe this is a mistake."
                )
            else:
                # Suspension expired: automatically return to ACTIVE
                user.status = UserAccountStatus.ACTIVE
                user.suspension_until = None
                user.blocked_reason = None
                db.commit()
                db.refresh(user)

    return user

def get_optional_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload:
        return None
    user_id_str = payload.get("sub")
    if not user_id_str:
        return None
    try:
        user_id = int(user_id_str)
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None

def require_role(allowed_roles: List[UserRole]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required role in: {[r.value for r in allowed_roles]}"
            )
        return current_user
    return role_checker

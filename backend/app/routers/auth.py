import secrets
import hmac
import hashlib
import uuid
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.models.user import (
    User, UserRole, UserAccountStatus, UserVerificationStatus,
    FarmerProfile, CustomerProfile, ShopkeeperProfile, PasswordResetToken,
    PhoneOTPVerification
)
from app.models.farm import Farm
from app.schemas.auth import (
    UserRegister, UserLogin, Token, UserResponse, UserProfileUpdate,
    ForgotPasswordRequest, ForgotPasswordResponse,
    ResetPasswordRequest, ResetPasswordResponse,
    GoogleAuthRequest,
    SendOTPRequest, SendOTPResponse,
    VerifyOTPRequest, VerifyOTPResponse
)
from app.services.sms_service import get_sms_provider

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/otp/send", response_model=SendOTPResponse)
def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    phone = req.phone_number.strip()

    # 1. Prevent sending OTP if active user with this phone already exists
    existing_user = db.query(User).filter(User.phone_number == phone, User.is_active == True).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A registered account with this mobile number already exists. Please log in or use another number."
        )

    now = datetime.now(timezone.utc)

    # 2. Enforce resend cooldown (60s)
    recent_otp = (
        db.query(PhoneOTPVerification)
        .filter(PhoneOTPVerification.phone_number == phone)
        .order_by(PhoneOTPVerification.created_at.desc())
        .first()
    )
    if recent_otp and recent_otp.created_at:
        created_utc = recent_otp.created_at.replace(tzinfo=timezone.utc) if recent_otp.created_at.tzinfo is None else recent_otp.created_at
        elapsed = (now - created_utc).total_seconds()
        if elapsed < settings.OTP_RESEND_COOLDOWN_SECONDS:
            wait_seconds = int(settings.OTP_RESEND_COOLDOWN_SECONDS - elapsed)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {wait_seconds} seconds before requesting a new OTP."
            )

    # 3. Enforce rate limit per hour (max 5 per hour)
    one_hour_ago = now - timedelta(hours=1)
    recent_records = (
        db.query(PhoneOTPVerification)
        .filter(PhoneOTPVerification.phone_number == phone)
        .order_by(PhoneOTPVerification.created_at.desc())
        .limit(20)
        .all()
    )
    count_last_hour = 0
    for r in recent_records:
        if r.created_at:
            r_created = r.created_at.replace(tzinfo=timezone.utc) if r.created_at.tzinfo is None else r.created_at
            if r_created >= one_hour_ago:
                count_last_hour += 1

    if count_last_hour >= settings.OTP_RATE_LIMIT_PER_HOUR:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many OTP requests for this phone number. Please try again after 1 hour."
        )

    # 4. Invalidate prior unconsumed OTPs for this phone number
    unconsumed = (
        db.query(PhoneOTPVerification)
        .filter(PhoneOTPVerification.phone_number == phone, PhoneOTPVerification.is_consumed == False)
        .all()
    )
    for u in unconsumed:
        u.is_consumed = True

    # 5. Cryptographically generate 6-digit OTP and HMAC
    otp = f"{secrets.randbelow(1000000):06d}"
    otp_hmac = hmac.new(settings.OTP_SECRET_KEY.encode(), otp.encode(), hashlib.sha256).hexdigest()
    request_id = f"otp_req_{uuid.uuid4().hex}"
    expires_at = now + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    otp_record = PhoneOTPVerification(
        request_id=request_id,
        phone_number=phone,
        otp_hmac=otp_hmac,
        attempts_count=0,
        is_verified=False,
        is_consumed=False,
        expires_at=expires_at,
        created_at=now
    )
    db.add(otp_record)
    db.commit()

    # 6. Dispatch SMS via configured provider
    sms_provider = get_sms_provider()
    sent, err_msg = sms_provider.send_otp(phone, otp)
    if not sent:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to deliver OTP SMS: {err_msg or 'SMS gateway error'}"
        )

    return SendOTPResponse(
        request_id=request_id,
        message="Verification OTP has been sent successfully to your mobile number.",
        cooldown_seconds=settings.OTP_RESEND_COOLDOWN_SECONDS,
        expires_in_seconds=settings.OTP_EXPIRE_MINUTES * 60,
        success=True
    )

@router.post("/otp/verify", response_model=VerifyOTPResponse)
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    phone = req.phone_number.strip()
    request_id = req.request_id.strip()
    otp = req.otp.strip()

    now = datetime.now(timezone.utc)

    # 1. Lookup verification record
    rec = (
        db.query(PhoneOTPVerification)
        .filter(
            PhoneOTPVerification.request_id == request_id,
            PhoneOTPVerification.phone_number == phone
        )
        .first()
    )

    if not rec:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP session. Please request a new verification code."
        )

    # 2. Check if consumed
    if rec.is_consumed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This verification request has already expired or been used. Please request a new code."
        )

    # 3. Check attempts count
    if rec.attempts_count >= settings.OTP_MAX_ATTEMPTS:
        rec.is_consumed = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum verification attempts exceeded. Please request a new OTP."
        )

    # 4. Check expiration
    exp = rec.expires_at.replace(tzinfo=timezone.utc) if rec.expires_at.tzinfo is None else rec.expires_at
    if now > exp:
        rec.is_consumed = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please request a new OTP."
        )

    # 5. Check HMAC
    expected_hmac = hmac.new(settings.OTP_SECRET_KEY.encode(), otp.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(rec.otp_hmac, expected_hmac):
        rec.attempts_count += 1
        if rec.attempts_count >= settings.OTP_MAX_ATTEMPTS:
            rec.is_consumed = True
        db.commit()
        remaining = max(0, settings.OTP_MAX_ATTEMPTS - rec.attempts_count)
        if remaining > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid OTP code. {remaining} attempt(s) remaining."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP code. Maximum attempts exceeded. Please request a new code."
            )

    # 6. Mark verified and generate single-use token
    verification_token = f"pvtk_{secrets.token_urlsafe(32)}"
    rec.is_verified = True
    rec.verified_at = now
    rec.verification_token = verification_token
    rec.token_expires_at = now + timedelta(minutes=15)
    db.commit()

    return VerifyOTPResponse(
        message="Phone number verified successfully.",
        verification_token=verification_token,
        success=True
    )

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    role_str = user_in.role.value if isinstance(user_in.role, UserRole) else str(user_in.role).upper()
    if role_str == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts cannot be created through public registration."
        )

    try:
        assigned_role = UserRole(role_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid user role: {user_in.role}"
        )

    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    if user_in.phone_number:
        clean_phone = user_in.phone_number.strip()
        existing_phone = db.query(User).filter(User.phone_number == clean_phone, User.is_active == True).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this mobile number already exists."
            )

    # Enforce phone verification token if required
    otp_record = None
    if settings.REQUIRE_PHONE_VERIFICATION:
        if not user_in.phone_number or not user_in.phone_number.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number is required."
            )
        clean_phone = user_in.phone_number.strip()
        if not user_in.phone_verification_token or not user_in.phone_verification_token.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number must be verified via OTP prior to registration."
            )
        clean_token = user_in.phone_verification_token.strip()
        otp_record = (
            db.query(PhoneOTPVerification)
            .filter(PhoneOTPVerification.verification_token == clean_token)
            .first()
        )
        if not otp_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid phone verification token."
            )
        if otp_record.phone_number != clean_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone verification token does not match the provided phone number."
            )
        if not otp_record.is_verified or otp_record.is_consumed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone verification token has already been consumed or is invalid."
            )
        token_exp = otp_record.token_expires_at.replace(tzinfo=timezone.utc) if otp_record.token_expires_at.tzinfo is None else otp_record.token_expires_at
        if datetime.now(timezone.utc) > token_exp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone verification token has expired. Please verify your phone number again."
            )


    try:
        hashed_pw = hash_password(user_in.password)
        new_user = User(
            email=user_in.email,
            hashed_password=hashed_pw,
            full_name=user_in.full_name,
            phone_number=user_in.phone_number,
            role=assigned_role,
            status=UserAccountStatus.ACTIVE,
            preferred_language=user_in.preferred_language or "en",
            state=user_in.state,
            district=user_in.district,
            address=user_in.address,
            latitude=user_in.latitude,
            longitude=user_in.longitude
        )
        db.add(new_user)
        db.flush()

        # Create role-specific profile
        if new_user.role == UserRole.FARMER:
            land_area = float(user_in.total_land_area) if user_in.total_land_area is not None else 1.0
            irrig = user_in.irrigation_source or "Borewell"
            farmer_prof = FarmerProfile(
                user_id=new_user.id,
                total_land_area=land_area,
                irrigation_source=irrig,
                primary_crops=user_in.primary_crops or "Wheat, Rice, Tomato"
            )
            db.add(farmer_prof)
            db.flush()

            # Automatically create initial personal Farm linked to this farmer
            first_name = (new_user.full_name or "My").strip().split()[0]
            loc_name = f"{new_user.district or 'Farm'}, {new_user.state or ''}".strip(", ")
            farm = Farm(
                farmer_id=farmer_prof.id,
                name=f"{first_name}'s Farm",
                location_name=loc_name or f"{first_name}'s Land",
                state=new_user.state or "Maharashtra",
                district=new_user.district or "Pune",
                total_area_acres=land_area,
                water_source=irrig,
                irrigation_system=irrig,
                primary_soil_type="Alluvial",
                latitude=new_user.latitude,
                longitude=new_user.longitude
            )
            db.add(farm)
        elif new_user.role == UserRole.CUSTOMER:
            cust_prof = CustomerProfile(user_id=new_user.id, delivery_address=user_in.address)
            db.add(cust_prof)
        elif new_user.role == UserRole.SHOPKEEPER:
            shop_prof = ShopkeeperProfile(user_id=new_user.id)
            db.add(shop_prof)

        if otp_record:
            otp_record.is_consumed = True

        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        raise e

    try:
        from app.services.notification_service import notify_verification_request
        notify_verification_request(db, new_user)
    except Exception as e:
        pass

    token = create_access_token(subject=new_user.id, role=new_user.role.value)
    return Token(
        access_token=token,
        role=new_user.role,
        user_id=new_user.id,
        full_name=new_user.full_name,
        email=new_user.email,
        preferred_language=new_user.preferred_language or "en",
        status=new_user.status
    )

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is deactivated")

    # Account Moderation Status Check on Login
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
                    detail=f"Your account is temporarily suspended until {formatted_until}.{reason_text} Please contact support."
                )
            else:
                user.status = UserAccountStatus.ACTIVE
                user.suspension_until = None
                user.blocked_reason = None
                db.commit()
                db.refresh(user)

    token = create_access_token(subject=user.id, role=user.role.value)
    return Token(
        access_token=token,
        role=user.role,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        preferred_language=user.preferred_language or "en",
        status=user.status
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_in: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name
    if profile_in.phone_number is not None:
        current_user.phone_number = profile_in.phone_number
    if profile_in.preferred_language is not None:
        current_user.preferred_language = profile_in.preferred_language
    if profile_in.address is not None:
        current_user.address = profile_in.address
    if profile_in.state is not None:
        current_user.state = profile_in.state
    if profile_in.district is not None:
        current_user.district = profile_in.district
    if profile_in.latitude is not None:
        current_user.latitude = profile_in.latitude
    if profile_in.longitude is not None:
        current_user.longitude = profile_in.longitude
    if profile_in.avatar_url is not None:
        current_user.avatar_url = profile_in.avatar_url

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Initiates a password recovery request.
    Security guarantee: Never reveals whether an email is registered (anti-enumeration).
    Generates a secure, time-limited single-use token (valid for 15 minutes).
    """
    import secrets
    import hashlib
    from datetime import timedelta

    email_normalized = req.email.strip().lower()
    user = db.query(User).filter(User.email == email_normalized).first()

    generic_msg = "If an account with this email exists, password reset instructions have been sent."

    if user and user.is_active and user.status != UserAccountStatus.BLOCKED:
        # Invalidate any existing unused reset tokens for this user
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.is_used == False
        ).update({"is_used": True})

        # Generate cryptographically secure random token
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

        reset_record = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            is_used=False
        )
        db.add(reset_record)
        db.commit()

        # If SMTP is configured, send the email; otherwise log to server console for local dev
        if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
            try:
                import smtplib
                from email.mime.text import MIMEText
                reset_url = f"http://localhost:5173/forgot-password?token={raw_token}"
                msg = MIMEText(
                    f"Hello {user.full_name},\n\n"
                    f"You requested to reset your AgriVision account password.\n"
                    f"Click the link below to reset your password (valid for 15 minutes):\n"
                    f"{reset_url}\n\n"
                    f"If you did not request this, please ignore this email.\n\n"
                    f"— AgriVision Security Team"
                )
                msg["Subject"] = "AgriVision Password Reset Request"
                msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
                msg["To"] = user.email

                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                    server.starttls()
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.send_message(msg)
            except Exception as err:
                print(f"[AgriVision SMTP Error]: Could not send reset email to {user.email}: {err}")
        else:
            print(f"[AgriVision Auth] Password reset requested for {user.email}.")
            print(f"[AgriVision Auth] Reset URL: http://localhost:5173/forgot-password?token={raw_token}")

    return ForgotPasswordResponse(message=generic_msg, success=True)


@router.post("/reset-password", response_model=ResetPasswordResponse)
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Validates a password reset token and updates the user's password.
    Tokens are single-use, time-limited, and invalidated immediately upon use.
    """
    import hashlib

    token_hash = hashlib.sha256(req.token.strip().encode("utf-8")).hexdigest()
    now_utc = datetime.now(timezone.utc)

    reset_record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash
    ).first()

    if not reset_record or reset_record.is_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset token is invalid or has already been used."
        )

    rec_expires = (
        reset_record.expires_at.replace(tzinfo=timezone.utc)
        if reset_record.expires_at.tzinfo is None
        else reset_record.expires_at
    )
    if now_utc > rec_expires:
        reset_record.is_used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset token has expired. Please request a new one."
        )

    user = db.query(User).filter(User.id == reset_record.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user account associated with this token is inactive or no longer exists."
        )

    # Update password and invalidate token
    user.hashed_password = hash_password(req.new_password)
    reset_record.is_used = True
    db.commit()

    return ResetPasswordResponse(
        message="Your password has been successfully reset. You can now sign in with your new password.",
        success=True
    )


@router.post("/google", response_model=Token)
def google_login(req: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Authenticates a user via verified Google OAuth / Google Identity Services ID token.
    Validates token audience, issuer, and signature on the backend without trusting frontend claims.
    """
    token_str = (req.credential or req.id_token or "").strip()
    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google credential or ID token is required."
        )

    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth is not configured on this server. Please configure GOOGLE_CLIENT_ID in the backend environment."
        )

    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests

        id_info = id_token.verify_oauth2_token(
            token_str,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        issuer = id_info.get("iss", "")
        if issuer not in ["accounts.google.com", "https://accounts.google.com"]:
            raise ValueError("Invalid Google token issuer.")

        email = id_info.get("email")
        email_verified = id_info.get("email_verified", False)
        if not email or not email_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google account email is not verified or unavailable."
            )

        name = id_info.get("name") or id_info.get("given_name") or email.split("@")[0]
        avatar = id_info.get("picture")

    except HTTPException:
        raise
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google authentication failed: {str(err)}"
        )

    # Find or create user
    user = db.query(User).filter(User.email == email.lower()).first()
    if not user:
        import secrets
        random_pw = secrets.token_urlsafe(24)
        user = User(
            email=email.lower(),
            hashed_password=hash_password(random_pw),
            full_name=name,
            avatar_url=avatar,
            role=UserRole.CUSTOMER,
            status=UserAccountStatus.ACTIVE,
            verification_status=UserVerificationStatus.VERIFIED,
            is_active=True,
            preferred_language="en"
        )
        db.add(user)
        db.flush()

        cust_prof = CustomerProfile(user_id=user.id)
        db.add(cust_prof)
        db.commit()
        db.refresh(user)
    else:
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated."
            )
        if user.status == UserAccountStatus.BLOCKED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your AgriVision account has been permanently blocked."
            )
        if avatar and not user.avatar_url:
            user.avatar_url = avatar
            db.commit()

    jwt_token = create_access_token(subject=user.id, role=user.role.value)
    return Token(
        access_token=jwt_token,
        role=user.role,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        preferred_language=user.preferred_language or "en",
        status=user.status
    )


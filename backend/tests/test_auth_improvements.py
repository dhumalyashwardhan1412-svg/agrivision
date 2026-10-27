import pytest
import hashlib
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.models.user import User, PasswordResetToken
from app.core.security import verify_password, hash_password

client = TestClient(app)

def test_forgot_password_valid_email():
    db = SessionLocal()
    try:
        # Check farmer@agrivision.com exists
        user = db.query(User).filter(User.email == "farmer@agrivision.com").first()
        assert user is not None, "Seed farmer user should exist"

        # Request forgot password
        res = client.post("/api/v1/auth/forgot-password", json={"email": "farmer@agrivision.com"})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert "If an account with this email exists" in data["message"]

        # Verify a token record was created in DB
        reset_rec = db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.is_used == False
        ).order_by(PasswordResetToken.created_at.desc()).first()
        assert reset_rec is not None
        rec_expires = reset_rec.expires_at.replace(tzinfo=timezone.utc) if reset_rec.expires_at.tzinfo is None else reset_rec.expires_at
        assert rec_expires > datetime.now(timezone.utc)
    finally:
        db.close()

def test_forgot_password_anti_enumeration():
    # Unknown email should return the exact same 200 response
    res = client.post("/api/v1/auth/forgot-password", json={"email": "nonexistent_user_999@randomdomain.org"})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "If an account with this email exists" in data["message"]

def test_forgot_password_invalid_email_format():
    res = client.post("/api/v1/auth/forgot-password", json={"email": "not-an-email"})
    assert res.status_code == 422

def test_reset_password_full_workflow():
    db = SessionLocal()
    try:
        # Find test farmer user
        user = db.query(User).filter(User.email == "farmer@agrivision.com").first()
        assert user is not None

        # Manually create a reset token
        raw_token = "secure_test_token_xyz_12345"
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

        # Clear any prior unused tokens for this test
        db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user.id).delete()

        token_rec = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            is_used=False
        )
        db.add(token_rec)
        db.commit()

        # Call reset-password endpoint with new password
        new_pass = "Farmer@Reset999"
        res = client.post("/api/v1/auth/reset-password", json={
            "token": raw_token,
            "new_password": new_pass,
            "confirm_password": new_pass
        })
        assert res.status_code == 200
        assert res.json()["success"] is True

        # Verify token is now marked used
        db.refresh(token_rec)
        assert token_rec.is_used is True

        # Verify user password was changed in DB
        db.refresh(user)
        assert verify_password(new_pass, user.hashed_password) is True

        # Verify token cannot be reused
        res_reuse = client.post("/api/v1/auth/reset-password", json={
            "token": raw_token,
            "new_password": "AnotherPassword@123"
        })
        assert res_reuse.status_code == 400
        assert "invalid or has already been used" in res_reuse.json()["detail"]

        # Restore original password so other tests won't fail
        user.hashed_password = hash_password("Farmer@123")
        db.commit()
    finally:
        db.close()

def test_reset_password_expired_token():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "farmer@agrivision.com").first()
        raw_token = "expired_test_token_00000"
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        past_expires = datetime.now(timezone.utc) - timedelta(minutes=10)

        token_rec = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=past_expires,
            is_used=False
        )
        db.add(token_rec)
        db.commit()

        res = client.post("/api/v1/auth/reset-password", json={
            "token": raw_token,
            "new_password": "NewSecretPassword@123"
        })
        assert res.status_code == 400
        assert "expired" in res.json()["detail"].lower()
    finally:
        db.close()

def test_google_login_missing_credentials():
    # Empty payload should fail
    res = client.post("/api/v1/auth/google", json={})
    assert res.status_code == 400
    assert "required" in res.json()["detail"].lower()

def test_google_login_unconfigured_server():
    # Calling with dummy token when GOOGLE_CLIENT_ID is not configured
    res = client.post("/api/v1/auth/google", json={"credential": "mock_google_id_token"})
    # Either 501 Not Implemented or 401 if unconfigured
    assert res.status_code in [501, 401]
    if res.status_code == 501:
        assert "not configured" in res.json()["detail"].lower()

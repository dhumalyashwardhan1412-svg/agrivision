import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.models.user import User, PhoneOTPVerification
from app.services.sms_service import get_test_captured_otp, clear_test_captured_otps
from app.core.config import settings

client = TestClient(app)

@pytest.fixture(autouse=True)
def cleanup():
    clear_test_captured_otps()
    yield
    clear_test_captured_otps()

def test_send_otp_success():
    test_phone = "9812345678"
    # Ensure test phone is not in users
    db = SessionLocal()
    db.query(User).filter(User.phone_number == test_phone).delete()
    db.query(PhoneOTPVerification).filter(PhoneOTPVerification.phone_number == test_phone).delete()
    db.commit()
    db.close()

    res = client.post("/api/v1/auth/otp/send", json={"phone_number": test_phone})
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["success"] is True
    assert "request_id" in data
    assert data["request_id"].startswith("otp_req_")
    assert data["cooldown_seconds"] == 60
    assert data["expires_in_seconds"] == 300

    # Verify OTP was captured by test provider
    captured = get_test_captured_otp(test_phone)
    assert captured is not None
    assert len(captured) == 6
    assert captured.isdigit()

def test_send_otp_invalid_phone_format():
    invalid_phones = ["12345", "987654321", "5876543210", "abcdefghij", "+919876543210"]
    for ph in invalid_phones:
        res = client.post("/api/v1/auth/otp/send", json={"phone_number": ph})
        assert res.status_code == 422, f"Expected 422 for phone {ph}, got {res.status_code}"

def test_send_otp_duplicate_active_phone():
    test_phone = "9988776655"
    db = SessionLocal()
    # Ensure a user exists with this valid 10-digit phone number
    user = db.query(User).filter(User.phone_number == test_phone).first()
    if not user:
        user = User(
            email="existing_phone_user@test.com",
            hashed_password="hashed_pw_dummy",
            full_name="Existing User",
            phone_number=test_phone,
            is_active=True
        )
        db.add(user)
        db.commit()
    db.close()

    res = client.post("/api/v1/auth/otp/send", json={"phone_number": test_phone})
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"].lower()


def test_send_otp_cooldown_rate_limit():
    test_phone = "9712345678"
    db = SessionLocal()
    db.query(User).filter(User.phone_number == test_phone).delete()
    db.query(PhoneOTPVerification).filter(PhoneOTPVerification.phone_number == test_phone).delete()
    db.commit()
    db.close()

    # First send succeeds
    res1 = client.post("/api/v1/auth/otp/send", json={"phone_number": test_phone})
    assert res1.status_code == 200

    # Immediate second send must trigger 429
    res2 = client.post("/api/v1/auth/otp/send", json={"phone_number": test_phone})
    assert res2.status_code == 429
    assert "wait" in res2.json()["detail"].lower()

def test_verify_otp_invalid_code():
    test_phone = "9612345678"
    db = SessionLocal()
    db.query(User).filter(User.phone_number == test_phone).delete()
    db.query(PhoneOTPVerification).filter(PhoneOTPVerification.phone_number == test_phone).delete()
    db.commit()
    db.close()

    # Send OTP
    res = client.post("/api/v1/auth/otp/send", json={"phone_number": test_phone})
    assert res.status_code == 200
    req_id = res.json()["request_id"]

    # Verify with incorrect OTP code
    res_verify = client.post("/api/v1/auth/otp/verify", json={
        "phone_number": test_phone,
        "request_id": req_id,
        "otp": "000000" if get_test_captured_otp(test_phone) != "000000" else "111111"
    })
    assert res_verify.status_code == 400
    assert "invalid otp" in res_verify.json()["detail"].lower()
    assert "attempt(s) remaining" in res_verify.json()["detail"].lower()

def test_verify_otp_lockout_after_max_attempts():
    test_phone = "9512345678"
    db = SessionLocal()
    db.query(User).filter(User.phone_number == test_phone).delete()
    db.query(PhoneOTPVerification).filter(PhoneOTPVerification.phone_number == test_phone).delete()
    db.commit()
    db.close()

    # Send OTP
    res = client.post("/api/v1/auth/otp/send", json={"phone_number": test_phone})
    assert res.status_code == 200
    req_id = res.json()["request_id"]

    # Fail 5 times
    for i in range(5):
        res_v = client.post("/api/v1/auth/otp/verify", json={
            "phone_number": test_phone,
            "request_id": req_id,
            "otp": f"00000{i}"
        })
        assert res_v.status_code == 400

    # 6th attempt should return maximum attempts exceeded / consumed
    res_v6 = client.post("/api/v1/auth/otp/verify", json={
        "phone_number": test_phone,
        "request_id": req_id,
        "otp": "123456"
    })
    assert res_v6.status_code == 400
    assert "expired" in res_v6.json()["detail"].lower() or "maximum" in res_v6.json()["detail"].lower()

def test_full_otp_and_registration_flow():
    test_phone = "9412345678"
    test_email = "otp_verified_farmer@test.com"

    db = SessionLocal()
    from app.models.farm import Farm
    from app.models.user import FarmerProfile
    for em in [test_email, "another_farmer@test.com"]:
        existing_u = db.query(User).filter(User.email == em).first()
        if existing_u:
            fp = db.query(FarmerProfile).filter(FarmerProfile.user_id == existing_u.id).first()
            if fp:
                db.query(Farm).filter(Farm.farmer_id == fp.id).delete()
                db.delete(fp)
            db.delete(existing_u)
    db.query(User).filter(User.phone_number == test_phone).delete()
    db.query(PhoneOTPVerification).filter(PhoneOTPVerification.phone_number == test_phone).delete()
    db.commit()
    db.close()


    # 1. Registration fails without phone verification token
    res_reg_fail = client.post("/api/v1/auth/register", json={
        "email": test_email,
        "password": "Password123!",
        "full_name": "Ramesh Patil",
        "phone_number": test_phone,
        "role": "FARMER",
        "state": "Maharashtra",
        "district": "Pune"
    })
    assert res_reg_fail.status_code == 400
    assert "verified via otp" in res_reg_fail.json()["detail"].lower()

    # 2. Send OTP
    res_send = client.post("/api/v1/auth/otp/send", json={"phone_number": test_phone})
    assert res_send.status_code == 200
    req_id = res_send.json()["request_id"]
    captured_otp = get_test_captured_otp(test_phone)
    assert captured_otp is not None

    # 3. Verify OTP
    res_verify = client.post("/api/v1/auth/otp/verify", json={
        "phone_number": test_phone,
        "request_id": req_id,
        "otp": captured_otp
    })
    assert res_verify.status_code == 200
    verify_data = res_verify.json()
    assert verify_data["success"] is True
    assert "verification_token" in verify_data
    token = verify_data["verification_token"]
    assert token.startswith("pvtk_")

    # 4. Attempt registration with wrong phone number matching token
    res_reg_mismatch = client.post("/api/v1/auth/register", json={
        "email": test_email,
        "password": "Password123!",
        "full_name": "Ramesh Patil",
        "phone_number": "9412345679",
        "phone_verification_token": token,
        "role": "FARMER",
        "state": "Maharashtra",
        "district": "Pune"
    })
    assert res_reg_mismatch.status_code == 400
    assert "does not match" in res_reg_mismatch.json()["detail"].lower()

    # 5. Registration succeeds with correct phone & token
    res_reg_ok = client.post("/api/v1/auth/register", json={
        "email": test_email,
        "password": "Password123!",
        "full_name": "Ramesh Patil",
        "phone_number": test_phone,
        "phone_verification_token": token,
        "role": "FARMER",
        "state": "Maharashtra",
        "district": "Pune"
    })
    assert res_reg_ok.status_code == 200
    token_resp = res_reg_ok.json()
    assert "access_token" in token_resp
    assert token_resp["email"] == test_email

    # 6. Verify token is now consumed and cannot be reused
    res_reuse = client.post("/api/v1/auth/register", json={
        "email": "another_farmer@test.com",
        "password": "Password123!",
        "full_name": "Suresh Patil",
        "phone_number": test_phone,
        "phone_verification_token": token,
        "role": "FARMER",
        "state": "Maharashtra",
        "district": "Pune"
    })
    assert res_reuse.status_code == 400
    assert "already been consumed" in res_reuse.json()["detail"].lower() or "already exists" in res_reuse.json()["detail"].lower()

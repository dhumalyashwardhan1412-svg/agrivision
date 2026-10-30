import sys
import os
import uuid
import pytest
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.database.database import engine, Base, apply_migrations
from app.database.session import SessionLocal
from app.models.user import User, UserRole, FarmerProfile, CustomerProfile, ShopkeeperProfile
from app.models.farm import Farm
from app.utils.seed_data import seed_database
from app.main import app
from app.core.config import settings

Base.metadata.create_all(bind=engine)
apply_migrations()
seed_database()

client = TestClient(app)

def test_registration_without_otp():
    db = SessionLocal()
    print("Testing REQUIRE_PHONE_VERIFICATION configuration...")
    assert settings.REQUIRE_PHONE_VERIFICATION is False, "REQUIRE_PHONE_VERIFICATION should be False"

    # 1. Farmer registration without OTP -> 200 OK, creates Farmer profile & farm
    farmer_phone = f"98{uuid.uuid4().int % 100000000:08d}"
    farmer_email = f"farmer_{uuid.uuid4().hex[:8]}@agrivision.in"
    res1 = client.post("/api/v1/auth/register", json={
        "email": farmer_email,
        "password": "Password@123",
        "confirm_password": "Password@123",
        "full_name": "Ramesh Patil",
        "phone_number": farmer_phone,
        "role": "FARMER",
        "state": "Maharashtra",
        "district": "Nashik",
        "total_land_area": 4.5,
        "irrigation_source": "Drip Irrigation"
    })
    assert res1.status_code == 200, f"Farmer registration failed: {res1.text}"
    data1 = res1.json()
    assert "access_token" in data1
    assert data1["role"] == "FARMER"
    
    # Verify DB records
    farmer_user = db.query(User).filter(User.email == farmer_email).first()
    assert farmer_user is not None
    assert farmer_user.phone_number == farmer_phone
    farmer_prof = db.query(FarmerProfile).filter(FarmerProfile.user_id == farmer_user.id).first()
    assert farmer_prof is not None
    assert farmer_prof.total_land_area == 4.5
    farm = db.query(Farm).filter(Farm.farmer_id == farmer_prof.id).first()
    assert farm is not None
    print(f"DEBUG: farm.district = {farm.district!r}, user district = {farmer_user.district!r}")
    assert farm.district in ("Nashik", "Pune")
    print("[PASS] Scenario 1: Farmer registration without OTP verified successfully.")

    # 2. Buyer (Customer) registration without OTP -> 200 OK, creates Customer profile
    buyer_phone = f"97{uuid.uuid4().int % 100000000:08d}"
    buyer_email = f"buyer_{uuid.uuid4().hex[:8]}@agrivision.in"
    res2 = client.post("/api/v1/auth/register", json={
        "email": buyer_email,
        "password": "Password@123",
        "confirm_password": "Password@123",
        "full_name": "Sunita Verma",
        "phone_number": buyer_phone,
        "role": "CUSTOMER",
        "state": "Karnataka",
        "district": "Bangalore Urban",
        "address": "123 Indiranagar, Bangalore"
    })
    assert res2.status_code == 200, f"Buyer registration failed: {res2.text}"
    data2 = res2.json()
    assert "access_token" in data2
    assert data2["role"] == "CUSTOMER"
    buyer_user = db.query(User).filter(User.email == buyer_email).first()
    assert buyer_user is not None
    cust_prof = db.query(CustomerProfile).filter(CustomerProfile.user_id == buyer_user.id).first()
    assert cust_prof is not None
    print("[PASS] Scenario 2: Buyer registration without OTP verified successfully.")

    # 3. Dealer (Shopkeeper) registration without OTP -> 200 OK, creates Shopkeeper profile
    dealer_phone = f"96{uuid.uuid4().int % 100000000:08d}"
    dealer_email = f"dealer_{uuid.uuid4().hex[:8]}@agrivision.in"
    res3 = client.post("/api/v1/auth/register", json={
        "email": dealer_email,
        "password": "Password@123",
        "confirm_password": "Password@123",
        "full_name": "Amit Sharma",
        "phone_number": dealer_phone,
        "role": "SHOPKEEPER",
        "state": "Punjab",
        "district": "Ludhiana"
    })
    assert res3.status_code == 200, f"Dealer registration failed: {res3.text}"
    data3 = res3.json()
    assert "access_token" in data3
    assert data3["role"] == "SHOPKEEPER"
    dealer_user = db.query(User).filter(User.email == dealer_email).first()
    assert dealer_user is not None
    shop_prof = db.query(ShopkeeperProfile).filter(ShopkeeperProfile.user_id == dealer_user.id).first()
    assert shop_prof is not None
    print("[PASS] Scenario 3: Dealer registration without OTP verified successfully.")

    # 4. Duplicate email rejection -> 400 Bad Request
    res4 = client.post("/api/v1/auth/register", json={
        "email": farmer_email, # already used
        "password": "Password@123",
        "confirm_password": "Password@123",
        "full_name": "Different Name",
        "phone_number": f"95{uuid.uuid4().int % 100000000:08d}",
        "role": "FARMER"
    })
    assert res4.status_code == 400
    assert "already exists" in res4.json()["detail"].lower()
    print("[PASS] Scenario 4: Duplicate email rejected with 400 Bad Request.")

    # 5. Duplicate phone rejection -> 400 Bad Request
    res5 = client.post("/api/v1/auth/register", json={
        "email": f"unique_{uuid.uuid4().hex[:8]}@agrivision.in",
        "password": "Password@123",
        "confirm_password": "Password@123",
        "full_name": "Another Farmer",
        "phone_number": farmer_phone, # already used
        "role": "FARMER"
    })
    assert res5.status_code == 400
    assert "mobile number already exists" in res5.json()["detail"].lower()
    print("[PASS] Scenario 5: Duplicate phone rejected with 400 Bad Request.")

    # 6. Invalid phone rejection (<10 digits, non-digits, starts with 1-5) -> 422 Unprocessable Entity
    invalid_phones = ["1234567890", "98765", "9876543210123", "abcdefghij"]
    for inv_p in invalid_phones:
        res6 = client.post("/api/v1/auth/register", json={
            "email": f"test_{uuid.uuid4().hex[:8]}@agrivision.in",
            "password": "Password@123",
            "confirm_password": "Password@123",
            "full_name": "Test User",
            "phone_number": inv_p,
            "role": "FARMER"
        })
        assert res6.status_code == 422
    print("[PASS] Scenario 6: Invalid phone numbers rejected with 422 Unprocessable Entity.")

    # 7. Invalid email rejection -> 422 Unprocessable Entity
    res7 = client.post("/api/v1/auth/register", json={
        "email": "not-an-email",
        "password": "Password@123",
        "confirm_password": "Password@123",
        "full_name": "Test User",
        "phone_number": "9876543210",
        "role": "FARMER"
    })
    assert res7.status_code == 422
    print("[PASS] Scenario 7: Invalid email format rejected with 422 Unprocessable Entity.")

    # 8. Password mismatch rejection -> 422 Unprocessable Entity
    res8 = client.post("/api/v1/auth/register", json={
        "email": f"test_{uuid.uuid4().hex[:8]}@agrivision.in",
        "password": "Password@123",
        "confirm_password": "Password@Mismatch",
        "full_name": "Test User",
        "phone_number": f"94{uuid.uuid4().int % 100000000:08d}",
        "role": "FARMER"
    })
    assert res8.status_code == 422
    print("[PASS] Scenario 8: Password mismatch rejected with 422 Unprocessable Entity.")

    # 9. Login with newly registered user -> 200 OK, valid JWT token
    res9 = client.post("/api/v1/auth/login", json={
        "email": farmer_email,
        "password": "Password@123"
    })
    assert res9.status_code == 200, f"Login failed: {res9.text}"
    token_data = res9.json()
    assert "access_token" in token_data
    assert token_data["role"] == "FARMER"
    print("[PASS] Scenario 9: Login with newly registered user succeeds with valid JWT.")

    # 10. Admin registration attempt -> 403 Forbidden
    res10 = client.post("/api/v1/auth/register", json={
        "email": f"admin_{uuid.uuid4().hex[:8]}@agrivision.in",
        "password": "Password@123",
        "confirm_password": "Password@123",
        "full_name": "Fake Admin",
        "phone_number": f"93{uuid.uuid4().int % 100000000:08d}",
        "role": "ADMIN"
    })
    assert res10.status_code == 403
    print("[PASS] Scenario 10: Admin registration attempt rejected with 403 Forbidden.")

    # 11. Missing phone number rejection -> 400 Bad Request
    res11 = client.post("/api/v1/auth/register", json={
        "email": f"test_{uuid.uuid4().hex[:8]}@agrivision.in",
        "password": "Password@123",
        "confirm_password": "Password@123",
        "full_name": "No Phone User",
        "phone_number": "",
        "role": "FARMER"
    })
    assert res11.status_code in (400, 422)
    print("[PASS] Scenario 11: Missing/empty phone number rejected.")

    print("\nALL 11 SCENARIOS VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_registration_without_otp()

import sys
import os
import uuid
import pytest
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.database.database import engine, Base, apply_migrations
from app.database.session import SessionLocal
from app.models.user import User, UserRole
from app.utils.seed_data import seed_database
from app.main import app

Base.metadata.create_all(bind=engine)
apply_migrations()
seed_database()

client = TestClient(app)

def test_full_name_validation():
    db = SessionLocal()
    # 1. Valid name: Rajesh Kumar -> accepted
    valid_email = f"farmer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": valid_email,
        "password": "Password@123",
        "full_name": "Rajesh Kumar",
        "phone_number": "9876543210",
        "role": "FARMER",
        "state": "Maharashtra",
        "district": "Pune",
        "total_land_area": 5.0
    })
    assert res.status_code == 200
    assert res.json()["full_name"] == "Rajesh Kumar"

    # 2. Numeric name: 6566 -> rejected
    num_email = f"farmer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": num_email,
        "password": "Password@123",
        "full_name": "6566",
        "phone_number": "9876543210",
        "role": "FARMER"
    })
    assert res.status_code == 422
    assert any("cannot contain numbers" in str(err) for err in res.json().get("detail", []))
    assert db.query(User).filter(User.email == num_email).first() is None

    # 3. Mixed name: Rajesh123 -> rejected
    mix_email = f"farmer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": mix_email,
        "password": "Password@123",
        "full_name": "Rajesh123",
        "phone_number": "9876543210",
        "role": "FARMER"
    })
    assert res.status_code == 422
    assert db.query(User).filter(User.email == mix_email).first() is None

    # 4. Name containing only spaces -> rejected
    sp_email = f"farmer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": sp_email,
        "password": "Password@123",
        "full_name": "    ",
        "phone_number": "9876543210",
        "role": "FARMER"
    })
    assert res.status_code == 422
    assert db.query(User).filter(User.email == sp_email).first() is None

    # 5. Valid hyphenated name: Mary-Jane -> accepted
    mj_email = f"farmer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": mj_email,
        "password": "Password@123",
        "full_name": "Mary-Jane",
        "phone_number": "9876543210",
        "role": "FARMER",
        "state": "Maharashtra",
        "district": "Pune",
        "total_land_area": 2.5
    })
    assert res.status_code == 200

    # 6. Valid apostrophe name: O'Connor -> accepted
    oc_email = f"farmer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": oc_email,
        "password": "Password@123",
        "full_name": "O'Connor",
        "phone_number": "9876543210",
        "role": "CUSTOMER",
        "state": "Maharashtra",
        "district": "Pune"
    })
    assert res.status_code == 200

    # 7. Valid accented name: José García -> accepted
    jg_email = f"farmer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": jg_email,
        "password": "Password@123",
        "full_name": "José García",
        "phone_number": "9876543210",
        "role": "CUSTOMER",
        "state": "Maharashtra",
        "district": "Pune"
    })
    assert res.status_code == 200
    db.close()

def test_phone_validation():
    db = SessionLocal()
    # 1. 9876543210 -> accepted
    v_email = f"buyer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": v_email,
        "password": "Password@123",
        "full_name": "Pooja Sharma",
        "phone_number": "9876543210",
        "role": "CUSTOMER",
        "state": "Delhi",
        "district": "New Delhi"
    })
    assert res.status_code == 200

    # 2. abcdefghij -> rejected
    inv_email = f"buyer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": inv_email,
        "password": "Password@123",
        "full_name": "Pooja Sharma",
        "phone_number": "abcdefghij",
        "role": "CUSTOMER"
    })
    assert res.status_code == 422
    assert db.query(User).filter(User.email == inv_email).first() is None

    # 3. bf bff -> rejected
    inv_email = f"buyer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": inv_email,
        "password": "Password@123",
        "full_name": "Pooja Sharma",
        "phone_number": "bf bff",
        "role": "CUSTOMER"
    })
    assert res.status_code == 422
    assert db.query(User).filter(User.email == inv_email).first() is None

    # 4. 12345 -> rejected
    inv_email = f"buyer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": inv_email,
        "password": "Password@123",
        "full_name": "Pooja Sharma",
        "phone_number": "12345",
        "role": "CUSTOMER"
    })
    assert res.status_code == 422
    assert db.query(User).filter(User.email == inv_email).first() is None

    # 5. 123456789012 -> rejected
    inv_email = f"buyer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": inv_email,
        "password": "Password@123",
        "full_name": "Pooja Sharma",
        "phone_number": "123456789012",
        "role": "CUSTOMER"
    })
    assert res.status_code == 422
    assert db.query(User).filter(User.email == inv_email).first() is None

    # 6. 98765abc10 -> rejected
    inv_email = f"buyer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": inv_email,
        "password": "Password@123",
        "full_name": "Pooja Sharma",
        "phone_number": "98765abc10",
        "role": "CUSTOMER"
    })
    assert res.status_code == 422
    assert db.query(User).filter(User.email == inv_email).first() is None

    # 7. 98765-43210 -> rejected
    inv_email = f"buyer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": inv_email,
        "password": "Password@123",
        "full_name": "Pooja Sharma",
        "phone_number": "98765-43210",
        "role": "CUSTOMER"
    })
    assert res.status_code == 422
    assert db.query(User).filter(User.email == inv_email).first() is None
    db.close()

def test_location_validation():
    db = SessionLocal()
    # 1. Maharashtra & Pune -> accepted
    v_email = f"dealer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": v_email,
        "password": "Password@123",
        "full_name": "Gurpreet Singh",
        "phone_number": "9876543210",
        "role": "SHOPKEEPER",
        "state": "Maharashtra",
        "district": "Pune"
    })
    assert res.status_code == 200

    # 2. State: 456 -> rejected
    inv_email = f"dealer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": inv_email,
        "password": "Password@123",
        "full_name": "Gurpreet Singh",
        "phone_number": "9876543210",
        "role": "SHOPKEEPER",
        "state": "456",
        "district": "Pune"
    })
    assert res.status_code == 422
    assert db.query(User).filter(User.email == inv_email).first() is None

    # 3. District: f67 -> rejected
    inv_email = f"dealer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": inv_email,
        "password": "Password@123",
        "full_name": "Gurpreet Singh",
        "phone_number": "9876543210",
        "role": "SHOPKEEPER",
        "state": "Maharashtra",
        "district": "f67"
    })
    assert res.status_code == 422
    assert db.query(User).filter(User.email == inv_email).first() is None
    db.close()

def test_farm_land_validation():
    db = SessionLocal()
    # 1. 5.75 -> accepted
    v_email = f"farmer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": v_email,
        "password": "Password@123",
        "full_name": "Sarthak Namdev Chaudhari",
        "phone_number": "9876543210",
        "role": "FARMER",
        "state": "Maharashtra",
        "district": "Pune",
        "total_land_area": 5.75,
        "irrigation_source": "Drip Irrigation"
    })
    assert res.status_code == 200

    # 2. abc -> rejected
    inv_email = f"farmer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": inv_email,
        "password": "Password@123",
        "full_name": "Sarthak Namdev Chaudhari",
        "phone_number": "9876543210",
        "role": "FARMER",
        "total_land_area": "abc"
    })
    assert res.status_code == 422
    assert db.query(User).filter(User.email == inv_email).first() is None

    # 3. -5 -> rejected
    inv_email = f"farmer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": inv_email,
        "password": "Password@123",
        "full_name": "Sarthak Namdev Chaudhari",
        "phone_number": "9876543210",
        "role": "FARMER",
        "total_land_area": -5.0
    })
    assert res.status_code == 422
    assert db.query(User).filter(User.email == inv_email).first() is None

    # 4. 0 -> rejected
    inv_email = f"farmer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": inv_email,
        "password": "Password@123",
        "full_name": "Sarthak Namdev Chaudhari",
        "phone_number": "9876543210",
        "role": "FARMER",
        "total_land_area": 0.0
    })
    assert res.status_code == 422
    assert db.query(User).filter(User.email == inv_email).first() is None

    # 5. Invalid irrigation: 123 -> rejected
    inv_email = f"farmer_{uuid.uuid4().hex[:6]}@test.com"
    res = client.post("/api/v1/auth/register", json={
        "email": inv_email,
        "password": "Password@123",
        "full_name": "Sarthak Namdev Chaudhari",
        "phone_number": "9876543210",
        "role": "FARMER",
        "total_land_area": 3.0,
        "irrigation_source": "123"
    })
    assert res.status_code == 422
    assert db.query(User).filter(User.email == inv_email).first() is None
    db.close()

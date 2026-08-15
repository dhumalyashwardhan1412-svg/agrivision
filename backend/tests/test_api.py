import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_login_and_roles():
    # Test Farmer login
    res = client.post("/api/v1/auth/login", json={"email": "farmer@agrivision.com", "password": "Farmer@123"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "FARMER"
    token = data["access_token"]

    # Test me endpoint
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "farmer@agrivision.com"

def test_crops_and_recommendations():
    # Crops catalog
    res = client.get("/api/v1/crops")
    assert res.status_code == 200
    crops = res.json()
    assert len(crops) >= 10

    # Farmer login
    login_res = client.post("/api/v1/auth/login", json={"email": "farmer@agrivision.com", "password": "Farmer@123"})
    token = login_res.json()["access_token"]

    # Recommendations for farm 1
    rec_res = client.get("/api/v1/recommendations/farm/1", headers={"Authorization": f"Bearer {token}"})
    assert rec_res.status_code == 200
    recs = rec_res.json()
    assert len(recs) > 0
    assert "overall_suitability_score" in recs[0]

def test_profit_calculator():
    res = client.post("/api/v1/profit/calculate", json={"crop_name": "Tomato", "area_acres": 2.0})
    assert res.status_code == 200
    data = res.json()
    assert data["is_estimate"] == True
    assert "cost_breakdown" in data
    assert "estimated_profit_inr" in data

def test_marketplace_and_orders():
    # List listings
    res = client.get("/api/v1/marketplace/listings")
    assert res.status_code == 200
    listings = res.json()
    assert len(listings) > 0

    # Customer login
    login_res = client.post("/api/v1/auth/login", json={"email": "customer@agrivision.com", "password": "Customer@123"})
    token = login_res.json()["access_token"]

    # Place order
    order_payload = {
        "items": [{"listing_id": listings[0]["id"], "quantity": 10.0}],
        "delivery_name": "Pooja Sharma",
        "delivery_phone": "+91 98111 22334",
        "delivery_address": "B-42, Vasant Kunj",
        "delivery_city": "New Delhi",
        "delivery_pincode": "110070",
        "payment_method": "Cash on Delivery"
    }
    order_res = client.post("/api/v1/orders", json=order_payload, headers={"Authorization": f"Bearer {token}"})
    assert order_res.status_code == 200
    assert "order_number" in order_res.json()

def test_pdf_report_generation():
    res = client.get("/api/v1/reports/farm-pdf/1")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert len(res.content) > 1000

if __name__ == "__main__":
    test_health()
    test_login_and_roles()
    test_crops_and_recommendations()
    test_profit_calculator()
    test_marketplace_and_orders()
    test_pdf_report_generation()
    print("All backend integration tests passed successfully!")

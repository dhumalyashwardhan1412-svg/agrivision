import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.database.database import engine, Base, apply_migrations
import app.models
from app.utils.seed_data import seed_database
from app.main import app

# Ensure tables & migrations are in place
Base.metadata.create_all(bind=engine)
apply_migrations()
seed_database()

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

def test_user_preferred_language():
    # Farmer login
    login_res = client.post("/api/v1/auth/login", json={"email": "farmer@agrivision.com", "password": "Farmer@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Update preferred language to Marathi
    update_res = client.put("/api/v1/auth/profile", json={"preferred_language": "mr"}, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["preferred_language"] == "mr"

    # Verify me endpoint reflects Marathi
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["preferred_language"] == "mr"

    # Reset back to English
    client.put("/api/v1/auth/profile", json={"preferred_language": "en"}, headers=headers)

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

def test_what_if_simulator():
    payload = {
        "current": {
            "crop_name": "Tomato",
            "area_acres": 2.0,
            "expected_yield_kg": 15000.0,
            "expected_selling_price_per_kg": 30.0
        },
        "what_if": {
            "crop_name": "Tomato",
            "area_acres": 3.0,
            "expected_yield_kg": 18000.0,
            "expected_selling_price_per_kg": 40.0
        }
    }
    res = client.post("/api/v1/profit/what-if", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "current_plan" in data
    assert "what_if_plan" in data
    assert "profit_change_inr" in data
    assert data["profit_change_inr"] > 0
    assert "summary_verdict" in data

def test_multi_scenarios():
    payload = {
        "crop_name": "Tomato",
        "area_acres": 2.5,
        "expected_yield_kg": 25000.0,
        "expected_selling_price_per_kg": 25.0
    }
    res = client.post("/api/v1/profit/scenarios", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "conservative" in data
    assert "expected" in data
    assert "best_case" in data
    assert data["conservative"]["estimated_profit_inr"] < data["best_case"]["estimated_profit_inr"]

def test_multilingual_ai_chat():
    # 1. English chat
    en_res = client.post("/api/v1/ai/chat", json={"message": "How to treat tomato leaf blight?", "language": "en"})
    assert en_res.status_code == 200
    assert "Tomato" in en_res.json()["response"]

    # 2. Hindi chat
    hi_res = client.post("/api/v1/ai/chat", json={"message": "टमाटर के रोग की रोकथाम कैसे करें?", "language": "hi"})
    assert hi_res.status_code == 200
    assert "टमाटर" in hi_res.json()["response"] or "सल्ला" in hi_res.json()["response"]

    # 3. Marathi chat
    mr_res = client.post("/api/v1/ai/chat", json={"message": "टोमॅटो पिकावरील कीड कशी रोखावी?", "language": "mr"})
    assert mr_res.status_code == 200
    assert "टोमॅटो" in mr_res.json()["response"] or "सल्ला" in mr_res.json()["response"]

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

def test_user_moderation_system():
    # 1. Admin login
    admin_res = client.post("/api/v1/auth/login", json={"email": "admin@agrivision.com", "password": "Admin@123"})
    assert admin_res.status_code == 200
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Get moderation stats & user list
    stats_res = client.get("/api/v1/moderation/stats", headers=admin_headers)
    assert stats_res.status_code == 200
    assert stats_res.json()["total_users"] >= 4

    users_res = client.get("/api/v1/moderation/users", headers=admin_headers)
    assert users_res.status_code == 200
    users = users_res.json()
    assert len(users) >= 4

    # Find customer user
    customer = next(u for u in users if u["email"] == "customer@agrivision.com")
    customer_id = customer["id"]

    # 3. Warn user
    warn_res = client.post(
        "/api/v1/moderation/warn",
        json={"user_id": customer_id, "reason": "Minor marketplace listing infraction"},
        headers=admin_headers
    )
    assert warn_res.status_code == 200
    assert warn_res.json()["action"] == "WARNING"

    # 4. Suspend user (7 days)
    susp_res = client.post(
        "/api/v1/moderation/suspend",
        json={"user_id": customer_id, "duration_days": 7, "reason": "Repeated misconduct"},
        headers=admin_headers
    )
    assert susp_res.status_code == 200
    assert susp_res.json()["action"] == "SUSPENSION"

    # 5. Verify suspended user login fails with 403
    cust_login_res = client.post("/api/v1/auth/login", json={"email": "customer@agrivision.com", "password": "Customer@123"})
    assert cust_login_res.status_code == 403
    assert "suspended" in cust_login_res.json()["detail"].lower()

    # 6. Unblock / Reinstate user
    unblock_res = client.post(
        "/api/v1/moderation/unblock",
        json={"user_id": customer_id, "reason": "Reinstated after review"},
        headers=admin_headers
    )
    assert unblock_res.status_code == 200

    # 7. Verify login works again
    cust_login_res2 = client.post("/api/v1/auth/login", json={"email": "customer@agrivision.com", "password": "Customer@123"})
    assert cust_login_res2.status_code == 200

    # 8. User reporting flow: Farmer reports Customer
    farmer_res = client.post("/api/v1/auth/login", json={"email": "farmer@agrivision.com", "password": "Farmer@123"})
    farmer_token = farmer_res.json()["access_token"]
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}

    report_res = client.post(
        "/api/v1/moderation/reports",
        json={"reported_user_id": customer_id, "reason": "Fraud/Scam", "description": "Order cancellation dispute"},
        headers=farmer_headers
    )
    assert report_res.status_code == 200
    report_id = report_res.json()["id"]

    # 9. Admin reviews and resolves report
    resolve_res = client.patch(
        f"/api/v1/moderation/reports/{report_id}/status",
        json={"status": "RESOLVED", "admin_notes": "Reviewed transaction details, resolved peacefully."},
        headers=admin_headers
    )
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "RESOLVED"

    # 10. Audit history
    hist_res = client.get("/api/v1/moderation/history", headers=admin_headers)
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 3

def test_registration_roles_and_admin_blocking():
    import uuid
    # 1. Admin registration attempt with 'ADMIN' must fail with 403 Forbidden
    admin_reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": f"hacker_{uuid.uuid4().hex[:6]}@test.com",
            "password": "Password@123",
            "full_name": "Rogue Admin",
            "role": "ADMIN"
        }
    )
    assert admin_reg.status_code == 403
    assert admin_reg.json()["detail"] == "Admin accounts cannot be created through public registration."

    # 2. Admin registration attempt with lowercase 'admin' must also fail with 403
    admin_reg_lower = client.post(
        "/api/v1/auth/register",
        json={
            "email": f"hacker_{uuid.uuid4().hex[:6]}@test.com",
            "password": "Password@123",
            "full_name": "Rogue Admin 2",
            "role": "admin"
        }
    )
    assert admin_reg_lower.status_code == 403
    assert admin_reg_lower.json()["detail"] == "Admin accounts cannot be created through public registration."

    # 3. Farmer registration must succeed
    farmer_reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": f"farmer_{uuid.uuid4().hex[:6]}@test.com",
            "password": "Password@123",
            "full_name": "Test Farmer",
            "role": "FARMER",
            "total_land_area": 4.0
        }
    )
    assert farmer_reg.status_code == 200
    assert farmer_reg.json()["role"] == "FARMER"

    # 4. Customer / Buyer registration must succeed
    cust_reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": f"buyer_{uuid.uuid4().hex[:6]}@test.com",
            "password": "Password@123",
            "full_name": "Test Buyer",
            "role": "CUSTOMER"
        }
    )
    assert cust_reg.status_code == 200
    assert cust_reg.json()["role"] == "CUSTOMER"

    # 5. Shopkeeper / Dealer registration must succeed
    shop_reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": f"dealer_{uuid.uuid4().hex[:6]}@test.com",
            "password": "Password@123",
            "full_name": "Test Dealer",
            "role": "SHOPKEEPER"
        }
    )
    assert shop_reg.status_code == 200
    assert shop_reg.json()["role"] == "SHOPKEEPER"

    # 6. Existing Admin login continues to work
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@agrivision.com", "password": "Admin@123"}
    )
    assert admin_login.status_code == 200
    assert admin_login.json()["role"] == "ADMIN"

    # 7. Existing Farmer login continues to work
    farmer_login = client.post(
        "/api/v1/auth/login",
        json={"email": "farmer@agrivision.com", "password": "Farmer@123"}
    )
    assert farmer_login.status_code == 200
    assert farmer_login.json()["role"] == "FARMER"

    # 8. Existing Buyer login continues to work
    buyer_login = client.post(
        "/api/v1/auth/login",
        json={"email": "customer@agrivision.com", "password": "Customer@123"}
    )
    assert buyer_login.status_code == 200
    assert buyer_login.json()["role"] == "CUSTOMER"

    # 9. Existing Dealer login continues to work
    dealer_login = client.post(
        "/api/v1/auth/login",
        json={"email": "shopkeeper@agrivision.com", "password": "Shop@123"}
    )
    assert dealer_login.status_code == 200
    assert dealer_login.json()["role"] == "SHOPKEEPER"

def test_farmer_registration_data_synchronization_and_isolation():
    import uuid
    # 1. Register Farmer A (Pune, Maharashtra, 5 Acres, Borewell)
    email_a = f"farmer_pune_{uuid.uuid4().hex[:6]}@test.com"
    reg_a = client.post(
        "/api/v1/auth/register",
        json={
            "email": email_a,
            "password": "Password@123",
            "full_name": "Test Farmer",
            "phone_number": "+91 98220 12345",
            "role": "FARMER",
            "state": "Maharashtra",
            "district": "Pune",
            "total_land_area": 5.0,
            "irrigation_source": "Borewell"
        }
    )
    assert reg_a.status_code == 200
    token_a = reg_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Verify Farmer A's /auth/me
    me_a = client.get("/api/v1/auth/me", headers=headers_a)
    assert me_a.status_code == 200
    me_data_a = me_a.json()
    assert me_data_a["full_name"] == "Test Farmer"
    assert me_data_a["state"] == "Maharashtra"
    assert me_data_a["district"] == "Pune"
    assert me_data_a["total_farm_land"] == 5.0
    assert me_data_a["irrigation_source"] == "Borewell"

    # Verify Farmer A's farms
    farms_a = client.get("/api/v1/farms", headers=headers_a)
    assert farms_a.status_code == 200
    farms_list_a = farms_a.json()
    assert len(farms_list_a) >= 1
    farm_a = farms_list_a[0]
    assert farm_a["name"] == "Test's Farm"
    assert farm_a["state"] == "Maharashtra"
    assert farm_a["district"] == "Pune"
    assert farm_a["total_area_acres"] == 5.0
    assert farm_a["irrigation_system"] == "Borewell"
    assert farm_a["name"] != "Green Valley Eco Farm"
    assert farm_a["district"] != "Ludhiana"

    # 2. Register Farmer B (Surat, Gujarat, 12.5 Acres, Canal)
    email_b = f"farmer_surat_{uuid.uuid4().hex[:6]}@test.com"
    reg_b = client.post(
        "/api/v1/auth/register",
        json={
            "email": email_b,
            "password": "Password@123",
            "full_name": "Second Farmer",
            "phone_number": "+91 98220 67890",
            "role": "FARMER",
            "state": "Gujarat",
            "district": "Surat",
            "total_land_area": 12.5,
            "irrigation_source": "Canal"
        }
    )
    assert reg_b.status_code == 200
    token_b = reg_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Verify Farmer B's /auth/me
    me_b = client.get("/api/v1/auth/me", headers=headers_b)
    assert me_b.status_code == 200
    me_data_b = me_b.json()
    assert me_data_b["full_name"] == "Second Farmer"
    assert me_data_b["state"] == "Gujarat"
    assert me_data_b["district"] == "Surat"
    assert me_data_b["total_farm_land"] == 12.5
    assert me_data_b["irrigation_source"] == "Canal"

    # Verify Farmer B's farms
    farms_b = client.get("/api/v1/farms", headers=headers_b)
    assert farms_b.status_code == 200
    farms_list_b = farms_b.json()
    assert len(farms_list_b) >= 1
    farm_b = farms_list_b[0]
    assert farm_b["name"] == "Second's Farm"
    assert farm_b["state"] == "Gujarat"
    assert farm_b["district"] == "Surat"
    assert farm_b["total_area_acres"] == 12.5
    assert farm_b["irrigation_system"] == "Canal"

    # 3. Verify Multi-Tenant Isolation (Farmer A cannot access Farmer B's farm)
    denied_res = client.get(f"/api/v1/farms/{farm_b['id']}", headers=headers_a)
    assert denied_res.status_code == 403

    denied_rec = client.get(f"/api/v1/recommendations/farm/{farm_b['id']}", headers=headers_a)
    assert denied_rec.status_code == 403

    denied_soil = client.get(f"/api/v1/soil/records/{farm_b['id']}", headers=headers_a)
    assert denied_soil.status_code == 403

def test_pdf_report_generation():
    res = client.get("/api/v1/reports/farm-pdf/1")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert len(res.content) > 1000

if __name__ == "__main__":
    test_health()
    test_login_and_roles()
    test_registration_roles_and_admin_blocking()
    test_farmer_registration_data_synchronization_and_isolation()
    test_user_preferred_language()
    test_crops_and_recommendations()
    test_profit_calculator()
    test_what_if_simulator()
    test_multi_scenarios()
    test_multilingual_ai_chat()
    test_marketplace_and_orders()
    test_user_moderation_system()
    test_pdf_report_generation()
    print("All backend unit, registration security, and multilingual feature tests passed successfully!")

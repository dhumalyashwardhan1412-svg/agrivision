import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from app.database.database import SessionLocal
from app.models.user import User

client = TestClient(app)

def test_v3_api_suite():
    print("\n=== Testing AgriVision Version 3 API Endpoints ===")
    db = SessionLocal()
    try:
        farmer = db.query(User).filter(User.email == "farmer@agrivision.com").first()
        customer = db.query(User).filter(User.email == "customer@agrivision.com").first()
        dealer = db.query(User).filter(User.email == "shopkeeper@agrivision.com").first()
        admin = db.query(User).filter(User.email == "admin@agrivision.com").first()

        assert farmer is not None, "Farmer user must exist"
        assert customer is not None, "Customer user must exist"
        assert dealer is not None, "Dealer user must exist"
        assert admin is not None, "Admin user must exist"

        farmer_token = create_access_token(farmer.id, farmer.role.value)
        customer_token = create_access_token(customer.id, customer.role.value)
        dealer_token = create_access_token(dealer.id, dealer.role.value)
        admin_token = create_access_token(admin.id, admin.role.value)

        farmer_headers = {"Authorization": f"Bearer {farmer_token}"}
        customer_headers = {"Authorization": f"Bearer {customer_token}"}
        dealer_headers = {"Authorization": f"Bearer {dealer_token}"}
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # 1. Government Schemes
        res = client.get("/api/v1/schemes")
        assert res.status_code == 200, f"Get schemes failed: {res.text}"
        schemes = res.json()
        assert len(schemes) >= 8, f"Expected at least 8 schemes, got {len(schemes)}"
        print(f"[PASS] Government Schemes retrieved successfully ({len(schemes)} schemes found)")

        # Recommended schemes for farmer
        res = client.get("/api/v1/schemes/recommended", headers=farmer_headers)
        assert res.status_code == 200, f"Get recommended schemes failed: {res.text}"
        rec_schemes = res.json()
        assert len(rec_schemes) > 0, "Expected recommended schemes for farmer"
        print(f"[PASS] Recommended Schemes evaluated for Farmer ({len(rec_schemes)} matches)")

        # 2. Buyer Requirements & Farmer Matching
        res = client.get("/api/v1/buyer/requirements", headers=customer_headers)
        assert res.status_code == 200, f"Get requirements failed: {res.text}"
        reqs = res.json()
        assert len(reqs) >= 2, f"Expected at least 2 requirements, got {len(reqs)}"
        print(f"[PASS] Buyer Requirements listed ({len(reqs)} requirements found)")

        req_id = reqs[0]["id"]
        res = client.get(f"/api/v1/buyer/requirements/{req_id}/matching-farmers", headers=customer_headers)
        assert res.status_code == 200, f"Matching farmers failed: {res.text}"
        print(f"[PASS] Matching farmers evaluated for requirement #{req_id}")

        # 3. Offers & Negotiations
        res = client.get("/api/v1/offers", headers=farmer_headers)
        assert res.status_code == 200, f"Get offers failed: {res.text}"
        offers = res.json()
        assert len(offers) >= 1, "Expected at least 1 seed offer"
        print(f"[PASS] Offers retrieved with timeline ({len(offers)} offers found)")

        # 4. Dealer Low Stock & Demand Insights
        res = client.get("/api/v1/dealer/low-stock", headers=dealer_headers)
        assert res.status_code == 200, f"Dealer low stock failed: {res.text}"
        low_stock = res.json()
        print(f"[PASS] Dealer Low Stock status evaluated ({len(low_stock)} products checked)")

        res = client.get("/api/v1/dealer/demand-insights", headers=dealer_headers)
        assert res.status_code == 200, f"Dealer demand insights failed: {res.text}"
        insights = res.json()
        assert "forecasts" in insights
        print(f"[PASS] Dealer Demand Insights generated: Overall trend = {insights['overall_trend']}")

        # 5. Admin Control Center
        res = client.get("/api/v1/admin/audit-logs", headers=admin_headers)
        assert res.status_code == 200, f"Admin audit logs failed: {res.text}"
        audit_logs = res.json()
        assert len(audit_logs) >= 2
        print(f"[PASS] Admin Audit Logs accessible ({len(audit_logs)} logs recorded)")

        res = client.get("/api/v1/admin/offline-sync", headers=admin_headers)
        assert res.status_code == 200, f"Admin offline sync monitor failed: {res.text}"
        sync_stats = res.json()
        print(f"[PASS] Admin Offline Sync Monitor stats verified (Total events: {sync_stats['total_sync_events']})")

        # 6. Offline Status & Sync
        res = client.get("/api/v1/offline/status")
        assert res.status_code == 200, f"Offline status failed: {res.text}"
        status_data = res.json()
        assert status_data["status"] == "ONLINE"
        print(f"[PASS] Offline Status endpoint online (Version: {status_data['version']})")

        print("\nAll Version 3 backend API tests PASSED successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    test_v3_api_suite()

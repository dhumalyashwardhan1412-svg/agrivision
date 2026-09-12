import sys
import os
import uuid
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, backend_dir)
os.chdir(backend_dir)

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from app.database.database import SessionLocal
from app.database.migrations import run_safe_schema_migrations
from app.models.user import User
from app.models.offer import Offer, OfferStatus
from app.models.review import TransactionReview, ReviewType
from app.models.notification import Notification
from app.services.notification_service import create_notification, notify_review_received

client = TestClient(app)

def test_v3_final_features():
    print("\n=== Testing AgriVision V3: Farmer Rates Buyer & Notification System ===")
    run_safe_schema_migrations()
    db = SessionLocal()
    try:
        # Clean up any leftover test offers
        db.query(TransactionReview).filter(TransactionReview.comment.like("%commercial buyer%")).delete()
        db.query(Offer).filter(Offer.offer_code.like("TEST-RATE-%")).delete()
        db.commit()

        farmer = db.query(User).filter(User.email == "farmer@agrivision.com").first()
        customer = db.query(User).filter(User.email == "customer@agrivision.com").first()
        dealer = db.query(User).filter(User.email == "shopkeeper@agrivision.com").first()
        admin = db.query(User).filter(User.email == "admin@agrivision.com").first()

        assert farmer is not None
        assert customer is not None
        assert dealer is not None
        assert admin is not None

        farmer_token = create_access_token(farmer.id, farmer.role.value)
        customer_token = create_access_token(customer.id, customer.role.value)
        dealer_token = create_access_token(dealer.id, dealer.role.value)
        admin_token = create_access_token(admin.id, admin.role.value)

        farmer_headers = {"Authorization": f"Bearer {farmer_token}"}
        customer_headers = {"Authorization": f"Bearer {customer_token}"}
        dealer_headers = {"Authorization": f"Bearer {dealer_token}"}
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # -------------------------------------------------------------
        # PART 1: FARMER RATES BUYER
        # -------------------------------------------------------------
        print("\n--- 1. Testing Farmer Rates Buyer Flow ---")

        # Step 1.1: Create a dedicated completed test offer between farmer and customer
        farmer_profile = farmer.farmer_profile
        customer_profile = customer.customer_profile

        assert farmer_profile is not None
        assert customer_profile is not None

        dynamic_code = f"TEST-RATE-{uuid.uuid4().hex[:8].upper()}"
        test_offer = Offer(
            offer_code=dynamic_code,
            buyer_id=customer_profile.id,
            farmer_id=farmer_profile.id,
            produce_name="Grade-A Basmati Paddy",
            quantity=50.0,
            unit="Qtl",
            offered_price=3200.0,
            price_unit="Rs/Qtl",
            delivery_preference="DIRECT_PICKUP",
            location="Karnal Mandi Yard",
            status=OfferStatus.PENDING
        )
        db.add(test_offer)
        db.commit()
        db.refresh(test_offer)

        # Attempt to rate buyer while offer is PENDING -> must return 400 Bad Request
        bad_res = client.post(
            "/api/v1/reviews/transaction",
            headers=farmer_headers,
            json={
                "review_type": "FARMER_TO_BUYER",
                "offer_id": test_offer.id,
                "target_user_id": customer.id,
                "rating": 5,
                "category_ratings": {
                    "Communication": 5,
                    "Payment Reliability": 5,
                    "Pickup / Delivery Experience": 5,
                    "Professional Behaviour": 5
                },
                "comment": "Premature review test"
            }
        )
        assert bad_res.status_code == 400, f"Expected 400 on incomplete offer, got {bad_res.status_code}"
        print("[PASS] Premature rating on non-completed offer correctly blocked with 400")

        # Attempt to rate buyer from unauthorized third party (dealer) -> must return 403 Forbidden
        unauth_res = client.post(
            "/api/v1/reviews/transaction",
            headers=dealer_headers,
            json={
                "review_type": "FARMER_TO_BUYER",
                "offer_id": test_offer.id,
                "target_user_id": customer.id,
                "rating": 5
            }
        )
        assert unauth_res.status_code == 403, f"Expected 403 for non-farmer/unauthorized user, got {unauth_res.status_code}"
        print("[PASS] Non-participant rating correctly blocked with 403 Forbidden")

        # Complete the offer
        test_offer.status = OfferStatus.COMPLETED
        db.commit()

        # Step 1.2: Farmer rates buyer successfully
        rate_res = client.post(
            "/api/v1/reviews/transaction",
            headers=farmer_headers,
            json={
                "review_type": "FARMER_TO_BUYER",
                "offer_id": test_offer.id,
                "target_user_id": customer.id,
                "rating": 5,
                "category_ratings": {
                    "Communication": 5,
                    "Payment Reliability": 5,
                    "Pickup / Delivery Experience": 5,
                    "Professional Behaviour": 5
                },
                "comment": "Outstanding commercial buyer! Immediate payment upon weighing and fast pickup truck dispatch."
            }
        )
        assert rate_res.status_code in [200, 201], f"Failed to submit farmer review: {rate_res.text}"
        review_data = rate_res.json()
        assert review_data["rating"] == 5
        assert review_data["target_user_id"] == customer.id
        print(f"[PASS] Farmer submitted 5-star review for Buyer successfully (Review ID: {review_data['id']})")

        # Step 1.3: Duplicate review attempt -> must return 409 Conflict
        dup_res = client.post(
            "/api/v1/reviews/transaction",
            headers=farmer_headers,
            json={
                "review_type": "FARMER_TO_BUYER",
                "offer_id": test_offer.id,
                "target_user_id": customer.id,
                "rating": 4,
                "comment": "Duplicate attempt"
            }
        )
        assert dup_res.status_code == 409, f"Expected 409 Conflict for duplicate review, got {dup_res.status_code}"
        print("[PASS] Duplicate review attempt correctly rejected with 409 Conflict")

        # Step 1.4: Verify offer response reflects farmer_reviewed = True and buyer user IDs
        offers_res = client.get("/api/v1/offers", headers=farmer_headers)
        assert offers_res.status_code == 200
        user_offers = offers_res.json()
        matched = next((o for o in user_offers if o["id"] == test_offer.id), None)
        assert matched is not None, "Test offer must be present in offers list"
        assert matched["farmer_reviewed"] is True, "farmer_reviewed flag must be True"
        assert matched["farmer_rating_given"] == 5, "farmer_rating_given must be 5"
        assert matched["buyer_user_id"] == customer.id, "buyer_user_id must match Customer User ID"
        print("[PASS] Offer response correctly includes farmer_reviewed, rating, and buyer_user_id")

        # Step 1.5: Verify buyer rating summary & reputation API
        summary_res = client.get(f"/api/v1/reviews/user/{customer.id}/summary")
        assert summary_res.status_code == 200
        summary_data = summary_res.json()
        assert summary_data["total_reviews"] >= 1
        assert summary_data["average_rating"] >= 4.0
        assert "Communication" in summary_data["category_averages"]
        print(f"[PASS] Buyer rating summary API returns avg {summary_data['average_rating']} over {summary_data['total_reviews']} reviews")

        # -------------------------------------------------------------
        # PART 2: NOTIFICATION SYSTEM
        # -------------------------------------------------------------
        print("\n--- 2. Testing V3 Notification System ---")

        # Step 2.1: Deduplication test
        event_key = "TEST_EVENT_DEDUP_001"
        n1 = create_notification(
            db=db,
            user_id=customer.id,
            user_role="CUSTOMER",
            notification_type="OFFER_COMPLETED",
            category="OFFER",
            title="Harvest Dispatched",
            message="Farmer dispatched paddy harvest.",
            action_url="/customer/offers",
            priority="SUCCESS",
            event_key=event_key
        )
        n2 = create_notification(
            db=db,
            user_id=customer.id,
            user_role="CUSTOMER",
            notification_type="OFFER_COMPLETED",
            category="OFFER",
            title="Harvest Dispatched duplicate",
            message="Farmer dispatched paddy harvest again.",
            action_url="/customer/offers",
            priority="SUCCESS",
            event_key=event_key
        )
        assert n1.id == n2.id, "Duplicate notification with same event_key must return existing record"
        print("[PASS] Notification deduplication by event_key verified")

        # Step 2.2: Get Unread Count for customer
        unread_res = client.get("/api/v1/notifications/unread-count", headers=customer_headers)
        assert unread_res.status_code == 200
        unread_cnt = unread_res.json()["unread_count"]
        assert unread_cnt >= 1
        print(f"[PASS] Unread count retrieved: {unread_cnt}")

        # Step 2.3: List notifications with pagination and filtering
        notifs_res = client.get("/api/v1/notifications?limit=20&offset=0", headers=customer_headers)
        assert notifs_res.status_code == 200
        notifs_list = notifs_res.json()
        assert len(notifs_list) >= 1
        found_notif = next((n for n in notifs_list if n["id"] == n1.id), None)
        assert found_notif is not None
        assert found_notif["title"] == "Harvest Dispatched"
        assert found_notif["action_url"] == "/customer/offers"
        assert found_notif["priority"] == "SUCCESS"
        print(f"[PASS] Notifications listed with rich metadata and action links ({len(notifs_list)} items)")

        # Step 2.4: Role Isolation Test: Farmer cannot see Customer's notifications
        farmer_notifs_res = client.get("/api/v1/notifications", headers=farmer_headers)
        assert farmer_notifs_res.status_code == 200
        farmer_notifs = farmer_notifs_res.json()
        assert all(n["user_id"] == farmer.id for n in farmer_notifs), "Role isolation violated: farmer received non-farmer notif"
        print("[PASS] Role isolation verified: Farmer cannot query Customer notifications")

        # Step 2.5: Mark single notification as read
        read_res = client.patch(f"/api/v1/notifications/{n1.id}/read", headers=customer_headers)
        assert read_res.status_code == 200
        assert read_res.json()["is_read"] is True
        print(f"[PASS] Notification {n1.id} marked as read")

        # Step 2.6: Mark all as read
        mark_all_res = client.post("/api/v1/notifications/mark-all-read", headers=customer_headers)
        assert mark_all_res.status_code == 200
        after_cnt_res = client.get("/api/v1/notifications/unread-count", headers=customer_headers)
        assert after_cnt_res.json()["unread_count"] == 0
        print("[PASS] Mark all notifications as read verified (unread_count now 0)")

        # Step 2.7: Delete notification
        del_res = client.delete(f"/api/v1/notifications/{n1.id}", headers=customer_headers)
        assert del_res.status_code == 200
        print(f"[PASS] Notification {n1.id} deleted successfully")

        # Clean up test offer & review
        db.query(TransactionReview).filter(TransactionReview.offer_id == test_offer.id).delete()
        db.query(Offer).filter(Offer.id == test_offer.id).delete()
        db.commit()

        print("\n=== ALL V3 FINAL FEATURE TESTS PASSED SUCCESSFULLY! ===\n")

    finally:
        db.close()

if __name__ == "__main__":
    test_v3_final_features()

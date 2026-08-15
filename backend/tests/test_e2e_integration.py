import requests
import json
import sys

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_full_platform_journey():
    print("==================================================")
    print("AGRIVISION END-TO-END INTEGRATION TEST SUITE")
    print("==================================================")

    # 1. Farmer Authentication
    print("\n[Step 1] Authenticating as Farmer...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": "farmer@agrivision.com", "password": "Farmer@123"})
    assert res.status_code == 200, f"Farmer login failed: {res.text}"
    farmer_token = res.json()["access_token"]
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}
    print("  -> Farmer Authenticated successfully. Token acquired.")

    # 2. Get Farmer Farms
    print("\n[Step 2] Fetching Farmer Land Parcels...")
    res = requests.get(f"{BASE_URL}/farms", headers=farmer_headers)
    assert res.status_code == 200
    farms = res.json()
    assert len(farms) > 0, "No farms found"
    farm_id = farms[0]["id"]
    print(f"  -> Active Farm: #{farm_id} '{farms[0]['name']}' ({farms[0]['total_area_acres']} Acres)")

    # 3. Add Certified Soil Lab Record
    print("\n[Step 3] Submitting Laboratory Soil Assay...")
    soil_payload = {
        "farm_id": farm_id,
        "nitrogen": 260.0,
        "phosphorus": 24.0,
        "potassium": 210.0,
        "ph": 6.8,
        "electrical_conductivity": 0.45,
        "organic_carbon": 0.78,
        "soil_texture": "Loamy",
        "lab_name": "Punjab Agricultural University Soil Testing Lab"
    }
    res = requests.post(f"{BASE_URL}/soil/lab-test", json=soil_payload, headers=farmer_headers)
    assert res.status_code == 200, f"Soil record creation failed: {res.text}"
    soil_record = res.json()
    print(f"  -> Soil Assay Recorded. Health Grade: {soil_record['health_grade']}, NPK: {soil_record['npk_status']}")

    # 4. Generate Hybrid Crop Recommendations
    print("\n[Step 4] Executing Hybrid Multi-Factor Recommendation Engine...")
    res = requests.get(f"{BASE_URL}/recommendations/farm/{farm_id}", headers=farmer_headers)
    assert res.status_code == 200, f"Recommendation failed: {res.text}"
    recommendations = res.json()
    assert len(recommendations) > 0
    top_rec = recommendations[0]
    print(f"  -> Top Recommended Crop: {top_rec['crop']['name']} with {top_rec['overall_suitability_score']}% Suitability")
    print(f"     Score Breakdown: Soil={top_rec['soil_score']}%, Climate={top_rec['climate_score']}%, Market={top_rec['market_score']}%, Profit={top_rec['profit_score']}%")

    # 5. Generate Multi-Stage Precision Farming Plan
    print("\n[Step 5] Generating Precision Farming Plan...")
    plan_payload = {
        "farm_id": farm_id,
        "crop_id": top_rec["crop_id"],
        "methodology": "MODERN",
        "target_area_acres": 2.0
    }
    res = requests.post(f"{BASE_URL}/farming-plans/generate", json=plan_payload, headers=farmer_headers)
    assert res.status_code == 200, f"Plan creation failed: {res.text}"
    plan = res.json()
    print(f"  -> Generated {len(plan['schedule_stages_json'])} Lifecycle Execution Phases. Est. Net Profit: INR {plan['estimated_net_profit_inr']}")

    # 6. Simulate Profit & ROI
    print("\n[Step 6] Simulating Financial Scenarios with Interactive Calculator...")
    calc_payload = {
        "crop_name": "Tomato",
        "area_acres": 2.5,
        "seed_cost_inr": 8000,
        "fertilizer_cost_inr": 12000
    }
    res = requests.post(f"{BASE_URL}/profit/calculate", json=calc_payload, headers=farmer_headers)
    assert res.status_code == 200, f"Profit calc failed: {res.text}"
    profit_res = res.json()
    print(f"  -> Profit Simulation Result: Net Profit = INR {profit_res['estimated_profit_inr']}, ROI = {profit_res['return_on_investment_roi_percent']}%, Rating = {profit_res['profitability_rating']}")

    # 7. List Produce on Marketplace
    print("\n[Step 7] Listing Farm Harvest on Direct Marketplace...")
    listing_payload = {
        "title": "Fresh Organic Farm Beefsteak Tomatoes",
        "crop_name": "Tomato",
        "category": "Vegetables",
        "quantity_available": 350.0,
        "unit": "kg",
        "price_per_unit": 38.0,
        "min_order_quantity": 10.0,
        "is_organic": True,
        "location_city": "Ludhiana",
        "state": "Punjab",
        "description": "Crisp, ripe, residue-free organic tomatoes harvested today morning."
    }
    res = requests.post(f"{BASE_URL}/marketplace/listings", json=listing_payload, headers=farmer_headers)
    assert res.status_code == 200, f"Listing failed: {res.text}"
    listing = res.json()
    listing_id = listing["id"]
    print(f"  -> Harvest Listed successfully (Listing #{listing_id}: {listing['title']} @ INR {listing['price_per_unit']}/kg)")

    # 8. Customer Order Placement
    print("\n[Step 8] Authenticating as Customer and Placing Direct Order...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": "customer@agrivision.com", "password": "Customer@123"})
    assert res.status_code == 200
    cust_token = res.json()["access_token"]
    cust_headers = {"Authorization": f"Bearer {cust_token}"}

    order_payload = {
        "delivery_name": "Pooja Sharma",
        "delivery_phone": "+91 9812345678",
        "delivery_address": "Flat 402, Green Avenue",
        "delivery_city": "Chandigarh",
        "delivery_pincode": "160017",
        "payment_method": "UPI",
        "items": [
            {
                "listing_id": listing_id,
                "quantity": 25.0
            }
        ]
    }
    res = requests.post(f"{BASE_URL}/orders", json=order_payload, headers=cust_headers)
    assert res.status_code == 200, f"Order placement failed: {res.text}"
    order = res.json()
    order_id = order["id"]
    print(f"  -> Direct Order Placed (#{order['order_number']}) for 25 kg. Total: INR {order['total_amount_inr']}. Status: {order['status']}")

    # 9. Farmer Order Lifecycle Advance
    print("\n[Step 9] Farmer Processing Order Lifecycle Pipeline...")
    statuses = ["CONFIRMED", "PACKED", "IN_TRANSIT", "DELIVERED"]
    for st in statuses:
        res = requests.patch(f"{BASE_URL}/orders/{order_id}/status", json={"status": st, "tracking_notes": f"Order marked as {st}"}, headers=farmer_headers)
        assert res.status_code == 200
        print(f"  -> Order #{order['order_number']} advanced to: {st}")

    # 10. Generate PDF Report
    print("\n[Step 10] Generating Certified Smart Farm PDF Report...")
    res = requests.get(f"{BASE_URL}/reports/farm-pdf/{farm_id}", headers=farmer_headers)
    assert res.status_code == 200
    assert len(res.content) > 1000, "PDF byte stream empty"
    print(f"  -> PDF Report successfully generated! Size: {len(res.content)} bytes.")

    print("\n==================================================")
    print("ALL 10 END-TO-END WORKFLOW TESTS PASSED 100%")
    print("==================================================")

if __name__ == "__main__":
    test_full_platform_journey()

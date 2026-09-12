from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.database.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.user import User, UserRole, FarmerProfile, CustomerProfile, ShopkeeperProfile
from app.models.farm import Farm, FarmingActivity
from app.models.soil import SoilTest, SoilSourceType
from app.models.crop import Crop, CropRequirement, CropRecommendation
from app.models.market import MarketPrice, MarketTrend, MarketDataType
from app.models.equipment import Equipment, EquipmentRental
from app.models.shop import Shop, ShopProduct
from app.models.listing import CropListing, Review, ListingStatus
from app.models.order import Order, OrderItem, OrderStatus
from app.models.notification import Notification
from app.models.scheme import GovernmentScheme, GovernmentType, SchemeCategory, SavedScheme
from app.models.requirement import BuyerRequirement, RequirementStatus
from app.models.offer import Offer, OfferStatus, OfferNegotiation, NegotiationActionType
from app.models.review import TransactionReview, ReviewType
from app.models.dealer_discount import DealerDiscount, DiscountType
from app.models.audit_log import AuditLog
from app.models.offline_sync import OfflineSyncRecord, SyncStatus

from app.database.migrations import run_safe_schema_migrations

def seed_database():
    Base.metadata.create_all(bind=engine)
    try:
        run_safe_schema_migrations()
    except Exception as e:
        print(f"Migration note: {e}")
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "farmer@agrivision.com").first():
            print("Database already contains seed data. Checking Version 3 extensions...")
            seed_v3_data(db)
            return

        print("Seeding AgriVision database with comprehensive agricultural data...")

        # 1. USERS & PROFILES
        # Farmer
        farmer_user = User(
            email="farmer@agrivision.com",
            hashed_password=hash_password("Farmer@123"),
            full_name="Rajesh Kumar",
            phone_number="+91 98765 43210",
            role=UserRole.FARMER,
            state="Punjab",
            district="Ludhiana",
            address="Village Bhamian Kalan, Ludhiana",
            latitude=30.9010,
            longitude=75.8573,
            avatar_url="https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80"
        )
        db.add(farmer_user)
        db.flush()

        farmer_profile = FarmerProfile(
            user_id=farmer_user.id,
            total_land_area=3.5,
            farming_experience_years=12,
            primary_crops="Wheat, Rice, Tomato, Mustard",
            irrigation_source="Borewell & Drip Irrigation",
            organic_certified=True,
            kisan_credit_card=True
        )
        db.add(farmer_profile)
        db.flush()

        # Customer
        customer_user = User(
            email="customer@agrivision.com",
            hashed_password=hash_password("Customer@123"),
            full_name="Pooja Sharma",
            phone_number="+91 98111 22334",
            role=UserRole.CUSTOMER,
            state="Delhi",
            district="New Delhi",
            address="B-42, Vasant Kunj, New Delhi - 110070",
            latitude=28.5244,
            longitude=77.1588,
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
        )
        db.add(customer_user)
        db.flush()

        customer_profile = CustomerProfile(
            user_id=customer_user.id,
            delivery_address="B-42, Vasant Kunj, New Delhi - 110070",
            preferred_payment_method="Cash on Delivery"
        )
        db.add(customer_profile)
        db.flush()

        # Shopkeeper
        shop_user = User(
            email="shopkeeper@agrivision.com",
            hashed_password=hash_password("Shop@123"),
            full_name="Gurpreet Singh",
            phone_number="+91 98722 55667",
            role=UserRole.SHOPKEEPER,
            state="Punjab",
            district="Ludhiana",
            address="GT Road Near Mandi Complex, Ludhiana",
            latitude=30.9120,
            longitude=75.8450,
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
        )
        db.add(shop_user)
        db.flush()

        shop_profile = ShopkeeperProfile(
            user_id=shop_user.id,
            business_license_number="LIC-AGRI-PB-2024-8841",
            gstin="03AABCK9921D1Z8"
        )
        db.add(shop_profile)
        db.flush()

        # Admin
        admin_user = User(
            email="admin@agrivision.com",
            hashed_password=hash_password("Admin@123"),
            full_name="Dr. Arvind Patel",
            phone_number="+91 99000 11223",
            role=UserRole.ADMIN,
            state="Delhi",
            district="Central Delhi",
            address="Krishi Bhawan, Rajendra Prasad Road, New Delhi",
            latitude=28.6189,
            longitude=77.2140,
            avatar_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80"
        )
        db.add(admin_user)
        db.flush()

        # 2. FARM & SOIL DATA
        farm = Farm(
            farmer_id=farmer_profile.id,
            name="Green Valley Eco Farm",
            location_name="Bhamian Kalan Sector",
            state="Punjab",
            district="Ludhiana",
            village="Bhamian Kalan",
            total_area_acres=3.5,
            latitude=30.9010,
            longitude=75.8573,
            elevation_meters=244.0,
            primary_soil_type="Loamy",
            water_source="Borewell",
            irrigation_system="Drip",
            budget_inr=85000.0
        )
        db.add(farm)
        db.flush()

        # Initial Soil Test (Laboratory)
        soil_test = SoilTest(
            farm_id=farm.id,
            source_type=SoilSourceType.LABORATORY,
            nitrogen=245.0,
            phosphorus=22.5,
            potassium=195.0,
            ph=6.8,
            electrical_conductivity=0.48,
            organic_carbon=0.72,
            moisture_percentage=22.0,
            soil_texture="Loamy",
            zinc_ppm=1.4,
            iron_ppm=5.8,
            sulfur_ppm=14.0,
            lab_name="Punjab Agricultural University (PAU) Soil Testing Lab",
            health_grade="Grade A (Prime Fertile)",
            npk_status="N: Low (245 kg/ha) | P: Optimal (22.5 kg/ha) | K: Optimal (195 kg/ha)",
            recommendations_summary="Incorporate 5 tonnes/acre FYM compost and apply Neem-coated urea in split doses to boost Nitrogen.",
            notes="Comprehensive pre-sowing soil fertility assay for Kharif/Rabi transition."
        )
        db.add(soil_test)
        db.flush()

        # 3. CROPS CATALOG (25+ Crops with full parameters)
        crops_data = [
            {
                "name": "Tomato", "scientific_name": "Solanum lycopersicum", "category": "Vegetables",
                "variety": "Abhinav / NS-501 Hybrid", "duration_days": 110, "growing_season": "Year-round",
                "water_need_level": "Medium", "labor_intensity": "High", "avg_yield_per_acre_kg": 14000.0,
                "benchmark_cost_per_acre_inr": 38000.0, "benchmark_market_price_per_kg": 22.0,
                "image_url": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
                "description": "High yielding semi-determinate tomato hybrid with thick pericarp, excellent shelf life, and high market demand.",
                "req": {"ph_min": 6.0, "ph_max": 7.2, "n_min": 120, "n_max": 200, "p_min": 25, "p_max": 50, "k_min": 150, "k_max": 300, "temp_min": 18, "temp_max": 32, "rain_min": 400, "rain_max": 800, "water_mm": 500}
            },
            {
                "name": "Wheat", "scientific_name": "Triticum aestivum", "category": "Cereal",
                "variety": "HD-3226 / PBW-725", "duration_days": 135, "growing_season": "Rabi",
                "water_need_level": "Medium", "labor_intensity": "Low", "avg_yield_per_acre_kg": 2200.0,
                "benchmark_cost_per_acre_inr": 22000.0, "benchmark_market_price_per_kg": 24.5,
                "image_url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80",
                "description": "Staple rabi cereal with high protein content and yellow rust resistance, guaranteed MSP procurement.",
                "req": {"ph_min": 6.0, "ph_max": 7.5, "n_min": 100, "n_max": 180, "p_min": 20, "p_max": 40, "k_min": 100, "k_max": 220, "temp_min": 12, "temp_max": 25, "rain_min": 350, "rain_max": 750, "water_mm": 450}
            },
            {
                "name": "Basmati Rice", "scientific_name": "Oryza sativa", "category": "Cereal",
                "variety": "Pusa Basmati 1121", "duration_days": 140, "growing_season": "Kharif",
                "water_need_level": "High", "labor_intensity": "High", "avg_yield_per_acre_kg": 2000.0,
                "benchmark_cost_per_acre_inr": 31000.0, "benchmark_market_price_per_kg": 42.0,
                "image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
                "description": "World renowned aromatic long-grain export variety commanding premium wholesale rates.",
                "req": {"ph_min": 5.5, "ph_max": 7.0, "n_min": 120, "n_max": 220, "p_min": 25, "p_max": 50, "k_min": 120, "k_max": 250, "temp_min": 20, "temp_max": 35, "rain_min": 900, "rain_max": 1500, "water_mm": 1200}
            },
            {
                "name": "Onion", "scientific_name": "Allium cepa", "category": "Vegetables",
                "variety": "Nashik Red / Bhima Super", "duration_days": 120, "growing_season": "Rabi",
                "water_need_level": "Medium", "labor_intensity": "High", "avg_yield_per_acre_kg": 10500.0,
                "benchmark_cost_per_acre_inr": 34000.0, "benchmark_market_price_per_kg": 24.0,
                "image_url": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80",
                "description": "High dry matter red bulb onion suitable for long storage and high inter-state mandi trade.",
                "req": {"ph_min": 6.2, "ph_max": 7.5, "n_min": 100, "n_max": 160, "p_min": 20, "p_max": 45, "k_min": 120, "k_max": 220, "temp_min": 15, "temp_max": 30, "rain_min": 350, "rain_max": 650, "water_mm": 400}
            },
            {
                "name": "Potato", "scientific_name": "Solanum tuberosum", "category": "Vegetables",
                "variety": "Kufri Jyoti / Kufri Pukhraj", "duration_days": 95, "growing_season": "Rabi",
                "water_need_level": "Medium", "labor_intensity": "Medium", "avg_yield_per_acre_kg": 12000.0,
                "benchmark_cost_per_acre_inr": 42000.0, "benchmark_market_price_per_kg": 16.0,
                "image_url": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80",
                "description": "Short duration high yielding tuber crop with strong cold storage value addition.",
                "req": {"ph_min": 5.5, "ph_max": 6.8, "n_min": 150, "n_max": 240, "p_min": 30, "p_max": 60, "k_min": 180, "k_max": 320, "temp_min": 14, "temp_max": 24, "rain_min": 300, "rain_max": 600, "water_mm": 450}
            },
            {
                "name": "Mustard", "scientific_name": "Brassica juncea", "category": "Oilseed",
                "variety": "Pusa Bold / Giriraj", "duration_days": 125, "growing_season": "Rabi",
                "water_need_level": "Low", "labor_intensity": "Low", "avg_yield_per_acre_kg": 950.0,
                "benchmark_cost_per_acre_inr": 15000.0, "benchmark_market_price_per_kg": 58.0,
                "image_url": "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=600&auto=format&fit=crop&q=80",
                "description": "Low input cost rabi oilseed with high oil percentage (40%+) and strong industrial oil demand.",
                "req": {"ph_min": 6.0, "ph_max": 7.5, "n_min": 60, "n_max": 120, "p_min": 15, "p_max": 35, "k_min": 60, "k_max": 150, "temp_min": 10, "temp_max": 25, "rain_min": 250, "rain_max": 450, "water_mm": 250}
            },
            {
                "name": "Cotton", "scientific_name": "Gossypium hirsutum", "category": "Cash Crop",
                "variety": "Bt Cotton RCH-659", "duration_days": 160, "growing_season": "Kharif",
                "water_need_level": "Medium", "labor_intensity": "High", "avg_yield_per_acre_kg": 1100.0,
                "benchmark_cost_per_acre_inr": 32000.0, "benchmark_market_price_per_kg": 72.0,
                "image_url": "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=600&auto=format&fit=crop&q=80",
                "description": "High value commercial fiber crop with major textile procurement and export potential.",
                "req": {"ph_min": 6.5, "ph_max": 8.0, "n_min": 90, "n_max": 150, "p_min": 20, "p_max": 45, "k_min": 90, "k_max": 180, "temp_min": 20, "temp_max": 35, "rain_min": 500, "rain_max": 900, "water_mm": 700}
            },
            {
                "name": "Green Chilli", "scientific_name": "Capsicum annuum", "category": "Spice / Veg",
                "variety": "G4 / Sitara", "duration_days": 150, "growing_season": "Year-round",
                "water_need_level": "Medium", "labor_intensity": "High", "avg_yield_per_acre_kg": 5500.0,
                "benchmark_cost_per_acre_inr": 36000.0, "benchmark_market_price_per_kg": 45.0,
                "image_url": "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80",
                "description": "Continuous multiple-picking spice vegetable offering steady weekly cash flow to farmers.",
                "req": {"ph_min": 6.0, "ph_max": 7.0, "n_min": 100, "n_max": 180, "p_min": 25, "p_max": 50, "k_min": 100, "k_max": 200, "temp_min": 18, "temp_max": 32, "rain_min": 400, "rain_max": 800, "water_mm": 550}
            },
            {
                "name": "Maize / Corn", "scientific_name": "Zea mays", "category": "Cereal",
                "variety": "Pioneer P3396", "duration_days": 105, "growing_season": "Kharif",
                "water_need_level": "Medium", "labor_intensity": "Low", "avg_yield_per_acre_kg": 3200.0,
                "benchmark_cost_per_acre_inr": 18000.0, "benchmark_market_price_per_kg": 21.5,
                "image_url": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80",
                "description": "Versatile industrial, feed, and food grain with robust drought tolerance.",
                "req": {"ph_min": 5.8, "ph_max": 7.2, "n_min": 100, "n_max": 160, "p_min": 20, "p_max": 40, "k_min": 80, "k_max": 160, "temp_min": 18, "temp_max": 32, "rain_min": 450, "rain_max": 850, "water_mm": 500}
            },
            {
                "name": "Chickpea (Chana)", "scientific_name": "Cicer arietinum", "category": "Pulse",
                "variety": "JG-11 / Pusa-362", "duration_days": 115, "growing_season": "Rabi",
                "water_need_level": "Low", "labor_intensity": "Low", "avg_yield_per_acre_kg": 900.0,
                "benchmark_cost_per_acre_inr": 14000.0, "benchmark_market_price_per_kg": 62.0,
                "image_url": "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&auto=format&fit=crop&q=80",
                "description": "Nitrogen-fixing pulse that enriches soil organic nitrogen while yielding high protein grain.",
                "req": {"ph_min": 6.0, "ph_max": 7.8, "n_min": 20, "n_max": 50, "p_min": 20, "p_max": 40, "k_min": 40, "k_max": 100, "temp_min": 12, "temp_max": 28, "rain_min": 250, "rain_max": 500, "water_mm": 250}
            }
        ]

        for cdata in crops_data:
            req_data = cdata.pop("req")
            crop = Crop(**cdata)
            db.add(crop)
            db.flush()

            crop_req = CropRequirement(
                crop_id=crop.id,
                ideal_ph_min=req_data["ph_min"],
                ideal_ph_max=req_data["ph_max"],
                ideal_n_min=req_data["n_min"],
                ideal_n_max=req_data["n_max"],
                ideal_p_min=req_data["p_min"],
                ideal_p_max=req_data["p_max"],
                ideal_k_min=req_data["k_min"],
                ideal_k_max=req_data["k_max"],
                ideal_temp_min_c=req_data["temp_min"],
                ideal_temp_max_c=req_data["temp_max"],
                ideal_rainfall_min_mm=req_data["rain_min"],
                ideal_rainfall_max_mm=req_data["rain_max"],
                water_requirement_mm=req_data["water_mm"]
            )
            db.add(crop_req)

        db.flush()

        # 4. APMC MANDI PRICES (Real regional mandis with data_type tags)
        mandi_records = [
            # Tomato
            {"market": "Azadpur Mandi", "state": "Delhi", "district": "North Delhi", "commodity": "Tomato", "min": 1800, "max": 2600, "modal": 2200, "kg": 22.0, "arrival": 180, "chg": 4.5, "type": MarketDataType.LIVE},
            {"market": "Ludhiana APMC Mandi", "state": "Punjab", "district": "Ludhiana", "commodity": "Tomato", "min": 1600, "max": 2400, "modal": 2100, "kg": 21.0, "arrival": 95, "chg": 2.1, "type": MarketDataType.LIVE},
            {"market": "Vashi APMC Mandi", "state": "Maharashtra", "district": "Navi Mumbai", "commodity": "Tomato", "min": 2000, "max": 2800, "modal": 2450, "kg": 24.5, "arrival": 220, "chg": 5.8, "type": MarketDataType.LIVE},
            {"market": "Nashik Mandi", "state": "Maharashtra", "district": "Nashik", "commodity": "Tomato", "min": 1400, "max": 2100, "modal": 1850, "kg": 18.5, "arrival": 350, "chg": -1.5, "type": MarketDataType.RECENT},

            # Wheat
            {"market": "Khanna Mandi (Asia's Largest)", "state": "Punjab", "district": "Ludhiana", "commodity": "Wheat", "min": 2350, "max": 2550, "modal": 2450, "kg": 24.5, "arrival": 450, "chg": 1.2, "type": MarketDataType.LIVE},
            {"market": "Azadpur Mandi", "state": "Delhi", "district": "North Delhi", "commodity": "Wheat", "min": 2400, "max": 2650, "modal": 2520, "kg": 25.2, "arrival": 310, "chg": 0.8, "type": MarketDataType.LIVE},
            {"market": "Indore Mandi", "state": "Madhya Pradesh", "district": "Indore", "commodity": "Wheat", "min": 2500, "max": 2900, "modal": 2750, "kg": 27.5, "arrival": 280, "chg": 3.4, "type": MarketDataType.LIVE},

            # Onion
            {"market": "Lasalgaon Mandi (Asia's Largest)", "state": "Maharashtra", "district": "Nashik", "commodity": "Onion", "min": 1900, "max": 2700, "modal": 2350, "kg": 23.5, "arrival": 520, "chg": 6.2, "type": MarketDataType.LIVE},
            {"market": "Azadpur Mandi", "state": "Delhi", "district": "North Delhi", "commodity": "Onion", "min": 2200, "max": 3100, "modal": 2700, "kg": 27.0, "arrival": 280, "chg": 4.1, "type": MarketDataType.LIVE},
            {"market": "Ludhiana APMC Mandi", "state": "Punjab", "district": "Ludhiana", "commodity": "Onion", "min": 2100, "max": 2800, "modal": 2500, "kg": 25.0, "arrival": 140, "chg": 3.0, "type": MarketDataType.LIVE},

            # Basmati Rice
            {"market": "Karnal Mandi", "state": "Haryana", "district": "Karnal", "commodity": "Basmati Rice", "min": 3800, "max": 4600, "modal": 4250, "kg": 42.5, "arrival": 190, "chg": 2.5, "type": MarketDataType.LIVE},
            {"market": "Amritsar Mandi", "state": "Punjab", "district": "Amritsar", "commodity": "Basmati Rice", "min": 3700, "max": 4500, "modal": 4180, "kg": 41.8, "arrival": 165, "chg": 1.9, "type": MarketDataType.LIVE},

            # Mustard
            {"market": "Jaipur Mandi", "state": "Rajasthan", "district": "Jaipur", "commodity": "Mustard", "min": 5400, "max": 6100, "modal": 5850, "kg": 58.5, "arrival": 140, "chg": 1.5, "type": MarketDataType.LIVE},
            {"market": "Bhatinda Mandi", "state": "Punjab", "district": "Bhatinda", "commodity": "Mustard", "min": 5300, "max": 5950, "modal": 5700, "kg": 57.0, "arrival": 90, "chg": 0.9, "type": MarketDataType.RECENT}
        ]

        for m in mandi_records:
            mp = MarketPrice(
                source="Agmarknet APMC",
                market_name=m["market"],
                state=m["state"],
                district=m["district"],
                commodity=m["commodity"],
                grade="FAQ",
                min_price_per_quintal=m["min"],
                max_price_per_quintal=m["max"],
                modal_price_per_quintal=m["modal"],
                price_per_kg=m["kg"],
                arrival_quantity_tons=m["arrival"],
                price_change_7d_percent=m["chg"],
                data_type=m["type"]
            )
            db.add(mp)

        # 5. SHOPS & AGRI DEALERS (With coordinates for Leaflet map)
        shop1 = Shop(
            owner_id=shop_profile.id,
            shop_name="Kisan Krishi Kendra & Machinery Rental Hub",
            shop_type="Machinery, Seeds & Fertilizers",
            address="Near New Mandi Gate, GT Road, Ludhiana",
            state="Punjab",
            district="Ludhiana",
            pincode="141001",
            latitude=30.9120,
            longitude=75.8450,
            contact_phone="+91 98722 55667",
            email="kisankendra.ldh@agrivision.com",
            rating=4.9,
            verified=True,
            opening_hours="07:30 AM - 08:30 PM",
            image_url="https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=600&auto=format&fit=crop&q=80"
        )
        db.add(shop1)
        db.flush()

        shop2 = Shop(
            owner_id=shop_profile.id,
            shop_name="Punjab Bio-Organics & Soil Clinic",
            shop_type="Bio-fertilizers, Neem inputs & Soil Testing",
            address="Ferozepur Road, Near PAU Gate 2, Ludhiana",
            state="Punjab",
            district="Ludhiana",
            pincode="141004",
            latitude=30.8980,
            longitude=75.8200,
            contact_phone="+91 98788 11234",
            email="soilclinic.pau@agrivision.com",
            rating=4.8,
            verified=True,
            opening_hours="08:00 AM - 07:00 PM",
            image_url="https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop&q=80"
        )
        db.add(shop2)
        db.flush()

        shop3 = Shop(
            owner_id=shop_profile.id,
            shop_name="GreenDrone AgriTech & Precision Spray Center",
            shop_type="Agricultural Drone Spraying & IoT Sensors",
            address="Chandigarh Road, Samrala Chowk, Ludhiana",
            state="Punjab",
            district="Ludhiana",
            pincode="141010",
            latitude=30.9080,
            longitude=75.8750,
            contact_phone="+91 98755 99887",
            email="drones.ldh@agrivision.com",
            rating=5.0,
            verified=True,
            opening_hours="08:30 AM - 08:00 PM",
            image_url="https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80"
        )
        db.add(shop3)
        db.flush()

        # Shop Products
        products_data = [
            {"shop_id": shop1.id, "name": "Neem Coated Urea (50kg)", "cat": "Fertilizer", "brand": "IFFCO", "price": 268.0, "unit": "50kg Bag", "stock": 250, "org": False},
            {"shop_id": shop1.id, "name": "DAP 18:46:00 (50kg)", "cat": "Fertilizer", "brand": "KRIBHCO", "price": 1350.0, "unit": "50kg Bag", "stock": 180, "org": False},
            {"shop_id": shop1.id, "name": "Tomato Hybrid Seeds NS-501 (10g)", "cat": "Seeds", "brand": "Namdhari Seeds", "price": 850.0, "unit": "Pack", "stock": 80, "org": False},
            {"shop_id": shop2.id, "name": "Enriched Bio-Vermicompost (40kg)", "cat": "Organic Fertilizer", "brand": "Punjab Bio", "price": 380.0, "unit": "40kg Bag", "stock": 300, "org": True},
            {"shop_id": shop2.id, "name": "Trichoderma Viride Bio-Fungicide (1kg)", "cat": "Bio-inputs", "brand": "BioRakshak", "price": 220.0, "unit": "1kg Pouch", "stock": 120, "org": True},
            {"shop_id": shop2.id, "name": "Pure Cold-Pressed Neem Oil 10000ppm (1L)", "cat": "Organic Pesticide", "brand": "NeemGuard", "price": 450.0, "unit": "1 Litre", "stock": 90, "org": True},
            {"shop_id": shop3.id, "name": "Inline Drip Lateral Pipe 16mm (500m Coil)", "cat": "Irrigation", "brand": "Jain Irrigation", "price": 3200.0, "unit": "500m Bundle", "stock": 45, "org": False},
            {"shop_id": shop3.id, "name": "Yellow Sticky Pest Traps (Pack of 25)", "cat": "Pest Management", "brand": "AgriTrap", "price": 350.0, "unit": "Pack (25 pcs)", "stock": 150, "org": True}
        ]
        for p in products_data:
            sp = ShopProduct(
                shop_id=p["shop_id"],
                name=p["name"],
                category=p["cat"],
                brand=p["brand"],
                price=p["price"],
                unit=p["unit"],
                stock_quantity=p["stock"],
                is_organic=p["org"]
            )
            db.add(sp)

        # 6. FARM EQUIPMENT (Rentals)
        equipment_list = [
            {
                "name": "Mahindra 575 DI Tractor (45 HP) with Power Steering",
                "cat": "Tractor", "brand": "Mahindra", "hp": 45.0, "daily_rent": 1200.0,
                "img": "https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=600&auto=format&fit=crop&q=80",
                "desc": "Heavy-duty agricultural tractor equipped with hydraulics, ideal for ploughing, rotavating, and trailer haulage."
            },
            {
                "name": "Spectra Precision Laser Land Leveler with Dual Mast",
                "cat": "Land Leveling", "brand": "Trimble / Spectra", "hp": 0.0, "daily_rent": 1500.0,
                "img": "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop&q=80",
                "desc": "Laser-guided millimeter precision land leveler that saves up to 30% irrigation water and improves crop emergence."
            },
            {
                "name": "DJI Agras T40 Agricultural Drone (40L Spray Tank)",
                "cat": "Drone Sprayer", "brand": "DJI Agriculture", "hp": 0.0, "daily_rent": 2800.0,
                "img": "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80",
                "desc": "Ultra-fast precision aerial sprayer covering 40 acres/hour with centrifugal atomization and obstacle avoidance."
            },
            {
                "name": "Shaktiman Semi-Champion Rotavator 6-Feet",
                "cat": "Rotavator", "brand": "Shaktiman", "hp": 40.0, "daily_rent": 750.0,
                "img": "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&auto=format&fit=crop&q=80",
                "desc": "Boron steel curved blades for fine soil seedbed preparation in single pass."
            },
            {
                "name": "Yanmar 6-Row High Speed Automatic Paddy Transplanter",
                "cat": "Transplanter", "brand": "Yanmar", "hp": 18.0, "daily_rent": 2200.0,
                "img": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format&fit=crop&q=80",
                "desc": "Riding type rice seedling transplanter with uniform hill-to-hill spacing."
            }
        ]

        for eq in equipment_list:
            item = Equipment(
                name=eq["name"],
                category=eq["cat"],
                brand=eq["brand"],
                power_hp=eq["hp"],
                daily_rental_rate_inr=eq["daily_rent"],
                image_url=eq["img"],
                description=eq["desc"],
                is_available_for_rent=True
            )
            db.add(item)

        # 7. CROP MARKETPLACE LISTINGS
        listings_data = [
            {
                "title": "Fresh Farm Harvest Organic Hybrid Tomatoes (A-Grade)",
                "crop_name": "Tomato",
                "category": "Vegetables",
                "quantity": 850.0,
                "unit": "kg",
                "price": 32.0,
                "min_order": 5.0,
                "organic": True,
                "grade": "Grade A (Export / Prime)",
                "city": "Ludhiana",
                "state": "Punjab",
                "desc": "Directly harvested from our certified organic farm. Naturally ripened, firm, sweet flavor with zero chemical pesticides.",
                "img": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80"
            },
            {
                "title": "Premium Sharbati Golden Wheat Grain (Cleaned & Graded)",
                "crop_name": "Wheat",
                "category": "Grains",
                "quantity": 3000.0,
                "unit": "kg",
                "price": 34.0,
                "min_order": 25.0,
                "organic": True,
                "grade": "Grade A (Premium Atta Quality)",
                "city": "Ludhiana",
                "state": "Punjab",
                "desc": "Heavy test-weight golden grains with high gluten elasticity. Sun-dried and stored in hermetic grain bags.",
                "img": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80"
            },
            {
                "title": "Crisp Nashik Red Onions (Medium-Large Size)",
                "crop_name": "Onion",
                "category": "Vegetables",
                "quantity": 1200.0,
                "unit": "kg",
                "price": 28.0,
                "min_order": 10.0,
                "organic": False,
                "grade": "Grade A (FAQ)",
                "city": "Ludhiana",
                "state": "Punjab",
                "desc": "Dry, cured red onions with thick skin and high pungency. Excellent for long home or restaurant storage.",
                "img": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80"
            },
            {
                "title": "Aromatic Pusa Basmati 1121 Paddy Rice",
                "crop_name": "Basmati Rice",
                "category": "Grains",
                "quantity": 2500.0,
                "unit": "kg",
                "price": 68.0,
                "min_order": 20.0,
                "organic": True,
                "grade": "Super Extra Long Grain",
                "city": "Ludhiana",
                "state": "Punjab",
                "desc": "Traditional organic basmati paddy from Punjab river plains. Distinct aroma and 2x cooked elongation.",
                "img": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80"
            }
        ]

        created_listings = []
        for ld in listings_data:
            cl = CropListing(
                farmer_id=farmer_profile.id,
                title=ld["title"],
                crop_name=ld["crop_name"],
                category=ld["category"],
                quantity_available=ld["quantity"],
                unit=ld["unit"],
                price_per_unit=ld["price"],
                min_order_quantity=ld["min_order"],
                is_organic=ld["organic"],
                quality_grade=ld["grade"],
                location_city=ld["city"],
                state=ld["state"],
                description=ld["desc"],
                image_url=ld["img"],
                status=ListingStatus.ACTIVE
            )
            db.add(cl)
            created_listings.append(cl)

        db.flush()

        # Add sample review to first listing
        rev = Review(
            listing_id=created_listings[0].id,
            reviewer_id=customer_user.id,
            rating=5,
            comment="Outstanding freshness! Delivered within 24 hours of harvest. Tomatoes are sweet, juicy, and flawless."
        )
        db.add(rev)

        # 8. NOTIFICATIONS
        notif1 = Notification(
            user_id=farmer_user.id,
            title="Kharif Sowing Season Window Open 🌱",
            message="Optimal soil temperature and moisture detected for Tomato and Basmati sowing in Ludhiana district.",
            category="FARMING_REMINDER",
            link_url="/farmer/recommendations"
        )
        notif2 = Notification(
            user_id=farmer_user.id,
            title="Azadpur Mandi Tomato Price Surge (+4.5%) 📈",
            message="Wholesale prices for Grade-A tomatoes reached ₹2,200/quintal today. Consider listing surplus harvest.",
            category="MARKET_ALERT",
            link_url="/farmer/market"
        )
        db.add(notif1)
        db.add(notif2)

        seed_v3_data(db)
        db.commit()
        print("Database seeded successfully with all roles, agricultural data, shops, equipment, and marketplace records.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

def seed_v3_data(db: Session):
    """Seeds Version 3 features: Real Government Schemes, Buyer Requirements, Offers, Dealer Discounts, Reviews, Audit Logs."""
    try:
        # 1. Real Government Schemes
        if not db.query(GovernmentScheme).first():
            print("Seeding verified Government Schemes...")
            schemes = [
                GovernmentScheme(
                    name="PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
                    scheme_code="PM-KISAN-2026",
                    government_type=GovernmentType.CENTRAL,
                    state="All India",
                    category=SchemeCategory.SUBSIDY,
                    short_description="Direct income support of ₹6,000 per year in three equal 4-monthly installments of ₹2,000 to farmer families.",
                    full_description="PM-KISAN provides income support to all landholding farmer families in the country having cultivable land, subject to certain exclusion criteria related to higher income status.",
                    benefits="₹6,000 annually credited directly into verified Aadhaar-linked bank accounts (DBT) in three tranches of ₹2,000.",
                    eligibility_criteria_text="All landholding farmer families with cultivable landholding in their names. Institutional landholders and high-income tax payees are excluded.",
                    eligible_farmer_categories="Small, Marginal, Large",
                    eligible_crops="All Crops",
                    min_land_acres=0.1,
                    max_land_acres=None,
                    required_documents="Aadhaar card, Landholding 7/12 or Khatauni papers, Bank account passbook, Mobile number linked to Aadhaar.",
                    official_website_url="https://pmkisan.gov.in/",
                    application_url="https://pmkisan.gov.in/RegistrationFormNew.aspx",
                    is_verified=True,
                    is_active=True
                ),
                GovernmentScheme(
                    name="PMFBY (Pradhan Mantri Fasal Bima Yojana)",
                    scheme_code="PMFBY-2026",
                    government_type=GovernmentType.CENTRAL,
                    state="All India",
                    category=SchemeCategory.INSURANCE,
                    short_description="Comprehensive financial risk insurance against crop loss or damage due to non-preventable natural risks.",
                    full_description="Offers financial support to farmers suffering crop loss/damage arising out of unforeseen events, stabilizing farmer incomes.",
                    benefits="Uniform premium of only 2% for Kharif crops, 1.5% for Rabi crops, and 5% for annual commercial/horticultural crops. Balance premium paid by Government.",
                    eligibility_criteria_text="All farmers growing notified crops in notified areas including sharecroppers and tenant farmers.",
                    eligible_farmer_categories="Small, Marginal, Large",
                    eligible_crops="Wheat, Rice, Tomato, Mustard, Cotton, Maize, Pulses, Onion",
                    min_land_acres=0.1,
                    max_land_acres=None,
                    required_documents="Land possession certificate / Sowing certificate, Aadhaar card, Bank passbook copy, Crop insurance proposal form.",
                    official_website_url="https://pmfby.gov.in/",
                    application_url="https://pmfby.gov.in/farmerRegistrationForm",
                    is_verified=True,
                    is_active=True
                ),
                GovernmentScheme(
                    name="SMAM (Sub-Mission on Agricultural Mechanization)",
                    scheme_code="SMAM-MECH-2026",
                    government_type=GovernmentType.CENTRAL,
                    state="All India",
                    category=SchemeCategory.EQUIPMENT,
                    short_description="Financial assistance of 40% to 50% for procurement of modern agricultural machinery and equipment.",
                    full_description="Promotes agricultural mechanization among small and marginal farmers in regions where farm power availability is low.",
                    benefits="Direct subsidy up to 50% or ₹1,50,000 to ₹3,00,000 on approved equipment like rotavator, laser land leveler, power tiller, and seed drill.",
                    eligibility_criteria_text="Individual farmers, SHGs, FPOs, and cooperative societies. Small and marginal farmers receive priority 50% subsidy.",
                    eligible_farmer_categories="Small, Marginal",
                    eligible_crops="All Crops",
                    min_land_acres=0.5,
                    max_land_acres=None,
                    required_documents="Aadhaar card, Land ownership record (7/12, 8A or Jamabandi), Bank account details, Tractor RC (if tractor-operated implements applied for).",
                    official_website_url="https://agrimachinery.nic.in/",
                    application_url="https://agrimachinery.nic.in/Index/FarmerRegistration",
                    is_verified=True,
                    is_active=True
                ),
                GovernmentScheme(
                    name="Per Drop More Crop - PMKSY (Micro-Irrigation)",
                    scheme_code="PMKSY-PDMC-2026",
                    government_type=GovernmentType.CENTRAL,
                    state="All India",
                    category=SchemeCategory.IRRIGATION,
                    short_description="Subsidy up to 55% for small/marginal farmers to install Drip and Sprinkler micro-irrigation systems.",
                    full_description="Focuses on enhancing water use efficiency at farm level through micro-irrigation technologies, reducing water wastage and boosting crop yields.",
                    benefits="55% subsidy on total unit cost of drip/sprinkler system for small/marginal farmers (< 5 acres) and 45% for other farmers.",
                    eligibility_criteria_text="Farmers holding cultivable land with an assured water source (well, borewell, farm pond, or canal connectivity).",
                    eligible_farmer_categories="Small, Marginal, Large",
                    eligible_crops="Tomato, Sugarcane, Cotton, Banana, Citrus, Wheat, Vegetables, Pulses",
                    min_land_acres=0.5,
                    max_land_acres=12.5,
                    required_documents="7/12 extract / Land registry, Electricity bill of water pump or certificate of water source, Aadhaar, Bank passbook, Quotation from empanelled vendor.",
                    official_website_url="https://pmksy.gov.in/",
                    application_url="https://pmksy.gov.in/microirrigation/",
                    is_verified=True,
                    is_active=True
                ),
                GovernmentScheme(
                    name="PKVY (Paramparagat Krishi Vikas Yojana - Organic Farming)",
                    scheme_code="PKVY-ORG-2026",
                    government_type=GovernmentType.CENTRAL,
                    state="All India",
                    category=SchemeCategory.SUBSIDY,
                    short_description="Financial assistance of ₹50,000 per hectare over 3 years for cluster-based organic farming and certification.",
                    full_description="Encourages organic farming through cluster approach and Participatory Guarantee System (PGS) certification, supporting chemical-free agriculture.",
                    benefits="₹31,000/ha for organic inputs (seeds, bio-fertilizers, vermicompost), ₹8,800/ha for post-harvest management, packaging, and marketing assistance.",
                    eligibility_criteria_text="Farmers forming a cluster of 20 hectares or more willing to practice certified organic agriculture under PGS-India.",
                    eligible_farmer_categories="Small, Marginal",
                    eligible_crops="All Crops",
                    min_land_acres=0.5,
                    max_land_acres=5.0,
                    required_documents="Aadhaar card, Land title documents, Bank details, PGS Cluster registration undertaking.",
                    official_website_url="https://pgsindia-ncof.gov.in/",
                    application_url="https://pgsindia-ncof.gov.in/pkvy/index.aspx",
                    is_verified=True,
                    is_active=True
                ),
                GovernmentScheme(
                    name="Kisan Credit Card (KCC) Scheme",
                    scheme_code="KCC-CREDIT-2026",
                    government_type=GovernmentType.CENTRAL,
                    state="All India",
                    category=SchemeCategory.LOAN_CREDIT,
                    short_description="Concessional institutional crop loan credit limit up to ₹3,00,000 at effective 4% annual interest with prompt repayment incentive.",
                    full_description="Simplifies flexible short-term credit requirements for cultivation of crops, post-harvest expenses, produce marketing, and farm asset maintenance.",
                    benefits="Low 7% nominal interest rate with 3% prompt repayment subvention, resulting in effective 4% annual interest rate. No collateral needed up to ₹1.60 Lakh.",
                    eligibility_criteria_text="All farmers—individuals/joint borrowers, tenant farmers, oral lessees, and sharecroppers.",
                    eligible_farmer_categories="Small, Marginal, Large",
                    eligible_crops="All Crops",
                    min_land_acres=0.1,
                    max_land_acres=None,
                    required_documents="Completed KCC application form, Aadhaar/Voter ID, Land record documents attested by revenue authority, Passport size photograph.",
                    official_website_url="https://www.myscheme.gov.in/schemes/kcc",
                    application_url="https://www.myscheme.gov.in/schemes/kcc",
                    is_verified=True,
                    is_active=True
                ),
                GovernmentScheme(
                    name="Magel Tyala Shettale (Farm Pond Scheme - Maharashtra)",
                    scheme_code="MAHA-SHETTALE-2026",
                    government_type=GovernmentType.STATE,
                    state="Maharashtra",
                    category=SchemeCategory.IRRIGATION,
                    short_description="Financial subsidy up to ₹50,000 credited directly into farmer account upon construction of personal farm pond.",
                    full_description="Maharashtra state government initiative to provide permanent water storage for drought-prone and rainfed regions to protect standing crops.",
                    benefits="Direct subsidy grant of up to ₹50,000 to construct a farm pond for water harvesting and micro-irrigation.",
                    eligibility_criteria_text="Farmers resident in Maharashtra with minimum 0.50 hectares (1.25 acres) cultivable landholding with suitable catchment slope.",
                    eligible_farmer_categories="Small, Marginal, Large",
                    eligible_crops="All Crops",
                    min_land_acres=1.25,
                    max_land_acres=None,
                    required_documents="7/12 & 8-A land extract, Caste certificate (if applicable), Aadhaar card, Bank passbook, Farm site GPS survey sketch.",
                    official_website_url="https://mahadbt.maharashtra.gov.in/",
                    application_url="https://mahadbt.maharashtra.gov.in/Farmer/",
                    is_verified=True,
                    is_active=True
                ),
                GovernmentScheme(
                    name="Punjab Subsidized Certified Seed Distribution Scheme",
                    scheme_code="PB-SEED-2026",
                    government_type=GovernmentType.STATE,
                    state="Punjab",
                    category=SchemeCategory.CROP_SUPPORT,
                    short_description="Direct price subsidy up to ₹1,000 per quintal on certified seeds distributed through PUNSEED centres.",
                    full_description="Department of Agriculture Punjab provides up to ₹1,000 per quintal direct subsidy on certified quality seed varieties to boost crop yield.",
                    benefits="Direct subsidy up to 50% or maximum ₹1,000/quintal on certified seeds purchased from state agricultural centers.",
                    eligibility_criteria_text="Cultivating farmers in Punjab owning or leasing farm land.",
                    eligible_farmer_categories="Small, Marginal, Large",
                    eligible_crops="Wheat, Rice, Mustard, Maize",
                    min_land_acres=0.5,
                    max_land_acres=10.0,
                    required_documents="Aadhaar card, Proof of landholding (Fard/Jamabandi), Bank account details.",
                    official_website_url="https://agri.punjab.gov.in/",
                    application_url="https://agri.punjab.gov.in/",
                    is_verified=True,
                    is_active=True
                )
            ]
            for s in schemes:
                db.add(s)
            db.commit()
            print(f"Seeded {len(schemes)} Government Schemes.")

        # 2. Buyer Requirements & Matching Offers
        customer_user = db.query(User).filter(User.email == "customer@agrivision.com").first()
        farmer_user = db.query(User).filter(User.email == "farmer@agrivision.com").first()
        dealer_user = db.query(User).filter(User.email == "dealer@agrivision.com").first()
        admin_user = db.query(User).filter(User.email == "admin@agrivision.com").first()

        if customer_user and customer_user.customer_profile:
            cust_prof = customer_user.customer_profile
            farmer_prof = farmer_user.farmer_profile if farmer_user else None

            if not db.query(BuyerRequirement).first():
                print("Seeding sample Buyer Requirements...")
                req1 = BuyerRequirement(
                    buyer_id=cust_prof.id,
                    title="Bulk Organic Tomatoes Needed for Retail",
                    crop_name="Tomato",
                    variety="Desi Organic / Roma",
                    quantity=25.0,
                    unit="Quintal",
                    min_quality_grade="Grade A (Standard)",
                    target_price=2100.0,
                    price_unit="₹/Quintal",
                    required_date=datetime.now(timezone.utc) + timedelta(days=14),
                    delivery_preference="Buyer Warehouse Delivery",
                    location_city=customer_user.district or "Ludhiana",
                    state=customer_user.state or "Punjab",
                    description="Urgent requirement for organic farm-fresh tomatoes. Needs safe crate packing.",
                    status=RequirementStatus.OPEN
                )
                req2 = BuyerRequirement(
                    buyer_id=cust_prof.id,
                    title="Premium Milling Grade Sharbati Wheat",
                    crop_name="Wheat",
                    variety="Sharbati / PBW-725",
                    quantity=50.0,
                    unit="Quintal",
                    min_quality_grade="Grade A (Export/Premium)",
                    target_price=2350.0,
                    price_unit="₹/Quintal",
                    required_date=datetime.now(timezone.utc) + timedelta(days=30),
                    delivery_preference="Farmer Farmgate Pickup",
                    location_city="Ludhiana",
                    state="Punjab",
                    description="Premium milling grade wheat required for direct retail distribution.",
                    status=RequirementStatus.OPEN
                )
                db.add(req1)
                db.add(req2)
                db.commit()
                db.refresh(req1)

                # Seed sample Offer
                if farmer_prof:
                    listing = db.query(CropListing).filter(CropListing.farmer_id == farmer_prof.id).first()
                    print("Seeding sample Offer with negotiation timeline...")
                    offer = Offer(
                        offer_code="OFF-AGRI9201",
                        requirement_id=req1.id,
                        listing_id=listing.id if listing else None,
                        buyer_id=cust_prof.id,
                        farmer_id=farmer_prof.id,
                        produce_name="Grade-A Organic Tomatoes",
                        quantity=20.0,
                        unit="Quintal",
                        offered_price=2150.0,
                        price_unit="₹/Quintal",
                        delivery_preference="Farm Pickup",
                        location="Village Bhamian Kalan, Ludhiana",
                        message="Direct harvest ready for dispatch. Certified organic quality assured.",
                        status=OfferStatus.ACCEPTED,
                        accepted_at=datetime.now(timezone.utc) - timedelta(days=1)
                    )
                    db.add(offer)
                    db.commit()
                    db.refresh(offer)

                    neg1 = OfferNegotiation(
                        offer_id=offer.id,
                        sender_user_id=customer_user.id,
                        sender_role="CUSTOMER",
                        action_type=NegotiationActionType.OFFER_MADE,
                        offered_price=2050.0,
                        quantity=20.0,
                        message="Can you supply 20 Quintals at ₹2,050/Quintal?"
                    )
                    neg2 = OfferNegotiation(
                        offer_id=offer.id,
                        sender_user_id=farmer_user.id,
                        sender_role="FARMER",
                        action_type=NegotiationActionType.COUNTERED,
                        offered_price=2150.0,
                        quantity=20.0,
                        message="Due to high quality organic sorting, best price is ₹2,150/Quintal."
                    )
                    neg3 = OfferNegotiation(
                        offer_id=offer.id,
                        sender_user_id=customer_user.id,
                        sender_role="CUSTOMER",
                        action_type=NegotiationActionType.ACCEPTED,
                        offered_price=2150.0,
                        quantity=20.0,
                        message="Agreed at ₹2,150/Quintal! We will send transport on Monday."
                    )
                    db.add(neg1)
                    db.add(neg2)
                    db.add(neg3)

                    # Seed sample review
                    sample_rev = TransactionReview(
                        review_type=ReviewType.BUYER_TO_FARMER,
                        offer_id=offer.id,
                        reviewer_id=customer_user.id,
                        target_user_id=farmer_user.id,
                        rating=5,
                        category_ratings={"Communication": 5, "Produce Quality": 5, "Delivery": 5, "Overall": 5},
                        comment="Superb organic tomatoes! Perfectly graded and weighed accurately. Will buy regularly from Rajesh."
                    )
                    db.add(sample_rev)
                    db.commit()

        # 3. Dealer Discounts & Low Stock Alerts
        if dealer_user and dealer_user.shopkeeper_profile:
            shop = db.query(Shop).filter(Shop.owner_id == dealer_user.shopkeeper_profile.id).first()
            if shop:
                # Set low stock threshold and adjust a product to trigger alert
                prods = db.query(ShopProduct).filter(ShopProduct.shop_id == shop.id).all()
                if prods:
                    # Make first product low stock to demonstrate alert
                    prods[0].stock_quantity = 4
                    prods[0].low_stock_threshold = 15
                    db.commit()

                    if not db.query(DealerDiscount).first():
                        print("Seeding Dealer Discounts...")
                        disc = DealerDiscount(
                            shop_id=shop.id,
                            product_id=prods[0].id,
                            title="Pre-Sowing Season Discount - 15% OFF",
                            discount_type=DiscountType.PERCENTAGE,
                            discount_value=15.0,
                            min_quantity=2,
                            max_discount_inr=500.0,
                            start_date=datetime.now(timezone.utc) - timedelta(days=2),
                            end_date=datetime.now(timezone.utc) + timedelta(days=28),
                            description="Special early bird discount for registered local farmers.",
                            is_active=True
                        )
                        db.add(disc)
                        db.commit()

        # 4. Sample Audit Logs
        if not db.query(AuditLog).first():
            print("Seeding initial System Audit Logs...")
            audit1 = AuditLog(
                user_id=admin_user.id if admin_user else None,
                user_name=admin_user.full_name if admin_user else "Admin",
                user_role="ADMIN",
                action="SYSTEM_INITIALIZATION",
                entity_type="System",
                entity_id="1",
                description="AgriVision upgraded to Version 3",
                after_state={"version": "AgriVision V3", "status": "UPGRADED"},
                ip_address="127.0.0.1"
            )
            audit2 = AuditLog(
                user_id=farmer_user.id if farmer_user else None,
                user_name=farmer_user.full_name if farmer_user else "Farmer",
                user_role="FARMER",
                action="PROFILE_VERIFIED",
                entity_type="FarmerProfile",
                entity_id=str(farmer_user.farmer_profile.id) if (farmer_user and farmer_user.farmer_profile) else "1",
                description="Farmer profile registered and verified",
                after_state={"status": "VERIFIED", "land_acres": 3.5},
                ip_address="127.0.0.1"
            )
            db.add(audit1)
            db.add(audit2)
            db.commit()

        # 5. Initial Sample Notifications for Demo Experience
        from app.models.notification import Notification
        if not db.query(Notification).first():
            print("Seeding initial V3 Notifications across roles...")
            sample_notifs = []
            if farmer_user:
                sample_notifs.extend([
                    Notification(
                        user_id=farmer_user.id,
                        user_role="FARMER",
                        notification_type="OFFER",
                        title="💰 New Buyer Offer",
                        message="ABC Foods offered ₹2,200/quintal for your red onions.",
                        related_entity_type="Offer",
                        action_url="/farmer/offers",
                        link_url="/farmer/offers",
                        priority="INFO",
                        event_key=f"SEED_NOTIF_1_{farmer_user.id}"
                    ),
                    Notification(
                        user_id=farmer_user.id,
                        user_role="FARMER",
                        notification_type="SCHEME",
                        title="🏛️ New Scheme Available",
                        message="A new verified scheme matching your 5-acre profile is available: PM-KISAN & PMFBY.",
                        related_entity_type="GovernmentScheme",
                        action_url="/farmer/schemes",
                        link_url="/farmer/schemes",
                        priority="SUCCESS",
                        event_key=f"SEED_NOTIF_2_{farmer_user.id}"
                    ),
                    Notification(
                        user_id=farmer_user.id,
                        user_role="FARMER",
                        notification_type="NEGOTIATION",
                        title="🤝 Counter Offer",
                        message="Buyer updated their offer to ₹2,250/quintal.",
                        related_entity_type="Offer",
                        action_url="/farmer/offers",
                        link_url="/farmer/offers",
                        priority="INFO",
                        event_key=f"SEED_NOTIF_3_{farmer_user.id}"
                    )
                ])
            if buyer_user:
                sample_notifs.extend([
                    Notification(
                        user_id=buyer_user.id,
                        user_role="CUSTOMER",
                        notification_type="REVIEW",
                        title="⭐ New Rating Received",
                        message="A farmer rated your transaction experience with 5 stars.",
                        related_entity_type="TransactionReview",
                        action_url="/customer",
                        link_url="/customer",
                        priority="SUCCESS",
                        event_key=f"SEED_NOTIF_4_{buyer_user.id}"
                    ),
                    Notification(
                        user_id=buyer_user.id,
                        user_role="CUSTOMER",
                        notification_type="NEGOTIATION",
                        title="🤝 Farmer Counter Offer",
                        message="Farmer countered your offer at ₹2,250/quintal.",
                        related_entity_type="Offer",
                        action_url="/customer/offers",
                        link_url="/customer/offers",
                        priority="INFO",
                        event_key=f"SEED_NOTIF_5_{buyer_user.id}"
                    )
                ])
            if dealer_user:
                sample_notifs.append(
                    Notification(
                        user_id=dealer_user.id,
                        user_role="SHOPKEEPER",
                        notification_type="STOCK",
                        title="📦 Low Stock Warning",
                        message="Product stock has fallen below your configured alert threshold.",
                        related_entity_type="ShopProduct",
                        action_url="/shopkeeper/low-stock",
                        link_url="/shopkeeper/low-stock",
                        priority="WARNING",
                        event_key=f"SEED_NOTIF_6_{dealer_user.id}"
                    )
                )
            if admin_user:
                sample_notifs.append(
                    Notification(
                        user_id=admin_user.id,
                        user_role="ADMIN",
                        notification_type="SYSTEM",
                        title="🛡️ Verification Request",
                        message="A new agricultural account is waiting for administrator verification.",
                        related_entity_type="User",
                        action_url="/admin/verifications",
                        link_url="/admin/verifications",
                        priority="INFO",
                        event_key=f"SEED_NOTIF_7_{admin_user.id}"
                    )
                )
            db.add_all(sample_notifs)
            db.commit()

        print("Version 3 data verified and seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding V3 data: {e}")

if __name__ == "__main__":
    seed_database()

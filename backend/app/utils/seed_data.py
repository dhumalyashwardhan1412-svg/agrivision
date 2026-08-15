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

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "farmer@agrivision.com").first():
            print("Database already contains seed data.")
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

        db.commit()
        print("Database seeded successfully with all roles, agricultural data, shops, equipment, and marketplace records.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

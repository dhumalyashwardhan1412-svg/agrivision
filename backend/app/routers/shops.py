import math
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.shop import Shop, ShopProduct
from app.schemas.shop import (
    ShopCreate,
    ShopResponse,
    ShopProductCreate,
    ShopProductResponse,
    ShopProductBase,
)

router = APIRouter(prefix="/shops", tags=["Agri Shops & Input Stores"])

def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Haversine formula
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

@router.get("", response_model=List[ShopResponse])
def get_nearby_shops(
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    shop_type: Optional[str] = None,
    district: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Shop)
    if shop_type:
        query = query.filter(Shop.shop_type.ilike(f"%{shop_type}%"))
    if district:
        query = query.filter(Shop.district.ilike(f"%{district}%"))
    
    shops = query.all()
    results = []

    for s in shops:
        shop_resp = ShopResponse.model_validate(s)
        if user_lat is not None and user_lng is not None:
            shop_resp.distance_km = calculate_distance_km(user_lat, user_lng, s.latitude, s.longitude)
        else:
            shop_resp.distance_km = 3.5 # Default nearby estimation
        results.append(shop_resp)

    if user_lat is not None and user_lng is not None:
        results.sort(key=lambda x: x.distance_km or 999.0)

    return results

@router.post("", response_model=ShopResponse)
def create_shop(
    shop_in: ShopCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SHOPKEEPER, UserRole.ADMIN]))
):
    if not current_user.shopkeeper_profile and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="User is not registered as a shopkeeper")

    owner_id = current_user.shopkeeper_profile.id if current_user.shopkeeper_profile else 1
    shop = Shop(
        owner_id=owner_id,
        shop_name=shop_in.shop_name,
        shop_type=shop_in.shop_type,
        address=shop_in.address,
        state=shop_in.state,
        district=shop_in.district,
        pincode=shop_in.pincode,
        latitude=shop_in.latitude,
        longitude=shop_in.longitude,
        contact_phone=shop_in.contact_phone,
        email=shop_in.email,
        opening_hours=shop_in.opening_hours,
        image_url=shop_in.image_url
    )
    db.add(shop)
    db.commit()
    db.refresh(shop)
    return shop

@router.get("/{shop_id}/products", response_model=List[ShopProductResponse])
def get_shop_products(shop_id: int, db: Session = Depends(get_db)):
    return db.query(ShopProduct).filter(ShopProduct.shop_id == shop_id).all()

@router.post("/{shop_id}/products", response_model=ShopProductResponse)
def add_product_to_shop(
    shop_id: int,
    prod_in: ShopProductBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SHOPKEEPER, UserRole.ADMIN]))
):
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    prod = ShopProduct(
        shop_id=shop.id,
        name=prod_in.name,
        category=prod_in.category,
        brand=prod_in.brand,
        price=prod_in.price,
        unit=prod_in.unit,
        stock_quantity=prod_in.stock_quantity,
        is_organic=prod_in.is_organic,
        description=prod_in.description,
        image_url=prod_in.image_url
    )
    db.add(prod)
    db.commit()
    db.refresh(prod)
    return prod

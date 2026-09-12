from typing import List, Optional, Union
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User, UserRole, ShopkeeperProfile
from app.models.shop import Shop, ShopProduct
from app.models.dealer_discount import DealerDiscount, DiscountType
from app.schemas.dealer_v3 import (
    DealerDiscountCreate,
    DealerDiscountResponse,
    DealerProductCreate,
    DealerProductResponse,
    ProductStockUpdate,
    LowStockProductResponse,
    DemandInsightsResponse
)
from app.services.demand_forecast_service import generate_demand_insights
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/dealer", tags=["Dealer Features"])

class UpdateStockQuantityRequest(BaseModel):
    stock_quantity: int = Field(..., ge=0)

def _get_dealer_shops(db: Session, user: User) -> List[Shop]:
    profile = db.query(ShopkeeperProfile).filter(ShopkeeperProfile.user_id == user.id).first()
    if not profile:
        profile = ShopkeeperProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    shops = db.query(Shop).filter(Shop.owner_id == profile.id).all()
    if not shops:
        # Auto-create default shop so new dealers immediately have a working store
        shop_title = f"{user.full_name}'s Agri Store" if user.full_name else "AgriVision Store"
        default_shop = Shop(
            owner_id=profile.id,
            shop_name=shop_title,
            shop_type="Agri Inputs & Machinery",
            address=user.address or "Main Market Area",
            state=user.state or "Punjab",
            district=user.district or "Ludhiana",
            pincode="141001",
            latitude=user.latitude or 30.9010,
            longitude=user.longitude or 75.8573,
            contact_phone=user.phone_number or "9876543210",
            email=user.email or "dealer@agrivision.com",
            opening_hours="08:00 AM - 08:00 PM",
            verified=True,
            rating=4.8
        )
        db.add(default_shop)
        db.commit()
        db.refresh(default_shop)
        shops = [default_shop]
    return shops

def _get_dealer_shop(db: Session, user: User) -> Shop:
    shops = _get_dealer_shops(db, user)
    return shops[0]

def _build_product_response(p: ShopProduct) -> DealerProductResponse:
    return DealerProductResponse(
        id=p.id,
        shop_id=p.shop_id,
        name=p.name,
        category=p.category,
        brand=p.brand,
        price=p.price,
        unit=p.unit or "Pack",
        stock_quantity=p.stock_quantity,
        stock=p.stock_quantity,
        low_stock_threshold=p.low_stock_threshold or 10,
        is_organic=bool(p.is_organic),
        is_in_stock=p.stock_quantity > 0,
        description=p.description,
        image_url=p.image_url,
        created_at=p.created_at
    )

def _build_discount_response(d: DealerDiscount) -> DealerDiscountResponse:
    prod_name = d.product.name if d.product else "Product"
    orig_price = d.product.price if d.product else 0.0
    discounted = orig_price
    if d.discount_type == DiscountType.PERCENTAGE:
        discounted = max(0.0, orig_price * (1 - (d.discount_value / 100.0)))
    elif d.discount_type == DiscountType.FLAT_AMOUNT:
        discounted = max(0.0, orig_price - d.discount_value)

    return DealerDiscountResponse(
        id=d.id,
        shop_id=d.shop_id,
        product_id=d.product_id,
        product_name=prod_name,
        original_price=orig_price,
        discounted_price=round(discounted, 2),
        title=d.title,
        discount_type=d.discount_type,
        discount_value=d.discount_value,
        min_quantity=d.min_quantity,
        max_discount_inr=d.max_discount_inr,
        max_discount_cap=d.max_discount_inr,
        start_date=d.start_date,
        end_date=d.end_date,
        description=d.description,
        is_active=d.is_active,
        created_at=d.created_at
    )

@router.get("/products", response_model=List[DealerProductResponse])
def get_dealer_products(
    current_user: User = Depends(require_role([UserRole.SHOPKEEPER])),
    db: Session = Depends(get_db)
):
    shops = _get_dealer_shops(db, current_user)
    shop_ids = [s.id for s in shops]
    products = db.query(ShopProduct).filter(ShopProduct.shop_id.in_(shop_ids)).order_by(ShopProduct.name.asc()).all()
    return [_build_product_response(p) for p in products]

@router.post("/products", response_model=DealerProductResponse, status_code=status.HTTP_201_CREATED)
def create_dealer_product(
    prod_in: DealerProductCreate,
    current_user: User = Depends(require_role([UserRole.SHOPKEEPER])),
    db: Session = Depends(get_db)
):
    shop = _get_dealer_shop(db, current_user)
    product = ShopProduct(
        shop_id=shop.id,
        name=prod_in.name,
        category=prod_in.category,
        brand=prod_in.brand,
        price=prod_in.price,
        unit=prod_in.unit,
        stock_quantity=prod_in.stock_quantity,
        low_stock_threshold=prod_in.low_stock_threshold,
        is_organic=prod_in.is_organic,
        description=prod_in.description,
        image_url=prod_in.image_url
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    log_audit_event(
        db=db,
        action="CREATE_PRODUCT",
        target_type="ShopProduct",
        user_id=current_user.id,
        target_id=product.id,
        details={"name": product.name, "category": product.category, "price": product.price}
    )

    return _build_product_response(product)


@router.post("/discounts", response_model=DealerDiscountResponse, status_code=status.HTTP_201_CREATED)
def create_discount(
    disc_in: DealerDiscountCreate,
    current_user: User = Depends(require_role([UserRole.SHOPKEEPER])),
    db: Session = Depends(get_db)
):
    shops = _get_dealer_shops(db, current_user)
    shop_ids = [s.id for s in shops]

    # Validate product belongs to any of dealer's shops
    product = db.query(ShopProduct).filter(
        ShopProduct.id == disc_in.product_id,
        ShopProduct.shop_id.in_(shop_ids)
    ).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found in your shop catalog")

    if disc_in.discount_value <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Discount value must be greater than 0")

    if disc_in.discount_type == DiscountType.PERCENTAGE and disc_in.discount_value > 90:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Percentage discount cannot exceed 90%")
    
    # Parse and normalize start_date and end_date
    start_dt = disc_in.start_date
    end_dt = disc_in.end_date
    if isinstance(start_dt, str):
        start_dt = datetime.fromisoformat(start_dt.replace('Z', '+00:00'))
    if isinstance(end_dt, str):
        end_dt = datetime.fromisoformat(end_dt.replace('Z', '+00:00'))

    if start_dt.tzinfo is not None and end_dt.tzinfo is None:
        end_dt = end_dt.replace(tzinfo=timezone.utc)
    elif start_dt.tzinfo is None and end_dt.tzinfo is not None:
        start_dt = start_dt.replace(tzinfo=timezone.utc)

    if start_dt >= end_dt:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="End date must be after start date")

    # Resolve max discount cap from either field name
    max_cap = disc_in.max_discount_inr if disc_in.max_discount_inr is not None else disc_in.max_discount_cap

    discount = DealerDiscount(
        shop_id=product.shop_id,
        product_id=disc_in.product_id,
        title=disc_in.title,
        discount_type=disc_in.discount_type,
        discount_value=disc_in.discount_value,
        min_quantity=max(1, disc_in.min_quantity or 1),
        max_discount_inr=max_cap,
        start_date=start_dt,
        end_date=end_dt,
        description=disc_in.description,
        is_active=disc_in.is_active
    )
    db.add(discount)
    db.commit()
    db.refresh(discount)

    log_audit_event(
        db=db,
        action="CREATE_DISCOUNT",
        target_type="DealerDiscount",
        user_id=current_user.id,
        target_id=discount.id,
        details={"product_id": product.id, "title": disc_in.title, "value": disc_in.discount_value}
    )

    return _build_discount_response(discount)

@router.get("/discounts", response_model=List[DealerDiscountResponse])
def get_discounts(
    current_user: User = Depends(require_role([UserRole.SHOPKEEPER])),
    db: Session = Depends(get_db)
):
    shops = _get_dealer_shops(db, current_user)
    shop_ids = [s.id for s in shops]
    discounts = db.query(DealerDiscount).filter(DealerDiscount.shop_id.in_(shop_ids)).order_by(DealerDiscount.created_at.desc()).all()
    return [_build_discount_response(d) for d in discounts]

@router.put("/discounts/{discount_id}/toggle", response_model=DealerDiscountResponse)
def toggle_discount(
    discount_id: int,
    current_user: User = Depends(require_role([UserRole.SHOPKEEPER])),
    db: Session = Depends(get_db)
):
    shops = _get_dealer_shops(db, current_user)
    shop_ids = [s.id for s in shops]
    discount = db.query(DealerDiscount).filter(
        DealerDiscount.id == discount_id,
        DealerDiscount.shop_id.in_(shop_ids)
    ).first()
    if not discount:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Discount not found")

    discount.is_active = not discount.is_active
    db.commit()
    db.refresh(discount)

    return _build_discount_response(discount)

@router.delete("/discounts/{discount_id}")
def delete_discount(
    discount_id: int,
    current_user: User = Depends(require_role([UserRole.SHOPKEEPER])),
    db: Session = Depends(get_db)
):
    shops = _get_dealer_shops(db, current_user)
    shop_ids = [s.id for s in shops]
    deleted = db.query(DealerDiscount).filter(
        DealerDiscount.id == discount_id,
        DealerDiscount.shop_id.in_(shop_ids)
    ).delete()
    db.commit()
    return {"message": "Discount deleted successfully", "deleted": deleted > 0}

@router.get("/low-stock", response_model=List[LowStockProductResponse])
def get_low_stock_products(
    current_user: User = Depends(require_role([UserRole.SHOPKEEPER])),
    db: Session = Depends(get_db)
):
    shops = _get_dealer_shops(db, current_user)
    shop_ids = [s.id for s in shops]
    products = db.query(ShopProduct).filter(ShopProduct.shop_id.in_(shop_ids)).all()

    results = []
    for p in products:
        thresh = p.low_stock_threshold or 10
        qty = p.stock_quantity
        if qty == 0:
            status_str = "OUT_OF_STOCK"
            suggested = thresh * 3
        elif qty <= thresh // 2:
            status_str = "CRITICAL"
            suggested = (thresh * 2) - qty
        elif qty <= thresh:
            status_str = "LOW"
            suggested = (thresh * 2) - qty
        else:
            status_str = "HEALTHY"
            suggested = 0

        shop_name = p.shop.shop_name if p.shop else "Agri Store"

        results.append(LowStockProductResponse(
            product_id=p.id,
            shop_id=p.shop_id,
            shop_name=shop_name,
            product_name=p.name,
            category=p.category,
            current_stock=qty,
            low_stock_threshold=thresh,
            status=status_str,
            suggested_restock=suggested,
            unit=p.unit or "Pack"
        ))

        if status_str in ["OUT_OF_STOCK", "CRITICAL", "LOW"]:
            try:
                from app.services.notification_service import notify_stock_alert
                notify_stock_alert(db, current_user.id, p, status_str)
            except Exception as e:
                pass

    order_map = {"OUT_OF_STOCK": 0, "CRITICAL": 1, "LOW": 2, "HEALTHY": 3}
    results.sort(key=lambda x: order_map.get(x.status, 4))
    return results

@router.put("/products/{product_id}/threshold")
def update_stock_threshold(
    product_id: int,
    update_in: ProductStockUpdate,
    current_user: User = Depends(require_role([UserRole.SHOPKEEPER])),
    db: Session = Depends(get_db)
):
    shops = _get_dealer_shops(db, current_user)
    shop_ids = [s.id for s in shops]
    product = db.query(ShopProduct).filter(
        ShopProduct.id == product_id,
        ShopProduct.shop_id.in_(shop_ids)
    ).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    product.low_stock_threshold = update_in.low_stock_threshold
    db.commit()
    db.refresh(product)
    return {"message": "Low stock threshold updated", "product_id": product.id, "threshold": product.low_stock_threshold}

@router.put("/products/{product_id}/stock")
def update_stock_quantity(
    product_id: int,
    update_in: UpdateStockQuantityRequest,
    current_user: User = Depends(require_role([UserRole.SHOPKEEPER])),
    db: Session = Depends(get_db)
):
    shops = _get_dealer_shops(db, current_user)
    shop_ids = [s.id for s in shops]
    product = db.query(ShopProduct).filter(
        ShopProduct.id == product_id,
        ShopProduct.shop_id.in_(shop_ids)
    ).with_for_update().first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    old_stock = product.stock_quantity
    product.stock_quantity = update_in.stock_quantity
    db.commit()
    db.refresh(product)

    log_audit_event(
        db=db,
        action="UPDATE_STOCK",
        target_type="ShopProduct",
        user_id=current_user.id,
        target_id=product.id,
        details={"product_name": product.name, "old_stock": old_stock, "new_stock": product.stock_quantity}
    )

    return {"message": "Stock quantity updated successfully", "product_id": product.id, "stock_quantity": product.stock_quantity}

@router.get("/demand-insights", response_model=DemandInsightsResponse)
def get_demand_insights(
    current_user: User = Depends(require_role([UserRole.SHOPKEEPER])),
    db: Session = Depends(get_db)
):
    shop = _get_dealer_shop(db, current_user)
    return generate_demand_insights(db, shop.id)


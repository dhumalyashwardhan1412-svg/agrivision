import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.order import Order, OrderItem, OrderStatus
from app.models.listing import CropListing
from app.models.notification import Notification
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate

router = APIRouter(prefix="/orders", tags=["Orders & Commerce"])

@router.post("", response_model=OrderResponse)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.customer_profile and current_user.role != UserRole.CUSTOMER and current_user.role != UserRole.ADMIN:
        # Create customer profile on the fly if needed
        pass

    customer_id = current_user.customer_profile.id if current_user.customer_profile else 1

    total_amount = 0.0
    order_items = []
    farmer_id = None

    for item in order_in.items:
        listing = db.query(CropListing).filter(CropListing.id == item.listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail=f"Listing ID {item.listing_id} not found")
        
        if listing.quantity_available < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Requested quantity {item.quantity} exceeds available stock ({listing.quantity_available} {listing.unit})"
            )

        subtotal = item.quantity * listing.price_per_unit
        total_amount += subtotal
        farmer_id = listing.farmer_id

        # Deduct quantity
        listing.quantity_available -= item.quantity

        order_item = OrderItem(
            listing_id=listing.id,
            item_title=listing.title,
            quantity=item.quantity,
            unit=listing.unit,
            unit_price=listing.price_per_unit,
            subtotal_inr=subtotal
        )
        order_items.append(order_item)

    order_num = f"ORD-{uuid.uuid4().hex[:8].upper()}"
    new_order = Order(
        order_number=order_num,
        customer_id=customer_id,
        farmer_id=farmer_id,
        total_amount_inr=total_amount,
        status=OrderStatus.PENDING,
        delivery_name=order_in.delivery_name,
        delivery_phone=order_in.delivery_phone,
        delivery_address=order_in.delivery_address,
        delivery_city=order_in.delivery_city,
        delivery_pincode=order_in.delivery_pincode,
        payment_method=order_in.payment_method,
        payment_status="PENDING" if order_in.payment_method == "Cash on Delivery" else "PAID",
        tracking_notes="Order placed and awaiting farmer dispatch confirmation.",
        items=order_items
    )
    db.add(new_order)

    # Add notification for farmer
    if farmer_id:
        farmer_profile = db.query(CropListing).filter(CropListing.farmer_id == farmer_id).first()
        if farmer_profile and farmer_profile.farmer:
            notif = Notification(
                user_id=farmer_profile.farmer.user_id,
                title="New Marketplace Order Received! 🛒",
                message=f"Order {order_num} for ₹{total_amount:,.2f} has been placed by {order_in.delivery_name}.",
                category="ORDER_UPDATE",
                link_url="/farmer/sales"
            )
            db.add(notif)

    db.commit()
    db.refresh(new_order)

    resp = OrderResponse.model_validate(new_order)
    resp.customer_name = current_user.full_name
    return resp

@router.get("/my-orders", response_model=List[OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.FARMER and current_user.farmer_profile:
        orders = (
            db.query(Order)
            .filter(Order.farmer_id == current_user.farmer_profile.id)
            .order_by(Order.created_at.desc())
            .all()
        )
    elif current_user.role == UserRole.CUSTOMER and current_user.customer_profile:
        orders = (
            db.query(Order)
            .filter(Order.customer_id == current_user.customer_profile.id)
            .order_by(Order.created_at.desc())
            .all()
        )
    elif current_user.role == UserRole.ADMIN:
        orders = db.query(Order).order_by(Order.created_at.desc()).all()
    else:
        orders = []

    results = []
    for o in orders:
        resp = OrderResponse.model_validate(o)
        if o.customer and o.customer.user:
            resp.customer_name = o.customer.user.full_name
        if o.farmer and o.farmer.user:
            resp.farmer_name = o.farmer.user.full_name
        results.append(resp)
    return results

@router.get("/{order_id}", response_model=OrderResponse)
def get_order_by_id(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    resp = OrderResponse.model_validate(order)
    if order.customer and order.customer.user:
        resp.customer_name = order.customer.user.full_name
    if order.farmer and order.farmer.user:
        resp.farmer_name = order.farmer.user.full_name
    return resp

@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_in: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status_in.status
    if status_in.tracking_notes:
        order.tracking_notes = status_in.tracking_notes

    if order.status == OrderStatus.DELIVERED:
        order.payment_status = "PAID"

    # Send notification to customer
    if order.customer and order.customer.user_id:
        notif = Notification(
            user_id=order.customer.user_id,
            title=f"Order Status Updated: {order.status.value} 📦",
            message=f"Your order {order.order_number} is now {order.status.value}. {status_in.tracking_notes or ''}",
            category="ORDER_UPDATE",
            link_url="/customer/orders"
        )
        db.add(notif)

    db.commit()
    db.refresh(order)

    resp = OrderResponse.model_validate(order)
    if order.customer and order.customer.user:
        resp.customer_name = order.customer.user.full_name
    return resp

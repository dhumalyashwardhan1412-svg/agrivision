from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.order import OrderStatus

class OrderItemCreate(BaseModel):
    listing_id: int
    quantity: float

class OrderItemResponse(BaseModel):
    id: int
    listing_id: Optional[int]
    item_title: str
    quantity: float
    unit: str
    unit_price: float
    subtotal_inr: float

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    delivery_name: str
    delivery_phone: str
    delivery_address: str
    delivery_city: str
    delivery_pincode: str
    payment_method: str = "Cash on Delivery"

class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    tracking_notes: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    order_number: str
    customer_id: int
    farmer_id: Optional[int]
    total_amount_inr: float
    status: OrderStatus
    delivery_name: str
    delivery_phone: str
    delivery_address: str
    delivery_city: str
    delivery_pincode: str
    payment_method: str
    payment_status: str
    tracking_notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []
    customer_name: Optional[str] = None
    farmer_name: Optional[str] = None

    class Config:
        from_attributes = True

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ShopProductBase(BaseModel):
    name: str
    category: str
    brand: Optional[str] = None
    price: float
    unit: str = "Pack"
    stock_quantity: int = 100
    is_organic: bool = False
    description: Optional[str] = None
    image_url: Optional[str] = None

class ShopProductCreate(ShopProductBase):
    shop_id: int

class ShopProductResponse(ShopProductBase):
    id: int
    shop_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ShopBase(BaseModel):
    shop_name: str
    shop_type: str = "Agri Inputs & Machinery"
    address: str
    state: str
    district: str
    pincode: Optional[str] = None
    latitude: float
    longitude: float
    contact_phone: str
    email: Optional[str] = None
    opening_hours: str = "08:00 AM - 08:00 PM"
    image_url: Optional[str] = None

class ShopCreate(ShopBase):
    pass

class ShopResponse(ShopBase):
    id: int
    owner_id: int
    rating: float
    verified: bool
    created_at: datetime
    products: List[ShopProductResponse] = []
    distance_km: Optional[float] = None

    class Config:
        from_attributes = True

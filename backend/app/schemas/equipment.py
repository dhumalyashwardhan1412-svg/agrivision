from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class EquipmentBase(BaseModel):
    name: str
    category: str
    brand: Optional[str] = None
    power_hp: Optional[float] = None
    daily_rental_rate_inr: float = 1200.0
    hourly_rate_inr: float = 300.0
    purchase_price_estimate_inr: float = 450000.0
    description: Optional[str] = None
    specifications_json: Optional[Dict[str, Any]] = None
    image_url: Optional[str] = None
    is_available_for_rent: bool = True

class EquipmentResponse(EquipmentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class EquipmentRentalCreate(BaseModel):
    equipment_id: int
    shop_id: Optional[int] = None
    start_date: datetime
    end_date: datetime
    notes: Optional[str] = None

class EquipmentRentalResponse(BaseModel):
    id: int
    equipment_id: int
    shop_id: Optional[int]
    farmer_id: int
    start_date: datetime
    end_date: datetime
    total_days: int
    daily_rate_applied: float
    total_cost_inr: float
    status: str
    notes: Optional[str]
    created_at: datetime
    equipment: Optional[EquipmentResponse] = None

    class Config:
        from_attributes = True

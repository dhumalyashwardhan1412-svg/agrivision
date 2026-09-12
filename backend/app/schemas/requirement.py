from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.requirement import RequirementStatus

class BuyerRequirementBase(BaseModel):
    title: str
    crop_name: str
    variety: Optional[str] = None
    quantity: float
    unit: str = "Quintal"
    min_quality_grade: str = "Grade A (Standard)"
    target_price: float
    price_unit: str = "₹/Quintal"
    required_date: Optional[datetime] = None
    delivery_preference: str = "Farmer Farmgate Pickup"
    location_city: str
    state: str
    description: Optional[str] = None

class BuyerRequirementCreate(BuyerRequirementBase):
    expires_at: Optional[datetime] = None

class BuyerRequirementUpdate(BaseModel):
    title: Optional[str] = None
    quantity: Optional[float] = None
    target_price: Optional[float] = None
    required_date: Optional[datetime] = None
    description: Optional[str] = None
    status: Optional[RequirementStatus] = None

class BuyerRequirementResponse(BuyerRequirementBase):
    id: int
    buyer_id: int
    buyer_name: Optional[str] = None
    buyer_company: Optional[str] = None
    status: RequirementStatus
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    total_offers_count: int = 0

    class Config:
        from_attributes = True

class MatchedFarmerItem(BaseModel):
    listing_id: int
    farmer_id: int
    farmer_name: str
    farm_location: str
    crop_name: str
    variety: Optional[str] = None
    available_quantity: float
    unit: str
    asking_price: float
    quality_grade: str
    rating: float
    match_score: int # e.g. 95
    match_breakdown: List[str]

class FarmerBuyerRequirementResponse(BuyerRequirementBase):
    id: int
    buyer_id: int
    buyer_name: str
    buyer_company: Optional[str] = None
    buyer_verified: bool = True
    buyer_rating: float = 4.9
    status: RequirementStatus
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    total_offers_count: int = 0
    has_my_offer: bool = False
    my_offer_id: Optional[int] = None
    my_offer_status: Optional[str] = None
    my_offered_price: Optional[float] = None
    my_offered_quantity: Optional[float] = None

    class Config:
        from_attributes = True

class FarmerCounterRequirementInput(BaseModel):
    counter_price: float
    quantity: Optional[float] = None
    message: Optional[str] = None


from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.offer import OfferStatus, NegotiationActionType

class OfferCreate(BaseModel):
    requirement_id: Optional[int] = None
    listing_id: Optional[int] = None
    farmer_id: int
    produce_name: str
    quantity: float
    unit: str = "Quintal"
    offered_price: float
    price_unit: str = "₹/Quintal"
    delivery_preference: str = "Pickup from Farm"
    location: Optional[str] = None
    message: Optional[str] = None
    expires_at: Optional[datetime] = None

class OfferCounterRequest(BaseModel):
    counter_price: float
    quantity: Optional[float] = None
    message: Optional[str] = None

class OfferNegotiationResponse(BaseModel):
    id: int
    sender_user_id: int
    sender_name: Optional[str] = None
    sender_role: str
    action_type: NegotiationActionType
    offered_price: float
    quantity: float
    message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class OfferResponse(BaseModel):
    id: int
    offer_code: str
    requirement_id: Optional[int] = None
    listing_id: Optional[int] = None
    buyer_id: int
    farmer_id: int
    buyer_user_id: Optional[int] = None
    farmer_user_id: Optional[int] = None
    buyer_name: Optional[str] = None
    buyer_phone: Optional[str] = None
    buyer_rating: float = 5.0
    farmer_name: Optional[str] = None
    farmer_phone: Optional[str] = None
    farmer_rating: float = 5.0
    produce_name: str
    quantity: float
    unit: str
    offered_price: float
    price_unit: str
    delivery_preference: str
    location: Optional[str] = None
    message: Optional[str] = None
    status: OfferStatus
    expires_at: Optional[datetime] = None
    accepted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    farmer_reviewed: bool = False
    farmer_rating_given: Optional[int] = None
    buyer_reviewed: bool = False
    buyer_rating_given: Optional[int] = None
    created_at: datetime
    negotiations: List[OfferNegotiationResponse] = []

    class Config:
        from_attributes = True

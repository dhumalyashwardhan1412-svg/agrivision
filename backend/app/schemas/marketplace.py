from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.listing import ListingStatus

class ReviewCreate(BaseModel):
    listing_id: int
    rating: int = 5
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    listing_id: int
    reviewer_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime
    reviewer_name: Optional[str] = None

    class Config:
        from_attributes = True

class CropListingBase(BaseModel):
    crop_id: Optional[int] = None
    title: str
    crop_name: str
    category: str = "Vegetables"
    variety: Optional[str] = None
    quantity_available: float
    unit: str = "kg"
    price_per_unit: float
    min_order_quantity: float = 1.0
    harvest_date: Optional[datetime] = None
    is_organic: bool = False
    quality_grade: str = "Grade A (Export/Premium)"
    location_city: str
    state: str
    image_url: Optional[str] = None
    description: Optional[str] = None

class CropListingCreate(CropListingBase):
    pass

class CropListingUpdate(BaseModel):
    title: Optional[str] = None
    quantity_available: Optional[float] = None
    price_per_unit: Optional[float] = None
    min_order_quantity: Optional[float] = None
    is_organic: Optional[bool] = None
    quality_grade: Optional[str] = None
    status: Optional[ListingStatus] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class CropListingResponse(CropListingBase):
    id: int
    farmer_id: int
    farmer_name: Optional[str] = None
    farmer_phone: Optional[str] = None
    status: ListingStatus
    created_at: datetime
    updated_at: datetime
    reviews: List[ReviewResponse] = []
    average_rating: Optional[float] = 5.0

    class Config:
        from_attributes = True

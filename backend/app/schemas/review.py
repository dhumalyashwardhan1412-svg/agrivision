from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from app.models.review import ReviewType

class TransactionReviewCreate(BaseModel):
    review_type: ReviewType
    order_id: Optional[int] = None
    offer_id: Optional[int] = None
    shop_id: Optional[int] = None
    target_user_id: int
    rating: int = Field(..., ge=1, le=5)
    category_ratings: Optional[Dict[str, int]] = None # e.g. {"communication": 5, "quality": 4, "delivery": 5}
    comment: Optional[str] = None

class TransactionReviewResponse(BaseModel):
    id: int
    review_type: ReviewType
    order_id: Optional[int] = None
    offer_id: Optional[int] = None
    shop_id: Optional[int] = None
    reviewer_id: int
    reviewer_name: Optional[str] = None
    target_user_id: int
    target_user_name: Optional[str] = None
    rating: int
    category_ratings: Optional[Dict[str, int]] = None
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserRatingSummary(BaseModel):
    user_id: int
    average_rating: float
    total_reviews: int
    rating_distribution: Dict[str, int] # e.g. {"5": 10, "4": 2, ...}
    category_averages: Dict[str, float]

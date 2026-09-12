from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.scheme import GovernmentType, SchemeCategory

class SchemeBase(BaseModel):
    name: str
    scheme_code: str
    government_type: GovernmentType = GovernmentType.CENTRAL
    state: str = "All India"
    category: SchemeCategory = SchemeCategory.SUBSIDY
    short_description: str
    full_description: Optional[str] = None
    benefits: str
    eligibility_criteria_text: str
    eligible_farmer_categories: str = "Small, Marginal, Large"
    eligible_crops: str = "All Crops"
    min_land_acres: float = 0.0
    max_land_acres: Optional[float] = None
    required_documents: str
    official_website_url: Optional[str] = None
    application_url: Optional[str] = None
    start_date: Optional[datetime] = None
    deadline_date: Optional[datetime] = None
    is_verified: bool = True
    is_active: bool = True
    is_demo: bool = False

class SchemeCreate(SchemeBase):
    pass

class SchemeUpdate(BaseModel):
    name: Optional[str] = None
    government_type: Optional[GovernmentType] = None
    state: Optional[str] = None
    category: Optional[SchemeCategory] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    benefits: Optional[str] = None
    eligibility_criteria_text: Optional[str] = None
    eligible_farmer_categories: Optional[str] = None
    eligible_crops: Optional[str] = None
    min_land_acres: Optional[float] = None
    max_land_acres: Optional[float] = None
    required_documents: Optional[str] = None
    official_website_url: Optional[str] = None
    application_url: Optional[str] = None
    deadline_date: Optional[datetime] = None
    is_verified: Optional[bool] = None
    is_active: Optional[bool] = None

class SchemeResponse(SchemeBase):
    id: int
    last_verified_date: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_saved: bool = False
    eligibility_status: Optional[str] = None # "ELIGIBLE", "POSSIBLY_ELIGIBLE", "NOT_ELIGIBLE"
    eligibility_reasons: Optional[List[str]] = None

    class Config:
        from_attributes = True

class SavedSchemeCreate(BaseModel):
    scheme_id: int
    notes: Optional[str] = None

class SavedSchemeResponse(BaseModel):
    id: int
    scheme_id: int
    scheme: SchemeResponse
    notes: Optional[str] = None
    saved_at: datetime

    class Config:
        from_attributes = True

class EligibilityCheckResponse(BaseModel):
    scheme_id: int
    scheme_name: str
    status: str # "ELIGIBLE", "POSSIBLY_ELIGIBLE", "NOT_ELIGIBLE"
    score_percentage: float
    matched_criteria: List[str]
    unmatched_criteria: List[str]
    disclaimer: str

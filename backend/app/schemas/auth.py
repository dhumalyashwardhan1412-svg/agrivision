from pydantic import BaseModel, EmailStr
from typing import Optional, Union
from datetime import datetime
from app.models.user import UserRole, UserAccountStatus

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone_number: Optional[str] = None
    role: Union[UserRole, str] = UserRole.FARMER
    preferred_language: Optional[str] = "en" # en, hi, mr
    state: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    # Extra role-specific initial fields
    total_land_area: Optional[float] = None
    irrigation_source: Optional[str] = None
    primary_crops: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user_id: int
    full_name: str
    email: str
    preferred_language: str = "en"
    status: UserAccountStatus = UserAccountStatus.ACTIVE

class FarmerProfileResponse(BaseModel):
    id: int
    total_land_area: float
    farming_experience_years: int
    primary_crops: Optional[str]
    irrigation_source: Optional[str]
    organic_certified: bool
    kisan_credit_card: bool

    class Config:
        from_attributes = True

class CustomerProfileResponse(BaseModel):
    id: int
    preferred_payment_method: str
    delivery_address: Optional[str]

    class Config:
        from_attributes = True

class ShopkeeperProfileResponse(BaseModel):
    id: int
    business_license_number: Optional[str]
    gstin: Optional[str]

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    phone_number: Optional[str]
    role: UserRole
    preferred_language: str = "en"
    status: UserAccountStatus = UserAccountStatus.ACTIVE
    warning_count: int = 0
    suspension_until: Optional[datetime] = None
    blocked_at: Optional[datetime] = None
    blocked_reason: Optional[str] = None
    is_active: bool
    avatar_url: Optional[str]
    address: Optional[str]
    state: Optional[str]
    district: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    created_at: datetime
    farmer_profile: Optional[FarmerProfileResponse] = None
    customer_profile: Optional[CustomerProfileResponse] = None
    shopkeeper_profile: Optional[ShopkeeperProfileResponse] = None
    total_farm_land: Optional[float] = None
    irrigation_source: Optional[str] = None

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    preferred_language: Optional[str] = None # en, hi, mr
    address: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    avatar_url: Optional[str] = None

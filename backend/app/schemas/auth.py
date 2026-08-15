from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import UserRole

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone_number: Optional[str] = None
    role: UserRole = UserRole.FARMER
    state: Optional[str] = "Punjab"
    district: Optional[str] = "Ludhiana"
    address: Optional[str] = None
    latitude: Optional[float] = 30.9010
    longitude: Optional[float] = 75.8573
    
    # Extra role-specific initial fields
    total_land_area: Optional[float] = 2.5
    irrigation_source: Optional[str] = "Borewell & Canal"
    primary_crops: Optional[str] = "Wheat, Rice, Tomato"

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

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    avatar_url: Optional[str] = None

from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Optional, Union
from datetime import datetime
import re
import math
from app.models.user import UserRole, UserAccountStatus

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    confirm_password: Optional[str] = None
    full_name: str
    phone_number: Optional[str] = None
    phone_verification_token: Optional[str] = None
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

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        if v is None:
            raise ValueError("Full name is required")
        v = v.strip()
        if not v:
            raise ValueError("Full name cannot be empty or whitespace only")
        if len(v) < 2 or len(v) > 100:
            raise ValueError("Full name must be between 2 and 100 characters")
        if any(char.isdigit() for char in v):
            raise ValueError("Full name cannot contain numbers")
        if not all(char.isalpha() or char in " '-." for char in v):
            raise ValueError("Full name contains invalid characters. Only letters, spaces, hyphens, and apostrophes are allowed")
        if sum(1 for char in v if char.isalpha()) < 2:
            raise ValueError("Full name must contain at least 2 alphabetic characters")
        return v

    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        if not v:
            raise ValueError("Phone number cannot be empty or whitespace only")
        if not re.match(r"^[6-9]\d{9}$", v):
            raise ValueError("Phone number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 without spaces or special characters")
        return v

    @field_validator("state")
    @classmethod
    def validate_state(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        if not v:
            raise ValueError("State cannot be empty or whitespace only")
        if len(v) < 2 or len(v) > 100:
            raise ValueError("State must be between 2 and 100 characters")
        if any(char.isdigit() for char in v):
            raise ValueError("State cannot contain numbers")
        if not all(char.isalpha() or char in " '-." for char in v):
            raise ValueError("State contains invalid characters. Only letters, spaces, and hyphens are allowed")
        if sum(1 for char in v if char.isalpha()) < 2:
            raise ValueError("State must contain at least 2 letters")
        return v

    @field_validator("district")
    @classmethod
    def validate_district(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        if not v:
            raise ValueError("District cannot be empty or whitespace only")
        if len(v) < 2 or len(v) > 100:
            raise ValueError("District must be between 2 and 100 characters")
        if any(char.isdigit() for char in v):
            raise ValueError("District cannot contain numbers")
        if not all(char.isalpha() or char in " '-." for char in v):
            raise ValueError("District contains invalid characters. Only letters, spaces, and hyphens are allowed")
        if sum(1 for char in v if char.isalpha()) < 2:
            raise ValueError("District must contain at least 2 letters")
        return v

    @field_validator("total_land_area")
    @classmethod
    def validate_total_land_area(cls, v: Optional[float]) -> Optional[float]:
        if v is None:
            return None
        if math.isnan(v) or math.isinf(v):
            raise ValueError("Total farm land area must be a valid finite number")
        if v <= 0:
            raise ValueError("Total farm land area must be a positive number greater than 0 acres")
        if v > 10000:
            raise ValueError("Total farm land area cannot exceed 10,000 acres")
        return v

    @field_validator("irrigation_source")
    @classmethod
    def validate_irrigation_source(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        if not v:
            return None
        if len(v) < 2 or len(v) > 100:
            raise ValueError("Primary irrigation source must be between 2 and 100 characters")
        if not any(char.isalpha() for char in v):
            raise ValueError("Primary irrigation source must contain valid alphabetic text")
        if any(char in "<>{};$" for char in v):
            raise ValueError("Primary irrigation source contains invalid characters")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if v is None or not v:
            raise ValueError("Password is required")
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long")
        if len(v) > 128:
            raise ValueError("Password cannot exceed 128 characters")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if v is None or not str(v).strip():
            raise ValueError("Email is required")
        return str(v).strip().lower()

    @model_validator(mode="after")
    def validate_model(self):
        if self.confirm_password is not None and self.confirm_password != self.password:
            raise ValueError("Passwords do not match")
        return self

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

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        if not v:
            raise ValueError("Full name cannot be empty or whitespace only")
        if len(v) < 2 or len(v) > 100:
            raise ValueError("Full name must be between 2 and 100 characters")
        if any(char.isdigit() for char in v):
            raise ValueError("Full name cannot contain numbers")
        if not all(char.isalpha() or char in " '-." for char in v):
            raise ValueError("Full name contains invalid characters. Only letters, spaces, hyphens, and apostrophes are allowed")
        if sum(1 for char in v if char.isalpha()) < 2:
            raise ValueError("Full name must contain at least 2 alphabetic characters")
        return v

    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        if not v:
            return None
        if not re.match(r"^[6-9]\d{9}$", v):
            raise ValueError("Phone number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 without spaces or special characters")
        return v

    @field_validator("state")
    @classmethod
    def validate_state(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        if not v:
            return None
        if len(v) < 2 or len(v) > 100:
            raise ValueError("State must be between 2 and 100 characters")
        if any(char.isdigit() for char in v):
            raise ValueError("State cannot contain numbers")
        if not all(char.isalpha() or char in " '-." for char in v):
            raise ValueError("State contains invalid characters. Only letters, spaces, and hyphens are allowed")
        if sum(1 for char in v if char.isalpha()) < 2:
            raise ValueError("State must contain at least 2 letters")
        return v

    @field_validator("district")
    @classmethod
    def validate_district(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        if not v:
            return None
        if len(v) < 2 or len(v) > 100:
            raise ValueError("District must be between 2 and 100 characters")
        if any(char.isdigit() for char in v):
            raise ValueError("District cannot contain numbers")
        if not all(char.isalpha() or char in " '-." for char in v):
            raise ValueError("District contains invalid characters. Only letters, spaces, and hyphens are allowed")
        if sum(1 for char in v if char.isalpha()) < 2:
            raise ValueError("District must contain at least 2 letters")
        return v

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if v is None or not str(v).strip():
            raise ValueError("Email address is required")
        return str(v).strip().lower()

class ForgotPasswordResponse(BaseModel):
    message: str
    success: bool = True

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: Optional[str] = None

    @field_validator("token")
    @classmethod
    def validate_token(cls, v: str) -> str:
        if v is None or not str(v).strip():
            raise ValueError("Reset token is required")
        return str(v).strip()

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if v is None or not v:
            raise ValueError("New password is required")
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long")
        if len(v) > 128:
            raise ValueError("Password cannot exceed 128 characters")
        return v

    @model_validator(mode="after")
    def validate_model(self):
        if self.confirm_password is not None and self.confirm_password != self.new_password:
            raise ValueError("Passwords do not match")
        return self

class ResetPasswordResponse(BaseModel):
    message: str
    success: bool = True

class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    id_token: Optional[str] = None

class SendOTPRequest(BaseModel):
    phone_number: str

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if v is None:
            raise ValueError("Phone number is required")
        v = v.strip()
        if not v:
            raise ValueError("Phone number cannot be empty or whitespace only")
        if not re.match(r"^[6-9]\d{9}$", v):
            raise ValueError("Phone number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 without spaces or special characters")
        return v

class SendOTPResponse(BaseModel):
    request_id: str
    message: str
    cooldown_seconds: int = 60
    expires_in_seconds: int = 300
    success: bool = True

class VerifyOTPRequest(BaseModel):
    phone_number: str
    request_id: str
    otp: str

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if v is None:
            raise ValueError("Phone number is required")
        v = v.strip()
        if not v:
            raise ValueError("Phone number cannot be empty or whitespace only")
        if not re.match(r"^[6-9]\d{9}$", v):
            raise ValueError("Phone number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9")
        return v

    @field_validator("request_id")
    @classmethod
    def validate_request_id(cls, v: str) -> str:
        if v is None or not str(v).strip():
            raise ValueError("Request ID is required")
        return str(v).strip()

    @field_validator("otp")
    @classmethod
    def validate_otp(cls, v: str) -> str:
        if v is None:
            raise ValueError("OTP is required")
        v = v.strip()
        if not re.match(r"^\d{6}$", v):
            raise ValueError("OTP must be exactly 6 digits")
        return v

class VerifyOTPResponse(BaseModel):
    message: str
    verification_token: str
    success: bool = True




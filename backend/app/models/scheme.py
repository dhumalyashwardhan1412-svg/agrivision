from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database.database import Base

class GovernmentType(str, enum.Enum):
    CENTRAL = "CENTRAL"
    STATE = "STATE"

class SchemeCategory(str, enum.Enum):
    SUBSIDY = "SUBSIDY"
    INSURANCE = "INSURANCE"
    LOAN_CREDIT = "LOAN_CREDIT"
    EQUIPMENT = "EQUIPMENT"
    IRRIGATION = "IRRIGATION"
    CROP_SUPPORT = "CROP_SUPPORT"
    OTHER = "OTHER"

class GovernmentScheme(Base):
    __tablename__ = "government_schemes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False) # e.g. "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)"
    scheme_code = Column(String(100), unique=True, index=True, nullable=False) # e.g. "PM-KISAN-2026"
    government_type = Column(Enum(GovernmentType), default=GovernmentType.CENTRAL, nullable=False)
    state = Column(String(100), default="All India", nullable=False)
    category = Column(Enum(SchemeCategory), default=SchemeCategory.SUBSIDY, nullable=False)
    short_description = Column(String(500), nullable=False)
    full_description = Column(Text, nullable=True)
    benefits = Column(Text, nullable=False)
    eligibility_criteria_text = Column(Text, nullable=False)
    
    # Structured matching attributes
    eligible_farmer_categories = Column(String(255), default="Small, Marginal, Large")
    eligible_crops = Column(String(500), default="All Crops") # comma-separated or "All Crops"
    min_land_acres = Column(Float, default=0.0)
    max_land_acres = Column(Float, nullable=True) # None = unlimited
    required_documents = Column(Text, nullable=False) # Aadhaar, Land records (7/12), Bank passbook
    
    # Verification & Official URLs
    official_website_url = Column(String(500), nullable=True)
    application_url = Column(String(500), nullable=True)
    start_date = Column(DateTime, nullable=True)
    deadline_date = Column(DateTime, nullable=True) # None = ongoing
    last_verified_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_verified = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    saved_by_farmers = relationship("SavedScheme", back_populates="scheme", cascade="all, delete-orphan")

class SavedScheme(Base):
    __tablename__ = "saved_schemes"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmer_profiles.id"), nullable=False)
    scheme_id = Column(Integer, ForeignKey("government_schemes.id"), nullable=False)
    notes = Column(Text, nullable=True)
    saved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    farmer = relationship("FarmerProfile")
    scheme = relationship("GovernmentScheme", back_populates="saved_by_farmers")

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database.database import Base

class UserRole(str, enum.Enum):
    FARMER = "FARMER"
    CUSTOMER = "CUSTOMER"
    SHOPKEEPER = "SHOPKEEPER"
    ADMIN = "ADMIN"

class UserAccountStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    WARNED = "WARNED"
    SUSPENDED = "SUSPENDED"
    BLOCKED = "BLOCKED"

class UserVerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"

class ModerationActionType(str, enum.Enum):
    WARNING = "WARNING"
    SUSPENSION = "SUSPENSION"
    BLOCK = "BLOCK"
    UNBLOCK = "UNBLOCK"

class ReportStatus(str, enum.Enum):
    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone_number = Column(String(50), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.FARMER, nullable=False)
    is_active = Column(Boolean, default=True)
    avatar_url = Column(String(500), nullable=True)
    address = Column(String(500), nullable=True)
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Moderation & Account Status Fields
    status = Column(Enum(UserAccountStatus), default=UserAccountStatus.ACTIVE, nullable=False)
    warning_count = Column(Integer, default=0, nullable=False)
    suspension_until = Column(DateTime, nullable=True)
    blocked_at = Column(DateTime, nullable=True)
    blocked_reason = Column(Text, nullable=True)

    # Verification workflow fields
    verification_status = Column(Enum(UserVerificationStatus), default=UserVerificationStatus.VERIFIED, nullable=False)
    verified_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    verification_notes = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)

    # Multilingual preference
    preferred_language = Column(String(10), default="en", nullable=False)

    # Profile relationships
    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    customer_profile = relationship("CustomerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    shopkeeper_profile = relationship("ShopkeeperProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

    @property
    def total_farm_land(self) -> float | None:
        return self.farmer_profile.total_land_area if self.farmer_profile else None

    @property
    def irrigation_source(self) -> str | None:
        return self.farmer_profile.irrigation_source if self.farmer_profile else None
    
    # Generic user entities
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    reviews_written = relationship("Review", back_populates="reviewer", cascade="all, delete-orphan")

    # Moderation relationships
    moderation_actions_received = relationship("ModerationAction", foreign_keys="ModerationAction.user_id", back_populates="user", cascade="all, delete-orphan")
    moderation_actions_performed = relationship("ModerationAction", foreign_keys="ModerationAction.admin_id", back_populates="admin")
    reports_filed = relationship("UserReport", foreign_keys="UserReport.reporter_id", back_populates="reporter")
    reports_received = relationship("UserReport", foreign_keys="UserReport.reported_user_id", back_populates="reported_user")

class ModerationAction(Base):
    __tablename__ = "moderation_actions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(Enum(ModerationActionType), nullable=False)
    reason = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=True)

    user = relationship("User", foreign_keys=[user_id], back_populates="moderation_actions_received")
    admin = relationship("User", foreign_keys=[admin_id], back_populates="moderation_actions_performed")

class UserReport(Base):
    __tablename__ = "user_reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reported_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(String(100), nullable=False) # Spam, Fraud/Scam, Fake Product, Misleading Information, Harassment, Suspicious Activity, Duplicate Account, Other
    description = Column(Text, nullable=True)
    status = Column(Enum(ReportStatus), default=ReportStatus.PENDING, nullable=False)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime, nullable=True)

    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="reports_filed")
    reported_user = relationship("User", foreign_keys=[reported_user_id], back_populates="reports_received")
    admin = relationship("User", foreign_keys=[admin_id])

class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    total_land_area = Column(Float, default=0.0) # in acres
    farming_experience_years = Column(Integer, default=0)
    primary_crops = Column(String(500), nullable=True)
    irrigation_source = Column(String(200), nullable=True) # Canal, Tubewell, Rainfed, Drip
    organic_certified = Column(Boolean, default=False)
    kisan_credit_card = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="farmer_profile")
    farms = relationship("Farm", back_populates="farmer", cascade="all, delete-orphan")
    crop_listings = relationship("CropListing", back_populates="farmer", cascade="all, delete-orphan")
    orders_received = relationship("Order", back_populates="farmer", cascade="all, delete-orphan")

class CustomerProfile(Base):
    __tablename__ = "customer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    preferred_payment_method = Column(String(100), default="Cash on Delivery")
    delivery_address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="customer_profile")
    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")

class ShopkeeperProfile(Base):
    __tablename__ = "shopkeeper_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    business_license_number = Column(String(100), nullable=True)
    gstin = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="shopkeeper_profile")
    shops = relationship("Shop", back_populates="owner", cascade="all, delete-orphan")

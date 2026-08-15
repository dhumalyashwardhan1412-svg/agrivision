from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole, FarmerProfile, CustomerProfile, ShopkeeperProfile
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse, UserProfileUpdate

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    hashed_pw = hash_password(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_pw,
        full_name=user_in.full_name,
        phone_number=user_in.phone_number,
        role=user_in.role,
        state=user_in.state,
        district=user_in.district,
        address=user_in.address,
        latitude=user_in.latitude,
        longitude=user_in.longitude
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create role-specific profile
    if new_user.role == UserRole.FARMER:
        farmer_prof = FarmerProfile(
            user_id=new_user.id,
            total_land_area=user_in.total_land_area or 2.5,
            irrigation_source=user_in.irrigation_source or "Borewell & Canal",
            primary_crops=user_in.primary_crops or "Wheat, Rice, Tomato"
        )
        db.add(farmer_prof)
    elif new_user.role == UserRole.CUSTOMER:
        cust_prof = CustomerProfile(user_id=new_user.id, delivery_address=user_in.address)
        db.add(cust_prof)
    elif new_user.role == UserRole.SHOPKEEPER:
        shop_prof = ShopkeeperProfile(user_id=new_user.id)
        db.add(shop_prof)

    db.commit()

    token = create_access_token(subject=new_user.id, role=new_user.role.value)
    return Token(
        access_token=token,
        role=new_user.role,
        user_id=new_user.id,
        full_name=new_user.full_name,
        email=new_user.email
    )

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is deactivated")

    token = create_access_token(subject=user.id, role=user.role.value)
    return Token(
        access_token=token,
        role=user.role,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_in: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name
    if profile_in.phone_number is not None:
        current_user.phone_number = profile_in.phone_number
    if profile_in.address is not None:
        current_user.address = profile_in.address
    if profile_in.state is not None:
        current_user.state = profile_in.state
    if profile_in.district is not None:
        current_user.district = profile_in.district
    if profile_in.latitude is not None:
        current_user.latitude = profile_in.latitude
    if profile_in.longitude is not None:
        current_user.longitude = profile_in.longitude
    if profile_in.avatar_url is not None:
        current_user.avatar_url = profile_in.avatar_url

    db.commit()
    db.refresh(current_user)
    return current_user

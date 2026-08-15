from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.core.dependencies import get_current_user, require_role, get_optional_user
from app.models.user import User, UserRole
from app.models.listing import CropListing, Review, ListingStatus
from app.schemas.marketplace import (
    CropListingCreate, CropListingUpdate, CropListingResponse, ReviewCreate, ReviewResponse
)

router = APIRouter(prefix="/marketplace", tags=["Agricultural Marketplace"])

@router.get("/listings", response_model=List[CropListingResponse])
def get_marketplace_listings(
    category: Optional[str] = None,
    is_organic: Optional[bool] = None,
    search: Optional[str] = None,
    state: Optional[str] = None,
    status: Optional[ListingStatus] = ListingStatus.ACTIVE,
    db: Session = Depends(get_db)
):
    query = db.query(CropListing)
    if status:
        query = query.filter(CropListing.status == status)
    if category and category != "All":
        query = query.filter(CropListing.category.ilike(f"%{category}%"))
    if is_organic is not None:
        query = query.filter(CropListing.is_organic == is_organic)
    if state:
        query = query.filter(CropListing.state.ilike(f"%{state}%"))
    if search:
        query = query.filter(
            (CropListing.title.ilike(f"%{search}%")) |
            (CropListing.crop_name.ilike(f"%{search}%")) |
            (CropListing.location_city.ilike(f"%{search}%"))
        )

    listings = query.order_by(CropListing.created_at.desc()).all()
    results = []
    for l in listings:
        resp = CropListingResponse.model_validate(l)
        if l.farmer and l.farmer.user:
            resp.farmer_name = l.farmer.user.full_name
            resp.farmer_phone = l.farmer.user.phone_number
        if l.reviews:
            resp.average_rating = sum(r.rating for r in l.reviews) / len(l.reviews)
        results.append(resp)
    return results

@router.post("/listings", response_model=CropListingResponse)
def create_crop_listing(
    listing_in: CropListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.FARMER, UserRole.ADMIN]))
):
    if not current_user.farmer_profile and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Only verified farmers can list harvest produce")

    farmer_id = current_user.farmer_profile.id if current_user.farmer_profile else 1

    listing = CropListing(
        farmer_id=farmer_id,
        crop_id=listing_in.crop_id,
        title=listing_in.title,
        crop_name=listing_in.crop_name,
        category=listing_in.category,
        variety=listing_in.variety,
        quantity_available=listing_in.quantity_available,
        unit=listing_in.unit,
        price_per_unit=listing_in.price_per_unit,
        min_order_quantity=listing_in.min_order_quantity,
        harvest_date=listing_in.harvest_date,
        is_organic=listing_in.is_organic,
        quality_grade=listing_in.quality_grade,
        location_city=listing_in.location_city,
        state=listing_in.state,
        image_url=listing_in.image_url or "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
        description=listing_in.description,
        status=ListingStatus.ACTIVE
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)

    resp = CropListingResponse.model_validate(listing)
    resp.farmer_name = current_user.full_name
    resp.farmer_phone = current_user.phone_number
    return resp

@router.get("/listings/{listing_id}", response_model=CropListingResponse)
def get_listing_details(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(CropListing).filter(CropListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    resp = CropListingResponse.model_validate(listing)
    if listing.farmer and listing.farmer.user:
        resp.farmer_name = listing.farmer.user.full_name
        resp.farmer_phone = listing.farmer.user.phone_number
    return resp

@router.put("/listings/{listing_id}", response_model=CropListingResponse)
def update_crop_listing(
    listing_id: int,
    update_in: CropListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.FARMER, UserRole.ADMIN]))
):
    listing = db.query(CropListing).filter(CropListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if current_user.role != UserRole.ADMIN and listing.farmer_id != current_user.farmer_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this listing")

    for field, value in update_in.model_dump(exclude_unset=True).items():
        setattr(listing, field, value)

    db.commit()
    db.refresh(listing)
    return listing

@router.delete("/listings/{listing_id}")
def delete_crop_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.FARMER, UserRole.ADMIN]))
):
    listing = db.query(CropListing).filter(CropListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if current_user.role != UserRole.ADMIN and listing.farmer_id != current_user.farmer_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")

    db.delete(listing)
    db.commit()
    return {"message": "Listing deleted successfully"}

@router.post("/listings/{listing_id}/reviews", response_model=ReviewResponse)
def add_listing_review(
    listing_id: int,
    rev_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    listing = db.query(CropListing).filter(CropListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    review = Review(
        listing_id=listing.id,
        reviewer_id=current_user.id,
        rating=rev_in.rating,
        comment=rev_in.comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    resp = ReviewResponse.model_validate(review)
    resp.reviewer_name = current_user.full_name
    return resp

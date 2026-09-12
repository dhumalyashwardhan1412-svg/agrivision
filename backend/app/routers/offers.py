import uuid
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User, UserRole, FarmerProfile, CustomerProfile
from app.models.offer import Offer, OfferStatus, OfferNegotiation, NegotiationActionType
from app.models.listing import CropListing, ListingStatus
from app.models.requirement import BuyerRequirement, RequirementStatus
from app.models.review import TransactionReview, ReviewType
from app.schemas.offer import (
    OfferCreate,
    OfferCounterRequest,
    OfferResponse,
    OfferNegotiationResponse
)
from app.services.audit_service import log_audit_event
from app.services.notification_service import (
    notify_offer_created,
    notify_offer_countered,
    notify_offer_accepted,
    notify_offer_rejected,
    notify_transaction_completed
)

router = APIRouter(prefix="/offers", tags=["Offers & Negotiations"])

def _build_offer_response(offer: Offer, db: Optional[Session] = None) -> OfferResponse:
    negotiations_resp = []
    for neg in offer.negotiations:
        sender_name = neg.sender.full_name if neg.sender else "User"
        negotiations_resp.append(OfferNegotiationResponse(
            id=neg.id,
            sender_user_id=neg.sender_user_id,
            sender_name=sender_name,
            sender_role=neg.sender_role,
            action_type=neg.action_type,
            offered_price=neg.offered_price,
            quantity=neg.quantity,
            message=neg.message,
            created_at=neg.created_at
        ))

    buyer_name = offer.buyer.user.full_name if (offer.buyer and offer.buyer.user) else "Buyer"
    buyer_phone = offer.buyer.user.phone_number if (offer.buyer and offer.buyer.user) else None
    buyer_user_id = offer.buyer.user_id if offer.buyer else None

    farmer_name = offer.farmer.user.full_name if (offer.farmer and offer.farmer.user) else "Farmer"
    farmer_phone = offer.farmer.user.phone_number if (offer.farmer and offer.farmer.user) else None
    farmer_user_id = offer.farmer.user_id if offer.farmer else None

    farmer_reviewed = False
    farmer_rating_given = None
    buyer_reviewed = False
    buyer_rating_given = None

    if db and offer.id:
        reviews = db.query(TransactionReview).filter(TransactionReview.offer_id == offer.id).all()
        for r in reviews:
            if r.review_type == ReviewType.FARMER_TO_BUYER:
                farmer_reviewed = True
                farmer_rating_given = r.rating
            elif r.review_type == ReviewType.BUYER_TO_FARMER:
                buyer_reviewed = True
                buyer_rating_given = r.rating

    return OfferResponse(
        id=offer.id,
        offer_code=offer.offer_code,
        requirement_id=offer.requirement_id,
        listing_id=offer.listing_id,
        buyer_id=offer.buyer_id,
        farmer_id=offer.farmer_id,
        buyer_user_id=buyer_user_id,
        farmer_user_id=farmer_user_id,
        buyer_name=buyer_name,
        buyer_phone=buyer_phone,
        buyer_rating=4.9,
        farmer_name=farmer_name,
        farmer_phone=farmer_phone,
        farmer_rating=4.9,
        produce_name=offer.produce_name,
        quantity=offer.quantity,
        unit=offer.unit,
        offered_price=offer.offered_price,
        price_unit=offer.price_unit,
        delivery_preference=offer.delivery_preference,
        location=offer.location,
        message=offer.message,
        status=offer.status,
        expires_at=offer.expires_at,
        accepted_at=offer.accepted_at,
        completed_at=offer.completed_at,
        farmer_reviewed=farmer_reviewed,
        farmer_rating_given=farmer_rating_given,
        buyer_reviewed=buyer_reviewed,
        buyer_rating_given=buyer_rating_given,
        created_at=offer.created_at,
        negotiations=negotiations_resp
    )

@router.post("", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
def create_offer(
    offer_in: OfferCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    buyer_profile = db.query(CustomerProfile).filter(CustomerProfile.user_id == current_user.id).first()
    farmer_profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()

    buyer_id = None
    farmer_id = offer_in.farmer_id

    # If the current user is a buyer
    if buyer_profile:
        buyer_id = buyer_profile.id
    elif farmer_profile:
        # If a farmer is sending an offer on a requirement, get buyer from requirement
        if not offer_in.requirement_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Requirement ID required when farmer initiates offer")
        req = db.query(BuyerRequirement).filter(BuyerRequirement.id == offer_in.requirement_id).first()
        if not req:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target requirement not found")
        buyer_id = req.buyer_id
        farmer_id = farmer_profile.id
    elif current_user.role == UserRole.ADMIN:
        # Fallback for admin testing
        c = db.query(CustomerProfile).first()
        buyer_id = c.id if c else 1
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Must be a registered Buyer or Farmer to make an offer")

    # If listing is specified, check availability
    if offer_in.listing_id:
        listing = db.query(CropListing).filter(CropListing.id == offer_in.listing_id).first()
        if not listing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop listing not found")
        if listing.quantity_available < offer_in.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Requested quantity ({offer_in.quantity}) exceeds available stock ({listing.quantity_available})"
            )

    offer_code = f"OFF-{uuid.uuid4().hex[:8].upper()}"
    expiry = offer_in.expires_at or (datetime.now(timezone.utc) + timedelta(days=7))

    new_offer = Offer(
        offer_code=offer_code,
        requirement_id=offer_in.requirement_id,
        listing_id=offer_in.listing_id,
        buyer_id=buyer_id,
        farmer_id=farmer_id,
        produce_name=offer_in.produce_name,
        quantity=offer_in.quantity,
        unit=offer_in.unit,
        offered_price=offer_in.offered_price,
        price_unit=offer_in.price_unit,
        delivery_preference=offer_in.delivery_preference,
        location=offer_in.location,
        message=offer_in.message,
        status=OfferStatus.PENDING,
        expires_at=expiry
    )
    db.add(new_offer)
    db.flush()

    sender_role_str = "BUYER" if buyer_profile else ("FARMER" if farmer_profile else "ADMIN")
    initial_neg = OfferNegotiation(
        offer_id=new_offer.id,
        sender_user_id=current_user.id,
        sender_role=sender_role_str,
        action_type=NegotiationActionType.OFFER_MADE,
        offered_price=offer_in.offered_price,
        quantity=offer_in.quantity,
        message=offer_in.message or "Initial offer submitted."
    )
    db.add(initial_neg)
    db.commit()
    db.refresh(new_offer)

    log_audit_event(
        db=db,
        action="CREATE_OFFER",
        target_type="Offer",
        user_id=current_user.id,
        target_id=new_offer.id,
        details={"offer_code": offer_code, "produce": offer_in.produce_name, "price": offer_in.offered_price}
    )

    try:
        notify_offer_created(db, new_offer, current_user)
    except Exception as e:
        print(f"Failed to trigger offer notification: {e}")

    return _build_offer_response(new_offer, db)

@router.get("", response_model=List[OfferResponse])
def get_offers(
    status_filter: Optional[OfferStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Offer)

    if current_user.role == UserRole.FARMER:
        farmer = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()
        if not farmer:
            return []
        query = query.filter(Offer.farmer_id == farmer.id)
    elif current_user.role == UserRole.CUSTOMER:
        buyer = db.query(CustomerProfile).filter(CustomerProfile.user_id == current_user.id).first()
        if not buyer:
            return []
        query = query.filter(Offer.buyer_id == buyer.id)
    elif current_user.role != UserRole.ADMIN:
        return []

    if status_filter:
        query = query.filter(Offer.status == status_filter)

    offers = query.order_by(Offer.created_at.desc()).all()

    # For buyers, do not show orphan/placeholder offers created for requirements without farmer response
    if current_user.role == UserRole.CUSTOMER:
        filtered_offers = []
        for o in offers:
            if o.requirement_id:
                has_farmer_activity = (
                    o.status in [OfferStatus.COUNTERED, OfferStatus.ACCEPTED, OfferStatus.COMPLETED, OfferStatus.REJECTED] or
                    any(neg.sender_role == "FARMER" for neg in o.negotiations)
                )
                if has_farmer_activity:
                    filtered_offers.append(o)
            else:
                filtered_offers.append(o)
        offers = filtered_offers

    return [_build_offer_response(o, db) for o in offers]

@router.get("/{offer_id}", response_model=OfferResponse)
def get_offer_by_id(
    offer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")

    # Authorization check
    farmer = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()
    buyer = db.query(CustomerProfile).filter(CustomerProfile.user_id == current_user.id).first()

    if (
        (farmer and offer.farmer_id == farmer.id) or
        (buyer and offer.buyer_id == buyer.id) or
        (current_user.role == UserRole.ADMIN)
    ):
        return _build_offer_response(offer, db)
    
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this offer")

@router.post("/{offer_id}/counter", response_model=OfferResponse)
def counter_offer(
    offer_id: int,
    counter_in: OfferCounterRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")

    if offer.status in [OfferStatus.ACCEPTED, OfferStatus.COMPLETED, OfferStatus.CANCELLED]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot counter an offer with status {offer.status}")

    offer.offered_price = counter_in.counter_price
    if counter_in.quantity:
        offer.quantity = counter_in.quantity
    offer.status = OfferStatus.COUNTERED

    sender_role_str = current_user.role.value
    neg = OfferNegotiation(
        offer_id=offer.id,
        sender_user_id=current_user.id,
        sender_role=sender_role_str,
        action_type=NegotiationActionType.COUNTERED,
        offered_price=counter_in.counter_price,
        quantity=offer.quantity,
        message=counter_in.message or "Counter-offer proposed."
    )
    db.add(neg)
    if offer.requirement_id and offer.requirement and offer.requirement.status == RequirementStatus.OPEN:
        offer.requirement.status = RequirementStatus.NEGOTIATING
    db.commit()
    db.refresh(offer)

    try:
        notify_offer_countered(db, offer, neg, current_user)
    except Exception as e:
        print(f"Failed to trigger counter notification: {e}")

    return _build_offer_response(offer, db)

@router.post("/{offer_id}/accept", response_model=OfferResponse)
def accept_offer(
    offer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Lock for update
    offer = db.query(Offer).filter(Offer.id == offer_id).with_for_update().first()
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")

    if offer.status in [OfferStatus.ACCEPTED, OfferStatus.COMPLETED]:
        return _build_offer_response(offer, db)

    # Check listing stock if applicable
    if offer.listing_id:
        listing = db.query(CropListing).filter(CropListing.id == offer.listing_id).with_for_update().first()
        if listing and listing.quantity_available < offer.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot accept offer: Available stock ({listing.quantity_available}) is less than offer quantity ({offer.quantity})"
            )

    offer.status = OfferStatus.ACCEPTED
    offer.accepted_at = datetime.now(timezone.utc)

    neg = OfferNegotiation(
        offer_id=offer.id,
        sender_user_id=current_user.id,
        sender_role=current_user.role.value,
        action_type=NegotiationActionType.ACCEPTED,
        offered_price=offer.offered_price,
        quantity=offer.quantity,
        message="Offer officially accepted!"
    )
    db.add(neg)
    if offer.requirement_id and offer.requirement:
        offer.requirement.status = RequirementStatus.FULFILLED
    db.commit()
    db.refresh(offer)

    log_audit_event(
        db=db,
        action="ACCEPT_OFFER",
        target_type="Offer",
        user_id=current_user.id,
        target_id=offer.id,
        details={"offer_code": offer.offer_code, "final_price": offer.offered_price}
    )

    try:
        notify_offer_accepted(db, offer, current_user)
    except Exception as e:
        print(f"Failed to trigger accepted notification: {e}")

    return _build_offer_response(offer, db)

@router.post("/{offer_id}/reject", response_model=OfferResponse)
def reject_offer(
    offer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")

    offer.status = OfferStatus.REJECTED
    neg = OfferNegotiation(
        offer_id=offer.id,
        sender_user_id=current_user.id,
        sender_role=current_user.role.value,
        action_type=NegotiationActionType.REJECTED,
        offered_price=offer.offered_price,
        quantity=offer.quantity,
        message="Offer declined."
    )
    db.add(neg)
    db.commit()
    db.refresh(offer)

    try:
        notify_offer_rejected(db, offer, current_user)
    except Exception as e:
        print(f"Failed to trigger rejected notification: {e}")

    return _build_offer_response(offer, db)

@router.post("/{offer_id}/complete", response_model=OfferResponse)
def complete_offer(
    offer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    offer = db.query(Offer).filter(Offer.id == offer_id).with_for_update().first()
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")

    if offer.status != OfferStatus.ACCEPTED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only accepted offers can be marked as completed")

    # Atomic stock reduction
    if offer.listing_id:
        listing = db.query(CropListing).filter(CropListing.id == offer.listing_id).with_for_update().first()
        if listing:
            new_qty = max(0.0, listing.quantity_available - offer.quantity)
            listing.quantity_available = new_qty
            if new_qty == 0.0:
                listing.status = ListingStatus.SOLD_OUT

    offer.status = OfferStatus.COMPLETED
    offer.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(offer)

    log_audit_event(
        db=db,
        action="COMPLETE_OFFER",
        target_type="Offer",
        user_id=current_user.id,
        target_id=offer.id,
        details={"offer_code": offer.offer_code}
    )

    try:
        notify_transaction_completed(db, offer)
    except Exception as e:
        print(f"Failed to trigger completion notification: {e}")

    return _build_offer_response(offer, db)

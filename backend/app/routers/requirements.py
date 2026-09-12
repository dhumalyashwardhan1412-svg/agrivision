import uuid
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User, UserRole, CustomerProfile, FarmerProfile
from app.models.requirement import BuyerRequirement, RequirementStatus
from app.models.offer import Offer, OfferStatus, OfferNegotiation, NegotiationActionType
from app.schemas.requirement import (
    BuyerRequirementCreate,
    BuyerRequirementUpdate,
    BuyerRequirementResponse,
    FarmerBuyerRequirementResponse,
    FarmerCounterRequirementInput,
    MatchedFarmerItem
)
from app.schemas.offer import OfferResponse
from app.routers.offers import _build_offer_response
from app.services.farmer_matching_service import find_matching_farmers_for_requirement
from app.services.audit_service import log_audit_event
from app.services.notification_service import (
    notify_buyer_requirement_posted,
    notify_farmer_accepted_requirement,
    notify_farmer_countered_requirement
)

router = APIRouter(prefix="/buyer/requirements", tags=["Buyer Requirements"])
farmer_router = APIRouter(prefix="/farmer/buyer-requirements", tags=["Farmer Sourcing Requirements"])


def _build_requirement_response(req: BuyerRequirement) -> BuyerRequirementResponse:
    b_name = "Verified Buyer"
    b_comp = None
    if req.buyer and req.buyer.user:
        b_name = req.buyer.user.full_name
    
    offers_cnt = len(req.offers) if hasattr(req, "offers") and req.offers else 0

    return BuyerRequirementResponse(
        id=req.id,
        buyer_id=req.buyer_id,
        buyer_name=b_name,
        buyer_company=b_comp,
        title=req.title,
        crop_name=req.crop_name,
        variety=req.variety,
        quantity=req.quantity,
        unit=req.unit,
        min_quality_grade=req.min_quality_grade,
        target_price=req.target_price,
        price_unit=req.price_unit,
        required_date=req.required_date,
        delivery_preference=req.delivery_preference,
        location_city=req.location_city,
        state=req.state,
        description=req.description,
        status=req.status,
        expires_at=req.expires_at,
        created_at=req.created_at,
        updated_at=req.updated_at,
        total_offers_count=offers_cnt
    )

@router.post("", response_model=BuyerRequirementResponse, status_code=status.HTTP_201_CREATED)
def create_requirement(
    req_in: BuyerRequirementCreate,
    current_user: User = Depends(require_role([UserRole.CUSTOMER])),
    db: Session = Depends(get_db)
):
    customer = db.query(CustomerProfile).filter(CustomerProfile.user_id == current_user.id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Buyer profile not found. Please complete your buyer profile."
        )

    requirement = BuyerRequirement(
        buyer_id=customer.id,
        title=req_in.title,
        crop_name=req_in.crop_name,
        variety=req_in.variety,
        quantity=req_in.quantity,
        unit=req_in.unit,
        min_quality_grade=req_in.min_quality_grade,
        target_price=req_in.target_price,
        price_unit=req_in.price_unit,
        required_date=req_in.required_date,
        delivery_preference=req_in.delivery_preference,
        location_city=req_in.location_city,
        state=req_in.state,
        description=req_in.description,
        expires_at=req_in.expires_at,
        status=RequirementStatus.OPEN
    )
    db.add(requirement)
    db.commit()
    db.refresh(requirement)

    log_audit_event(
        db=db,
        action="CREATE_REQUIREMENT",
        target_type="BuyerRequirement",
        user_id=current_user.id,
        target_id=requirement.id,
        details={"crop_name": req_in.crop_name, "quantity": req_in.quantity, "unit": req_in.unit}
    )

    try:
        notify_buyer_requirement_posted(db=db, requirement=requirement, buyer_user=current_user)
    except Exception as e:
        print(f"Failed to trigger requirement notification: {e}")

    return _build_requirement_response(requirement)

@router.get("", response_model=List[BuyerRequirementResponse])
def list_requirements(
    status_filter: Optional[RequirementStatus] = None,
    crop_name: Optional[str] = None,
    my_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(BuyerRequirement)

    if my_only:
        customer = db.query(CustomerProfile).filter(CustomerProfile.user_id == current_user.id).first()
        if not customer:
            return []
        query = query.filter(BuyerRequirement.buyer_id == customer.id)
    
    if status_filter:
        query = query.filter(BuyerRequirement.status == status_filter)
    if crop_name:
        query = query.filter(BuyerRequirement.crop_name.ilike(f"%{crop_name}%"))

    requirements = query.order_by(BuyerRequirement.created_at.desc()).all()
    return [_build_requirement_response(r) for r in requirements]

@router.get("/{requirement_id}", response_model=BuyerRequirementResponse)
def get_requirement(
    requirement_id: int,
    db: Session = Depends(get_db)
):
    req = db.query(BuyerRequirement).filter(BuyerRequirement.id == requirement_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found")
    return _build_requirement_response(req)

@router.put("/{requirement_id}", response_model=BuyerRequirementResponse)
def update_requirement(
    requirement_id: int,
    req_update: BuyerRequirementUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(BuyerRequirement).filter(BuyerRequirement.id == requirement_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found")

    customer = db.query(CustomerProfile).filter(CustomerProfile.user_id == current_user.id).first()
    if (not customer or req.buyer_id != customer.id) and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this requirement")

    update_data = req_update.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(req, field, val)

    db.commit()
    db.refresh(req)
    return _build_requirement_response(req)

@router.post("/{requirement_id}/close", response_model=BuyerRequirementResponse)
def close_requirement(
    requirement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(BuyerRequirement).filter(BuyerRequirement.id == requirement_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found")

    customer = db.query(CustomerProfile).filter(CustomerProfile.user_id == current_user.id).first()
    if (not customer or req.buyer_id != customer.id) and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to close this requirement")

    req.status = RequirementStatus.CANCELLED
    db.commit()
    db.refresh(req)
    return _build_requirement_response(req)

@router.get("/{requirement_id}/matching-farmers", response_model=List[MatchedFarmerItem])
def get_matching_farmers(
    requirement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(BuyerRequirement).filter(BuyerRequirement.id == requirement_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found")

    matches = find_matching_farmers_for_requirement(db, req, limit=10)
    return matches


# =========================================================
# FARMER SOURCING REQUIREMENTS & RESPONSES
# =========================================================

@farmer_router.get("", response_model=List[FarmerBuyerRequirementResponse])
@router.get("/open-for-farmers", response_model=List[FarmerBuyerRequirementResponse])
def get_farmer_buyer_requirements(
    crop_name: Optional[str] = None,
    current_user: User = Depends(require_role([UserRole.FARMER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    farmer = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()
    farmer_id = farmer.id if farmer else None

    query = db.query(BuyerRequirement).filter(
        BuyerRequirement.status.in_([RequirementStatus.OPEN, RequirementStatus.NEGOTIATING])
    )
    if crop_name:
        query = query.filter(BuyerRequirement.crop_name.ilike(f"%{crop_name}%"))

    requirements = query.order_by(BuyerRequirement.created_at.desc()).all()

    results = []
    for req in requirements:
        b_name = "Verified Buyer"
        b_verified = True
        if req.buyer and req.buyer.user:
            b_name = req.buyer.user.full_name
            b_verified = (req.buyer.user.verification_status.value == "VERIFIED") if hasattr(req.buyer.user.verification_status, "value") else (str(req.buyer.user.verification_status) == "VERIFIED")

        my_offer = None
        if farmer_id:
            my_offer = db.query(Offer).filter(
                Offer.requirement_id == req.id,
                Offer.farmer_id == farmer_id
            ).order_by(Offer.created_at.desc()).first()

        has_offer = my_offer is not None
        my_offer_id = my_offer.id if my_offer else None
        my_offer_status = my_offer.status.value if (my_offer and hasattr(my_offer.status, "value")) else (str(my_offer.status) if my_offer else None)
        my_offered_price = my_offer.offered_price if my_offer else None
        my_offered_quantity = my_offer.quantity if my_offer else None

        results.append(FarmerBuyerRequirementResponse(
            id=req.id,
            buyer_id=req.buyer_id,
            buyer_name=b_name,
            buyer_company=None,
            buyer_verified=b_verified,
            buyer_rating=4.9,
            title=req.title,
            crop_name=req.crop_name,
            variety=req.variety,
            quantity=req.quantity,
            unit=req.unit,
            min_quality_grade=req.min_quality_grade,
            target_price=req.target_price,
            price_unit=req.price_unit,
            required_date=req.required_date,
            delivery_preference=req.delivery_preference,
            location_city=req.location_city,
            state=req.state,
            description=req.description,
            status=req.status,
            expires_at=req.expires_at,
            created_at=req.created_at,
            updated_at=req.updated_at,
            total_offers_count=len(req.offers) if req.offers else 0,
            has_my_offer=has_offer,
            my_offer_id=my_offer_id,
            my_offer_status=my_offer_status,
            my_offered_price=my_offered_price,
            my_offered_quantity=my_offered_quantity
        ))

    return results


@farmer_router.post("/{requirement_id}/accept", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
@router.post("/{requirement_id}/farmer-accept", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
def accept_buyer_requirement(
    requirement_id: int,
    current_user: User = Depends(require_role([UserRole.FARMER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    farmer = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()
    if not farmer and current_user.role == UserRole.FARMER:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farmer profile not found")

    farmer_id = farmer.id if farmer else 1

    req = db.query(BuyerRequirement).filter(BuyerRequirement.id == requirement_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Buyer requirement not found")

    if req.status not in [RequirementStatus.OPEN, RequirementStatus.NEGOTIATING]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot accept requirement with status {req.status}")

    # Check if this farmer already has an offer for this requirement
    existing_offer = db.query(Offer).filter(
        Offer.requirement_id == req.id,
        Offer.farmer_id == farmer_id
    ).first()
    if existing_offer:
        return _build_offer_response(existing_offer, db)

    offer_code = f"OFF-{uuid.uuid4().hex[:8].upper()}"
    expiry = req.expires_at or (datetime.now(timezone.utc) + timedelta(days=7))

    new_offer = Offer(
        offer_code=offer_code,
        requirement_id=req.id,
        listing_id=None,
        buyer_id=req.buyer_id,
        farmer_id=farmer_id,
        produce_name=req.crop_name,
        quantity=req.quantity,
        unit=req.unit,
        offered_price=req.target_price,
        price_unit=req.price_unit,
        delivery_preference=req.delivery_preference,
        location=f"{current_user.district or current_user.state or 'Farmgate'}",
        message=f"Farmer {current_user.full_name} accepted your sourcing terms at target price ₹{req.target_price:,.0f}/{req.unit}.",
        status=OfferStatus.ACCEPTED,
        accepted_at=datetime.now(timezone.utc),
        expires_at=expiry
    )
    db.add(new_offer)
    db.flush()

    neg = OfferNegotiation(
        offer_id=new_offer.id,
        sender_user_id=current_user.id,
        sender_role="FARMER",
        action_type=NegotiationActionType.ACCEPTED,
        offered_price=req.target_price,
        quantity=req.quantity,
        message="Farmer accepted buyer's target price and terms directly."
    )
    db.add(neg)

    req.status = RequirementStatus.NEGOTIATING
    db.commit()
    db.refresh(new_offer)

    log_audit_event(
        db=db,
        action="FARMER_ACCEPT_REQUIREMENT",
        target_type="Offer",
        user_id=current_user.id,
        target_id=new_offer.id,
        details={"requirement_id": req.id, "crop_name": req.crop_name, "price": req.target_price}
    )

    try:
        notify_farmer_accepted_requirement(db, new_offer, current_user)
    except Exception as e:
        print(f"Failed to notify buyer of acceptance: {e}")

    return _build_offer_response(new_offer, db)


@farmer_router.post("/{requirement_id}/counter", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
@router.post("/{requirement_id}/farmer-counter", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
def counter_buyer_requirement(
    requirement_id: int,
    counter_in: FarmerCounterRequirementInput,
    current_user: User = Depends(require_role([UserRole.FARMER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    if counter_in.counter_price <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Counter price must be greater than 0")

    farmer = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()
    if not farmer and current_user.role == UserRole.FARMER:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farmer profile not found")

    farmer_id = farmer.id if farmer else 1

    req = db.query(BuyerRequirement).filter(BuyerRequirement.id == requirement_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Buyer requirement not found")

    if req.status not in [RequirementStatus.OPEN, RequirementStatus.NEGOTIATING]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot counter requirement with status {req.status}")

    offer_qty = counter_in.quantity if counter_in.quantity and counter_in.quantity > 0 else req.quantity
    msg = counter_in.message or f"Counter-offer of ₹{counter_in.counter_price:,.0f}/{req.unit} proposed by {current_user.full_name}."

    # Check if this farmer already has an offer for this requirement
    existing_offer = db.query(Offer).filter(
        Offer.requirement_id == req.id,
        Offer.farmer_id == farmer_id
    ).first()

    if existing_offer:
        existing_offer.offered_price = counter_in.counter_price
        existing_offer.quantity = offer_qty
        existing_offer.status = OfferStatus.COUNTERED
        neg = OfferNegotiation(
            offer_id=existing_offer.id,
            sender_user_id=current_user.id,
            sender_role="FARMER",
            action_type=NegotiationActionType.COUNTERED,
            offered_price=counter_in.counter_price,
            quantity=offer_qty,
            message=msg
        )
        db.add(neg)
        req.status = RequirementStatus.NEGOTIATING
        db.commit()
        db.refresh(existing_offer)

        try:
            notify_farmer_countered_requirement(db, existing_offer, neg, current_user)
        except Exception as e:
            print(f"Failed to notify buyer of counter: {e}")

        return _build_offer_response(existing_offer, db)

    offer_code = f"OFF-{uuid.uuid4().hex[:8].upper()}"
    expiry = req.expires_at or (datetime.now(timezone.utc) + timedelta(days=7))

    new_offer = Offer(
        offer_code=offer_code,
        requirement_id=req.id,
        listing_id=None,
        buyer_id=req.buyer_id,
        farmer_id=farmer_id,
        produce_name=req.crop_name,
        quantity=offer_qty,
        unit=req.unit,
        offered_price=counter_in.counter_price,
        price_unit=req.price_unit,
        delivery_preference=req.delivery_preference,
        location=f"{current_user.district or current_user.state or 'Farmgate'}",
        message=msg,
        status=OfferStatus.COUNTERED,
        expires_at=expiry
    )
    db.add(new_offer)
    db.flush()

    neg = OfferNegotiation(
        offer_id=new_offer.id,
        sender_user_id=current_user.id,
        sender_role="FARMER",
        action_type=NegotiationActionType.COUNTERED,
        offered_price=counter_in.counter_price,
        quantity=offer_qty,
        message=msg
    )
    db.add(neg)

    req.status = RequirementStatus.NEGOTIATING
    db.commit()
    db.refresh(new_offer)

    log_audit_event(
        db=db,
        action="FARMER_COUNTER_REQUIREMENT",
        target_type="Offer",
        user_id=current_user.id,
        target_id=new_offer.id,
        details={"requirement_id": req.id, "counter_price": counter_in.counter_price, "quantity": offer_qty}
    )

    try:
        notify_farmer_countered_requirement(db, new_offer, neg, current_user)
    except Exception as e:
        print(f"Failed to notify buyer of counter: {e}")

    return _build_offer_response(new_offer, db)


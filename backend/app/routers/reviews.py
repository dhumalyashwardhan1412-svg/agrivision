from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User, UserRole, FarmerProfile, CustomerProfile
from app.models.order import Order, OrderStatus
from app.models.offer import Offer, OfferStatus
from app.models.shop import Shop
from app.models.review import TransactionReview, ReviewType
from app.schemas.review import (
    TransactionReviewCreate,
    TransactionReviewResponse,
    UserRatingSummary
)
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/reviews", tags=["Transaction Reviews & Ratings"])

def _build_review_response(rev: TransactionReview) -> TransactionReviewResponse:
    rev_name = rev.reviewer.full_name if rev.reviewer else "Verified User"
    target_name = rev.target_user.full_name if rev.target_user else "User"
    return TransactionReviewResponse(
        id=rev.id,
        review_type=rev.review_type,
        order_id=rev.order_id,
        offer_id=rev.offer_id,
        shop_id=rev.shop_id,
        reviewer_id=rev.reviewer_id,
        reviewer_name=rev_name,
        target_user_id=rev.target_user_id,
        target_user_name=target_name,
        rating=rev.rating,
        category_ratings=rev.category_ratings,
        comment=rev.comment,
        created_at=rev.created_at
    )

from app.services.notification_service import notify_review_received

@router.post("/transaction", response_model=TransactionReviewResponse, status_code=status.HTTP_201_CREATED)
def create_transaction_review(
    review_in: TransactionReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Cannot review yourself
    if review_in.target_user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot review yourself")

    resolved_target_user_id = review_in.target_user_id

    # 1. FARMER_TO_BUYER validation
    if review_in.review_type == ReviewType.FARMER_TO_BUYER:
        if current_user.role != UserRole.FARMER:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only farmers can rate buyers")

        if review_in.offer_id:
            offer = db.query(Offer).filter(Offer.id == review_in.offer_id).first()
            if not offer:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction offer not found")

            # Farmer belongs to transaction
            farmer_user_id = offer.farmer.user_id if offer.farmer else None
            if farmer_user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not a participant in this transaction")

            # Buyer belongs to transaction
            buyer_user_id = offer.buyer.user_id if offer.buyer else None
            if review_in.target_user_id != buyer_user_id and review_in.target_user_id != offer.buyer_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Buyer does not belong to this transaction")
            resolved_target_user_id = buyer_user_id

            # Transaction status is COMPLETED
            if offer.status != OfferStatus.COMPLETED:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You can rate the buyer only after the transaction is completed."
                )

            # Duplicate check
            existing = db.query(TransactionReview).filter(
                TransactionReview.offer_id == review_in.offer_id,
                TransactionReview.reviewer_id == current_user.id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="You have already reviewed this buyer for this transaction."
                )

        elif review_in.order_id:
            order = db.query(Order).filter(Order.id == review_in.order_id).first()
            if not order:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated order not found")
            if order.farmer_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not a participant in this transaction")
            if order.status != OrderStatus.DELIVERED and order.status != OrderStatus.COMPLETED:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You can rate the buyer only after the transaction is completed.")
            existing = db.query(TransactionReview).filter(
                TransactionReview.order_id == review_in.order_id,
                TransactionReview.reviewer_id == current_user.id
            ).first()
            if existing:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already reviewed this buyer for this transaction.")

    # 2. BUYER_TO_FARMER validation
    elif review_in.review_type == ReviewType.BUYER_TO_FARMER:
        if current_user.role != UserRole.CUSTOMER:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only buyers can rate farmers")

        if review_in.offer_id:
            offer = db.query(Offer).filter(Offer.id == review_in.offer_id).first()
            if not offer:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction offer not found")

            buyer_user_id = offer.buyer.user_id if offer.buyer else None
            if buyer_user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not a participant in this transaction")

            farmer_user_id = offer.farmer.user_id if offer.farmer else None
            if review_in.target_user_id != farmer_user_id and review_in.target_user_id != offer.farmer_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Farmer does not belong to this transaction")
            resolved_target_user_id = farmer_user_id

            if offer.status != OfferStatus.COMPLETED:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You can rate the farmer only after the transaction is completed."
                )

            existing = db.query(TransactionReview).filter(
                TransactionReview.offer_id == review_in.offer_id,
                TransactionReview.reviewer_id == current_user.id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="You have already reviewed this farmer for this transaction."
                )

        elif review_in.order_id:
            order = db.query(Order).filter(Order.id == review_in.order_id).first()
            if not order:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated order not found")
            if order.customer_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not a participant in this transaction")
            if order.status != OrderStatus.DELIVERED and order.status != OrderStatus.COMPLETED:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You can rate the farmer only after the transaction is completed.")
            existing = db.query(TransactionReview).filter(
                TransactionReview.order_id == review_in.order_id,
                TransactionReview.reviewer_id == current_user.id
            ).first()
            if existing:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already reviewed this farmer for this transaction.")

    # 3. CUSTOMER_TO_DEALER validation
    elif review_in.review_type == ReviewType.CUSTOMER_TO_DEALER:
        if review_in.order_id:
            existing = db.query(TransactionReview).filter(
                TransactionReview.order_id == review_in.order_id,
                TransactionReview.reviewer_id == current_user.id
            ).first()
            if existing:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already reviewed this transaction")

    new_review = TransactionReview(
        review_type=review_in.review_type,
        order_id=review_in.order_id,
        offer_id=review_in.offer_id,
        shop_id=review_in.shop_id,
        reviewer_id=current_user.id,
        target_user_id=resolved_target_user_id,
        rating=review_in.rating,
        category_ratings=review_in.category_ratings,
        comment=review_in.comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    log_audit_event(
        db=db,
        action="SUBMIT_REVIEW",
        target_type="TransactionReview",
        user_id=current_user.id,
        target_id=new_review.id,
        details={"rating": review_in.rating, "target_user_id": resolved_target_user_id, "review_type": review_in.review_type.value}
    )

    try:
        notify_review_received(db, new_review, current_user)
    except Exception as e:
        print(f"Failed to trigger review notification: {e}")

    return _build_review_response(new_review)

@router.get("/user/{user_id}", response_model=List[TransactionReviewResponse])
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    reviews = db.query(TransactionReview).filter(
        TransactionReview.target_user_id == user_id
    ).order_by(TransactionReview.created_at.desc()).all()
    return [_build_review_response(r) for r in reviews]

@router.get("/user/{user_id}/summary", response_model=UserRatingSummary)
def get_user_rating_summary(user_id: int, db: Session = Depends(get_db)):
    reviews = db.query(TransactionReview).filter(TransactionReview.target_user_id == user_id).all()
    if not reviews:
        return UserRatingSummary(
            user_id=user_id,
            average_rating=5.0,
            total_reviews=0,
            rating_distribution={"5": 0, "4": 0, "3": 0, "2": 0, "1": 0},
            category_averages={}
        )

    total = len(reviews)
    avg = sum(r.rating for r in reviews) / total
    dist = {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}
    cat_totals: Dict[str, float] = {}
    cat_counts: Dict[str, int] = {}

    for r in reviews:
        dist[str(r.rating)] = dist.get(str(r.rating), 0) + 1
        if r.category_ratings and isinstance(r.category_ratings, dict):
            for k, val in r.category_ratings.items():
                cat_totals[k] = cat_totals.get(k, 0.0) + float(val)
                cat_counts[k] = cat_counts.get(k, 0) + 1

    cat_averages = {k: round(cat_totals[k] / cat_counts[k], 1) for k in cat_totals}

    return UserRatingSummary(
        user_id=user_id,
        average_rating=round(avg, 1),
        total_reviews=total,
        rating_distribution=dist,
        category_averages=cat_averages
    )

@router.get("/shop/{shop_id}", response_model=List[TransactionReviewResponse])
def get_shop_reviews(shop_id: int, db: Session = Depends(get_db)):
    reviews = db.query(TransactionReview).filter(
        TransactionReview.shop_id == shop_id
    ).order_by(TransactionReview.created_at.desc()).all()
    return [_build_review_response(r) for r in reviews]

@router.get("/shop/{shop_id}/summary", response_model=UserRatingSummary)
def get_shop_rating_summary(shop_id: int, db: Session = Depends(get_db)):
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    owner_user_id = shop.owner.user_id if (shop and shop.owner) else 0

    reviews = db.query(TransactionReview).filter(TransactionReview.shop_id == shop_id).all()
    if not reviews:
        return UserRatingSummary(
            user_id=owner_user_id,
            average_rating=shop.rating if shop else 4.8,
            total_reviews=0,
            rating_distribution={"5": 0, "4": 0, "3": 0, "2": 0, "1": 0},
            category_averages={"Product Quality": 4.8, "Pricing": 4.7, "Delivery": 4.9, "Service": 4.8}
        )

    total = len(reviews)
    avg = sum(r.rating for r in reviews) / total
    dist = {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}
    cat_totals: Dict[str, float] = {}
    cat_counts: Dict[str, int] = {}

    for r in reviews:
        dist[str(r.rating)] = dist.get(str(r.rating), 0) + 1
        if r.category_ratings and isinstance(r.category_ratings, dict):
            for k, val in r.category_ratings.items():
                cat_totals[k] = cat_totals.get(k, 0.0) + float(val)
                cat_counts[k] = cat_counts.get(k, 0) + 1

    cat_averages = {k: round(cat_totals[k] / cat_counts[k], 1) for k in cat_totals}

    return UserRatingSummary(
        user_id=owner_user_id,
        average_rating=round(avg, 1),
        total_reviews=total,
        rating_distribution=dist,
        category_averages=cat_averages
    )

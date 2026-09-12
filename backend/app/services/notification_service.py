from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.notification import Notification, NotificationPriority
from app.models.user import User, UserRole

def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "SYSTEM",
    category: Optional[str] = None,
    user_role: Optional[str] = None,
    related_entity_type: Optional[str] = None,
    related_entity_id: Optional[str] = None,
    action_url: Optional[str] = None,
    priority: str = "INFO",
    event_key: Optional[str] = None,
    metadata_json: Optional[Dict[str, Any]] = None
) -> Optional[Notification]:
    """
    Creates a new notification with deduplication protection via event_key.
    Does not duplicate notifications if an active notification with event_key already exists.
    """
    # 1. Deduplication check
    if event_key:
        existing = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.event_key == event_key
        ).first()
        if existing:
            return existing

    # 2. Derive user_role if not passed
    if not user_role:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user_role = user.role.value

    # 3. Create Notification
    notif = Notification(
        user_id=user_id,
        user_role=user_role,
        notification_type=notification_type,
        category=category or notification_type,
        title=title,
        message=message,
        related_entity_type=related_entity_type,
        related_entity_id=str(related_entity_id) if related_entity_id else None,
        action_url=action_url,
        link_url=action_url,
        priority=priority,
        event_key=event_key,
        metadata_json=metadata_json,
        is_read=False,
        created_at=datetime.now(timezone.utc)
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

# --- Domain Specific Notification Helpers ---

def notify_offer_created(db: Session, offer, creator_user: User):
    """
    Notifies the recipient of a newly created trade offer.
    """
    farmer_user_id = offer.farmer.user_id if offer.farmer else None
    buyer_user_id = offer.buyer.user_id if offer.buyer else None

    if creator_user.id == buyer_user_id and farmer_user_id:
        buyer_name = offer.buyer.user.full_name if (offer.buyer and offer.buyer.user) else "A Buyer"
        create_notification(
            db=db,
            user_id=farmer_user_id,
            user_role="FARMER",
            notification_type="OFFER",
            title="💰 New Buyer Offer",
            message=f"{buyer_name} offered ₹{offer.offered_price:,.0f}/{offer.unit} for your {offer.produce_name} ({offer.quantity} {offer.unit}).",
            related_entity_type="Offer",
            related_entity_id=offer.id,
            action_url="/farmer/offers",
            priority="INFO",
            event_key=f"NEW_OFFER-{offer.id}-{farmer_user_id}"
        )
    elif creator_user.id == farmer_user_id and buyer_user_id:
        farmer_name = offer.farmer.user.full_name if (offer.farmer and offer.farmer.user) else "A Farmer"
        create_notification(
            db=db,
            user_id=buyer_user_id,
            user_role="CUSTOMER",
            notification_type="OFFER",
            title="💰 New Farmer Offer",
            message=f"{farmer_name} offered {offer.quantity} {offer.unit} of {offer.produce_name} at ₹{offer.offered_price:,.0f}/{offer.unit}.",
            related_entity_type="Offer",
            related_entity_id=offer.id,
            action_url="/customer/offers",
            priority="INFO",
            event_key=f"NEW_OFFER-{offer.id}-{buyer_user_id}"
        )

def notify_offer_countered(db: Session, offer, counter_neg, sender_user: User):
    """
    Notifies the other party when a counter-offer is proposed.
    """
    farmer_user_id = offer.farmer.user_id if offer.farmer else None
    buyer_user_id = offer.buyer.user_id if offer.buyer else None

    recipient_id = buyer_user_id if sender_user.id == farmer_user_id else farmer_user_id
    if not recipient_id:
        return

    recipient_role = "CUSTOMER" if recipient_id == buyer_user_id else "FARMER"
    action_url = "/customer/offers" if recipient_role == "CUSTOMER" else "/farmer/offers"
    sender_name = sender_user.full_name or ("Farmer" if recipient_role == "CUSTOMER" else "Buyer")

    create_notification(
        db=db,
        user_id=recipient_id,
        user_role=recipient_role,
        notification_type="NEGOTIATION",
        title="🤝 New Counter Offer",
        message=f"{sender_name} sent a new counter-offer of ₹{counter_neg.offered_price:,.0f}/{offer.unit} for {offer.produce_name}.",
        related_entity_type="Offer",
        related_entity_id=offer.id,
        action_url=action_url,
        priority="INFO",
        event_key=f"COUNTER_OFFER-{offer.id}-{counter_neg.id}"
    )

def notify_offer_accepted(db: Session, offer, accepting_user: User):
    """
    Notifies both parties when an offer is accepted.
    """
    farmer_user_id = offer.farmer.user_id if offer.farmer else None
    buyer_user_id = offer.buyer.user_id if offer.buyer else None

    # Notify the other party who proposed the accepted price
    other_user_id = buyer_user_id if accepting_user.id == farmer_user_id else farmer_user_id
    if other_user_id:
        other_role = "CUSTOMER" if other_user_id == buyer_user_id else "FARMER"
        action_url = "/customer/offers" if other_role == "CUSTOMER" else "/farmer/offers"
        create_notification(
            db=db,
            user_id=other_user_id,
            user_role=other_role,
            notification_type="OFFER",
            title="✅ Offer Accepted",
            message=f"{accepting_user.full_name} accepted the deal for {offer.produce_name} at ₹{offer.offered_price:,.0f}/{offer.unit}!",
            related_entity_type="Offer",
            related_entity_id=offer.id,
            action_url=action_url,
            priority="SUCCESS",
            event_key=f"OFFER_ACCEPTED-{offer.id}-{other_user_id}"
        )

def notify_offer_rejected(db: Session, offer, rejecting_user: User):
    """
    Notifies the other party when an offer negotiation is rejected.
    """
    farmer_user_id = offer.farmer.user_id if offer.farmer else None
    buyer_user_id = offer.buyer.user_id if offer.buyer else None

    other_user_id = buyer_user_id if rejecting_user.id == farmer_user_id else farmer_user_id
    if other_user_id:
        other_role = "CUSTOMER" if other_user_id == buyer_user_id else "FARMER"
        action_url = "/customer/offers" if other_role == "CUSTOMER" else "/farmer/offers"
        create_notification(
            db=db,
            user_id=other_user_id,
            user_role=other_role,
            notification_type="OFFER",
            title="❌ Offer Declined",
            message=f"Negotiation for {offer.produce_name} (#{offer.offer_code}) has been declined by {rejecting_user.full_name}.",
            related_entity_type="Offer",
            related_entity_id=offer.id,
            action_url=action_url,
            priority="WARNING",
            event_key=f"OFFER_REJECTED-{offer.id}-{other_user_id}"
        )

def notify_transaction_completed(db: Session, offer):
    """
    Notifies Farmer and Buyer upon deal completion with review prompts.
    """
    farmer_user_id = offer.farmer.user_id if offer.farmer else None
    buyer_user_id = offer.buyer.user_id if offer.buyer else None

    if farmer_user_id:
        create_notification(
            db=db,
            user_id=farmer_user_id,
            user_role="FARMER",
            notification_type="OFFER",
            title="✅ Transaction Completed",
            message=f"Transaction #{offer.offer_code} for {offer.produce_name} has been completed successfully. You can now rate the buyer.",
            related_entity_type="Offer",
            related_entity_id=offer.id,
            action_url="/farmer/offers",
            priority="SUCCESS",
            event_key=f"TRANSACTION_COMPLETED-{offer.id}-{farmer_user_id}"
        )

    if buyer_user_id:
        create_notification(
            db=db,
            user_id=buyer_user_id,
            user_role="CUSTOMER",
            notification_type="OFFER",
            title="✅ Transaction Completed",
            message=f"Transaction #{offer.offer_code} for {offer.produce_name} has been marked completed. You can now rate the farmer.",
            related_entity_type="Offer",
            related_entity_id=offer.id,
            action_url="/customer/offers",
            priority="SUCCESS",
            event_key=f"TRANSACTION_COMPLETED-{offer.id}-{buyer_user_id}"
        )

def notify_review_received(db: Session, review, reviewer: User):
    """
    Notifies the target user when a new review/rating is received.
    """
    target_user = db.query(User).filter(User.id == review.target_user_id).first()
    if not target_user:
        return

    target_role = target_user.role.value
    action_url = "/customer" if target_role == "CUSTOMER" else ("/shopkeeper/reviews" if target_role == "SHOPKEEPER" else "/farmer")

    role_desc = "farmer" if reviewer.role == UserRole.FARMER else ("buyer" if reviewer.role == UserRole.CUSTOMER else "customer")

    create_notification(
        db=db,
        user_id=target_user.id,
        user_role=target_role,
        notification_type="REVIEW",
        title="⭐ New Rating Received",
        message=f"A {role_desc} ({reviewer.full_name}) submitted a verified {review.rating}-star rating for your recent transaction.",
        related_entity_type="TransactionReview",
        related_entity_id=review.id,
        action_url=action_url,
        priority="SUCCESS",
        event_key=f"REVIEW_RECEIVED-{review.id}"
    )

def notify_stock_alert(db: Session, dealer_user_id: int, product, alert_level: str):
    """
    Notifies dealer of low or critical inventory.
    """
    if alert_level == "OUT_OF_STOCK":
        title = "🚨 Out of Stock Alert"
        msg = f"{product.name} is now out of stock (0 {product.unit})."
        prio = "URGENT"
        event_k = f"STOCK_OUT-{product.id}"
    elif alert_level == "CRITICAL":
        title = "⚠️ Critical Low Stock"
        msg = f"{product.name} is critically low ({product.stock_quantity} {product.unit} remaining, threshold: {product.low_stock_threshold})."
        prio = "URGENT"
        event_k = f"STOCK_CRITICAL-{product.id}"
    else:
        title = "📦 Low Stock Warning"
        msg = f"{product.name} has fallen below your configured threshold ({product.stock_quantity} {product.unit} remaining)."
        prio = "WARNING"
        event_k = f"STOCK_LOW-{product.id}"

    create_notification(
        db=db,
        user_id=dealer_user_id,
        user_role="SHOPKEEPER",
        notification_type="STOCK",
        title=title,
        message=msg,
        related_entity_type="ShopProduct",
        related_entity_id=product.id,
        action_url="/shopkeeper/low-stock",
        priority=prio,
        event_key=event_k
    )

def notify_verification_request(db: Session, new_user: User):
    """
    Notifies admin when a new user requests account verification.
    """
    admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
    for admin in admins:
        create_notification(
            db=db,
            user_id=admin.id,
            user_role="ADMIN",
            notification_type="SYSTEM",
            title="🛡️ Verification Request",
            message=f"A new {new_user.role.value} account ({new_user.full_name}) is waiting for administrator verification.",
            related_entity_type="User",
            related_entity_id=new_user.id,
            action_url="/admin/verifications",
            priority="INFO",
            event_key=f"VERIF_REQ-{new_user.id}"
        )

def notify_offline_sync_failure(db: Session, record, repeated: bool = False):
    """
    Notifies admin when an offline sync operation fails.
    """
    admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
    prio = "URGENT" if repeated else "WARNING"
    title = "🚨 Repeated Offline Sync Failure" if repeated else "⚠️ Offline Sync Failure"
    msg = f"Offline mutation #{record.id} for user #{record.user_id} failed repeatedly ({record.retry_count} retries): {record.error_message or 'Unknown error'}" if repeated else f"Offline mutation #{record.id} for user #{record.user_id} failed: {record.error_message or 'Reconciliation error'}"

    for admin in admins:
        create_notification(
            db=db,
            user_id=admin.id,
            user_role="ADMIN",
            notification_type="SYNC",
            title=title,
            message=msg,
            related_entity_type="OfflineSyncRecord",
            related_entity_id=record.id,
            action_url="/admin/offline-sync",
            priority=prio,
            event_key=f"SYNC_FAIL-{record.id}-{'REPEAT' if repeated else 'ONCE'}"
        )

def notify_buyer_requirement_posted(db: Session, requirement, buyer_user: User):
    """
    Notifies active farmers about a new open crop procurement requirement from a buyer.
    """
    farmers = db.query(User).filter(
        User.role == UserRole.FARMER,
        User.is_active == True
    ).all()
    buyer_name = buyer_user.full_name or "Verified Commercial Buyer"
    for farmer in farmers:
        create_notification(
            db=db,
            user_id=farmer.id,
            user_role="FARMER",
            notification_type="REQUIREMENT",
            category="REQUIREMENT",
            title="🌾 New Buyer Sourcing Requirement",
            message=f"{buyer_name} is sourcing {requirement.quantity:,.0f} {requirement.unit} of {requirement.crop_name} at target price ₹{requirement.target_price:,.0f}/{requirement.unit} in {requirement.location_city}.",
            related_entity_type="BuyerRequirement",
            related_entity_id=requirement.id,
            action_url="/farmer/offers",
            priority="INFO",
            event_key=f"NEW_REQ-{requirement.id}-{farmer.id}"
        )

def notify_farmer_accepted_requirement(db: Session, offer, farmer_user: User):
    """
    Notifies buyer when a farmer accepts their requirement target price.
    """
    buyer_user_id = offer.buyer.user_id if offer.buyer else None
    if buyer_user_id:
        farmer_name = farmer_user.full_name or "A Farmer"
        create_notification(
            db=db,
            user_id=buyer_user_id,
            user_role="CUSTOMER",
            notification_type="OFFER",
            title="🎉 Farmer Accepted Your Requirement!",
            message=f"{farmer_name} accepted your sourcing requirement for {offer.quantity:,.0f} {offer.unit} of {offer.produce_name} at your target price ₹{offer.offered_price:,.0f}/{offer.unit}.",
            related_entity_type="Offer",
            related_entity_id=offer.id,
            action_url="/customer/offers",
            priority="SUCCESS",
            event_key=f"FARMER_ACCEPT-{offer.id}-{buyer_user_id}"
        )

def notify_farmer_countered_requirement(db: Session, offer, counter_neg, farmer_user: User):
    """
    Notifies buyer when a farmer submits a counter-offer on their requirement.
    """
    buyer_user_id = offer.buyer.user_id if offer.buyer else None
    if buyer_user_id:
        farmer_name = farmer_user.full_name or "A Farmer"
        create_notification(
            db=db,
            user_id=buyer_user_id,
            user_role="CUSTOMER",
            notification_type="NEGOTIATION",
            title="🤝 Farmer Counter-Offer Received",
            message=f"{farmer_name} proposed a counter-offer of ₹{counter_neg.offered_price:,.0f}/{offer.unit} for {counter_neg.quantity:,.0f} {offer.unit} of {offer.produce_name}.",
            related_entity_type="Offer",
            related_entity_id=offer.id,
            action_url="/customer/offers",
            priority="INFO",
            event_key=f"FARMER_COUNTER-{offer.id}-{counter_neg.id}-{buyer_user_id}"
        )


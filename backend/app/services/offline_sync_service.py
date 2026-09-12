import logging
from datetime import datetime, timezone
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.offline_sync import OfflineSyncRecord, SyncStatus
from app.models.scheme import GovernmentScheme, SavedScheme
from app.models.user import User, UserRole, FarmerProfile, CustomerProfile
from app.models.requirement import BuyerRequirement
from app.models.offer import Offer, OfferStatus, OfferNegotiation, NegotiationActionType
from app.models.review import TransactionReview
from app.schemas.offline import OfflineBatchSyncRequest, OfflineBatchSyncResponse, OfflineSyncResultItem

logger = logging.getLogger(__name__)

def process_offline_sync_batch(db: Session, user: User, batch: OfflineBatchSyncRequest) -> OfflineBatchSyncResponse:
    results: List[OfflineSyncResultItem] = []
    success_count = 0
    failure_count = 0

    for item in batch.items:
        # Check idempotency: if already SYNCED, skip re-execution
        existing_record = db.query(OfflineSyncRecord).filter(
            OfflineSyncRecord.client_mutation_id == item.client_item_id
        ).first()

        if existing_record and existing_record.status == SyncStatus.SYNCED:
            results.append(OfflineSyncResultItem(
                client_item_id=item.client_item_id,
                status="ALREADY_SYNCED",
                message="Mutation already synced previously",
                result_data={"synced_at": existing_record.synced_at.isoformat() if existing_record.synced_at else None}
            ))
            success_count += 1
            continue

        sync_record = existing_record or OfflineSyncRecord(
            user_id=user.id,
            client_mutation_id=item.client_item_id,
            action_type=item.sync_type,
            payload=item.payload,
            status=SyncStatus.PENDING,
            retry_count=0
        )
        if not existing_record:
            db.add(sync_record)

        try:
            res_data = _execute_action(db, user, item.sync_type, item.payload)
            sync_record.status = SyncStatus.SYNCED
            sync_record.synced_at = datetime.now(timezone.utc)
            sync_record.error_message = None
            db.commit()

            results.append(OfflineSyncResultItem(
                client_item_id=item.client_item_id,
                status="SYNCED",
                message="Synced successfully",
                result_data=res_data
            ))
            success_count += 1

        except Exception as e:
            db.rollback()
            err_msg = str(e)
            logger.warning(f"Offline sync failed for mutation {item.client_item_id}: {err_msg}")
            sync_record.status = SyncStatus.FAILED
            sync_record.retry_count += 1
            sync_record.error_message = err_msg
            try:
                db.add(sync_record)
                db.commit()
            except Exception:
                db.rollback()

            results.append(OfflineSyncResultItem(
                client_item_id=item.client_item_id,
                status="FAILED",
                message=err_msg
            ))
            failure_count += 1
            try:
                from app.services.notification_service import notify_offline_sync_failure
                notify_offline_sync_failure(db, sync_record, repeated=(sync_record.retry_count >= 3))
            except Exception:
                pass

    try:
        from app.services.notification_service import create_notification
        if failure_count > 0:
            create_notification(
                db=db,
                user_id=user.id,
                title="⚠️ Offline Sync Alert",
                message=f"{success_count} offline operations synced, but {failure_count} could not be synchronized.",
                notification_type="SYNC",
                action_url="/farmer/offline" if user.role == UserRole.FARMER else "/",
                priority="WARNING"
            )
        elif success_count > 0:
            create_notification(
                db=db,
                user_id=user.id,
                title="🔄 Offline Sync Completed",
                message=f"Your {success_count} offline changes were synchronized successfully.",
                notification_type="SYNC",
                action_url="/farmer/offline" if user.role == UserRole.FARMER else "/",
                priority="SUCCESS"
            )
    except Exception as e:
        logger.warning(f"Failed to trigger sync notification: {e}")

    return OfflineBatchSyncResponse(
        success=failure_count == 0,
        processed_count=len(batch.items),
        results=results,
        server_timestamp=datetime.now(timezone.utc)
    )

def _execute_action(db: Session, user: User, action_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    action_type = action_type.upper()

    if action_type == "SAVE_SCHEME":
        scheme_id = payload.get("scheme_id")
        if not scheme_id:
            raise ValueError("Missing scheme_id in payload")
        
        # Check scheme exists
        scheme = db.query(GovernmentScheme).filter(GovernmentScheme.id == scheme_id).first()
        if not scheme:
            raise ValueError(f"Scheme {scheme_id} not found")

        farmer = db.query(FarmerProfile).filter(FarmerProfile.user_id == user.id).first()
        if not farmer:
            raise ValueError("User does not have a farmer profile")

        existing = db.query(SavedScheme).filter(
            SavedScheme.farmer_id == farmer.id,
            SavedScheme.scheme_id == scheme_id
        ).first()

        if not existing:
            saved = SavedScheme(
                farmer_id=farmer.id,
                scheme_id=scheme_id,
                notes=payload.get("notes")
            )
            db.add(saved)
            db.flush()
            return {"saved_scheme_id": saved.id, "scheme_id": scheme_id}
        return {"saved_scheme_id": existing.id, "already_saved": True}

    elif action_type == "UNSAVE_SCHEME":
        scheme_id = payload.get("scheme_id")
        farmer = db.query(FarmerProfile).filter(FarmerProfile.user_id == user.id).first()
        if not farmer:
            raise ValueError("User does not have a farmer profile")
        
        db.query(SavedScheme).filter(
            SavedScheme.farmer_id == farmer.id,
            SavedScheme.scheme_id == scheme_id
        ).delete()
        db.flush()
        return {"unsaved_scheme_id": scheme_id}

    elif action_type == "SUBMIT_REQUIREMENT":
        customer = db.query(CustomerProfile).filter(CustomerProfile.user_id == user.id).first()
        if not customer:
            raise ValueError("User does not have a buyer profile")

        req = BuyerRequirement(
            buyer_id=customer.id,
            title=payload.get("title", f"Requirement for {payload.get('crop_name', 'Produce')}"),
            crop_name=payload.get("crop_name", "Produce"),
            variety=payload.get("variety"),
            quantity=float(payload.get("quantity", payload.get("quantity_required", 1))),
            unit=payload.get("unit", "Quintal"),
            target_price=float(payload.get("target_price", payload.get("target_price_per_unit", 0))),
            min_quality_grade=payload.get("min_quality_grade", "Grade A (Standard)"),
            required_date=datetime.fromisoformat(payload.get("required_date")) if payload.get("required_date") else None,
            delivery_preference=payload.get("delivery_preference", "Farmer Farmgate Pickup"),
            location_city=payload.get("location_city", user.district or "Ludhiana"),
            state=payload.get("state", user.state or "Punjab"),
            description=payload.get("description")
        )
        db.add(req)
        db.flush()
        return {"requirement_id": req.id}

    else:
        raise ValueError(f"Unsupported offline action_type: {action_type}")

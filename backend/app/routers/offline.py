from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.scheme import GovernmentScheme
from app.schemas.offline import OfflineSyncBatchRequest, OfflineSyncBatchResponse
from app.services.offline_sync_service import process_offline_sync_batch

router = APIRouter(prefix="/offline", tags=["Offline Mode & Sync"])

@router.post("/sync", response_model=OfflineSyncBatchResponse)
def sync_offline_batch(
    batch: OfflineSyncBatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return process_offline_sync_batch(db, current_user, batch)

@router.get("/status")
def get_offline_metadata(db: Session = Depends(get_db)):
    latest_scheme = db.query(GovernmentScheme).order_by(GovernmentScheme.updated_at.desc()).first()
    return {
        "status": "ONLINE",
        "server_time": datetime.now(timezone.utc).isoformat(),
        "schemes_last_updated": latest_scheme.updated_at.isoformat() if latest_scheme and latest_scheme.updated_at else datetime.now(timezone.utc).isoformat(),
        "mandi_prices_last_updated": datetime.now(timezone.utc).isoformat(),
        "version": "AgriVision V3"
    }

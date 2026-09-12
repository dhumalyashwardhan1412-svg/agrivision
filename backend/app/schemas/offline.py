from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class OfflineQueueItem(BaseModel):
    client_item_id: str
    sync_type: str # e.g. "SAVE_SCHEME", "UNSAVE_SCHEME", "SUBMIT_REQUIREMENT", "CLIENT_PING"
    payload: Dict[str, Any]
    created_offline_at: datetime

class OfflineSyncResultItem(BaseModel):
    client_item_id: str
    status: str # "SYNCED", "FAILED", "CONFLICT", "ALREADY_SYNCED"
    message: Optional[str] = None
    result_data: Optional[Dict[str, Any]] = None

class OfflineBatchSyncRequest(BaseModel):
    client_session_id: Optional[str] = "session-default"
    items: List[OfflineQueueItem]

class OfflineBatchSyncResponse(BaseModel):
    success: bool
    processed_count: int
    results: List[OfflineSyncResultItem]
    server_timestamp: datetime

# Convenient Aliases
OfflineSyncItem = OfflineQueueItem
OfflineSyncBatchRequest = OfflineBatchSyncRequest
OfflineSyncItemResult = OfflineSyncResultItem
OfflineSyncBatchResponse = OfflineBatchSyncResponse

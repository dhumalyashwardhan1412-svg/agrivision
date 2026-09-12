import axios from 'axios';
import {
  getPendingOfflineMutations,
  clearSyncedMutations,
  OfflineMutationQueueItem
} from '../utils/offlineStorage';

const API_BASE = '/api/v1';

export async function syncPendingMutationsNow(): Promise<{
  processed: number;
  synced: number;
  failed: number;
}> {
  const pending = await getPendingOfflineMutations();
  if (!pending || pending.length === 0) {
    return { processed: 0, synced: 0, failed: 0 };
  }

  const token = localStorage.getItem('agrivision_token') || localStorage.getItem('token');
  if (!token) {
    return { processed: 0, synced: 0, failed: pending.length };
  }

  try {
    const response = await axios.post(
      `${API_BASE}/offline/sync`,
      {
        client_session_id: 'session-' + Date.now(),
        items: pending
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const result = response.data;
    const syncedIds = (result.results || [])
      .filter((r: any) => r.status === 'SYNCED' || r.status === 'ALREADY_SYNCED')
      .map((r: any) => r.client_item_id);

    await clearSyncedMutations(syncedIds);

    return {
      processed: result.processed_count || pending.length,
      synced: syncedIds.length,
      failed: (result.processed_count || pending.length) - syncedIds.length
    };
  } catch (err) {
    console.warn('Auto offline sync failed:', err);
    return { processed: pending.length, synced: 0, failed: pending.length };
  }
}

export function initializeOfflineSyncListener(): void {
  window.addEventListener('online', () => {
    console.log('[AgriVision V3] Network reconnected. Starting offline sync queue processing...');
    syncPendingMutationsNow().then((res) => {
      if (res.synced > 0) {
        console.log(`[AgriVision V3] Successfully synced ${res.synced} offline mutations.`);
      }
    });
  });
}

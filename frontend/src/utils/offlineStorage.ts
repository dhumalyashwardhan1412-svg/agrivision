/**
 * Native IndexedDB offline storage wrapper for AgriVision V3.
 * Supports caching Schemes, Mandi Prices, Offline Farming Guides,
 * and offline mutation queues with timestamps and status tracking.
 */

const DB_NAME = 'agrivision_offline_v3';
const DB_VERSION = 2;

export interface CachedItem<T> {
  id: string | number;
  data: T;
  cachedAt: string;
}

export interface OfflineMutationQueueItem {
  client_item_id: string;
  sync_type: string;
  payload: any;
  created_offline_at: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains('schemes')) {
        db.createObjectStore('schemes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('mandi_prices')) {
        db.createObjectStore('mandi_prices', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('guides')) {
        db.createObjectStore('guides', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('notifications')) {
        db.createObjectStore('notifications', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pending_mutations')) {
        db.createObjectStore('pending_mutations', { keyPath: 'client_item_id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// -------------------------------------------------------------
// CACHE HELPERS
// -------------------------------------------------------------

export async function cacheDataItems<T extends { id: string | number }>(
  storeName: 'schemes' | 'mandi_prices' | 'guides' | 'notifications',
  items: T[]
): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  const now = new Date().toISOString();

  items.forEach((item) => {
    store.put({
      id: item.id,
      data: item,
      cachedAt: now
    });
  });

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedDataItems<T>(
  storeName: 'schemes' | 'mandi_prices' | 'guides' | 'notifications'
): Promise<{ items: T[]; lastUpdated: string | null }> {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const raw = (request.result || []) as CachedItem<T>[];
        const items = raw.map((r) => r.data);
        const latestTime = raw.length > 0
          ? raw.reduce((max, r) => (r.cachedAt > max ? r.cachedAt : max), raw[0].cachedAt)
          : null;
        resolve({ items, lastUpdated: latestTime });
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return { items: [], lastUpdated: null };
  }
}

// -------------------------------------------------------------
// MUTATION QUEUE HELPERS
// -------------------------------------------------------------

export async function enqueueOfflineMutation(
  sync_type: string,
  payload: any
): Promise<string> {
  const db = await openDB();
  const tx = db.transaction('pending_mutations', 'readwrite');
  const store = tx.objectStore('pending_mutations');
  const mutationId = 'MUT-' + Math.random().toString(36).substring(2, 9).toUpperCase();

  const item: OfflineMutationQueueItem = {
    client_item_id: mutationId,
    sync_type,
    payload,
    created_offline_at: new Date().toISOString()
  };

  store.put(item);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(mutationId);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingOfflineMutations(): Promise<OfflineMutationQueueItem[]> {
  try {
    const db = await openDB();
    const tx = db.transaction('pending_mutations', 'readonly');
    const store = tx.objectStore('pending_mutations');
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

export async function clearSyncedMutations(mutationIds: string[]): Promise<void> {
  if (!mutationIds || mutationIds.length === 0) return;
  const db = await openDB();
  const tx = db.transaction('pending_mutations', 'readwrite');
  const store = tx.objectStore('pending_mutations');

  mutationIds.forEach((id) => store.delete(id));

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

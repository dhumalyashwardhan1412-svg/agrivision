import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { syncPendingMutationsNow } from '../../services/offlineSync';
import { getPendingOfflineMutations } from '../../utils/offlineStorage';

interface ConnectivityBadgeProps {
  cachedTimestamp?: string | null;
  className?: string;
}

export const ConnectivityBadge: React.FC<ConnectivityBadgeProps> = ({
  cachedTimestamp,
  className = ''
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const checkPending = async () => {
    try {
      const items = await getPendingOfflineMutations();
      setPendingCount(items.length);
    } catch {
      setPendingCount(0);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkPending();
    };
    const handleOffline = () => {
      setIsOnline(false);
      checkPending();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    checkPending();

    const interval = setInterval(checkPending, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    try {
      await syncPendingMutationsNow();
      await checkPending();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
      isOnline
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        : 'bg-amber-50 text-amber-700 border border-amber-200'
    } ${className}`}>
      {isOnline ? (
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <Wifi className="w-3.5 h-3.5 text-emerald-600" />
          <span>Online</span>
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <WifiOff className="w-3.5 h-3.5 text-amber-600" />
          <span>Offline Mode</span>
        </span>
      )}

      {cachedTimestamp && !isOnline && (
        <span className="text-[10px] text-amber-600/80 border-l border-amber-300 pl-2">
          Cached: {new Date(cachedTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}

      {pendingCount > 0 && (
        <span className="flex items-center gap-1 text-[11px] font-semibold bg-amber-200/60 px-2 py-0.5 rounded-full text-amber-900">
          {pendingCount} unsynced
          {isOnline && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              title="Sync now"
              className="ml-1 p-0.5 hover:bg-amber-300 rounded transition"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </span>
      )}
    </div>
  );
};

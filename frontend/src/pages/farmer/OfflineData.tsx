import React, { useState, useEffect } from 'react';
import {
  Download,
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  BookOpen,
  Send
} from 'lucide-react';
import { ConnectivityBadge } from '../../components/common/ConnectivityBadge';
import {
  cacheDataItems,
  getCachedDataItems,
  getPendingOfflineMutations,
  OfflineMutationQueueItem
} from '../../utils/offlineStorage';
import { syncPendingMutationsNow } from '../../services/offlineSync';
import { schemesApi } from '../../services/schemesApi';
import { marketApi } from '../../services/marketApi';
import { cropApi } from '../../services/cropApi';
import { GovernmentScheme } from '../../types';

export const OfflineData: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Cached states
  const [cachedSchemes, setCachedSchemes] = useState<GovernmentScheme[]>([]);
  const [schemesTime, setSchemesTime] = useState<string | null>(null);

  const [cachedPrices, setCachedPrices] = useState<any[]>([]);
  const [pricesTime, setPricesTime] = useState<string | null>(null);

  const [cachedGuides, setCachedGuides] = useState<any[]>([]);
  const [guidesTime, setGuidesTime] = useState<string | null>(null);

  const [pendingQueue, setPendingQueue] = useState<OfflineMutationQueueItem[]>([]);
  const [activeTab, setActiveTab] = useState<'SCHEMES' | 'PRICES' | 'GUIDES' | 'QUEUE'>('SCHEMES');
  const [syncing, setSyncing] = useState<boolean>(false);

  const loadOfflineData = async () => {
    const [sData, pData, gData, qData] = await Promise.all([
      getCachedDataItems<GovernmentScheme>('schemes'),
      getCachedDataItems<any>('mandi_prices'),
      getCachedDataItems<any>('guides'),
      getPendingOfflineMutations()
    ]);

    setCachedSchemes(sData.items);
    setSchemesTime(sData.lastUpdated);

    setCachedPrices(pData.items);
    setPricesTime(pData.lastUpdated);

    setCachedGuides(gData.items);
    setGuidesTime(gData.lastUpdated);

    setPendingQueue(qData);
  };

  useEffect(() => {
    loadOfflineData();

    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);

    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const handleDownloadAll = async () => {
    if (!navigator.onLine) {
      alert('You need an active internet connection to download data for offline use.');
      return;
    }
    setDownloading(true);
    setDownloadSuccess(null);

    try {
      // 1. Fetch & Cache Schemes
      const schemes = await schemesApi.getSchemes();
      await cacheDataItems('schemes', schemes);

      // 2. Fetch & Cache Mandi Prices
      const prices = await marketApi.getPrices({}).catch(() => []);
      if (prices && prices.length > 0) {
        await cacheDataItems('mandi_prices', prices);
      }

      // 3. Fetch & Cache Crops
      const crops = await cropApi.getCrops().catch(() => []);
      if (crops && crops.length > 0) {
        await cacheDataItems('guides', crops);
      }

      await loadOfflineData();
      setDownloadSuccess('Offline agricultural database successfully updated and saved locally!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error('Download offline data failed:', err);
      alert('Failed to download some offline datasets.');
    } finally {
      setDownloading(false);
    }
  };

  const handleManualSync = async () => {
    if (!navigator.onLine) {
      alert('Connect to internet to sync offline changes.');
      return;
    }
    setSyncing(true);
    try {
      const res = await syncPendingMutationsNow();
      alert(`Sync completed! ${res.synced} mutations synchronized to server.`);
      await loadOfflineData();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-6 rounded-2xl shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-[11px] font-bold tracking-wide uppercase">
              PWA Offline Engine
            </span>
            <ConnectivityBadge />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Offline & Low-Internet Data Center</h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl">
            Keep farming with confidence even in remote fields without cell coverage. Cache official schemes, mandi prices, and crop guides for offline access, and auto-sync your actions when you return online.
          </p>
        </div>

        <button
          onClick={handleDownloadAll}
          disabled={downloading || !isOnline}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition shadow-md ${
            isOnline
              ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-900/30'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
          <span>{downloading ? 'Downloading...' : 'Download for Offline Use'}</span>
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Storage Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Cached Schemes</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{cachedSchemes.length}</div>
          <p className="text-[11px] text-slate-500">
            {schemesTime ? `Updated ${new Date(schemesTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not cached'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Mandi Prices</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{cachedPrices.length}</div>
          <p className="text-[11px] text-slate-500">
            {pricesTime ? `Cached ${new Date(pricesTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not cached'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Crops & Guides</span>
            <BookOpen className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{cachedGuides.length}</div>
          <p className="text-[11px] text-slate-500">
            {guidesTime ? `Updated ${new Date(guidesTime).toLocaleDateString()}` : 'Not cached'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Pending Sync Queue</span>
            <RefreshCw className={`w-4 h-4 ${pendingQueue.length > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>
          <div className="text-2xl font-black text-slate-800">{pendingQueue.length}</div>
          <p className="text-[11px] text-slate-500">
            {pendingQueue.length > 0 ? 'Queued mutations waiting for internet' : 'All changes synchronized'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            {[
              { id: 'SCHEMES', label: `Government Schemes (${cachedSchemes.length})` },
              { id: 'PRICES', label: `Mandi Prices (${cachedPrices.length})` },
              { id: 'GUIDES', label: `Farming Guides (${cachedGuides.length})` },
              { id: 'QUEUE', label: `Sync Queue (${pendingQueue.length})` }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                  activeTab === t.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'QUEUE' && pendingQueue.length > 0 && (
            <button
              onClick={handleManualSync}
              disabled={syncing || !isOnline}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>Sync All Now</span>
            </button>
          )}
        </div>

        {/* Tab 1: Schemes */}
        {activeTab === 'SCHEMES' && (
          <div className="space-y-3">
            {cachedSchemes.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No schemes saved locally. Click "Download for Offline Use" to store schemes for field viewing.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cachedSchemes.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {s.category}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                        Cached Data • {schemesTime ? new Date(schemesTime).toLocaleDateString() : ''}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-800">{s.name}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{s.short_description}</p>
                    <p className="text-xs text-emerald-800 font-medium pt-1 border-t border-slate-200/60">
                      Benefits: {s.benefits}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Prices */}
        {activeTab === 'PRICES' && (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Cached Mandi Prices:</strong> These prices were saved on{' '}
                {pricesTime ? new Date(pricesTime).toLocaleString() : 'earlier today'}. Real-time mandi rates may vary when mandis are open.
              </span>
            </div>

            {cachedPrices.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No mandi prices cached yet. Click "Download for Offline Use" while connected.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {cachedPrices.map((p, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800">{p.commodity || p.crop_name}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Cached Data</span>
                    </div>
                    <div className="text-xs text-slate-500">{p.market_name || p.district}, {p.state}</div>
                    <div className="text-base font-black text-emerald-700">
                      ₹{p.modal_price || p.current_price}/Quintal
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Guides */}
        {activeTab === 'GUIDES' && (
          <div className="space-y-3">
            {cachedGuides.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No crop cultivation guides cached yet. Click "Download for Offline Use" while connected.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cachedGuides.map((g, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base text-slate-800">{g.name}</h4>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {g.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{g.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span>Season: {g.season || 'Kharif / Rabi'}</span>
                      <span>Water: {g.water_requirement || 'Medium'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Queue */}
        {activeTab === 'QUEUE' && (
          <div className="space-y-3">
            {pendingQueue.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs space-y-1">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                <p className="font-bold text-slate-700">No Pending Offline Actions</p>
                <p>All bookmarks, offer updates, and data submissions are completely in sync with the server.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingQueue.map((item) => (
                  <div
                    key={item.client_item_id}
                    className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{item.sync_type}</span>
                        <span className="font-mono text-[10px] text-slate-400">{item.client_item_id}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Queued: {new Date(item.created_offline_at).toLocaleTimeString()}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 text-[10px] font-bold">
                      Awaiting Connection
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default OfflineData;

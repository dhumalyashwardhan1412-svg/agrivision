import React, { useEffect, useState } from 'react';
import {
  WifiOff,
  Wifi,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  RotateCcw,
  Layers,
  ArrowUpRight,
  Database
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { adminV3Api } from '../../services/adminV3Api';
import { OfflineSyncStats, OfflineSyncMonitorItem } from '../../types';

export const OfflineSyncMonitor: React.FC = () => {
  const [stats, setStats] = useState<OfflineSyncStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [retryingId, setRetryingId] = useState<number | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminV3Api.getOfflineSyncStats(
        statusFilter === 'ALL' ? undefined : statusFilter
      );
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch offline sync analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [statusFilter]);

  const handleRetry = async (recordId: number) => {
    try {
      setRetryingId(recordId);
      await adminV3Api.retryOfflineSync(recordId);
      await fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Retry execution failed.');
    } finally {
      setRetryingId(null);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st.toUpperCase()) {
      case 'SUCCESS':
        return <Badge variant="green" size="sm"><CheckCircle className="w-3 h-3 mr-1" /> Synced</Badge>;
      case 'FAILED':
        return <Badge variant="red" size="sm"><AlertTriangle className="w-3 h-3 mr-1" /> Failed</Badge>;
      case 'PENDING':
        return <Badge variant="amber" size="sm"><Clock className="w-3 h-3 mr-1" /> Queued</Badge>;
      case 'CONFLICT':
        return <Badge variant="red" size="sm">Conflict</Badge>;
      default:
        return <Badge variant="slate" size="sm">{st}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Offline Mutation Queue & Sync Monitor
            </h1>
            <Badge variant="blue" size="sm">PWA Resiliency Engine</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Supervise field mutations generated under zero or intermittent internet connectivity across rural APMC mandis and farms.
          </p>
        </div>

        <Button
          onClick={fetchStats}
          disabled={loading}
          variant="outline"
          className="self-start sm:self-auto gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* KPI Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Offline Events</span>
              <Database className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-black text-slate-900 mt-2">
              {stats.total_sync_events}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Ingested from client IndexedDB</div>
          </Card>

          <Card className="p-4 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Successfully Reconciled</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-700 mt-2">
              {stats.successful_syncs}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">100% database parity achieved</div>
          </Card>

          <Card className="p-4 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Pending Ingestion</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-amber-600 mt-2">
              {stats.pending_syncs}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Awaiting network trigger</div>
          </Card>

          <Card className="p-4 border-l-4 border-l-rose-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Sync Failures & Conflicts</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-3xl font-black text-rose-600 mt-2">
              {stats.failed_syncs + stats.conflicts}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Requires manual retry or resolution</div>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <Card className="p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 mr-2">Status:</span>
          {['ALL', 'SUCCESS', 'PENDING', 'FAILED', 'CONFLICT'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </Card>

      {/* Sync Records Table */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0 mb-4">
          <CardTitle className="text-base font-bold text-slate-900">
            Sync Telemetry Log
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Every transaction created offline carries a client-generated UUID for deduplication and replay safety.
          </CardDescription>
        </CardHeader>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
            Loading sync telemetry records...
          </div>
        ) : !stats || stats.records.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No offline sync records logged under this status.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Record ID</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Attempts</th>
                  <th className="py-3 px-4">Error / Diagnosis</th>
                  <th className="py-3 px-4">Reconciled At</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {stats.records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                      #{r.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{r.user_name || `User #${r.user_id}`}</div>
                      <div className="text-[10px] text-slate-400">{r.user_role}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                      {r.sync_item_type}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(r.status)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {r.retry_count}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-[11px]">
                      {r.error_message ? (
                        <span className="text-rose-600 font-mono">{r.error_message}</span>
                      ) : (
                        <span className="text-slate-400 font-mono">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {r.synced_at ? new Date(r.synced_at).toLocaleTimeString() : 'Pending'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {(r.status === 'FAILED' || r.status === 'PENDING') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetry(r.id)}
                          disabled={retryingId === r.id}
                          className="h-7 px-2 text-[11px] gap-1 text-sky-700 border-sky-200 hover:bg-sky-50"
                        >
                          <RotateCcw className={`w-3 h-3 ${retryingId === r.id ? 'animate-spin' : ''}`} />
                          <span>Retry</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

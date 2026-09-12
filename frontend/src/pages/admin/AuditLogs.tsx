import React, { useEffect, useState } from 'react';
import {
  FileText,
  Shield,
  Search,
  RefreshCw,
  Eye,
  Filter,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { adminV3Api } from '../../services/adminV3Api';
import { AuditLog } from '../../types';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Diff inspection modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [diffModalOpen, setDiffModalOpen] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { limit: 100 };
      if (actionFilter !== 'ALL') params.action = actionFilter;
      if (entityFilter !== 'ALL') params.entity_type = entityFilter;
      const data = await adminV3Api.getAuditLogs(params);
      setLogs(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch audit trails.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter]);

  const handleInspect = (log: AuditLog) => {
    setSelectedLog(log);
    setDiffModalOpen(true);
  };

  const filteredLogs = logs.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (l.user_name && l.user_name.toLowerCase().includes(q)) ||
      (l.action && l.action.toLowerCase().includes(q)) ||
      (l.description && l.description.toLowerCase().includes(q)) ||
      (l.entity_type && l.entity_type.toLowerCase().includes(q))
    );
  });

  const getActionBadge = (action: string) => {
    if (action.includes('VERIFY')) return <Badge variant="green" size="sm">{action}</Badge>;
    if (action.includes('REJECT') || action.includes('SUSPEND') || action.includes('DELETE'))
      return <Badge variant="red" size="sm">{action}</Badge>;
    if (action.includes('OFFER') || action.includes('ACCEPT'))
      return <Badge variant="blue" size="sm">{action}</Badge>;
    if (action.includes('STOCK')) return <Badge variant="amber" size="sm">{action}</Badge>;
    return <Badge variant="slate" size="sm">{action}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform Audit Trail & Security Logs
            </h1>
            <Badge variant="purple" size="sm">Immutable Ledger</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tamper-evident logs of negotiations, price acceptances, inventory movements, scheme verifications, and user state changes.
          </p>
        </div>

        <Button
          onClick={fetchLogs}
          disabled={loading}
          variant="outline"
          className="self-start sm:self-auto gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <Card className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by user, action, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white font-semibold text-slate-700"
          >
            <option value="ALL">All Actions</option>
            <option value="ACCEPT_OFFER">Accept Offer</option>
            <option value="COUNTER_OFFER">Counter Offer</option>
            <option value="CREATE_OFFER">Create Offer</option>
            <option value="VERIFY_USER">Verify User</option>
            <option value="REJECT_VERIFICATION">Reject Verification</option>
            <option value="SUSPEND_USER">Suspend User</option>
            <option value="UPDATE_STOCK">Update Stock</option>
            <option value="VERIFY_SCHEME">Verify Scheme</option>
            <option value="SUBMIT_REVIEW">Submit Review</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white font-semibold text-slate-700"
          >
            <option value="ALL">All Entities</option>
            <option value="Offer">Offer</option>
            <option value="User">User</option>
            <option value="ShopProduct">ShopProduct</option>
            <option value="GovernmentScheme">GovernmentScheme</option>
            <option value="TransactionReview">TransactionReview</option>
          </select>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0 mb-4">
          <CardTitle className="text-base font-bold text-slate-900">
            Recorded Audit Events ({filteredLogs.length})
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Click 'Inspect Diff' to view granular before & after state transitions. All credentials and secrets are automatically redacted.
          </CardDescription>
        </CardHeader>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
            Loading system audit logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No audit records found matching the active filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Event Time</th>
                  <th className="py-3 px-4">Initiator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Event Summary</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{l.user_name || 'System'}</div>
                      <div className="text-[10px] text-slate-400">{l.user_role || 'AUTOMATED'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getActionBadge(l.action)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {l.entity_type} {l.entity_id ? `#${l.entity_id}` : ''}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm truncate text-slate-800">
                      {l.description}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {(l.before_state || l.after_state) ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInspect(l)}
                          className="h-7 px-2 text-[11px] gap-1 text-purple-700 border-purple-200 hover:bg-purple-50"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Diff</span>
                        </Button>
                      ) : (
                        <span className="text-slate-300 text-[11px] font-mono">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Diff Inspection Modal */}
      <Modal
        isOpen={diffModalOpen}
        onClose={() => setDiffModalOpen(false)}
        title={`Audit Event #${selectedLog?.id} – State Transition`}
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div><span className="font-bold">Action:</span> {selectedLog?.action}</div>
            <div><span className="font-bold">Initiated By:</span> {selectedLog?.user_name} ({selectedLog?.user_role})</div>
            <div><span className="font-bold">Description:</span> {selectedLog?.description}</div>
            <div><span className="font-bold">Timestamp:</span> {selectedLog && new Date(selectedLog.created_at).toLocaleString()}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <span>Before State</span>
              </div>
              <pre className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl text-[11px] font-mono text-slate-800 max-h-60 overflow-y-auto whitespace-pre-wrap">
                {selectedLog?.before_state ? JSON.stringify(selectedLog.before_state, null, 2) : 'null (Created or Initial)'}
              </pre>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <span>After State</span>
                <CheckCircle className="w-3 h-3 text-emerald-600" />
              </div>
              <pre className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-[11px] font-mono text-slate-800 max-h-60 overflow-y-auto whitespace-pre-wrap">
                {selectedLog?.after_state ? JSON.stringify(selectedLog.after_state, null, 2) : 'null'}
              </pre>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setDiffModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

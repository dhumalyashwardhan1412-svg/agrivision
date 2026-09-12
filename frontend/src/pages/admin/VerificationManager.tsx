import React, { useEffect, useState } from 'react';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  Filter,
  Eye
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { adminV3Api } from '../../services/adminV3Api';
import {
  AdminUserItem,
  UserRole,
  UserAccountStatus,
  UserVerificationStatus
} from '../../types';

export const VerificationManager: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedRole, setSelectedRole] = useState<UserRole | 'ALL'>('ALL');
  const [selectedVerification, setSelectedVerification] = useState<UserVerificationStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Action Modals
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyNotes, setVerifyNotes] = useState('');

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendDays, setSuspendDays] = useState(7);

  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (selectedRole !== 'ALL') params.role = selectedRole;
      if (selectedVerification !== 'ALL') params.verification_filter = selectedVerification;
      if (searchQuery.trim()) params.q = searchQuery.trim();

      const data = await adminV3Api.getUsers(params);
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, selectedVerification]);

  const handleVerify = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      await adminV3Api.verifyUser(selectedUser.id, verifyNotes);
      setVerifyModalOpen(false);
      setVerifyNotes('');
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to verify user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedUser) return;
    if (!rejectReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }
    try {
      setActionLoading(true);
      await adminV3Api.rejectVerification(selectedUser.id, rejectReason);
      setRejectModalOpen(false);
      setRejectReason('');
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to reject verification.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedUser) return;
    if (!suspendReason.trim()) {
      alert('Please enter a reason for suspension.');
      return;
    }
    try {
      setActionLoading(true);
      await adminV3Api.suspendUser(selectedUser.id, suspendReason, suspendDays);
      setSuspendModalOpen(false);
      setSuspendReason('');
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to suspend user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (userId: number) => {
    try {
      setActionLoading(true);
      await adminV3Api.activateUser(userId);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to activate user.');
    } finally {
      setActionLoading(false);
    }
  };

  const getVerificationBadge = (status: UserVerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge variant="green" size="sm"><CheckCircle className="w-3 h-3 mr-1" /> Verified</Badge>;
      case 'REJECTED':
        return <Badge variant="red" size="sm"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="amber" size="sm"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'FARMER':
        return <Badge variant="green" size="sm">Farmer</Badge>;
      case 'CUSTOMER':
        return <Badge variant="blue" size="sm">Buyer</Badge>;
      case 'SHOPKEEPER':
        return <Badge variant="purple" size="sm">Dealer</Badge>;
      case 'ADMIN':
        return <Badge variant="slate" size="sm">Admin</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              User Verification & Moderation
            </h1>
            <Badge variant="purple" size="sm">Admin V3 Governance</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review applicant identities, manage role verification badges, and govern network accounts.
          </p>
        </div>

        <Button
          onClick={fetchUsers}
          disabled={loading}
          variant="outline"
          className="self-start sm:self-auto gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Directory</span>
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, email, or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Roles</option>
              <option value="FARMER">Farmers</option>
              <option value="CUSTOMER">Buyers</option>
              <option value="SHOPKEEPER">Dealers</option>
              <option value="ADMIN">Admins</option>
            </select>

            {/* Verification Status Filter */}
            <select
              value={selectedVerification}
              onChange={(e) => setSelectedVerification(e.target.value as any)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Verifications</option>
              <option value="PENDING">Pending Review</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* User Directory Table */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0 mb-4">
          <CardTitle className="text-base font-bold text-slate-900">
            Registered Users ({users.length})
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Review credentials, verify profiles to grant high-trust badges, or suspend accounts for policy violations.
          </CardDescription>
        </CardHeader>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
            Loading registered accounts...
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No accounts found matching the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{u.full_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {u.district ? `${u.district}, ${u.state}` : u.state || 'India'}
                    </td>
                    <td className="py-3.5 px-4">
                      {getVerificationBadge(u.verification_status)}
                      {u.verified_at && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(u.verified_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-bold ${u.status === 'ACTIVE' ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.verification_status !== 'VERIFIED' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedUser(u);
                              setVerifyModalOpen(true);
                            }}
                            className="h-7 px-2 text-[11px] bg-emerald-700 hover:bg-emerald-800 text-white gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Verify</span>
                          </Button>
                        )}

                        {u.verification_status === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(u);
                              setRejectModalOpen(true);
                            }}
                            className="h-7 px-2 text-[11px] text-rose-600 border-rose-200 hover:bg-rose-50 gap-1"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Reject</span>
                          </Button>
                        )}

                        {u.status === 'ACTIVE' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(u);
                              setSuspendModalOpen(true);
                            }}
                            className="h-7 px-2 text-[11px] text-amber-600 border-amber-200 hover:bg-amber-50"
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActivate(u.id)}
                            className="h-7 px-2 text-[11px] text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          >
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Verify User Modal */}
      <Modal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        title={`Verify ${selectedUser?.full_name}`}
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-500">
            Confirming will mark this account as <span className="font-bold text-emerald-700">VERIFIED</span>. A verification badge will be displayed across their listings, offers, and profile.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Admin Verification Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={verifyNotes}
              onChange={(e) => setVerifyNotes(e.target.value)}
              placeholder="e.g., Aadhaar verified, Kisan Credit Card matched, Store registration license confirmed..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setVerifyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={actionLoading}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {actionLoading ? 'Verifying...' : 'Confirm Verification'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Verification Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={`Reject Verification: ${selectedUser?.full_name}`}
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-500">
            Provide the reason why this applicant does not satisfy verification criteria. The user will be notified.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Rejection Reason *
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Land registry document illegible, Phone number unverified, Missing dealer license..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={actionLoading}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Suspend User Modal */}
      <Modal
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        title={`Suspend Account: ${selectedUser?.full_name}`}
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-500">
            Suspended accounts cannot create listings, submit requirements, make offers, or access trading features.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Suspension Duration (Days)
            </label>
            <input
              type="number"
              min={1}
              max={365}
              value={suspendDays}
              onChange={(e) => setSuspendDays(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reason for Suspension *
            </label>
            <textarea
              rows={3}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="e.g., Repeated order default, false listing reports, violating community standards..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setSuspendModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSuspend}
              disabled={actionLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {actionLoading ? 'Suspending...' : 'Suspend Account'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

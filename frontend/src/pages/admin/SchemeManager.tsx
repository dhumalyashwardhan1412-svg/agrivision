import React, { useEffect, useState } from 'react';
import {
  Landmark,
  Plus,
  CheckCircle,
  ExternalLink,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { adminV3Api } from '../../services/adminV3Api';
import { GovernmentScheme, SchemeCategory, GovernmentType } from '../../types';

export const SchemeManager: React.FC = () => {
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Create / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    scheme_code: '',
    government_type: 'CENTRAL' as GovernmentType,
    state: 'All India',
    category: 'SUBSIDY' as SchemeCategory,
    short_description: '',
    benefits: '',
    eligibility_criteria_text: '',
    eligible_farmer_categories: 'ALL',
    eligible_crops: 'ALL',
    min_land_acres: 0,
    max_land_acres: 50,
    required_documents: 'Aadhaar, Land Registry 7/12, Bank Passbook',
    official_website_url: '',
    application_url: '',
    is_active: true
  });

  const [actionLoading, setActionLoading] = useState(false);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminV3Api.getSchemes();
      setSchemes(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch government schemes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setSelectedSchemeId(null);
    setFormData({
      name: '',
      scheme_code: '',
      government_type: 'CENTRAL',
      state: 'All India',
      category: 'SUBSIDY',
      short_description: '',
      benefits: '',
      eligibility_criteria_text: '',
      eligible_farmer_categories: 'ALL',
      eligible_crops: 'ALL',
      min_land_acres: 0,
      max_land_acres: 50,
      required_documents: 'Aadhaar, Land Registry 7/12, Bank Passbook',
      official_website_url: '',
      application_url: '',
      is_active: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (s: GovernmentScheme) => {
    setIsEditing(true);
    setSelectedSchemeId(s.id);
    setFormData({
      name: s.name,
      scheme_code: s.scheme_code,
      government_type: s.government_type,
      state: s.state,
      category: s.category,
      short_description: s.short_description,
      benefits: s.benefits,
      eligibility_criteria_text: s.eligibility_criteria_text,
      eligible_farmer_categories: s.eligible_farmer_categories,
      eligible_crops: s.eligible_crops,
      min_land_acres: s.min_land_acres,
      max_land_acres: s.max_land_acres || 50,
      required_documents: s.required_documents,
      official_website_url: s.official_website_url || '',
      application_url: s.application_url || '',
      is_active: s.is_active
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      if (isEditing && selectedSchemeId) {
        await adminV3Api.updateScheme(selectedSchemeId, formData);
      } else {
        await adminV3Api.createScheme(formData);
      }
      setModalOpen(false);
      await fetchSchemes();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save scheme.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async (id: number) => {
    try {
      setActionLoading(true);
      await adminV3Api.verifyScheme(id);
      await fetchSchemes();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to verify scheme.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to deactivate/delete this scheme?')) return;
    try {
      setActionLoading(true);
      await adminV3Api.deleteScheme(id);
      await fetchSchemes();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete scheme.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSchemes = schemes.filter((s) => {
    const matchesCategory = categoryFilter === 'ALL' || s.category === categoryFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.scheme_code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Government Schemes Registry
            </h1>
            <Badge variant="purple" size="sm">Admin Scheme Governance</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain verified Central & State agricultural welfare initiatives with official portal links and eligibility rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleOpenAdd} className="bg-purple-700 hover:bg-purple-800 text-white gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add Official Scheme</span>
          </Button>
          <Button onClick={fetchSchemes} disabled={loading} variant="outline" className="gap-1.5">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
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
            placeholder="Search scheme name, state, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All Categories</option>
            <option value="SUBSIDY">Subsidies</option>
            <option value="INSURANCE">Crop Insurance</option>
            <option value="LOAN_CREDIT">Kisan Loans & Credit</option>
            <option value="EQUIPMENT">Machinery / SMAM</option>
            <option value="IRRIGATION">Micro-Irrigation</option>
            <option value="CROP_SUPPORT">Direct Crop Support</option>
          </select>
        </div>
      </Card>

      {/* Schemes List */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0 mb-4">
          <CardTitle className="text-base font-bold text-slate-900">
            Registered Schemes ({filteredSchemes.length})
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Every scheme must point to genuine government portals (.gov.in / .nic.in) and undergo official timestamp verification.
          </CardDescription>
        </CardHeader>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
            Loading schemes directory...
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No schemes found matching the search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Scheme Details</th>
                  <th className="py-3 px-4">Type / Jurisdiction</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Key Benefits</th>
                  <th className="py-3 px-4">Official Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredSchemes.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{s.scheme_code}</div>
                      {s.official_website_url && (
                        <a
                          href={s.official_website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-sky-700 hover:underline mt-1 font-semibold"
                        >
                          <ExternalLink className="w-3 h-3" /> Official Portal
                        </a>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={s.government_type === 'CENTRAL' ? 'blue' : 'purple'} size="sm">
                        {s.government_type}
                      </Badge>
                      <div className="text-[11px] text-slate-500 mt-1">{s.state}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-600 line-clamp-2">
                      {s.benefits}
                    </td>
                    <td className="py-3.5 px-4">
                      {s.is_verified ? (
                        <div>
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5" /> Verified
                          </span>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {s.last_verified_date || 'Active'}
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleVerify(s.id)}
                          className="h-6 px-2 text-[10px] bg-emerald-700 hover:bg-emerald-800 text-white gap-1"
                        >
                          <ShieldCheck className="w-3 h-3" /> Verify Now
                        </Button>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(s)}
                          className="h-7 px-2 text-[11px] gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(s.id)}
                          className="h-7 px-2 text-[11px] text-rose-600 border-rose-200 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Scheme Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Government Scheme' : 'Register New Government Scheme'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 max-h-[75vh] overflow-y-auto px-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Scheme Title *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Pradhan Mantri Fasal Bima Yojana"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Scheme Code *</label>
              <input
                type="text"
                required
                value={formData.scheme_code}
                onChange={(e) => setFormData({ ...formData, scheme_code: e.target.value })}
                placeholder="e.g. PMFBY-CENTRAL"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Government Level</label>
              <select
                value={formData.government_type}
                onChange={(e) => setFormData({ ...formData, government_type: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
              >
                <option value="CENTRAL">Central Government</option>
                <option value="STATE">State Government</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jurisdiction / State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. All India or Maharashtra"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
              >
                <option value="SUBSIDY">Subsidy</option>
                <option value="INSURANCE">Crop Insurance</option>
                <option value="LOAN_CREDIT">Loan / Credit</option>
                <option value="EQUIPMENT">Equipment</option>
                <option value="IRRIGATION">Irrigation</option>
                <option value="CROP_SUPPORT">Crop Support</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Short Summary / Highlights *</label>
            <input
              type="text"
              required
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              placeholder="1-2 sentences summarizing the core objective"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Direct Financial & Equipment Benefits *</label>
            <textarea
              rows={2}
              required
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              placeholder="e.g. Up to 50% subsidy on tractor/rotavator; ₹6,000 yearly income support in 3 tranches"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Eligibility Criteria Details *</label>
            <textarea
              rows={2}
              required
              value={formData.eligibility_criteria_text}
              onChange={(e) => setFormData({ ...formData, eligibility_criteria_text: e.target.value })}
              placeholder="Specific farmer eligibility, landholding guidelines, crop conditions"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Portal URL (.gov.in) *</label>
              <input
                type="url"
                required
                value={formData.official_website_url}
                onChange={(e) => setFormData({ ...formData, official_website_url: e.target.value })}
                placeholder="https://pmkisan.gov.in"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Online Application URL</label>
              <input
                type="url"
                value={formData.application_url}
                onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
                placeholder="https://pmkisan.gov.in/RegistrationForm.aspx"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Required Documents</label>
            <input
              type="text"
              value={formData.required_documents}
              onChange={(e) => setFormData({ ...formData, required_documents: e.target.value })}
              placeholder="e.g. Aadhaar Card, Land Record 7/12, Bank Account"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={actionLoading} className="bg-purple-700 hover:bg-purple-800 text-white">
              {actionLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish Scheme'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

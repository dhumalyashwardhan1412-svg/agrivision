import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FilePlus,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { requirementsApi } from '../../services/requirementsApi';
import { offersApi } from '../../services/offersApi';
import { BuyerRequirement, MatchedFarmerItem } from '../../types';
import { MatchingFarmersModal } from '../../components/common/MatchingFarmersModal';

export const MyRequirements: React.FC = () => {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Matching Modal state
  const [activeReq, setActiveReq] = useState<BuyerRequirement | null>(null);
  const [matches, setMatches] = useState<MatchedFarmerItem[]>([]);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState<boolean>(false);
  const [fetchingMatches, setFetchingMatches] = useState<boolean>(false);

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const data = await requirementsApi.listRequirements({ my_only: true });
      setRequirements(data);
    } catch (err) {
      console.error('Failed to load buyer requirements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const handleOpenMatches = async (req: BuyerRequirement) => {
    setActiveReq(req);
    setIsMatchModalOpen(true);
    setFetchingMatches(true);
    try {
      const matched = await requirementsApi.getMatchingFarmers(req.id);
      setMatches(matched);
    } catch (err) {
      console.error('Failed to get matching farmers:', err);
    } finally {
      setFetchingMatches(false);
    }
  };

  const handleCloseRequirement = async (id: number) => {
    if (!window.confirm('Are you sure you want to close this purchase requirement?')) return;
    try {
      const updated = await requirementsApi.closeRequirement(id);
      setRequirements((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      alert('Failed to close requirement');
    }
  };

  const handleSendOfferToMatch = async (match: MatchedFarmerItem) => {
    if (!activeReq) return;
    try {
      await offersApi.createOffer({
        requirement_id: activeReq.id,
        listing_id: match.listing_id,
        farmer_id: match.farmer_id,
        produce_name: match.crop_name,
        quantity: Math.min(match.available_quantity, activeReq.quantity),
        unit: activeReq.unit,
        offered_price: activeReq.target_price,
        delivery_preference: activeReq.delivery_preference,
        message: `Direct proposal from requirement: ${activeReq.title}`
      });
      alert(`Offer sent to ${match.farmer_name}!`);
      setIsMatchModalOpen(false);
      navigate('/customer/offers');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to send offer');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-6 rounded-2xl shadow-lg">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-[11px] font-bold tracking-wide uppercase">
            Buyer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">My Sourcing Requirements</h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl">
            Manage your open purchase orders, match verified regional farmer produce listings, and initiate direct negotiations.
          </p>
        </div>

        <Link
          to="/customer/post-requirement"
          className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-950/30"
        >
          <FilePlus className="w-4 h-4" />
          <span>Post New Requirement</span>
        </Link>
      </div>

      {/* Requirements List */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto text-emerald-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading your purchase requirements...</p>
        </div>
      ) : requirements.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-4">
          <Package className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No requirements posted yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Post your first commodity purchase requirement to automatically discover matched farmers and receive direct offers.
          </p>
          <Link
            to="/customer/post-requirement"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <FilePlus className="w-4 h-4" />
            <span>Post Requirement Now</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {req.crop_name}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        req.status === 'OPEN'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{req.title}</h3>
                  {req.variety && (
                    <span className="text-xs text-slate-500 block">Variety: {req.variety}</span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Target Price</span>
                  <span className="text-xl font-black text-emerald-700">
                    ₹{req.target_price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500 font-medium"> /{req.unit}</span>
                </div>
              </div>

              {/* Requirement Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Quantity Needed:</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {req.quantity} {req.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Quality Grade:</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {req.min_quality_grade}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Location:</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {req.location_city}, {req.state}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Delivery Mode:</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {req.delivery_preference}
                  </span>
                </div>
              </div>

              {req.description && (
                <p className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                  {req.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Posted {new Date(req.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  {req.status === 'OPEN' && (
                    <button
                      onClick={() => handleCloseRequirement(req.id)}
                      className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition"
                    >
                      Close Order
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenMatches(req)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>View Matching Farmers</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Matching Farmers Modal */}
      {activeReq && (
        <MatchingFarmersModal
          requirement={activeReq}
          matches={matches}
          isOpen={isMatchModalOpen}
          onClose={() => setIsMatchModalOpen(false)}
          onSendOffer={handleSendOfferToMatch}
        />
      )}
    </div>
  );
};
export default MyRequirements;

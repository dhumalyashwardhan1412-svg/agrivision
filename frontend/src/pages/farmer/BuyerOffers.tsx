import React, { useState, useEffect } from 'react';
import {
  Inbox,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  MapPin,
  Star,
  DollarSign,
  Package,
  RefreshCw,
  Send,
  Check,
  Calendar
} from 'lucide-react';
import { offersApi, CounterOfferInput } from '../../services/offersApi';
import { requirementsApi } from '../../services/requirementsApi';
import { reviewsApi } from '../../services/reviewsApi';
import { Offer, OfferStatus, FarmerBuyerRequirement } from '../../types';
import { NegotiationTimeline } from '../../components/common/NegotiationTimeline';
import { StarRating } from '../../components/common/StarRating';

export const FarmerBuyerOffers: React.FC = () => {
  // Main Tab: 'requirements' | 'negotiations'
  const [activeTab, setActiveTab] = useState<'requirements' | 'negotiations'>('requirements');

  // Buyer Requirements State
  const [requirements, setRequirements] = useState<FarmerBuyerRequirement[]>([]);
  const [loadingRequirements, setLoadingRequirements] = useState<boolean>(true);
  const [reqCropFilter, setReqCropFilter] = useState<string>('');

  // Counter Requirement Modal
  const [counteringReq, setCounteringReq] = useState<FarmerBuyerRequirement | null>(null);
  const [counterReqPrice, setCounterReqPrice] = useState<number>(0);
  const [counterReqQuantity, setCounterReqQuantity] = useState<number>(0);
  const [counterReqMessage, setCounterReqMessage] = useState<string>('');
  const [submittingReqCounter, setSubmittingReqCounter] = useState<boolean>(false);

  // Offers State
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Counter Offer Modal (for existing negotiation)
  const [counteringOffer, setCounteringOffer] = useState<Offer | null>(null);
  const [counterPrice, setCounterPrice] = useState<number>(0);
  const [counterMessage, setCounterMessage] = useState<string>('');
  const [submittingCounter, setSubmittingCounter] = useState<boolean>(false);

  // Review Modal
  const [reviewingOffer, setReviewingOffer] = useState<Offer | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [commRating, setCommRating] = useState<number>(5);
  const [payRating, setPayRating] = useState<number>(5);
  const [delRating, setDelRating] = useState<number>(5);
  const [profRating, setProfRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  // View Submitted Review Modal
  const [viewingReviewOffer, setViewingReviewOffer] = useState<Offer | null>(null);
  const [viewingReviewDetails, setViewingReviewDetails] = useState<any | null>(null);
  const [loadingReviewDetails, setLoadingReviewDetails] = useState<boolean>(false);

  const handleOpenReview = (offer: Offer) => {
    setReviewingOffer(offer);
    setReviewRating(5);
    setCommRating(5);
    setPayRating(5);
    setDelRating(5);
    setProfRating(5);
    setReviewComment('');
    setReviewSuccess(false);
  };

  const handleViewReview = async (offer: Offer) => {
    setViewingReviewOffer(offer);
    setLoadingReviewDetails(true);
    try {
      const targetUserId = offer.buyer_user_id || offer.buyer_id;
      if (targetUserId) {
        const revs = await reviewsApi.getUserReviews(targetUserId);
        const match = revs.find((r) => r.offer_id === offer.id);
        setViewingReviewDetails(match || null);
      }
    } catch {
      setViewingReviewDetails(null);
    } finally {
      setLoadingReviewDetails(false);
    }
  };

  const fetchRequirements = async () => {
    setLoadingRequirements(true);
    try {
      const data = await requirementsApi.getFarmerBuyerRequirements();
      setRequirements(data);
    } catch (err) {
      console.error('Failed to load buyer requirements:', err);
    } finally {
      setLoadingRequirements(false);
    }
  };

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const data = await offersApi.getOffers();
      setOffers(data);
    } catch (err) {
      console.error('Failed to load offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
    fetchOffers();
  }, []);

  const handleRefreshAll = async () => {
    await Promise.all([fetchRequirements(), fetchOffers()]);
  };

  const handleAcceptRequirement = async (req: FarmerBuyerRequirement) => {
    if (!window.confirm(`Accept buyer target terms for ${req.quantity} ${req.unit} of ${req.crop_name} at ₹${req.target_price.toLocaleString('en-IN')}/${req.unit}?`)) {
      return;
    }
    try {
      const newOffer = await requirementsApi.acceptRequirementPrice(req.id);
      alert(`Deal accepted! Offer #${newOffer.offer_code} has been created with ${req.buyer_name}.`);
      await Promise.all([fetchRequirements(), fetchOffers()]);
      setActiveTab('negotiations');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to accept buyer requirement');
    }
  };

  const handleOpenCounterReq = (req: FarmerBuyerRequirement) => {
    setCounteringReq(req);
    setCounterReqPrice(req.target_price);
    setCounterReqQuantity(req.quantity);
    setCounterReqMessage('');
  };

  const handleSubmitCounterReq = async () => {
    if (!counteringReq || counterReqPrice <= 0) return;
    setSubmittingReqCounter(true);
    try {
      const newOffer = await requirementsApi.counterRequirement(counteringReq.id, {
        counter_price: counterReqPrice,
        quantity: counterReqQuantity || counteringReq.quantity,
        message: counterReqMessage
      });
      alert(`Counter-offer of ₹${counterReqPrice.toLocaleString('en-IN')}/${counteringReq.unit} sent directly to ${counteringReq.buyer_name}!`);
      setCounteringReq(null);
      await Promise.all([fetchRequirements(), fetchOffers()]);
      setActiveTab('negotiations');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit counter-offer');
    } finally {
      setSubmittingReqCounter(false);
    }
  };


  const handleAccept = async (offer: Offer) => {
    if (!window.confirm(`Accept offer for ${offer.quantity} ${offer.unit} at ₹${offer.offered_price}/${offer.unit}?`)) {
      return;
    }
    try {
      const updated = await offersApi.acceptOffer(offer.id);
      setOffers((prev) => prev.map((o) => (o.id === offer.id ? updated : o)));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to accept offer');
    }
  };

  const handleReject = async (offer: Offer) => {
    if (!window.confirm('Decline this offer?')) return;
    try {
      const updated = await offersApi.rejectOffer(offer.id);
      setOffers((prev) => prev.map((o) => (o.id === offer.id ? updated : o)));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to decline offer');
    }
  };

  const handleComplete = async (offer: Offer) => {
    if (!window.confirm('Mark this harvest dispatch as delivered and completed?')) return;
    try {
      const updated = await offersApi.completeOffer(offer.id);
      setOffers((prev) => prev.map((o) => (o.id === offer.id ? updated : o)));
      setReviewingOffer(updated);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to complete transaction');
    }
  };

  const handleOpenCounter = (offer: Offer) => {
    setCounteringOffer(offer);
    setCounterPrice(offer.offered_price);
    setCounterMessage('');
  };

  const submitCounter = async () => {
    if (!counteringOffer || counterPrice <= 0) return;
    setSubmittingCounter(true);
    try {
      const updated = await offersApi.counterOffer(counteringOffer.id, {
        counter_price: counterPrice,
        message: counterMessage
      });
      setOffers((prev) => prev.map((o) => (o.id === counteringOffer.id ? updated : o)));
      setCounteringOffer(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to send counter offer');
    } finally {
      setSubmittingCounter(false);
    }
  };

  const submitReview = async () => {
    if (!reviewingOffer) return;
    const targetUserId = reviewingOffer.buyer_user_id || reviewingOffer.buyer_id;
    if (!targetUserId) {
      alert('Buyer account information not found for this offer.');
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewsApi.submitReview({
        review_type: 'FARMER_TO_BUYER',
        offer_id: reviewingOffer.id,
        target_user_id: targetUserId,
        rating: reviewRating,
        category_ratings: {
          'Communication': commRating,
          'Payment Reliability': payRating,
          'Pickup / Delivery Experience': delRating,
          'Professional Behaviour': profRating,
          'Overall': reviewRating
        },
        comment: reviewComment
      });
      setReviewSuccess(true);
      setOffers((prev) =>
        prev.map((o) =>
          o.id === reviewingOffer.id
            ? { ...o, farmer_reviewed: true, farmer_rating_given: reviewRating }
            : o
        )
      );
      setTimeout(() => {
        setReviewingOffer(null);
        setReviewSuccess(false);
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit rating');
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredOffers = offers.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    return true;
  });

  const filteredRequirements = requirements.filter((r) => {
    if (reqCropFilter.trim()) {
      const q = reqCropFilter.toLowerCase();
      return (
        r.crop_name.toLowerCase().includes(q) ||
        (r.variety && r.variety.toLowerCase().includes(q)) ||
        r.location_city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-6 rounded-2xl shadow-lg">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-[11px] font-bold tracking-wide uppercase">
            Direct Trade Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">Buyer Requirements & Price Negotiations</h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl">
            Browse open crop procurement requirements from verified commercial buyers or manage active direct trade negotiations and deliveries without middlemen.
          </p>
        </div>

        <button
          onClick={handleRefreshAll}
          disabled={loading || loadingRequirements}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading || loadingRequirements ? 'animate-spin' : ''}`} />
          <span>Refresh All</span>
        </button>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('requirements')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-black transition ${
            activeTab === 'requirements'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Open Buyer Sourcing Requirements</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'requirements' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-700'
          }`}>
            {requirements.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('negotiations')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-black transition ${
            activeTab === 'negotiations'
              ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>My Active Negotiations & Trades</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'negotiations' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
          }`}>
            {offers.length}
          </span>
        </button>
      </div>

      {activeTab === 'requirements' ? (
        <div className="space-y-5">
          {/* Search bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <input
                type="text"
                placeholder="Filter requirements by crop (e.g. Basmati Rice, Wheat), variety, or city..."
                value={reqCropFilter}
                onChange={(e) => setReqCropFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
            {reqCropFilter && (
              <button
                onClick={() => setReqCropFilter('')}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-1"
              >
                Clear
              </button>
            )}
            <span className="text-xs text-slate-400 font-medium">
              Showing {filteredRequirements.length} open {filteredRequirements.length === 1 ? 'demand' : 'demands'}
            </span>
          </div>

          {loadingRequirements ? (
            <div className="text-center py-16 space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto text-emerald-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-600">Loading open buyer requirements...</p>
            </div>
          ) : filteredRequirements.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-3">
              <Package className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="text-base font-bold text-slate-700">No open buyer requirements found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                When verified commercial buyers post crop purchase requirements matching your region, they will appear here in real-time for you to accept or propose counter-offers.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequirements.map((req) => (
                <div
                  key={req.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-4"
                >
                  {/* Card Header: Buyer details & status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                        {req.buyer_name ? req.buyer_name.charAt(0).toUpperCase() : 'B'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">{req.buyer_name}</span>
                          {req.buyer_verified && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Verified Buyer
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-slate-600">{req.buyer_rating || 4.9}</span>
                          <span>• Posted {new Date(req.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        req.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                      {req.has_my_offer && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          Offer Submitted
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Core Requirements Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Crop & Variety</span>
                      <span className="text-sm font-bold text-slate-800">{req.crop_name}</span>
                      {req.variety && <span className="text-[11px] text-slate-500 block">({req.variety})</span>}
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Buyer Target Price</span>
                      <span className="text-base font-black text-emerald-700">₹{req.target_price.toLocaleString('en-IN')}</span>
                      <span className="text-[11px] text-slate-500"> / {req.unit}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Quantity Needed</span>
                      <span className="text-sm font-bold text-slate-800">{req.quantity} {req.unit}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Target Location</span>
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{req.location_city}, {req.state}</span>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Details: Quality Grade & Delivery */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400">Quality Spec: </span>
                      <span className="font-semibold text-slate-700">{req.min_quality_grade}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Delivery Preference: </span>
                      <span className="font-semibold text-slate-700">{req.delivery_preference}</span>
                    </div>
                  </div>

                  {req.description && (
                    <p className="text-xs text-slate-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 italic">
                      "{req.description}"
                    </p>
                  )}

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-400">
                      Requirement #{req.id} • Commercial Sourcing
                    </div>

                    <div className="flex items-center gap-2">
                      {req.has_my_offer ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                            Your Offer: ₹{req.my_offered_price?.toLocaleString('en-IN')}/{req.unit} ({req.my_offer_status})
                          </span>
                          <button
                            onClick={() => setActiveTab('negotiations')}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
                          >
                            View in Negotiations →
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleOpenCounterReq(req)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Counter Offer</span>
                          </button>

                          <button
                            onClick={() => handleAcceptRequirement(req)}
                            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept Price (₹{req.target_price.toLocaleString('en-IN')}/{req.unit})</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['ALL', 'PENDING', 'COUNTERED', 'ACCEPTED', 'COMPLETED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {st === 'ALL' ? 'All Offers' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

      {/* Offers List */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto text-emerald-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading buyer proposals...</p>
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-3">
          <Inbox className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No buyer offers found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You currently have no buyer offers matching this status filter. Active produce listings and responses to buyer requirements will show here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-5"
            >
              {/* Offer Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {offer.offer_code}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        offer.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : offer.status === 'COUNTERED'
                          ? 'bg-amber-100 text-amber-800'
                          : offer.status === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-800'
                          : offer.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {offer.status === 'COMPLETED' ? 'Completed ✅' : offer.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{offer.produce_name}</h3>
                </div>

                {/* Offer Price Highlight */}
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium block">Current Offered Price</span>
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-2xl font-black text-emerald-700">
                      ₹{offer.offered_price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{offer.price_unit}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold block">
                    Total: ₹{(offer.offered_price * offer.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Offer Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Quantity</span>
                  <span className="font-bold text-slate-700">
                    {offer.quantity} {offer.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Buyer</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-700 truncate">{offer.buyer_name || 'Commercial Buyer'}</span>
                    <span className="flex items-center text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 rounded">
                      <Star className="w-2.5 h-2.5 fill-amber-500 mr-0.5" />
                      {offer.buyer_rating?.toFixed(1) || '5.0'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Delivery Mode</span>
                  <span className="font-bold text-slate-700 capitalize">
                    {offer.delivery_preference?.replace('_', ' ').toLowerCase() || 'Pickup'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Destination / Location</span>
                  <span className="font-bold text-slate-700 truncate">
                    {offer.location || 'Local Mandi / Hub'}
                  </span>
                </div>
              </div>

              {/* Negotiation History Timeline */}
              {offer.negotiations && offer.negotiations.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 block mb-3">Negotiation History</span>
                  <NegotiationTimeline negotiations={offer.negotiations} />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Received {new Date(offer.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  {offer.status === 'PENDING' || offer.status === 'COUNTERED' ? (
                    <>
                      <button
                        onClick={() => handleReject(offer)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>

                      <button
                        onClick={() => handleOpenCounter(offer)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Counter Price</span>
                      </button>

                      <button
                        onClick={() => handleAccept(offer)}
                        className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Offer</span>
                      </button>
                    </>
                  ) : offer.status === 'ACCEPTED' ? (
                    <button
                      onClick={() => handleComplete(offer)}
                      className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Mark Delivered & Rate Buyer</span>
                    </button>
                  ) : offer.status === 'COMPLETED' ? (
                    offer.farmer_reviewed ? (
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>Your Rating: {offer.farmer_rating_given || 5}/5</span>
                        </span>
                        <button
                          onClick={() => handleViewReview(offer)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                        >
                          View Review
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenReview(offer)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        <span>⭐ Rate Buyer</span>
                      </button>
                    )
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}

  {/* Counter Requirement Modal */}
  {counteringReq && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
        <h3 className="font-bold text-lg text-slate-800">
          Propose Counter-Offer to Buyer
        </h3>
        <p className="text-xs text-slate-500">
          Buyer: {counteringReq.buyer_name} • Sourcing {counteringReq.crop_name}
        </p>

        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-emerald-900 font-medium">Buyer Target Price:</span>
            <span className="font-bold text-emerald-800">₹{counteringReq.target_price.toLocaleString('en-IN')}/{counteringReq.unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-emerald-900 font-medium">Requested Quantity:</span>
            <span className="font-bold text-emerald-800">{counteringReq.quantity} {counteringReq.unit}</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Counter Price (₹/{counteringReq.unit})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={counterReqPrice}
                onChange={(e) => setCounterReqPrice(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Available Quantity You Can Supply ({counteringReq.unit})
            </label>
            <input
              type="number"
              value={counterReqQuantity}
              onChange={(e) => setCounterReqQuantity(Number(e.target.value))}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Message / Proposal Note to Buyer
            </label>
            <textarea
              rows={3}
              value={counterReqMessage}
              onChange={(e) => setCounterReqMessage(e.target.value)}
              placeholder="e.g. Can supply export-grade sorted Basmati at ₹2,350 with farmgate pickup in Pune."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={() => setCounteringReq(null)}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitCounterReq}
            disabled={submittingReqCounter || counterReqPrice <= 0}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {submittingReqCounter ? 'Submitting...' : 'Submit Counter Offer'}
          </button>
        </div>
      </div>
    </div>
  )}


      {/* Counter Offer Modal */}
      {counteringOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800">
              Propose Counter Offer
            </h3>
            <p className="text-xs text-slate-500">
              Offer Code: {counteringOffer.offer_code} • {counteringOffer.produce_name}
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Counter Asking Price (₹/{counteringOffer.unit})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message / Note to Buyer
                </label>
                <textarea
                  rows={3}
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  placeholder="e.g. Due to superior grade organic grading and crate packing, lowest viable price is ₹2,200/Qtl."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setCounteringOffer(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={submitCounter}
                disabled={submittingCounter || counterPrice <= 0}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                {submittingCounter ? 'Sending...' : 'Send Counter Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buyer Rating Modal */}
      {reviewingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800">
              Rate Buyer & Transaction
            </h3>
            <p className="text-xs text-slate-500">
              Buyer: {reviewingOffer.buyer_name || 'Commercial Buyer'} • {reviewingOffer.produce_name}
            </p>

            {reviewSuccess ? (
              <div className="text-center py-6 space-y-2 text-emerald-600">
                <Check className="w-10 h-10 mx-auto bg-emerald-100 p-2 rounded-full" />
                <h4 className="font-bold text-base">Rating Submitted!</h4>
                <p className="text-xs text-slate-500">Thank you for keeping AgriVision trade verified and trustworthy.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-700">Overall Experience</span>
                    <StarRating value={reviewRating} onChange={setReviewRating} size="md" />
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-700">Payment Reliability</span>
                    <StarRating value={payRating} onChange={setPayRating} size="sm" />
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-700">Communication & Conduct</span>
                    <StarRating value={commRating} onChange={setCommRating} size="sm" />
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-700">Logistics & Pickup Promptness</span>
                    <StarRating value={delRating} onChange={setDelRating} size="sm" />
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-700">Professional Behaviour</span>
                    <StarRating value={profRating} onChange={setProfRating} size="sm" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Review Comments
                    </label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Prompt payment, smooth pickup, clear communication..."
                      className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setReviewingOffer(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReview}
                    disabled={submittingReview}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Buyer Review'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* View Submitted Review Modal */}
      {viewingReviewOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-slate-800">
                  Rating for {viewingReviewOffer.buyer_name || 'Buyer'}
                </h3>
                <p className="text-xs text-slate-500">
                  Offer {viewingReviewOffer.offer_code} • {viewingReviewOffer.produce_name}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Completed ✅
              </span>
            </div>

            {loadingReviewDetails ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-600" />
                <span>Loading your verified review...</span>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">Overall Score</span>
                    <span className="text-2xl font-black text-emerald-800">
                      {(viewingReviewDetails?.rating || viewingReviewOffer.farmer_rating_given || 5).toFixed(1)}
                      <span className="text-sm font-semibold text-emerald-600"> / 5.0</span>
                    </span>
                  </div>
                  <StarRating
                    value={viewingReviewDetails?.rating || viewingReviewOffer.farmer_rating_given || 5}
                    size="md"
                    readOnly
                  />
                </div>

                {/* Category breakdown */}
                {viewingReviewDetails?.category_ratings && (
                  <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-700 block">Category Ratings:</span>
                    {Object.entries(viewingReviewDetails.category_ratings).map(([cat, val]: [string, any]) => (
                      <div key={cat} className="flex items-center justify-between text-xs text-slate-600">
                        <span>{cat}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="font-bold text-slate-800">{val}/5</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {viewingReviewDetails?.comment && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700">
                    <span className="font-bold block mb-1 text-slate-900">Your Feedback:</span>
                    <p className="italic text-slate-600">"{viewingReviewDetails.comment}"</p>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setViewingReviewOffer(null);
                      setViewingReviewDetails(null);
                    }}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default FarmerBuyerOffers;

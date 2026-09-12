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
  Package,
  RefreshCw,
  Send,
  Check
} from 'lucide-react';
import { offersApi } from '../../services/offersApi';
import { reviewsApi } from '../../services/reviewsApi';
import { Offer } from '../../types';
import { NegotiationTimeline } from '../../components/common/NegotiationTimeline';
import { StarRating } from '../../components/common/StarRating';

export const CustomerBuyerOffers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Counter Modal
  const [counteringOffer, setCounteringOffer] = useState<Offer | null>(null);
  const [counterPrice, setCounterPrice] = useState<number>(0);
  const [counterMessage, setCounterMessage] = useState<string>('');
  const [submittingCounter, setSubmittingCounter] = useState<boolean>(false);

  // Review Modal
  const [reviewingOffer, setReviewingOffer] = useState<Offer | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [commRating, setCommRating] = useState<number>(5);
  const [qualRating, setQualRating] = useState<number>(5);
  const [delRating, setDelRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

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
    fetchOffers();
  }, []);

  const handleAccept = async (offer: Offer) => {
    if (!window.confirm(`Accept final terms at ₹${offer.offered_price}/${offer.unit}?`)) {
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
    if (!window.confirm(`Decline this proposal for ${offer.produce_name}?`)) return;
    try {
      const updated = await offersApi.rejectOffer(offer.id);
      setOffers((prev) => prev.map((o) => (o.id === offer.id ? updated : o)));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to decline offer');
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
    setSubmittingReview(true);
    try {
      await reviewsApi.submitReview({
        review_type: 'BUYER_TO_FARMER',
        offer_id: reviewingOffer.id,
        target_user_id: reviewingOffer.farmer_user_id || reviewingOffer.farmer_id,
        rating: reviewRating,
        category_ratings: {
          Communication: commRating,
          'Produce Quality': qualRating,
          Delivery: delRating,
          Overall: reviewRating
        },
        comment: reviewComment
      });
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewingOffer(null);
        setReviewSuccess(false);
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit farmer rating');
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredOffers = offers.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
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
          <h1 className="text-2xl sm:text-3xl font-black">Negotiations & Offers with Farmers</h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl">
            Track direct farmer proposals, counter-offer prices, inspect quality grades, and rate growers upon successful delivery.
          </p>
        </div>

        <button
          onClick={fetchOffers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Offers</span>
        </button>
      </div>

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
          <p className="text-sm font-semibold text-slate-600">Loading your direct offers...</p>
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-3">
          <Inbox className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No active offers found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You have no negotiations matching this filter. Send offers to farmers from your requirements or browse marketplace listings.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-5"
            >
              {/* Header */}
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
                      {offer.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{offer.produce_name}</h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium block">Current Price</span>
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

              {/* Deal Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Quantity:</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {offer.quantity} {offer.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Farmer:</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {offer.farmer_name || 'Verified Farmer'}
                  </span>
                  {offer.farmer_phone && (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" /> {offer.farmer_phone}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Delivery Preference:</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {offer.delivery_preference}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Farm Location:</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {offer.location || 'Local Farm'}
                  </span>
                </div>
              </div>

              {/* Negotiation Timeline */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Timeline & Communication
                </h4>
                <NegotiationTimeline negotiations={offer.negotiations} />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-400">
                  Last active: {new Date(offer.created_at).toLocaleDateString()}
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
                        <span>Counter Offer</span>
                      </button>

                      <button
                        onClick={() => handleAccept(offer)}
                        className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Price</span>
                      </button>
                    </>
                  ) : offer.status === 'COMPLETED' || offer.status === 'ACCEPTED' ? (
                    <button
                      onClick={() => setReviewingOffer(offer)}
                      className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                      <span>Rate Farmer Produce & Delivery</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Counter Offer Modal */}
      {counteringOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800">
              Propose Counter Price
            </h3>
            <p className="text-xs text-slate-500">
              Offer Code: {counteringOffer.offer_code} • {counteringOffer.produce_name}
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Counter Price (₹/{counteringOffer.unit})
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
                  Message to Farmer
                </label>
                <textarea
                  rows={3}
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  placeholder="e.g. Willing to purchase entire lot if price is ₹2,100 with farmgate pickup on Thursday."
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

      {/* Farmer Rating Modal */}
      {reviewingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800">
              Rate Farmer & Harvest Quality
            </h3>
            <p className="text-xs text-slate-500">
              Farmer: {reviewingOffer.farmer_name || 'Grower'} • {reviewingOffer.produce_name}
            </p>

            {reviewSuccess ? (
              <div className="text-center py-6 space-y-2 text-emerald-600">
                <Check className="w-10 h-10 mx-auto bg-emerald-100 p-2 rounded-full" />
                <h4 className="font-bold text-base">Farmer Review Submitted!</h4>
                <p className="text-xs text-slate-500">Your feedback builds reputation and fair pricing across AgriVision.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-700">Overall Rating</span>
                    <StarRating value={reviewRating} onChange={setReviewRating} size="md" />
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-700">Produce Freshness & Quality</span>
                    <StarRating value={qualRating} onChange={setQualRating} size="sm" />
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-700">Communication & Responsiveness</span>
                    <StarRating value={commRating} onChange={setCommRating} size="sm" />
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-700">Delivery & Handover Promptness</span>
                    <StarRating value={delRating} onChange={setDelRating} size="sm" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Review Comments
                    </label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Produce was fresh, neatly packed, and accurate weights verified..."
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
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default CustomerBuyerOffers;

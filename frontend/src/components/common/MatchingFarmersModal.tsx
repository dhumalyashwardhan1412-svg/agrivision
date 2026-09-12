import React from 'react';
import { X, CheckCircle2, MapPin, Tag, Package, Send, Star } from 'lucide-react';
import { MatchedFarmerItem, BuyerRequirement } from '../../types';

interface MatchingFarmersModalProps {
  requirement: BuyerRequirement;
  matches: MatchedFarmerItem[];
  isOpen: boolean;
  onClose: () => void;
  onSendOffer: (match: MatchedFarmerItem) => void;
}

export const MatchingFarmersModal: React.FC<MatchingFarmersModalProps> = ({
  requirement,
  matches,
  isOpen,
  onClose,
  onSendOffer
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Target Requirement Match
            </span>
            <h2 className="text-xl font-bold text-slate-800 mt-1">
              Matching Farmers for: {requirement.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Target: {requirement.quantity} {requirement.unit} of {requirement.crop_name} @ ₹{requirement.target_price}/{requirement.unit}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matches List */}
        {matches.length === 0 ? (
          <div className="text-center py-10 text-slate-500 space-y-2">
            <Package className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No Direct Farmer Listings Found</p>
            <p className="text-xs max-w-md mx-auto">
              Currently no active farmer listings match {requirement.crop_name} in this region. Farmers will receive your requirement on the marketplace.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((m) => (
              <div
                key={m.listing_id}
                className="bg-slate-50 hover:bg-slate-50/80 border border-slate-200 rounded-xl p-4 transition space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-slate-800">{m.farmer_name}</h4>
                      <div className="flex items-center gap-0.5 text-xs font-semibold text-amber-500 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{m.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{m.farm_location}</span>
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <span className="text-xs uppercase font-bold text-slate-400 block">Match Score</span>
                      <span className="text-xl font-black text-emerald-600">{m.match_score}%</span>
                    </div>
                    <button
                      onClick={() => onSendOffer(m)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Offer</span>
                    </button>
                  </div>
                </div>

                {/* Offer Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                  <div>
                    <span className="text-slate-400 block">Available:</span>
                    <span className="font-semibold text-slate-700">{m.available_quantity} {m.unit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Asking Price:</span>
                    <span className="font-bold text-emerald-700">₹{m.asking_price}/{m.unit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Variety:</span>
                    <span className="font-medium text-slate-700">{m.variety || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Quality Grade:</span>
                    <span className="font-medium text-slate-700">{m.quality_grade}</span>
                  </div>
                </div>

                {/* Match Breakdown Criteria */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {m.match_breakdown.map((rule, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      {rule}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { CheckCircle2, XCircle, ArrowRightLeft, Send, Clock, User } from 'lucide-react';
import { OfferNegotiation, NegotiationActionType } from '../../types';

interface NegotiationTimelineProps {
  negotiations: OfferNegotiation[];
}

export const NegotiationTimeline: React.FC<NegotiationTimelineProps> = ({ negotiations }) => {
  if (!negotiations || negotiations.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-slate-500">
        No negotiation activity recorded yet.
      </div>
    );
  }

  const getActionBadge = (action: NegotiationActionType) => {
    switch (action) {
      case 'OFFER_MADE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
            <Send className="w-3 h-3" /> Offer Submitted
          </span>
        );
      case 'COUNTERED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
            <ArrowRightLeft className="w-3 h-3" /> Counter Proposed
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Offer Accepted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3" /> Offer Declined
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
      {negotiations.map((neg, idx) => (
        <div key={neg.id || idx} className="relative flex items-start gap-4">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white border-2 border-emerald-500 text-emerald-600 z-10 shadow-sm">
            <User className="w-3.5 h-3.5" />
          </div>

          <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800">
                  {neg.sender_name || (neg.sender_role === 'FARMER' ? 'Farmer' : 'Buyer')}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                  {neg.sender_role}
                </span>
                {getActionBadge(neg.action_type)}
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                {new Date(neg.created_at).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            <div className="flex items-baseline gap-4 pt-1 border-t border-slate-100 text-sm">
              <div>
                <span className="text-xs text-slate-400">Price: </span>
                <span className="font-bold text-emerald-700">₹{neg.offered_price.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400">Quantity: </span>
                <span className="font-semibold text-slate-700">{neg.quantity} Qtl</span>
              </div>
            </div>

            {neg.message && (
              <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                "{neg.message}"
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

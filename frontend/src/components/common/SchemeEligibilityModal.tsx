import React from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, ExternalLink, ShieldCheck, FileText } from 'lucide-react';
import { GovernmentScheme, SchemeEligibilityResult } from '../../types';

interface SchemeEligibilityModalProps {
  scheme: GovernmentScheme;
  result: SchemeEligibilityResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SchemeEligibilityModal: React.FC<SchemeEligibilityModalProps> = ({
  scheme,
  result,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const isEligible = result?.status === 'ELIGIBLE';
  const isPossibly = result?.status === 'POSSIBLY_ELIGIBLE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {scheme.category}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {scheme.government_type} • {scheme.state}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mt-1">{scheme.name}</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Code: {scheme.scheme_code}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Eligibility Status Banner */}
        {result && (
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
            isEligible
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : isPossibly
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-3">
              {isEligible ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
              ) : isPossibly ? (
                <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0" />
              ) : (
                <XCircle className="w-7 h-7 text-rose-600 shrink-0" />
              )}
              <div>
                <h4 className="font-bold text-base">
                  {isEligible
                    ? 'Eligible for this Scheme'
                    : isPossibly
                    ? 'Conditionally / Possibly Eligible'
                    : 'Currently Ineligible'}
                </h4>
                <p className="text-xs opacity-90">
                  {isEligible
                    ? 'Your farm profile matches all core criteria requirements.'
                    : isPossibly
                    ? 'Some requirements may need additional paperwork or verification.'
                    : 'Your registered land area, crop, or state does not match prerequisites.'}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-2xl font-black">{Math.round(result.score_percentage)}%</span>
              <span className="block text-[10px] uppercase font-bold tracking-wider opacity-70">Match Score</span>
            </div>
          </div>
        )}

        {/* Benefits Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Financial & Material Benefits
          </h4>
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
            {scheme.benefits}
          </p>
        </div>

        {/* Criteria Evaluation */}
        {result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Matched Criteria ({result.matched_criteria.length})
              </h5>
              <div className="space-y-1.5">
                {result.matched_criteria.map((item, idx) => (
                  <div key={idx} className="text-xs text-slate-700 bg-emerald-50/50 border border-emerald-100 p-2 rounded-lg">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Unmatched / Cautions */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Unmatched / Requirements ({result.unmatched_criteria.length})
              </h5>
              <div className="space-y-1.5">
                {result.unmatched_criteria.length > 0 ? (
                  result.unmatched_criteria.map((item, idx) => (
                    <div key={idx} className="text-xs text-slate-600 bg-amber-50/40 border border-amber-100 p-2 rounded-lg">
                      {item}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 italic p-2 bg-slate-50 rounded-lg">
                    No disqualifying criteria detected.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Required Documents */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Mandatory Documents Needed
          </h4>
          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            {scheme.required_documents}
          </p>
        </div>

        {/* Disclaimer */}
        <div className="p-3 rounded-lg bg-slate-100 text-[11px] text-slate-500 leading-normal border border-slate-200">
          <strong>Official Transparency Note:</strong> Eligibility shown by AgriVision is an estimate based on your profile. Final eligibility is determined by the respective government authority upon physical document verification.
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          >
            Close
          </button>

          {scheme.application_url && (
            <a
              href={scheme.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition"
            >
              <span>Apply on Official Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

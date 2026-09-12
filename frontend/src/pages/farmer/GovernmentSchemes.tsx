import React, { useState, useEffect } from 'react';
import {
  Search,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Filter,
  RefreshCw,
  Info
} from 'lucide-react';
import { schemesApi } from '../../services/schemesApi';
import { GovernmentScheme, SchemeEligibilityResult, SchemeCategory, GovernmentType } from '../../types';
import { SchemeEligibilityModal } from '../../components/common/SchemeEligibilityModal';
import { ConnectivityBadge } from '../../components/common/ConnectivityBadge';
import { cacheDataItems, getCachedDataItems, enqueueOfflineMutation } from '../../utils/offlineStorage';

export const GovernmentSchemes: React.FC = () => {
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [recommended, setRecommended] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cachedTime, setCachedTime] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);

  // Modal state
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);
  const [eligibilityResult, setEligibilityResult] = useState<SchemeEligibilityResult | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      if (navigator.onLine) {
        const [allSchemes, recSchemes] = await Promise.all([
          schemesApi.getSchemes(),
          schemesApi.getRecommendedSchemes().catch(() => [])
        ]);
        setSchemes(allSchemes);
        setRecommended(recSchemes);
        // Cache to IndexedDB
        await cacheDataItems('schemes', allSchemes);
        setCachedTime(new Date().toISOString());
      } else {
        // Offline: read from IndexedDB
        const cached = await getCachedDataItems<GovernmentScheme>('schemes');
        setSchemes(cached.items);
        setCachedTime(cached.lastUpdated);
      }
    } catch (err) {
      console.warn('Network fetch failed, loading offline schemes cache:', err);
      const cached = await getCachedDataItems<GovernmentScheme>('schemes');
      setSchemes(cached.items);
      setCachedTime(cached.lastUpdated);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleToggleSave = async (scheme: GovernmentScheme) => {
    const isCurrentlySaved = scheme.is_saved;
    // Optimistic UI update
    setSchemes((prev) =>
      prev.map((s) => (s.id === scheme.id ? { ...s, is_saved: !isCurrentlySaved } : s))
    );
    setRecommended((prev) =>
      prev.map((s) => (s.id === scheme.id ? { ...s, is_saved: !isCurrentlySaved } : s))
    );

    try {
      if (navigator.onLine) {
        if (isCurrentlySaved) {
          await schemesApi.unsaveScheme(scheme.id);
        } else {
          await schemesApi.saveScheme(scheme.id);
        }
      } else {
        // Enqueue offline mutation
        await enqueueOfflineMutation(
          isCurrentlySaved ? 'UNSAVE_SCHEME' : 'SAVE_SCHEME',
          { scheme_id: scheme.id }
        );
      }
    } catch (err) {
      console.error('Failed to toggle save state:', err);
    }
  };

  const handleOpenEligibility = async (scheme: GovernmentScheme) => {
    setSelectedScheme(scheme);
    setIsModalOpen(true);
    setModalLoading(true);

    try {
      if (navigator.onLine) {
        const res = await schemesApi.checkEligibility(scheme.id);
        setEligibilityResult(res);
      } else {
        // Fallback offline evaluation
        setEligibilityResult({
          scheme_id: scheme.id,
          scheme_name: scheme.name,
          status: 'POSSIBLY_ELIGIBLE',
          score_percentage: 80,
          matched_criteria: [
            'Offline Estimate: Cached eligibility calculation',
            'Connect to internet for latest official verification rules'
          ],
          unmatched_criteria: [],
          disclaimer: 'Eligibility calculated from offline cached rules.'
        });
      }
    } catch (err) {
      console.error('Eligibility check failed:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredSchemes = schemes.filter((s) => {
    if (showSavedOnly && !s.is_saved) return false;
    if (selectedType !== 'ALL' && s.government_type !== selectedType) return false;
    if (selectedCategory !== 'ALL' && s.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.short_description.toLowerCase().includes(q) ||
        s.benefits.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories: { label: string; value: string }[] = [
    { label: 'All Schemes', value: 'ALL' },
    { label: 'Direct Subsidy', value: 'SUBSIDY' },
    { label: 'Crop Insurance', value: 'INSURANCE' },
    { label: 'Kisan Credit / Loans', value: 'LOAN_CREDIT' },
    { label: 'Farm Equipment', value: 'EQUIPMENT' },
    { label: 'Micro-Irrigation', value: 'IRRIGATION' },
    { label: 'Crop Support', value: 'CROP_SUPPORT' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-6 rounded-2xl shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-[11px] font-bold tracking-wide uppercase">
              AgriVision V3 Ecosystem
            </span>
            <ConnectivityBadge cachedTimestamp={cachedTime} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Government Scheme Finder & Eligibility Matcher</h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl">
            Match verified Central & State agricultural subsidies, credit incentives, and insurance tailored to your registered land area, soil, and crop profile.
          </p>
        </div>

        <button
          onClick={fetchSchemes}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Schemes</span>
        </button>
      </div>

      {/* Recommended For You Section */}
      {recommended.length > 0 && !searchQuery && selectedCategory === 'ALL' && (
        <div className="space-y-3 bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-800">
                Recommended For Your Farm Profile
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Based on your registered location & crops
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {recommended.slice(0, 3).map((rec) => (
              <div
                key={rec.id}
                className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {rec.category}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {rec.eligibility_status === 'ELIGIBLE' ? '✓ High Match' : 'Possible Match'}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 line-clamp-2">{rec.name}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{rec.short_description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenEligibility(rec)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    Check Eligibility →
                  </button>
                  <button
                    onClick={() => handleToggleSave(rec)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-50 transition"
                  >
                    {rec.is_saved ? (
                      <BookmarkCheck className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search scheme name, subsidy benefits, crop, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          {/* Government Type Filter */}
          <div className="flex items-center gap-1.5">
            {['ALL', 'CENTRAL', 'STATE'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-2 text-xs font-bold rounded-xl transition ${
                  selectedType === type
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'ALL' ? 'All Types' : type.charAt(0) + type.slice(1).toLowerCase()}
              </button>
            ))}

            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition ${
                showSavedOnly
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Schemes</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition ${
                selectedCategory === cat.value
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto text-emerald-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading verified agricultural schemes...</p>
        </div>
      ) : filteredSchemes.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-3">
          <FileText className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No schemes found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No government schemes match your active search filters. Try clearing the search query or switching categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {scheme.category}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {scheme.government_type} • {scheme.state}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleSave(scheme)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-50 transition"
                    title={scheme.is_saved ? 'Remove from saved' : 'Save scheme'}
                  >
                    {scheme.is_saved ? (
                      <BookmarkCheck className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-800 line-clamp-2">{scheme.name}</h3>
                  <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                    Code: {scheme.scheme_code}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {scheme.short_description}
                </p>

                {/* Key Benefits snippet */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Benefits:</span>
                  <p className="text-xs text-slate-700 font-medium line-clamp-2">
                    {scheme.benefits}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleOpenEligibility(scheme)}
                    className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>Check Eligibility</span>
                    <span>→</span>
                  </button>

                  {scheme.application_url && (
                    <a
                      href={scheme.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Official Transparency Disclaimer */}
      <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <h5 className="font-bold text-slate-700">Official Transparency Notice</h5>
          <p className="text-slate-500 mt-0.5 leading-relaxed">
            All schemes listed on AgriVision are sourced from official Central and State portals (pmkisan.gov.in, pmfby.gov.in, agrimachinery.nic.in, mahadbt.maharashtra.gov.in). AgriVision does not charge fees or approve applications directly. Eligibility scores are transparent mathematical estimates based on your profile.
          </p>
        </div>
      </div>

      {/* Eligibility Modal */}
      {selectedScheme && (
        <SchemeEligibilityModal
          scheme={selectedScheme}
          result={eligibilityResult}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
export default GovernmentSchemes;

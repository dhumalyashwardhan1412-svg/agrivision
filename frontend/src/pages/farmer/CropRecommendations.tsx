import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Calculator, BookOpen, TrendingUp, ShieldAlert, CheckCircle2, Droplets, FlaskConical, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import { cropApi } from '../../services/cropApi';
import { farmApi } from '../../services/farmApi';
import { CropRecommendation, Farm } from '../../types';
import { formatINR } from '../../utils/formatters';

export const CropRecommendations: React.FC = () => {
  const navigate = useNavigate();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecommendations = async (farmId: number) => {
    setIsLoading(true);
    try {
      const recs = await cropApi.getRecommendationsForFarm(farmId);
      setRecommendations(recs);
    } catch (err) {
      console.error('Failed to load crop recommendations', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const myFarms = await farmApi.getMyFarms();
        setFarms(myFarms);
        if (myFarms.length > 0) {
          setSelectedFarm(myFarms[0]);
          await loadRecommendations(myFarms[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-agri-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="green" size="sm">HYBRID MULTI-CRITERIA DECISION SYSTEM</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Top Recommended Crops for {selectedFarm?.name || 'Your Farm'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Calculated by cross-referencing soil NPK & pH, irrigation availability, APMC price momentum, cost of cultivation, and climate season.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {farms.length > 1 && (
            <select
              value={selectedFarm?.id || ''}
              onChange={(e) => {
                const f = farms.find((farm) => farm.id === parseInt(e.target.value));
                if (f) {
                  setSelectedFarm(f);
                  loadRecommendations(f.id);
                }
              }}
              className="rounded-xl border border-slate-700 bg-slate-800 text-white px-3 py-2 text-xs font-bold"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          )}

          <Button
            variant="secondary"
            size="sm"
            icon={Sparkles}
            onClick={() => selectedFarm && loadRecommendations(selectedFarm.id)}
            isLoading={isLoading}
          >
            Re-calculate Scores
          </Button>
        </div>
      </div>

      {/* Ranked Crop Recommendation Cards */}
      <div className="space-y-6">
        {recommendations.map((rec, index) => (
          <Card key={rec.id} className="p-6 sm:p-8 border-2 border-slate-200/90 shadow-md hover:border-agri-500 transition-all">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-100">
              {/* Crop Details */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={rec.crop.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'}
                    alt={rec.crop.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow"
                  />
                  <span className="absolute -top-2 -left-2 w-7 h-7 bg-agri-800 text-white rounded-full flex items-center justify-center font-extrabold text-xs shadow-md">
                    #{index + 1}
                  </span>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">{rec.crop.name}</h3>
                    <Badge variant="slate" size="sm">{rec.crop.category}</Badge>
                    <span className="text-xs text-slate-500 font-medium">({rec.crop.scientific_name})</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                    {rec.crop.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
                    <span>⏳ Duration: <strong>{rec.crop.duration_days} Days</strong></span>
                    <span>🌤️ Season: <strong>{rec.crop.growing_season}</strong></span>
                    <span>💧 Water: <strong>{rec.crop.water_need_level}</strong></span>
                    <span>🏷️ Mandi Benchmark: <strong>₹{rec.crop.benchmark_market_price_per_kg}/kg</strong></span>
                  </div>
                </div>
              </div>

              {/* Overall Score Badge */}
              <div className="text-left lg:text-right p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl shrink-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">Overall Suitability Score</span>
                <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700">{rec.overall_suitability_score}%</span>
                <span className="text-xs text-emerald-800 font-bold block mt-0.5">Top Agronomic Match</span>
              </div>
            </div>

            {/* Score Breakdown Bar Matrix */}
            <div className="py-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Soil Score</span>
                  <span>{rec.soil_score}%</span>
                </div>
                <Progress value={rec.soil_score} color="green" size="sm" />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Climate Fit</span>
                  <span>{rec.climate_score}%</span>
                </div>
                <Progress value={rec.climate_score} color="blue" size="sm" />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Water Match</span>
                  <span>{rec.water_score}%</span>
                </div>
                <Progress value={rec.water_score} color="blue" size="sm" />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Market Demand</span>
                  <span>{rec.market_score}%</span>
                </div>
                <Progress value={rec.market_score} color="amber" size="sm" />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Profitability</span>
                  <span>{rec.profit_score}%</span>
                </div>
                <Progress value={rec.profit_score} color="green" size="sm" />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Pest & Risk</span>
                  <span className="text-emerald-700">Low ({rec.risk_score}%)</span>
                </div>
                <Progress value={100 - rec.risk_score} color="green" size="sm" />
              </div>
            </div>

            {/* Financial Estimates Card */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Est. Cultivation Cost</span>
                <span className="text-base font-extrabold text-rose-300">{formatINR(rec.estimated_cost_inr)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Est. Gross Revenue</span>
                <span className="text-base font-extrabold text-sky-300">{formatINR(rec.estimated_revenue_inr)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Est. Net Profit</span>
                <span className="text-lg font-extrabold text-emerald-400">{formatINR(rec.estimated_profit_inr)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Return on Investment</span>
                <span className="text-lg font-extrabold text-amber-400">{rec.roi_percentage}% ROI</span>
              </div>
            </div>

            {/* AI Explanation & Advantages */}
            {rec.ai_explanation && (
              <div className="mt-4 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs text-slate-700 space-y-2">
                <p className="leading-relaxed">
                  💡 <strong>AI Recommendation Rationale:</strong> {rec.ai_explanation}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="flex items-start gap-1.5 text-emerald-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Key Strengths:</strong> {rec.advantages}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-amber-900 font-medium">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Risk Management:</strong> {rec.risk_factors}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                icon={Calculator}
                onClick={() => navigate('/farmer/profit', { state: { cropName: rec.crop.name } })}
              >
                Custom Profit Simulation
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={BookOpen}
                onClick={() => navigate('/farmer/plans', { state: { cropId: rec.crop.id, cropName: rec.crop.name } })}
              >
                Generate Comprehensive Farming Plan
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

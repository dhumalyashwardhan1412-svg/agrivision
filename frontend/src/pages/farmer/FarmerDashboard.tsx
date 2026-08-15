import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  FlaskConical,
  Sparkles,
  TrendingUp,
  Calculator,
  Stethoscope,
  ShoppingBag,
  FileText,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { WeatherWidget } from '../../components/dashboard/WeatherWidget';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { farmApi } from '../../services/farmApi';
import { soilApi } from '../../services/soilApi';
import { cropApi } from '../../services/cropApi';
import { marketApi } from '../../services/marketApi';
import { Farm, SoilTest, CropRecommendation, MarketPrice } from '../../types';
import { formatINR } from '../../utils/formatters';

export const FarmerDashboard: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [activeFarm, setActiveFarm] = useState<Farm | null>(null);
  const [latestSoil, setLatestSoil] = useState<SoilTest | null>(null);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [recentPrices, setRecentPrices] = useState<MarketPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const farmList = await farmApi.getMyFarms();
        setFarms(farmList);
        if (farmList.length > 0) {
          const selected = farmList[0];
          setActiveFarm(selected);

          // Load soil tests
          const soils = await soilApi.getSoilRecords(selected.id);
          if (soils.length > 0) setLatestSoil(soils[0]);

          // Load recommendations
          const recs = await cropApi.getRecommendationsForFarm(selected.id);
          setRecommendations(recs);
        }

        // Load prices
        const prices = await marketApi.getPrices();
        setRecentPrices(prices.slice(0, 4));
      } catch (err) {
        console.error('Error loading farmer dashboard', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const topRec = recommendations.length > 0 ? recommendations[0] : null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-agri-800 to-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
              🌾 ACTIVE FARM
            </span>
            <span className="text-xs text-emerald-200">
              {activeFarm?.location_name || 'Ludhiana, Punjab'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            {activeFarm?.name || 'Green Valley Eco Farm'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
            {activeFarm?.total_area_acres || 3.5} Acres • {activeFarm?.primary_soil_type || 'Loamy'} Soil • {activeFarm?.irrigation_system || 'Drip'} Irrigation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/farmer/soil">
            <Button size="sm" variant="secondary" icon={FlaskConical}>
              New Soil Test
            </Button>
          </Link>
          <Link to="/farmer/report">
            <Button size="sm" className="bg-white text-agri-900 hover:bg-slate-100 font-bold" icon={FileText}>
              Download PDF Report
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Farm Area"
          value={`${activeFarm?.total_area_acres || 3.5} Acres`}
          subtitle="100% precision mapped"
          icon={Sprout}
          color="green"
        />
        <StatCard
          title="Soil Health Grade"
          value={latestSoil?.health_grade || 'Grade A (Prime)'}
          subtitle={latestSoil?.npk_status?.slice(0, 30) || 'N-P-K Well Balanced'}
          icon={FlaskConical}
          color="blue"
        />
        <StatCard
          title="Top Recommended Crop"
          value={topRec?.crop?.name || 'Tomato (Hybrid)'}
          subtitle={`Suitability: ${topRec?.overall_suitability_score || 92.5}%`}
          icon={Sparkles}
          color="amber"
        />
        <StatCard
          title="Est. Net Profit (Season)"
          value={topRec ? formatINR(topRec.estimated_profit_inr) : '₹1,45,000'}
          subtitle={`Projected ROI: ${topRec?.roi_percentage || 115}%`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Main Grid: Weather + Crop Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Card */}
        <div className="lg:col-span-1">
          <WeatherWidget locationName={`${activeFarm?.district || 'Ludhiana'}, ${activeFarm?.state || 'Punjab'}`} />
        </div>

        {/* Top Recommendation Highlight Card */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <CardHeader>
                <div>
                  <Badge variant="green" size="sm">HYBRID MULTI-FACTOR MATCH</Badge>
                  <CardTitle className="mt-1 text-xl">Top Agronomic Recommendation</CardTitle>
                  <CardDescription>Scientific scoring based on soil, climate, water, and APMC market prices</CardDescription>
                </div>
                <Link to="/farmer/recommendations">
                  <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                    View All
                  </Button>
                </Link>
              </CardHeader>

              {topRec ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={topRec.crop.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'}
                        alt={topRec.crop.name}
                        className="w-16 h-16 rounded-2xl object-cover shadow-sm"
                      />
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900">{topRec.crop.name}</h4>
                        <span className="text-xs text-slate-500 font-medium">{topRec.crop.variety || 'High Yield Hybrid'} • {topRec.crop.duration_days} Days</span>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {topRec.overall_suitability_score}% Overall Suitability
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Profit</span>
                      <span className="text-xl font-extrabold text-emerald-700">{formatINR(topRec.estimated_profit_inr)}</span>
                      <span className="text-xs text-slate-500 block">ROI: {topRec.roi_percentage}%</span>
                    </div>
                  </div>

                  {/* Multi-parameter scoring pills */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Soil Score</span>
                      <span className="font-bold text-slate-800">{topRec.soil_score}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Climate</span>
                      <span className="font-bold text-slate-800">{topRec.climate_score}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Water</span>
                      <span className="font-bold text-slate-800">{topRec.water_score}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Market</span>
                      <span className="font-bold text-slate-800">{topRec.market_score}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Profit</span>
                      <span className="font-bold text-slate-800">{topRec.profit_score}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Risk</span>
                      <span className="font-bold text-emerald-600">Low ({topRec.risk_score}%)</span>
                    </div>
                  </div>

                  {topRec.ai_explanation && (
                    <p className="text-xs text-slate-600 leading-relaxed bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/60">
                      💡 <strong>AI Agronomy Insight:</strong> {topRec.ai_explanation}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Run crop recommendation engine to view scientific multi-factor suggestions.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link to="/farmer/profit">
                <Button variant="outline" size="sm" icon={Calculator}>
                  Simulate Profit Scenarios
                </Button>
              </Link>
              <Link to="/farmer/plans">
                <Button variant="primary" size="sm" icon={Sparkles}>
                  Generate Farming Plan
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link to="/farmer/soil" className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-agri-500 hover:shadow-md transition group">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FlaskConical className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Soil Health Testing</h4>
          <p className="text-xs text-slate-500 mt-0.5">Lab records & AI photo analysis</p>
        </Link>

        <Link to="/farmer/doctor" className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-agri-500 hover:shadow-md transition group">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Stethoscope className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Crop Doctor (AI)</h4>
          <p className="text-xs text-slate-500 mt-0.5">Scan leaf diseases & pests</p>
        </Link>

        <Link to="/farmer/equipment" className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-agri-500 hover:shadow-md transition group">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Machinery & Maps</h4>
          <p className="text-xs text-slate-500 mt-0.5">Tractor rentals & local dealers</p>
        </Link>

        <Link to="/farmer/sales" className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-agri-500 hover:shadow-md transition group">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Direct Farm Sales</h4>
          <p className="text-xs text-slate-500 mt-0.5">List produce & manage orders</p>
        </Link>
      </div>

      {/* Mandi Intelligence Overview */}
      <Card>
        <CardHeader>
          <div>
            <Badge variant="blue" size="sm">APMC MANDI INTELLIGENCE</Badge>
            <CardTitle className="mt-1 text-lg">Regional Market Spot Prices</CardTitle>
            <CardDescription>Live wholesale price updates across major North Indian mandis</CardDescription>
          </div>
          <Link to="/farmer/market">
            <Button variant="outline" size="sm" icon={TrendingUp}>
              Full Market Intelligence
            </Button>
          </Link>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Commodity</th>
                <th className="py-3 px-4">Mandi / Market</th>
                <th className="py-3 px-4">Modal Price (₹/Qtl)</th>
                <th className="py-3 px-4">Price / kg</th>
                <th className="py-3 px-4">7-Day Change</th>
                <th className="py-3 px-4">Data Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {recentPrices.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{p.commodity}</td>
                  <td className="py-3 px-4">{p.market_name} ({p.state})</td>
                  <td className="py-3 px-4 font-mono font-bold">₹{p.modal_price_per_quintal}</td>
                  <td className="py-3 px-4 font-mono text-emerald-700 font-bold">₹{p.price_per_kg}/kg</td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${p.price_change_7d_percent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {p.price_change_7d_percent >= 0 ? '+' : ''}{p.price_change_7d_percent}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={p.data_type === 'LIVE' ? 'green' : 'slate'} size="sm">
                      {p.data_type}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

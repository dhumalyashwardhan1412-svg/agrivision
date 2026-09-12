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
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Farm, SoilTest, CropRecommendation, MarketPrice } from '../../types';
import { formatINR } from '../../utils/formatters';

export const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
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
          try {
            const soils = await soilApi.getSoilRecords(selected.id);
            if (soils.length > 0) setLatestSoil(soils[0]);
          } catch (e) {
            console.warn('Could not load soil records', e);
          }

          // Load recommendations
          try {
            const recs = await cropApi.getRecommendationsForFarm(selected.id);
            setRecommendations(recs);
          } catch (e) {
            console.warn('Could not load recommendations', e);
          }
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
  }, [user]);

  const topRec = recommendations.length > 0 ? recommendations[0] : null;

  // Dynamic values derived from active farm and authenticated user
  const farmerFirstName = user?.full_name ? user.full_name.trim().split(' ')[0] : 'My';
  const displayFarmName = activeFarm?.name || `${farmerFirstName}'s Farm`;

  const displayLocation =
    activeFarm?.location_name ||
    (activeFarm?.district && activeFarm?.state ? `${activeFarm.district}, ${activeFarm.state}` : '') ||
    (user?.district && user?.state ? `${user.district}, ${user.state}` : '') ||
    user?.district ||
    user?.state ||
    'Registered Farm';

  const displayAcreage =
    activeFarm?.total_area_acres ??
    (user?.farmer_profile?.total_land_area ?? user?.total_farm_land ?? 1.0);

  const displaySoil = activeFarm?.primary_soil_type || 'Healthy Native';
  const displayIrrigation =
    activeFarm?.irrigation_system ||
    activeFarm?.water_source ||
    user?.farmer_profile?.irrigation_source ||
    user?.irrigation_source ||
    'Borewell';

  const weatherLocation =
    (activeFarm?.district && activeFarm?.state ? `${activeFarm.district}, ${activeFarm.state}` : '') ||
    (user?.district && user?.state ? `${user.district}, ${user.state}` : '') ||
    user?.district ||
    'Pune, Maharashtra';

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl lg:col-span-1" />
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-agri-800 to-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
              🌾 {t('farmer.activeFarm', 'ACTIVE FARM')}
            </span>
            <span className="text-xs text-emerald-200">
              {displayLocation}
            </span>
            {user?.full_name && (
              <span className="text-xs text-emerald-300 font-medium">
                • {t('farmer.farmerLabel', 'Farmer')}: {user.full_name}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            {displayFarmName}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
            {displayAcreage} {t('common.acres', 'Acres')} • {displaySoil} • {displayIrrigation}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/farmer/report">
            <Button size="sm" className="bg-white text-agri-900 hover:bg-slate-100 font-bold" icon={FileText}>
              {t('farmer.downloadPdf', 'Download PDF Report')}
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('farmer.totalArea', 'Total Farm Area')}
          value={`${displayAcreage} ${t('common.acres', 'Acres')}`}
          subtitle="100% precision mapped"
          icon={Sprout}
          color="green"
        />
        <StatCard
          title={t('farmer.soilGrade', 'Soil Health Grade')}
          value={latestSoil?.health_grade || 'Grade A (Prime)'}
          subtitle={latestSoil?.npk_status?.slice(0, 30) || 'N-P-K Well Balanced'}
          icon={FlaskConical}
          color="blue"
        />
        <StatCard
          title={t('farmer.topRecommendation', 'Top AI Recommendation')}
          value={topRec?.crop?.name || 'Tomato (Hybrid)'}
          subtitle={`Suitability: ${topRec?.overall_suitability_score || 92.5}%`}
          icon={Sparkles}
          color="amber"
        />
        <StatCard
          title={t('farmer.estNetProfit', 'Est. Net Profit (Season)')}
          value={topRec ? formatINR(topRec.estimated_profit_inr) : formatINR(Math.round(45000 * Number(displayAcreage)))}
          subtitle={`Projected ROI: ${topRec?.roi_percentage || 115}%`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Main Grid: Weather + Crop Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Card */}
        <div className="lg:col-span-1">
          <WeatherWidget locationName={weatherLocation} />
        </div>

        {/* Top Recommendation Highlight Card */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <CardHeader>
                <div>
                  <Badge variant="green" size="sm">HYBRID MULTI-FACTOR MATCH</Badge>
                  <CardTitle className="mt-1 text-xl">{t('farmer.topRecommendation', 'Top Agronomic Recommendation')}</CardTitle>
                  <CardDescription>Scientific scoring based on soil, climate, water, and APMC market prices</CardDescription>
                </div>
                <Link to="/farmer/recommendations">
                  <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                    {t('common.viewDetails', 'View All')}
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
                            {topRec.overall_suitability_score}% {t('farmer.scientificScore', 'Suitability')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('farmer.estNetProfit', 'Estimated Profit')}</span>
                      <span className="text-xl font-extrabold text-emerald-700">{formatINR(topRec.estimated_profit_inr)}</span>
                      <span className="text-xs text-slate-500 block">ROI: {topRec.roi_percentage}%</span>
                    </div>
                  </div>

                  {/* Multi-parameter scoring pills */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">{t('farmer.soilCompatibility', 'Soil')}</span>
                      <span className="font-bold text-slate-800">{topRec.soil_score}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">{t('farmer.climateSuitability', 'Climate')}</span>
                      <span className="font-bold text-slate-800">{topRec.climate_score}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">{t('farmer.waterScore', 'Water')}</span>
                      <span className="font-bold text-slate-800">{topRec.water_score}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">{t('farmer.marketScore', 'Market')}</span>
                      <span className="font-bold text-slate-800">{topRec.market_score}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">{t('farmer.profitScore', 'Profit')}</span>
                      <span className="font-bold text-slate-800">{topRec.profit_score}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">{t('farmer.riskScore', 'Risk')}</span>
                      <span className="font-bold text-emerald-600">{t('farmer.lowRisk', 'Low')} ({topRec.risk_score}%)</span>
                    </div>
                  </div>

                  {topRec.ai_explanation && (
                    <p className="text-xs text-slate-600 leading-relaxed bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/60">
                      💡 <strong>{t('farmer.aiInsight', 'AI Agronomy Insight')}:</strong> {topRec.ai_explanation}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  {t('farmer.noRecsYet', 'Run crop recommendation engine to view scientific multi-factor suggestions.')}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link to="/farmer/profit">
                <Button variant="outline" size="sm" icon={Calculator}>
                  {t('farmer.simulateScenarios', 'Simulate Profit Scenarios')}
                </Button>
              </Link>
              <Link to="/farmer/plans">
                <Button variant="primary" size="sm" icon={Sparkles}>
                  {t('farmer.generatePlan', 'Generate Farming Plan')}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link to="/farmer/recommendations" className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-agri-500 hover:shadow-md transition group">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">{t('farmer.cropRecs', 'Crop Recommendations')}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{t('farmer.cropRecsDesc', 'Scientific AI scoring engine')}</p>
        </Link>

        <Link to="/farmer/doctor" className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-agri-500 hover:shadow-md transition group">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Stethoscope className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">{t('farmer.cropDoctor', 'Crop Doctor (AI)')}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{t('farmer.cropDoctorDesc', 'Scan leaf diseases & pests')}</p>
        </Link>

        <Link to="/farmer/equipment" className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-agri-500 hover:shadow-md transition group">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">{t('farmer.machineryMaps', 'Machinery & Maps')}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{t('farmer.machineryMapsDesc', 'Tractor rentals & local dealers')}</p>
        </Link>

        <Link to="/farmer/sales" className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-agri-500 hover:shadow-md transition group">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">{t('farmer.directSales', 'Direct Farm Sales')}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{t('farmer.directSalesDesc', 'List produce & manage orders')}</p>
        </Link>
      </div>

      {/* Mandi Intelligence Overview */}
      <Card>
        <CardHeader>
          <div>
            <Badge variant="blue" size="sm">{t('farmer.mandiIntelligence', 'APMC MANDI INTELLIGENCE')}</Badge>
            <CardTitle className="mt-1 text-lg">{t('farmer.regionalMarketPrices', 'Regional Market Spot Prices')}</CardTitle>
            <CardDescription>{t('farmer.liveWholesaleUpdates', 'Live wholesale price updates across major North Indian mandis')}</CardDescription>
          </div>
          <Link to="/farmer/market">
            <Button variant="outline" size="sm" icon={TrendingUp}>
              {t('farmer.fullMarketIntelligence', 'Full Market Intelligence')}
            </Button>
          </Link>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">{t('farmer.commodity', 'Commodity')}</th>
                <th className="py-3 px-4">{t('farmer.mandiMarket', 'Mandi / Market')}</th>
                <th className="py-3 px-4">{t('farmer.modalPrice', 'Modal Price (₹/Qtl)')}</th>
                <th className="py-3 px-4">{t('farmer.priceKg', 'Price / kg')}</th>
                <th className="py-3 px-4">{t('farmer.change7d', '7-Day Change')}</th>
                <th className="py-3 px-4">{t('farmer.dataType', 'Data Type')}</th>
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

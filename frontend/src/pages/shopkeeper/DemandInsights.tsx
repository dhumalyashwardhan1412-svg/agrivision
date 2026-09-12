import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Calendar,
  Package,
  AlertCircle,
  RefreshCw,
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { dealerV3Api } from '../../services/dealerV3Api';
import { DemandInsightsResponse } from '../../types';

export const DemandInsights: React.FC = () => {
  const [data, setData] = useState<DemandInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dealerV3Api.getDemandInsights();
      setData(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load predictive demand insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getTrendIcon = (trend: 'RISING' | 'STABLE' | 'FALLING') => {
    if (trend === 'RISING') return <TrendingUp className="w-4 h-4 text-emerald-600" />;
    if (trend === 'FALLING') return <TrendingDown className="w-4 h-4 text-rose-600" />;
    return <Minus className="w-4 h-4 text-slate-500" />;
  };

  const getTrendBadge = (trend: 'RISING' | 'STABLE' | 'FALLING') => {
    if (trend === 'RISING') return <Badge variant="green" size="sm">Rising (+Demand)</Badge>;
    if (trend === 'FALLING') return <Badge variant="red" size="sm">Falling Demand</Badge>;
    return <Badge variant="slate" size="sm">Stable</Badge>;
  };

  const getConfidenceBadge = (confidence: 'HIGH' | 'MODERATE' | 'LOW') => {
    if (confidence === 'HIGH') return <Badge variant="blue" size="sm">High Confidence</Badge>;
    if (confidence === 'MODERATE') return <Badge variant="amber" size="sm">Moderate</Badge>;
    return <Badge variant="slate" size="sm">Preliminary</Badge>;
  };

  // Determine current Indian agricultural season based on month
  const currentMonth = new Date().getMonth() + 1;
  const currentSeason =
    currentMonth >= 6 && currentMonth <= 10
      ? { name: 'Kharif Sowing Season', desc: 'Paddy, Maize, Cotton, Soybean peak input demand' }
      : currentMonth >= 11 || currentMonth <= 3
      ? { name: 'Rabi Sowing Season', desc: 'Wheat, Mustard, Gram, Barley, Fertilizer demand' }
      : { name: 'Zaid / Pre-Kharif Season', desc: 'Vegetables, Pulses, Fodder, Micro-nutrients' };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Predictive Demand & Sowing Insights
            </h1>
            <Badge variant="purple" size="sm" className="hidden sm:inline-flex">
              <Sparkles className="w-3 h-3 mr-1" /> V3 Forecasting
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Historical store velocity combined with regional agro-climatic sowing cycles for accurate inventory replenishment.
          </p>
        </div>

        <Button
          onClick={fetchInsights}
          disabled={loading}
          variant="outline"
          className="self-start sm:self-auto gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Season Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-sky-300">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Current Agro Cycle</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-400/30">Active</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">{currentSeason.name}</h3>
            <p className="text-xs text-slate-300 mt-0.5">{currentSeason.desc}</p>
          </div>
        </div>

        {data && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10 text-right self-stretch md:self-auto">
            <div className="text-[11px] text-slate-300">Projected Store Momentum</div>
            <div className="text-lg font-black text-emerald-400 flex items-center justify-end gap-1.5">
              {getTrendIcon(data.overall_trend)}
              <span>{data.overall_trend} DEMAND</span>
            </div>
          </div>
        )}
      </div>

      {/* Notice for Early Stores */}
      {data && !data.has_sufficient_data && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Transparent Data Note: </span>
            {data.data_notice || 'Predictive model is augmenting baseline sales with regional agro-climatic seasonal indices due to new store history.'}
          </div>
        </div>
      )}

      {/* Metrics Row */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Tracked Categories</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {data.forecasts.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Seeds, Fertilisers, Spray & Tools</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Highest Demand Category</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-2">
              {data.forecasts.find(f => f.trend === 'RISING')?.category || 'Fertilizers'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Sowing surge anticipated</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Restock Urgency</span>
              <Package className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2">
              {data.forecasts.filter(f => f.recommended_stock > f.current_stock).length} Categories
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Current units below projected target</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Forecasting Model</span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-700 mt-2">
              Hybrid Sowing
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Velocity + Agro Seasons (Kharif/Rabi)</div>
          </Card>
        </div>
      )}

      {/* Chart: Sales & Projected Demand */}
      {data && data.monthly_sales_chart && data.monthly_sales_chart.length > 0 && (
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Store Velocity & 3-Month Demand Projection
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Actual recorded dealer sales vs AI seasonal projection (INR)
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-sky-700">
                  <span className="w-3 h-3 rounded-full bg-sky-500 inline-block" /> Actual Sales
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Projected Demand
                </span>
              </div>
            </div>
          </CardHeader>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly_sales_chart} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="projectedSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="actual_sales_inr"
                  name="Actual Sales"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#actualSalesGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="projected_sales_inr"
                  name="Projected Demand"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#projectedSalesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Category Breakdown Table */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0 mb-4">
          <CardTitle className="text-base font-bold text-slate-900">
            Category-Wise Restock Recommendations
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Based on stock depletion rates, 30-day run rates, and upcoming farmer field preparation schedules.
          </CardDescription>
        </CardHeader>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
            Analyzing store transactions and seasonal calendars...
          </div>
        ) : !data || data.forecasts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No category forecasts available yet. Add products to your inventory to start forecasting.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">30-Day Velocity</th>
                  <th className="py-3 px-4">Demand Shift</th>
                  <th className="py-3 px-4">Target Restock Level</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Action Advice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {data.forecasts.map((f, idx) => {
                  const needsRestock = f.recommended_stock > f.current_stock;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {f.category}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        {f.current_stock} units
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {f.sales_last_30_days} sold
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {getTrendBadge(f.trend)}
                          <span className={`text-[11px] font-bold ${f.demand_change_percent >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {f.demand_change_percent > 0 ? `+${f.demand_change_percent}%` : `${f.demand_change_percent}%`}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {f.recommended_stock} units
                      </td>
                      <td className="py-3.5 px-4">
                        {getConfidenceBadge(f.confidence)}
                      </td>
                      <td className="py-3.5 px-4">
                        {needsRestock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                            <ArrowUpRight className="w-3 h-3" /> Reorder +{f.recommended_stock - f.current_stock}
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                            Stock Adequate
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

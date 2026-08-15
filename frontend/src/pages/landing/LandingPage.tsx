import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout,
  Sparkles,
  FlaskConical,
  TrendingUp,
  MapPin,
  Stethoscope,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
  Calculator,
  FileText,
  Bot,
  Users,
  CheckCircle2,
  Check,
  Star
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { cropApi } from '../../services/cropApi';
import { Crop } from '../../types';
import { formatINR } from '../../utils/formatters';

export const LandingPage: React.FC = () => {
  const { user, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const [calcArea, setCalcArea] = useState<number>(2.0);
  const [profitEstimate, setProfitEstimate] = useState<any>(null);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const data = await cropApi.getCrops();
        setCrops(data.slice(0, 6));
      } catch (err) {
        console.error('Crops fetch error', err);
      }
    };
    fetchCrops();
  }, []);

  useEffect(() => {
    const runProfit = async () => {
      try {
        const res = await cropApi.calculateProfit({
          crop_name: selectedCrop,
          area_acres: calcArea,
        });
        setProfitEstimate(res);
      } catch (err) {
        console.error('Profit err', err);
      }
    };
    runProfit();
  }, [selectedCrop, calcArea]);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 bg-gradient-to-b from-agri-50/60 via-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs font-bold mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Next-Generation AI Precision Agritech Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Cultivate Smarter. Maximize Yield.{' '}
            <span className="text-agri-700 bg-clip-text">Prosper More.</span>
          </h1>

          <p className="mt-6 text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            AgriVision combines scientific soil analysis, hybrid multi-factor crop recommendations, real-time APMC mandi intelligence, and direct marketplace commerce in one platform.
          </p>

          {/* Quick 1-Click Role Login Demo Bar */}
          <div className="mt-10 max-w-2xl mx-auto bg-white p-4 rounded-3xl shadow-xl border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <span className="text-xs font-bold text-slate-900 block">Instant 1-Click Prototype Demo</span>
              <span className="text-[11px] text-slate-500">Explore pre-seeded workflows as:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={Sprout}
                onClick={async () => {
                  await quickDemoLogin('FARMER');
                  navigate('/farmer');
                }}
              >
                Farmer
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={ShoppingBag}
                onClick={async () => {
                  await quickDemoLogin('CUSTOMER');
                  navigate('/marketplace');
                }}
              >
                Customer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await quickDemoLogin('SHOPKEEPER');
                  navigate('/shopkeeper');
                }}
              >
                Dealer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await quickDemoLogin('ADMIN');
                  navigate('/admin');
                }}
              >
                Admin
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Sparkles}
                onClick={() => navigate('/3d')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                3D Digital Twin
              </Button>
            </div>
          </div>

          {/* Live Platform Highlights */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-left">
              <span className="text-2xl font-extrabold text-agri-800">25+</span>
              <span className="block text-xs font-semibold text-slate-600 mt-0.5">Crop Agro-Ecological Models</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-left">
              <span className="text-2xl font-extrabold text-sky-700">100%</span>
              <span className="block text-xs font-semibold text-slate-600 mt-0.5">Verified Lab NPK Interpreters</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-left">
              <span className="text-2xl font-extrabold text-amber-700">50+</span>
              <span className="block text-xs font-semibold text-slate-600 mt-0.5">Live Regional APMC Mandis</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-left">
              <span className="text-2xl font-extrabold text-purple-700">0%</span>
              <span className="block text-xs font-semibold text-slate-600 mt-0.5">Direct Farm Middleman Fee</span>
            </div>
          </div>
        </div>
      </section>

      {/* End-to-End Workflow Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="green" size="md">THE COMPLETE END-TO-END JOURNEY</Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            How AgriVision Transforms Farming into a Data-Driven Enterprise
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4 hover:border-agri-500 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-lg shadow-inner">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-900">Soil Assay & AI Visual Screening</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Enter certified lab NPK & pH parameters or use our topsoil photo analyzer. Get customized organic & micronutrient amendment prescriptions.
            </p>
            <div className="pt-2 text-xs font-bold text-emerald-700 flex items-center gap-1">
              <FlaskConical className="w-4 h-4" /> Lab & Image Source Segregation
            </div>
          </Card>

          <Card className="p-6 space-y-4 hover:border-agri-500 transition">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-extrabold text-lg shadow-inner">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-900">Hybrid Multi-Factor Recommendation</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              No blind guessing. Our scoring engine evaluates Soil compatibility + Climate + Water availability + Market pricing + Net ROI - Pest Risk.
            </p>
            <div className="pt-2 text-xs font-bold text-sky-700 flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> Configurable Multi-Parameter Engine
            </div>
          </Card>

          <Card className="p-6 space-y-4 hover:border-agri-500 transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-extrabold text-lg shadow-inner">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-900">Direct Sales & PDF Farm Advisory</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              List surplus harvest directly to consumers on the marketplace, find local tractor rentals on Leaflet maps, and download branded PDF reports.
            </p>
            <div className="pt-2 text-xs font-bold text-amber-700 flex items-center gap-1">
              <ShoppingBag className="w-4 h-4" /> Real-time Commerce & PDF Export
            </div>
          </Card>
        </div>
      </section>

      {/* Interactive Live Profit & ROI Simulator on Landing Page */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-agri-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <Calculator className="w-3.5 h-3.5" /> Interactive Yield & Profit Simulator
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Simulate Your Farm Returns Before Sowing a Single Seed
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Adjust acreage and crop selection to see how precision input planning, labour optimization, and prevailing APMC rates translate to real net income.
              </p>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Select Crop</label>
                  <div className="flex flex-wrap gap-2">
                    {['Tomato', 'Wheat', 'Basmati Rice', 'Onion', 'Potato', 'Mustard'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedCrop(c)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                          selectedCrop === c
                            ? 'bg-emerald-500 text-slate-950 shadow-md'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                    <span>Farm Area</span>
                    <span className="text-emerald-400">{calcArea} Acres</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={calcArea}
                    onChange={(e) => setCalcArea(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Output Stats Card */}
            {profitEstimate && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Forecast Model</span>
                    <span className="font-bold text-base text-white">{selectedCrop} ({calcArea} Acres)</span>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl">
                    {profitEstimate.profitability_rating}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 bg-black/20 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Total Est. Cost</span>
                    <span className="text-xl font-extrabold text-rose-300">{formatINR(profitEstimate.cost_breakdown.total_cost_inr)}</span>
                  </div>
                  <div className="p-3.5 bg-black/20 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Est. Gross Revenue</span>
                    <span className="text-xl font-extrabold text-sky-300">{formatINR(profitEstimate.expected_revenue_inr)}</span>
                  </div>
                  <div className="p-3.5 bg-black/20 rounded-xl border border-white/5 col-span-2">
                    <span className="text-[10px] text-slate-400 block">Estimated Net Profit</span>
                    <span className="text-3xl font-extrabold text-emerald-400">{formatINR(profitEstimate.estimated_profit_inr)}</span>
                    <span className="text-xs text-slate-300 block mt-1">ROI: <strong>{profitEstimate.return_on_investment_roi_percent}%</strong> | Break-even Price: <strong>₹{profitEstimate.break_even_price_per_kg}/kg</strong></span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 italic">
                  * Values are agronomic estimates based on regional benchmarks.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Marketplace Produce */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <Badge variant="green" size="md">DIRECT FROM FARM</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Fresh Harvest Marketplace
            </h2>
          </div>
          <Link to="/marketplace">
            <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
              View All Produce
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop) => (
            <Card key={crop.id} className="overflow-hidden p-0 flex flex-col justify-between">
              <div className="relative h-44 bg-slate-100">
                <img src={crop.image_url} alt={crop.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3">
                  <Badge variant="green" size="sm">
                    {crop.category}
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-xs font-bold text-slate-800">
                  {crop.duration_days} Days
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-900">{crop.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {crop.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Benchmark Price</span>
                    <span className="text-base font-extrabold text-slate-900">₹{crop.benchmark_market_price_per_kg}/kg</span>
                  </div>
                  <Link to="/marketplace">
                    <Button variant="secondary" size="sm">
                      Browse
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-agri-800 to-emerald-700 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Upgrade Your Agricultural Operations?
            </h2>
            <p className="text-xs sm:text-base text-emerald-100 leading-relaxed">
              Join thousands of progressive farmers, buyers, and agritech dealers across India on AgriVision.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register">
                <Button size="lg" className="bg-white text-agri-900 hover:bg-slate-100 font-bold shadow-lg">
                  Create Free Account
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="text-white border-white/40 hover:bg-white/10"
                onClick={async () => {
                  await quickDemoLogin('FARMER');
                  navigate('/farmer');
                }}
              >
                Launch Live Demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

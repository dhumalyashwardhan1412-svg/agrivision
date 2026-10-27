import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sprout,
  Sparkles,
  TrendingUp,
  MapPin,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
  Calculator,
  Compass,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  Clock,
  Layers,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { cropApi } from '../../services/cropApi';
import { Crop } from '../../types';
import { formatINR } from '../../utils/formatters';
import loginFarmlandBg from '../../assets/login-farmland-bg.jpg';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
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
    <div className="space-y-24 pb-28 text-slate-100 overflow-hidden">
      {/* ========================================================= */}
      {/* 1. CINEMATIC HERO SECTION                                 */}
      {/* ========================================================= */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Cinematic Farmland Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url(${loginFarmlandBg})` }}
        />

        {/* Multi-layered Cinematic Dark Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07130F]/90 via-[#07130F]/75 to-[#07130F]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.2),transparent_70%)]" />

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-12 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Small Label / Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-widest uppercase backdrop-blur-md shadow-lg shadow-emerald-950/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI-POWERED PRECISION AGRICULTURE</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-5xl mx-auto leading-[1.1]">
              The Future of Farming <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                Starts With AgriVision.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
              Make smarter farming decisions with AI-powered crop recommendations, soil insights, real-time mandi prices, and direct agricultural markets.
            </p>

            {/* CTA Buttons */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate(user ? '/farmer' : '/register')}
                className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer"
              >
                <Sprout className="w-5 h-5 text-slate-950" />
                <span>Explore AgriVision</span>
                <ArrowRight className="w-4 h-4 text-slate-950 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/marketplace')}
                className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl border border-white/20 backdrop-blur-md transition-all duration-200 hover:border-emerald-400/40 flex items-center gap-2.5 cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <span>Explore Marketplace</span>
              </button>
            </div>

            {/* Supporting Feature Pills */}
            <div className="pt-10 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-300">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-base">🌾</span>
                <span>AI-Powered Crop Recommendations</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-base">📊</span>
                <span>Real-Time Mandi Intelligence</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-base">🤝</span>
                <span>Direct Farmer-to-Buyer Marketplace</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. TRUST AND STATISTICS SECTION                           */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-6 sm:p-8 bg-[#0D1F18]/90 border border-emerald-900/40 rounded-3xl backdrop-blur-xl shadow-2xl shadow-black/40 grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Stat 1 */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">25+</div>
              <div className="text-xs font-semibold text-slate-400 mt-0.5 leading-tight">Crop Agro-Ecological Models</div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-sky-300 tracking-tight">100%</div>
              <div className="text-xs font-semibold text-slate-400 mt-0.5 leading-tight">Verified Agmarknet Data</div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">50+</div>
              <div className="text-xs font-semibold text-slate-400 mt-0.5 leading-tight">APMC Mandis Tracked</div>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-teal-300 tracking-tight">0%</div>
              <div className="text-xs font-semibold text-slate-400 mt-0.5 leading-tight">Direct Farm Middleman Fee</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========================================================= */}
      {/* 3. CORE SMART FARMING FEATURES                            */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>PRECISION AGRONOMY WORKFLOW</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Smarter Decisions. <br />
            <span className="text-emerald-400">Stronger Harvests.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            How AgriVision transforms traditional cultivation into a predictive, profitable agricultural enterprise from soil assay to market sale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card A */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="p-8 rounded-3xl bg-[#0D1F18]/90 border border-emerald-900/40 hover:border-emerald-500/50 shadow-xl shadow-black/40 space-y-5 flex flex-col justify-between transition-all duration-300 group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <Sprout className="w-7 h-7" />
                </div>
                <span className="text-xs font-mono font-black text-emerald-400/50 group-hover:text-emerald-400 transition-colors">
                  01
                </span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Smart Farm & Soil Profiling</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Record native soil parameters (N, P, K, pH, organic carbon) and agro-climatic zones. Receive certified organic and micronutrient amendment prescriptions tailored to your plot.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Certified Agronomic Baseline</span>
            </div>
          </motion.div>

          {/* Card B */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="p-8 rounded-3xl bg-[#0D1F18]/90 border border-emerald-900/40 hover:border-emerald-500/50 shadow-xl shadow-black/40 space-y-5 flex flex-col justify-between transition-all duration-300 group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
                  <Sparkles className="w-7 h-7" />
                </div>
                <span className="text-xs font-mono font-black text-sky-400/50 group-hover:text-sky-400 transition-colors">
                  02
                </span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">AI Crop Recommendations</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                No blind guessing. Our algorithmic scoring engine evaluates Soil compatibility + Climate + Water availability + APMC Mandi pricing + Net ROI minus Pest Risk to rank optimal crops.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-bold text-sky-400">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>Hybrid Multi-Factor Scoring Engine</span>
            </div>
          </motion.div>

          {/* Card C */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="p-8 rounded-3xl bg-[#0D1F18]/90 border border-emerald-900/40 hover:border-emerald-500/50 shadow-xl shadow-black/40 space-y-5 flex flex-col justify-between transition-all duration-300 group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
                  <Calendar className="w-7 h-7" />
                </div>
                <span className="text-xs font-mono font-black text-teal-400/50 group-hover:text-teal-400 transition-colors">
                  03
                </span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Automated Crop Calendar</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Receive day-by-day precision schedules for seed treatment, basal dose, irrigation intervals, pest scouting windows, and optimal harvesting dates for maximum farmgate realization.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-bold text-teal-400">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Organic & Modern Dual Schedules</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. REDESIGNED PROFITABILITY CALCULATOR                    */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#064E3B]/30 via-[#0D1F18] to-[#07130F] border border-emerald-800/40 p-6 sm:p-10 lg:p-12 shadow-2xl">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Controls Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                <span>PRECISION FINANCIAL DASHBOARD</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Interactive ROI & <br />
                <span className="text-emerald-400">Profitability Simulator</span>
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Experience how scientific inputs and mandi price intelligence multiply farmer returns. Test different crop models and acreage to forecast gross revenue and net profit.
              </p>

              {/* Crop Selection */}
              <div className="space-y-2.5 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Crop:
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Tomato', 'Wheat', 'Basmati Rice', 'Onion', 'Potato', 'Mustard'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedCrop(c)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        selectedCrop === c
                          ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-105'
                          : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Land Area Slider */}
              <div className="space-y-2.5 pt-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="uppercase tracking-wider text-slate-400">Land Area:</span>
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-sm">
                    {calcArea} Acres
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={calcArea}
                  onChange={(e) => setCalcArea(parseFloat(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 border border-white/10"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>0.5 Acre</span>
                  <span>5.0 Acres</span>
                  <span>10.0 Acres</span>
                </div>
              </div>
            </div>

            {/* Right Financial Display Column */}
            <div className="lg:col-span-6">
              {profitEstimate ? (
                <div className="p-6 sm:p-8 rounded-3xl bg-[#07130F]/80 border border-emerald-800/40 backdrop-blur-xl space-y-6 shadow-xl">
                  {/* Top Rating */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Forecast Model
                      </span>
                      <span className="font-extrabold text-lg text-white">
                        {selectedCrop} ({calcArea} Acres)
                      </span>
                    </div>
                    <span className="px-3 py-1 text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl uppercase tracking-wider">
                      {profitEstimate.profitability_rating}
                    </span>
                  </div>

                  {/* 2-Column Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-black/40 border border-rose-500/20">
                      <span className="text-[11px] font-semibold text-rose-300/80 block">Total Input Cost</span>
                      <span className="text-xl sm:text-2xl font-black text-rose-300 mt-1 block">
                        {formatINR(profitEstimate.cost_breakdown?.total_cost_inr || 0)}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/40 border border-sky-500/20">
                      <span className="text-[11px] font-semibold text-sky-300/80 block">Expected Gross Revenue</span>
                      <span className="text-xl sm:text-2xl font-black text-sky-300 mt-1 block">
                        {formatINR(profitEstimate.expected_revenue_inr || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Highlight Net Profit Card */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-teal-950/40 border border-emerald-500/30 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300/90 block">
                      Estimated Net Profit
                    </span>
                    <span className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight block">
                      {formatINR(profitEstimate.estimated_profit_inr || 0)}
                    </span>
                    <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        {profitEstimate.return_on_investment_roi_percent}% Net ROI
                      </span>
                      <span className="text-slate-400">
                        Break-even: <strong className="text-white">₹{profitEstimate.break_even_price_per_kg}/kg</strong>
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    * Values are agronomic estimates calculated using PAU/ICAR benchmarks and live APMC mandi indices. Regional soil & weather variations apply.
                  </p>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 bg-black/30 rounded-3xl border border-white/5">
                  <Calculator className="w-8 h-8 text-emerald-400 mx-auto animate-pulse mb-3" />
                  <span>Loading financial forecast...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. DIRECT FARM MARKETPLACE PRODUCE                        */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span>DIRECT FROM FARM</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Fresh Harvest Marketplace
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Direct farmer-to-buyer commerce with transparent farmgate prices and zero intermediaries.
            </p>
          </div>

          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-all hover:border-emerald-400/40"
          >
            <span>Browse All Produce</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {crops.map((crop) => (
            <motion.div
              key={crop.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl overflow-hidden bg-[#0D1F18]/90 border border-emerald-900/40 hover:border-emerald-500/50 shadow-xl shadow-black/40 flex flex-col justify-between transition-all group"
            >
              {/* Image & Badges */}
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img
                  src={crop.image_url}
                  alt={crop.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F18] via-transparent to-transparent opacity-80" />
                <div className="absolute top-3.5 left-3.5">
                  <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                    {crop.category}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-200 border border-white/10">
                  {crop.duration_days} Days
                </div>
              </div>

              {/* Info Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
                    {crop.name}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed font-normal">
                    {crop.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">
                      Benchmark Price
                    </span>
                    <span className="text-lg font-black text-white">
                      ₹{crop.benchmark_market_price_per_kg}
                      <span className="text-xs text-slate-400 font-normal">/kg</span>
                    </span>
                  </div>

                  <Link
                    to="/marketplace"
                    className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-slate-950 text-xs font-bold rounded-xl border border-emerald-500/30 transition-all flex items-center gap-1.5"
                  >
                    <span>Browse</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. FINAL CALL-TO-ACTION SECTION                           */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 lg:p-16 text-center border border-emerald-700/40 shadow-2xl">
          {/* Background image & gradient overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
            style={{ backgroundImage: `url(${loginFarmlandBg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07130F]/95 via-[#064E3B]/90 to-[#07130F]/95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.25),transparent_70%)]" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-widest border border-emerald-400/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>TRANSFORM YOUR AGRICULTURE TODAY</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Grow Smarter. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                Build a Better Future.
              </span>
            </h2>

            <p className="text-xs sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl mx-auto font-normal">
              Bring precision agriculture, market intelligence, and direct agricultural commerce together with AgriVision.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate(user ? '/farmer' : '/register')}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/30 transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                Get Started
              </button>

              <button
                type="button"
                onClick={() => navigate('/marketplace')}
                className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl border border-white/20 backdrop-blur-md transition-all cursor-pointer"
              >
                Explore Marketplace
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

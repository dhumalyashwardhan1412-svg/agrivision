import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Calculator,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  DollarSign,
  PieChart as PieIcon,
  ShieldAlert,
  Sliders,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Percent,
  Layers,
  Scale,
  Zap,
  Info,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { CostPieChart } from '../../components/charts/CostPieChart';
import { cropApi } from '../../services/cropApi';
import { farmApi } from '../../services/farmApi';
import { useAuth } from '../../context/AuthContext';
import {
  ProfitCalculationResponse,
  Crop,
  WhatIfComparisonResponse,
  MultiScenarioResponse
} from '../../types';
import { formatINR, formatNumber } from '../../utils/formatters';

export const ProfitCalculator: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const stateData = location.state as { cropName?: string } | undefined;

  // Active Tab: 'standard' | 'what-if'
  const [activeTab, setActiveTab] = useState<'standard' | 'what-if'>('standard');

  const defaultArea = user?.farmer_profile?.total_land_area ?? user?.total_farm_land ?? 2.0;

  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>(stateData?.cropName || 'Tomato');
  const [area, setArea] = useState<number>(defaultArea);

  // Standard Calculator custom overrides
  const [seedCost, setSeedCost] = useState<string>('');
  const [fertCost, setFertCost] = useState<string>('');
  const [manureCost, setManureCost] = useState<string>('');
  const [labourCost, setLabourCost] = useState<string>('');
  const [irrigCost, setIrrigCost] = useState<string>('');
  const [equipCost, setEquipCost] = useState<string>('');
  const [protCost, setProtCost] = useState<string>('');
  const [transCost, setTransCost] = useState<string>('');
  const [customYield, setCustomYield] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<string>('');

  const [calculation, setCalculation] = useState<ProfitCalculationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ==========================================
  // WHAT-IF SIMULATOR STATE
  // ==========================================
  const [whatIfCrop, setWhatIfCrop] = useState<string>(stateData?.cropName || 'Tomato');
  
  // Baseline (Current Plan)
  const [currentArea, setCurrentArea] = useState<number>(2.0);
  const [currentYield, setCurrentYield] = useState<number>(12000);
  const [currentPrice, setCurrentPrice] = useState<number>(18);
  const [currentSeed, setCurrentSeed] = useState<number>(4500);
  const [currentFert, setCurrentFert] = useState<number>(6000);
  const [currentManure, setCurrentManure] = useState<number>(3000);
  const [currentLabour, setCurrentLabour] = useState<number>(8500);
  const [currentIrrig, setCurrentIrrig] = useState<number>(2500);
  const [currentEquip, setCurrentEquip] = useState<number>(3500);
  const [currentFuel, setCurrentFuel] = useState<number>(1800);
  const [currentProt, setCurrentProt] = useState<number>(3200);
  const [currentTrans, setCurrentTrans] = useState<number>(2000);
  const [currentPack, setCurrentPack] = useState<number>(2000);
  const [currentOther, setCurrentOther] = useState<number>(1000);

  // What-If Plan (Simulated)
  const [whatIfArea, setWhatIfArea] = useState<number>(2.5);
  const [whatIfYield, setWhatIfYield] = useState<number>(14500);
  const [whatIfPrice, setWhatIfPrice] = useState<number>(24);
  const [whatIfSeed, setWhatIfSeed] = useState<number>(4500);
  const [whatIfFert, setWhatIfFert] = useState<number>(5500);
  const [whatIfManure, setWhatIfManure] = useState<number>(4000);
  const [whatIfLabour, setWhatIfLabour] = useState<number>(9000);
  const [whatIfIrrig, setWhatIfIrrig] = useState<number>(2000);
  const [whatIfEquip, setWhatIfEquip] = useState<number>(3500);
  const [whatIfFuel, setWhatIfFuel] = useState<number>(1500);
  const [whatIfProt, setWhatIfProt] = useState<number>(2800);
  const [whatIfTrans, setWhatIfTrans] = useState<number>(2200);
  const [whatIfPack, setWhatIfPack] = useState<number>(2200);
  const [whatIfOther, setWhatIfOther] = useState<number>(1000);

  const [whatIfResult, setWhatIfResult] = useState<WhatIfComparisonResponse | null>(null);
  const [scenariosResult, setScenariosResult] = useState<MultiScenarioResponse | null>(null);
  const [isWhatIfLoading, setIsWhatIfLoading] = useState(false);

  useEffect(() => {
    const fetchFarmsAndCrops = async () => {
      try {
        const [farmList, data] = await Promise.all([
          farmApi.getMyFarms().catch(() => []),
          cropApi.getCrops(),
        ]);
        setCrops(data);
        if (farmList.length > 0 && farmList[0].total_area_acres) {
          const farmAcres = farmList[0].total_area_acres;
          setArea(farmAcres);
          setCurrentArea(farmAcres);
          setWhatIfArea(farmAcres);
        } else if (user?.farmer_profile?.total_land_area) {
          const farmAcres = user.farmer_profile.total_land_area;
          setArea(farmAcres);
          setCurrentArea(farmAcres);
          setWhatIfArea(farmAcres);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchFarmsAndCrops();
  }, [user]);

  // Standard calculation
  const runCalculation = async () => {
    setIsLoading(true);
    try {
      const payload: Record<string, any> = {
        crop_name: selectedCrop,
        area_acres: area,
      };
      if (seedCost) payload.seed_cost_inr = parseFloat(seedCost);
      if (fertCost) payload.fertilizer_cost_inr = parseFloat(fertCost);
      if (manureCost) payload.organic_manure_cost_inr = parseFloat(manureCost);
      if (labourCost) payload.labour_cost_inr = parseFloat(labourCost);
      if (irrigCost) payload.irrigation_cost_inr = parseFloat(irrigCost);
      if (equipCost) payload.equipment_cost_inr = parseFloat(equipCost);
      if (protCost) payload.crop_protection_cost_inr = parseFloat(protCost);
      if (transCost) payload.transportation_cost_inr = parseFloat(transCost);
      if (customYield) payload.expected_yield_kg = parseFloat(customYield);
      if (customPrice) payload.expected_selling_price_per_kg = parseFloat(customPrice);

      const res = await cropApi.calculateProfit(payload);
      setCalculation(res);
    } catch (err) {
      console.error('Calculation error', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'standard') {
      runCalculation();
    }
  }, [selectedCrop, area, activeTab]);

  // Run What-If simulation
  const runWhatIfSimulation = async () => {
    setIsWhatIfLoading(true);
    try {
      const payload = {
        current: {
          crop_name: whatIfCrop,
          area_acres: currentArea,
          expected_yield_kg: currentYield * currentArea,
          expected_selling_price_per_kg: currentPrice,
          seed_cost_inr: currentSeed * currentArea,
          fertilizer_cost_inr: currentFert * currentArea,
          organic_manure_cost_inr: currentManure * currentArea,
          labour_cost_inr: currentLabour * currentArea,
          irrigation_cost_inr: currentIrrig * currentArea,
          equipment_cost_inr: currentEquip * currentArea,
          electricity_fuel_cost_inr: currentFuel * currentArea,
          crop_protection_cost_inr: currentProt * currentArea,
          transportation_cost_inr: currentTrans * currentArea,
          packaging_cost_inr: currentPack * currentArea,
          other_costs_inr: currentOther * currentArea
        },
        what_if: {
          crop_name: whatIfCrop,
          area_acres: whatIfArea,
          expected_yield_kg: whatIfYield * whatIfArea,
          expected_selling_price_per_kg: whatIfPrice,
          seed_cost_inr: whatIfSeed * whatIfArea,
          fertilizer_cost_inr: whatIfFert * whatIfArea,
          organic_manure_cost_inr: whatIfManure * whatIfArea,
          labour_cost_inr: whatIfLabour * whatIfArea,
          irrigation_cost_inr: whatIfIrrig * whatIfArea,
          equipment_cost_inr: whatIfEquip * whatIfArea,
          electricity_fuel_cost_inr: whatIfFuel * whatIfArea,
          crop_protection_cost_inr: whatIfProt * whatIfArea,
          transportation_cost_inr: whatIfTrans * whatIfArea,
          packaging_cost_inr: whatIfPack * whatIfArea,
          other_costs_inr: whatIfOther * whatIfArea
        }
      };

      const [cmpRes, scnRes] = await Promise.all([
        cropApi.calculateWhatIf(payload),
        cropApi.calculateScenarios({
          crop_name: whatIfCrop,
          area_acres: whatIfArea,
          expected_yield_kg: whatIfYield * whatIfArea,
          expected_selling_price_per_kg: whatIfPrice
        })
      ]);

      setWhatIfResult(cmpRes);
      setScenariosResult(scnRes);
    } catch (err) {
      console.error('What-If simulation error', err);
    } finally {
      setIsWhatIfLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'what-if') {
      runWhatIfSimulation();
    }
  }, [
    activeTab,
    whatIfCrop,
    currentArea,
    currentYield,
    currentPrice,
    currentSeed,
    currentFert,
    currentManure,
    currentLabour,
    currentIrrig,
    currentEquip,
    currentFuel,
    currentProt,
    currentTrans,
    currentPack,
    currentOther,
    whatIfArea,
    whatIfYield,
    whatIfPrice,
    whatIfSeed,
    whatIfFert,
    whatIfManure,
    whatIfLabour,
    whatIfIrrig,
    whatIfEquip,
    whatIfFuel,
    whatIfProt,
    whatIfTrans,
    whatIfPack,
    whatIfOther
  ]);

  // Preset scenarios
  const applyPreset = (preset: string) => {
    if (preset === 'organic') {
      setWhatIfFert(1500);
      setWhatIfManure(7000);
      setWhatIfPrice(currentPrice * 1.35); // 35% organic premium
      setWhatIfProt(1800);
    } else if (preset === 'expansion') {
      setWhatIfArea(currentArea * 2);
      setWhatIfYield(currentYield);
      setWhatIfPrice(currentPrice);
    } else if (preset === 'price_surge') {
      setWhatIfPrice(Math.round(currentPrice * 1.4));
    } else if (preset === 'solar_drip') {
      setWhatIfIrrig(Math.round(currentIrrig * 0.4));
      setWhatIfFuel(Math.round(currentFuel * 0.3));
    } else if (preset === 'stress_test') {
      setWhatIfYield(Math.round(currentYield * 0.75));
      setWhatIfPrice(Math.round(currentPrice * 0.85));
      setWhatIfIrrig(Math.round(currentIrrig * 1.3));
    }
  };

  const resetOverrides = () => {
    setSeedCost('');
    setFertCost('');
    setManureCost('');
    setLabourCost('');
    setIrrigCost('');
    setEquipCost('');
    setProtCost('');
    setTransCost('');
    setCustomYield('');
    setCustomPrice('');
    runCalculation();
  };

  // Recharts Chart Data
  const chartData = whatIfResult
    ? [
        {
          metric: 'Estimated Profit',
          Current: whatIfResult.current_plan.estimated_profit_inr,
          'What-If': whatIfResult.what_if_plan.estimated_profit_inr
        },
        {
          metric: 'Expected Revenue',
          Current: whatIfResult.current_plan.expected_revenue_inr,
          'What-If': whatIfResult.what_if_plan.expected_revenue_inr
        },
        {
          metric: 'Total Expenses',
          Current: whatIfResult.current_plan.cost_breakdown.total_cost_inr,
          'What-If': whatIfResult.what_if_plan.cost_breakdown.total_cost_inr
        }
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-agri-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="green" size="sm">FINANCIAL INTELLIGENCE</Badge>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ESTIMATED MODEL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Farm Profit & What-If Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Simulate dynamic market rates, yield fluctuations, and input cost assumptions to optimize net earnings.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 shrink-0">
          <button
            onClick={() => setActiveTab('standard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'standard'
                ? 'bg-agri-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Standard Calculator
          </button>
          <button
            onClick={() => setActiveTab('what-if')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'what-if'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            💰 What-If Simulator
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: STANDARD PROFIT CALCULATOR                        */}
      {/* ======================================================== */}
      {activeTab === 'standard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Sliders & Adjustments */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 space-y-5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Scenario Variables</CardTitle>
                    <CardDescription>Adjust area, yield, and crop parameters</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetOverrides} icon={RefreshCw}>
                    Reset
                  </Button>
                </div>
              </CardHeader>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Crop</label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-agri-600/30"
                >
                  {['Tomato', 'Wheat', 'Rice', 'Onion', 'Potato', 'Mustard', 'Cotton', 'Maize'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Total Farm Area</span>
                  <span className="text-agri-700 font-extrabold">{area} Acres</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={area}
                  onChange={(e) => setArea(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-agri-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <Input
                  label="Custom Yield (kg)"
                  type="number"
                  value={customYield}
                  onChange={(e) => setCustomYield(e.target.value)}
                  placeholder="Auto Benchmark"
                />
                <Input
                  label="Selling Price (₹/kg)"
                  type="number"
                  step="0.5"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="Auto Benchmark"
                />
              </div>

              {/* Itemized Cost Overrides */}
              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                <span className="font-bold text-slate-800 uppercase text-[10px] block">Optional Itemized Cost Overrides (INR):</span>
                <div className="grid grid-cols-2 gap-2.5">
                  <Input label="Seeds Cost" value={seedCost} onChange={(e) => setSeedCost(e.target.value)} placeholder="Auto" />
                  <Input label="Fertilizer Cost" value={fertCost} onChange={(e) => setFertCost(e.target.value)} placeholder="Auto" />
                  <Input label="Organic Manure" value={manureCost} onChange={(e) => setManureCost(e.target.value)} placeholder="Auto" />
                  <Input label="Labour Cost" value={labourCost} onChange={(e) => setLabourCost(e.target.value)} placeholder="Auto" />
                  <Input label="Irrigation & Power" value={irrigCost} onChange={(e) => setIrrigCost(e.target.value)} placeholder="Auto" />
                  <Input label="Equipment Rental" value={equipCost} onChange={(e) => setEquipCost(e.target.value)} placeholder="Auto" />
                  <Input label="Crop Protection" value={protCost} onChange={(e) => setProtCost(e.target.value)} placeholder="Auto" />
                  <Input label="Transportation" value={transCost} onChange={(e) => setTransCost(e.target.value)} placeholder="Auto" />
                </div>

                <Button variant="primary" size="sm" className="w-full mt-2" onClick={runCalculation} isLoading={isLoading}>
                  Update Profit Simulation
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Output: Key Financial Cards & Pie Chart */}
          <div className="lg:col-span-7 space-y-6">
            {calculation && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Cost (Est.)</span>
                    <span className="text-xl font-extrabold text-rose-600">{formatINR(calculation.cost_breakdown.total_cost_inr)}</span>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Expected Revenue</span>
                    <span className="text-xl font-extrabold text-sky-700">{formatINR(calculation.expected_revenue_inr)}</span>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Net Profit (Est.)</span>
                    <span className="text-xl font-extrabold text-emerald-700">{formatINR(calculation.estimated_profit_inr)}</span>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Profit Margin</span>
                    <span className="text-xl font-extrabold text-slate-900">{calculation.profit_margin_percent}%</span>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Return on Investment</span>
                    <span className="text-xl font-extrabold text-amber-600">{calculation.return_on_investment_roi_percent}% ROI</span>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Break-even Price</span>
                    <span className="text-xl font-extrabold text-purple-700">₹{calculation.break_even_price_per_kg}/kg</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-5 flex flex-col justify-between">
                    <CardHeader className="pb-2 mb-2">
                      <CardTitle className="text-sm flex items-center gap-1.5">
                        <PieIcon className="w-4 h-4 text-slate-500" /> Operational Cost Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CostPieChart costBreakdown={calculation.cost_breakdown} />
                  </Card>

                  <Card className="p-5 space-y-4">
                    <CardHeader className="pb-2 mb-2">
                      <CardTitle className="text-sm">Economic Analysis & Insights</CardTitle>
                      <span className="px-2 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
                        {calculation.profitability_rating}
                      </span>
                    </CardHeader>

                    <div className="space-y-2 text-xs text-slate-600">
                      {calculation.insights.map((ins, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          {ins}
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-normal flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>Disclaimer:</strong> {calculation.disclaimer}</span>
                    </div>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: 💰 WHAT-IF FARM PROFIT SIMULATOR                  */}
      {/* ======================================================== */}
      {activeTab === 'what-if' && (
        <div className="space-y-6">
          {/* Strategy Presets Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Quick Strategy Presets:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => applyPreset('organic')}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition"
                >
                  🌱 Organic Transition (+35% Premium)
                </button>
                <button
                  onClick={() => applyPreset('expansion')}
                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-bold transition"
                >
                  📈 2x Land Expansion
                </button>
                <button
                  onClick={() => applyPreset('price_surge')}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition"
                >
                  🏷️ Mandi Price Surge (+40%)
                </button>
                <button
                  onClick={() => applyPreset('solar_drip')}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition"
                >
                  💧 Drip & Solar Power Savings
                </button>
                <button
                  onClick={() => applyPreset('stress_test')}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold transition"
                >
                  ⚠️ Adverse Climate Stress-Test
                </button>
              </div>
            </div>
          </div>

          {/* Prominent Profit Change Callout */}
          {whatIfResult && (
            <div
              className={`p-6 rounded-3xl border shadow-md flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${
                whatIfResult.profit_change_inr >= 0
                  ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white border-emerald-700/50'
                  : 'bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 text-white border-rose-800/50'
              }`}
            >
              <div className="space-y-1.5 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/20 tracking-wider">
                    SIMULATION IMPACT VERDICT
                  </span>
                  <span className="text-[10px] font-bold text-white/70 uppercase">
                    ESTIMATED CHANGE
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  {whatIfResult.summary_verdict}
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl">
                  {whatIfResult.disclaimer}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-white/80 block">Estimated Profit Change</span>
                  <div className="flex items-center gap-1.5 justify-end mt-0.5">
                    {whatIfResult.profit_change_inr >= 0 ? (
                      <TrendingUp className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-rose-400" />
                    )}
                    <span className="text-2xl sm:text-3xl font-black">
                      {whatIfResult.profit_change_inr >= 0 ? '+' : ''}
                      {formatINR(whatIfResult.profit_change_inr)}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-300 block mt-0.5">
                    ({whatIfResult.profit_change_percent >= 0 ? '+' : ''}
                    {whatIfResult.profit_change_percent}% relative to baseline)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Dual Parameter Controls vs Side-by-Side Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 5 Cols: Sliders and Inputs */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="p-6 space-y-5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-emerald-600" /> What-If Parameter Controls
                      </CardTitle>
                      <CardDescription>Tune assumptions to simulate dynamic outcomes</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Crop</label>
                  <select
                    value={whatIfCrop}
                    onChange={(e) => setWhatIfCrop(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  >
                    {['Tomato', 'Wheat', 'Rice', 'Onion', 'Potato', 'Mustard', 'Cotton', 'Maize'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Farm Area Slider */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>What-If Farm Area</span>
                    <span className="text-emerald-700 font-extrabold">{whatIfArea} Acres</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="25"
                    step="0.5"
                    value={whatIfArea}
                    onChange={(e) => setWhatIfArea(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                {/* Yield & Selling Price */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Expected Yield (kg/acre)
                    </label>
                    <input
                      type="number"
                      value={whatIfYield}
                      onChange={(e) => setWhatIfYield(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Selling Price (₹/kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={whatIfPrice}
                      onChange={(e) => setWhatIfPrice(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                    />
                  </div>
                </div>

                {/* Itemized Cost Assumptions Per Acre */}
                <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                  <span className="font-bold text-slate-800 uppercase text-[10px] block">
                    What-If Input Costs (₹ / Acre):
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Seeds</span>
                      <input
                        type="number"
                        value={whatIfSeed}
                        onChange={(e) => setWhatIfSeed(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Chemical Fertilizer</span>
                      <input
                        type="number"
                        value={whatIfFert}
                        onChange={(e) => setWhatIfFert(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Organic Manure</span>
                      <input
                        type="number"
                        value={whatIfManure}
                        onChange={(e) => setWhatIfManure(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Labour</span>
                      <input
                        type="number"
                        value={whatIfLabour}
                        onChange={(e) => setWhatIfLabour(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Irrigation</span>
                      <input
                        type="number"
                        value={whatIfIrrig}
                        onChange={(e) => setWhatIfIrrig(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Equipment & Tractor</span>
                      <input
                        type="number"
                        value={whatIfEquip}
                        onChange={(e) => setWhatIfEquip(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Electricity & Fuel</span>
                      <input
                        type="number"
                        value={whatIfFuel}
                        onChange={(e) => setWhatIfFuel(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Crop Protection</span>
                      <input
                        type="number"
                        value={whatIfProt}
                        onChange={(e) => setWhatIfProt(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Transportation</span>
                      <input
                        type="number"
                        value={whatIfTrans}
                        onChange={(e) => setWhatIfTrans(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Packaging</span>
                      <input
                        type="number"
                        value={whatIfPack}
                        onChange={(e) => setWhatIfPack(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right 7 Cols: CURRENT vs WHAT-IF Side-by-Side & Comparative Chart */}
            <div className="lg:col-span-7 space-y-6">
              {whatIfResult && (
                <>
                  {/* Two Side-by-Side Comparison Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Current Plan Card */}
                    <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <Badge variant="slate" size="sm">CURRENT PLAN</Badge>
                          <h4 className="font-extrabold text-sm text-slate-800 mt-1">Baseline Model</h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-500">{currentArea} Acres</span>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Expected Harvest:</span>
                          <span className="font-bold text-slate-800">{formatNumber(whatIfResult.current_plan.expected_yield_kg)} kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Selling Price:</span>
                          <span className="font-bold text-slate-800">₹{whatIfResult.current_plan.expected_selling_price_per_kg}/kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Total Input Cost:</span>
                          <span className="font-bold text-rose-600">{formatINR(whatIfResult.current_plan.cost_breakdown.total_cost_inr)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Gross Revenue:</span>
                          <span className="font-bold text-sky-700">{formatINR(whatIfResult.current_plan.expected_revenue_inr)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                          <span className="font-bold text-slate-700">Net Profit (Est.):</span>
                          <span className="font-extrabold text-sm text-emerald-700">
                            {formatINR(whatIfResult.current_plan.estimated_profit_inr)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-slate-500">
                          <span>ROI: {whatIfResult.current_plan.return_on_investment_roi_percent}%</span>
                          <span>Break-even: ₹{whatIfResult.current_plan.break_even_price_per_kg}/kg</span>
                        </div>
                      </div>
                    </div>

                    {/* What-If Plan Card */}
                    <div className="p-5 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 rounded-3xl border-2 border-emerald-500/80 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
                        <div>
                          <Badge variant="green" size="sm">WHAT-IF PLAN</Badge>
                          <h4 className="font-extrabold text-sm text-emerald-950 mt-1">Simulated Model</h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-800">{whatIfArea} Acres</span>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Expected Harvest:</span>
                          <span className="font-bold text-slate-900">{formatNumber(whatIfResult.what_if_plan.expected_yield_kg)} kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Selling Price:</span>
                          <span className="font-bold text-slate-900">₹{whatIfResult.what_if_plan.expected_selling_price_per_kg}/kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Total Input Cost:</span>
                          <span className="font-bold text-rose-600">{formatINR(whatIfResult.what_if_plan.cost_breakdown.total_cost_inr)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Gross Revenue:</span>
                          <span className="font-bold text-sky-700">{formatINR(whatIfResult.what_if_plan.expected_revenue_inr)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-emerald-200/80">
                          <span className="font-extrabold text-emerald-950">Net Profit (Est.):</span>
                          <span className="font-black text-base text-emerald-700">
                            {formatINR(whatIfResult.what_if_plan.estimated_profit_inr)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-emerald-800 font-semibold">
                          <span>ROI: {whatIfResult.what_if_plan.return_on_investment_roi_percent}%</span>
                          <span>Break-even: ₹{whatIfResult.what_if_plan.break_even_price_per_kg}/kg</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Recharts Comparison BarChart */}
                  <Card className="p-5 space-y-3">
                    <CardHeader className="pb-1">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Scale className="w-4 h-4 text-emerald-600" /> Current Plan vs What-If Plan Comparison
                      </CardTitle>
                      <CardDescription>Direct visual delta across Profit, Revenue, and Costs</CardDescription>
                    </CardHeader>

                    <div className="h-64 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                          <YAxis
                            tickFormatter={(val) => `₹${val >= 100000 ? `${(val/100000).toFixed(1)}L` : `${(val/1000).toFixed(0)}k`}`}
                            tick={{ fill: '#64748b', fontSize: 10 }}
                          />
                          <Tooltip
                            formatter={(value: any) => [formatINR(Number(value) || 0), 'Amount']}
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                          <Bar dataKey="Current" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="What-If" fill="#10b981" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </>
              )}
            </div>
          </div>

          {/* Multi-Scenario Analysis (Conservative, Expected, Best Case) */}
          {scenariosResult && (
            <Card className="p-6 space-y-5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Layers className="w-4 h-4 text-agri-700" /> Multi-Scenario Range Projection
                    </CardTitle>
                    <CardDescription>
                      Simulated range under market volatility, weather swings, and premium wholesale rates
                    </CardDescription>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-md">
                    ALL ESTIMATED
                  </span>
                </div>
              </CardHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Conservative Scenario */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase">📉 Conservative</span>
                    <Badge variant="amber" size="sm">{scenariosResult.conservative.risk_level}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">{scenariosResult.conservative.tagline}</p>
                  
                  <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Yield:</span>
                      <span className="font-bold">{formatNumber(scenariosResult.conservative.assumed_yield_kg)} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Price:</span>
                      <span className="font-bold">₹{scenariosResult.conservative.assumed_price_per_kg}/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cost:</span>
                      <span className="font-bold text-rose-600">{formatINR(scenariosResult.conservative.total_cost_inr)}</span>
                    </div>
                    <div className="flex justify-between pt-1 font-bold text-slate-800">
                      <span>Est. Net Profit:</span>
                      <span className="text-emerald-700">{formatINR(scenariosResult.conservative.estimated_profit_inr)}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 text-right">
                      ROI: {scenariosResult.conservative.roi_percent}%
                    </div>
                  </div>
                </div>

                {/* Expected Scenario */}
                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 uppercase">📊 Expected (Benchmark)</span>
                    <Badge variant="green" size="sm">{scenariosResult.expected.risk_level}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-600">{scenariosResult.expected.tagline}</p>
                  
                  <div className="space-y-1.5 pt-2 border-t border-emerald-200 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Yield:</span>
                      <span className="font-bold">{formatNumber(scenariosResult.expected.assumed_yield_kg)} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Price:</span>
                      <span className="font-bold">₹{scenariosResult.expected.assumed_price_per_kg}/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Cost:</span>
                      <span className="font-bold text-rose-600">{formatINR(scenariosResult.expected.total_cost_inr)}</span>
                    </div>
                    <div className="flex justify-between pt-1 font-bold text-slate-900">
                      <span>Est. Net Profit:</span>
                      <span className="text-emerald-700">{formatINR(scenariosResult.expected.estimated_profit_inr)}</span>
                    </div>
                    <div className="text-[11px] text-emerald-800 text-right font-semibold">
                      ROI: {scenariosResult.expected.roi_percent}%
                    </div>
                  </div>
                </div>

                {/* Best Case Scenario */}
                <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 uppercase">🚀 Best Case (Optimal)</span>
                    <Badge variant="purple" size="sm">{scenariosResult.best_case.risk_level}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-600">{scenariosResult.best_case.tagline}</p>
                  
                  <div className="space-y-1.5 pt-2 border-t border-purple-200 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Yield:</span>
                      <span className="font-bold">{formatNumber(scenariosResult.best_case.assumed_yield_kg)} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Price:</span>
                      <span className="font-bold">₹{scenariosResult.best_case.assumed_price_per_kg}/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Cost:</span>
                      <span className="font-bold text-rose-600">{formatINR(scenariosResult.best_case.total_cost_inr)}</span>
                    </div>
                    <div className="flex justify-between pt-1 font-bold text-slate-900">
                      <span>Est. Net Profit:</span>
                      <span className="text-emerald-700 font-extrabold">{formatINR(scenariosResult.best_case.estimated_profit_inr)}</span>
                    </div>
                    <div className="text-[11px] text-purple-800 text-right font-semibold">
                      ROI: {scenariosResult.best_case.roi_percent}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Simulation Methodology:</strong> Projections account for weather anomalies, crop pest vulnerabilities, and mandi price volatility. All outputs are mathematical estimations and do not constitute legal or financial guarantees.
                </span>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

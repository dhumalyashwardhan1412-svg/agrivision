import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calculator, TrendingUp, AlertCircle, RefreshCw, DollarSign, PieChart as PieIcon, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { CostPieChart } from '../../components/charts/CostPieChart';
import { cropApi } from '../../services/cropApi';
import { ProfitCalculationResponse, Crop } from '../../types';
import { formatINR, formatNumber } from '../../utils/formatters';

export const ProfitCalculator: React.FC = () => {
  const location = useLocation();
  const stateData = location.state as { cropName?: string } | undefined;

  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>(stateData?.cropName || 'Tomato');
  const [area, setArea] = useState<number>(2.0);

  // Custom cost overrides
  const [seedCost, setSeedCost] = useState<string>('');
  const [fertCost, setFertCost] = useState<string>('');
  const [labourCost, setLabourCost] = useState<string>('');
  const [irrigCost, setIrrigCost] = useState<string>('');
  const [equipCost, setEquipCost] = useState<string>('');
  const [protCost, setProtCost] = useState<string>('');
  const [transCost, setTransCost] = useState<string>('');
  const [customYield, setCustomYield] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<string>('');

  const [calculation, setCalculation] = useState<ProfitCalculationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const data = await cropApi.getCrops();
        setCrops(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCrops();
  }, []);

  const runCalculation = async () => {
    setIsLoading(true);
    try {
      const payload: Record<string, any> = {
        crop_name: selectedCrop,
        area_acres: area,
      };
      if (seedCost) payload.seed_cost_inr = parseFloat(seedCost);
      if (fertCost) payload.fertilizer_cost_inr = parseFloat(fertCost);
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
    runCalculation();
  }, [selectedCrop, area]);

  const resetOverrides = () => {
    setSeedCost('');
    setFertCost('');
    setLabourCost('');
    setIrrigCost('');
    setEquipCost('');
    setProtCost('');
    setTransCost('');
    setCustomYield('');
    setCustomPrice('');
    runCalculation();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-agri-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="green" size="sm">ECONOMIC MODELING & SIMULATION</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Interactive Profit & ROI Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Simulate input expenses, harvest yields, and mandi selling prices to calculate break-even points.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={resetOverrides} icon={RefreshCw}>
            Reset to Benchmarks
          </Button>
        </div>
      </div>

      {/* Main Grid: Parameters vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Sliders & Adjustments */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-5">
            <CardHeader>
              <div>
                <CardTitle className="text-base">Scenario Variables</CardTitle>
                <CardDescription>Adjust area, yield, and crop parameters</CardDescription>
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

            {/* Itemized Cost Overrides Accordion/Inputs */}
            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <span className="font-bold text-slate-800 uppercase text-[10px] block">Optional Itemized Cost Overrides (INR):</span>
              <div className="grid grid-cols-2 gap-2.5">
                <Input label="Seeds Cost" value={seedCost} onChange={(e) => setSeedCost(e.target.value)} placeholder="Auto" />
                <Input label="Fertilizer Cost" value={fertCost} onChange={(e) => setFertCost(e.target.value)} placeholder="Auto" />
                <Input label="Labour Cost" value={labourCost} onChange={(e) => setLabourCost(e.target.value)} placeholder="Auto" />
                <Input label="Irrigation & Electricity" value={irrigCost} onChange={(e) => setIrrigCost(e.target.value)} placeholder="Auto" />
                <Input label="Equipment Rental" value={equipCost} onChange={(e) => setEquipCost(e.target.value)} placeholder="Auto" />
                <Input label="Crop Protection" value={protCost} onChange={(e) => setProtCost(e.target.value)} placeholder="Auto" />
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
              {/* Financial KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Cost</span>
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

              {/* Cost Pie Chart & Insights */}
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
    </div>
  );
};

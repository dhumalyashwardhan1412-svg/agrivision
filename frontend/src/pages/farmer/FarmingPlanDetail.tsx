import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Sprout,
  Sparkles,
  Layers,
  Calendar,
  Clock,
  Droplets,
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  FileText,
  DollarSign
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { cropApi } from '../../services/cropApi';
import { farmApi } from '../../services/farmApi';
import { Crop, Farm, FarmingPlan, FarmingMethodology } from '../../types';
import { formatINR } from '../../utils/formatters';

export const FarmingPlanDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stateData = location.state as { cropId?: number; cropName?: string } | undefined;

  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<number>(stateData?.cropId || 1);
  const [methodology, setMethodology] = useState<FarmingMethodology>('MODERN');
  const [activePlan, setActivePlan] = useState<FarmingPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      try {
        const farmList = await farmApi.getMyFarms();
        setFarms(farmList);
        if (farmList.length > 0) setSelectedFarm(farmList[0]);

        const cropList = await cropApi.getCrops();
        setCrops(cropList);
        if (cropList.length > 0 && !stateData?.cropId) {
          setSelectedCropId(cropList[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const handleGeneratePlan = async (method: FarmingMethodology) => {
    if (!selectedFarm) return;
    setIsLoading(true);
    try {
      const plan = await cropApi.generateFarmingPlan({
        farm_id: selectedFarm.id,
        crop_id: selectedCropId,
        methodology: method,
        target_area_acres: selectedFarm.total_area_acres || 1.0,
      });
      setActivePlan(plan);
      setMethodology(method);
    } catch (err) {
      console.error('Failed to generate plan', err);
      alert('Error generating farming plan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFarm && selectedCropId) {
      handleGeneratePlan(methodology);
    }
  }, [selectedFarm, selectedCropId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-agri-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="green" size="sm">PRECISION AGRONOMIC PROTOCOL</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Multi-Stage Farming Schedule & Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Tailored stage-by-stage instructions from field preparation to post-harvest cold storage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCropId}
            onChange={(e) => setSelectedCropId(parseInt(e.target.value))}
            className="rounded-xl border border-slate-700 bg-slate-800 text-white px-3 py-2 text-xs font-bold"
          >
            {crops.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Methodology Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Tabs
          tabs={[
            { id: 'MODERN', label: '🚀 Modern Precision Agriculture', icon: Sparkles },
            { id: 'ORGANIC', label: '🌱 Certified Organic & Natural Farming', icon: Sprout },
            { id: 'CONVENTIONAL', label: '🌾 Conventional Intensive System', icon: Layers },
          ]}
          activeTab={methodology}
          onChange={(id) => handleGeneratePlan(id as FarmingMethodology)}
        />

        <Button
          variant="outline"
          size="sm"
          icon={FileText}
          onClick={() => navigate('/farmer/report')}
        >
          Download PDF Farm Plan
        </Button>
      </div>

      {/* Plan Overview & Financial Summary */}
      {activePlan && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="p-4 bg-slate-900 text-white">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Estimated Cost</span>
              <span className="text-xl font-extrabold text-rose-300">{formatINR(activePlan.total_estimated_cost_inr)}</span>
            </Card>
            <Card className="p-4 bg-slate-900 text-white">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Expected Harvest Yield</span>
              <span className="text-xl font-extrabold text-sky-300">{activePlan.expected_yield_kg.toLocaleString()} kg</span>
            </Card>
            <Card className="p-4 bg-slate-900 text-white">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Est. Gross Revenue</span>
              <span className="text-xl font-extrabold text-amber-300">{formatINR(activePlan.expected_revenue_inr)}</span>
            </Card>
            <Card className="p-4 bg-slate-900 text-white">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Estimated Net Profit</span>
              <span className="text-xl font-extrabold text-emerald-400">{formatINR(activePlan.estimated_net_profit_inr)}</span>
            </Card>
          </div>

          {/* Timeline Phase Stages */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Crop Lifecycle Timeline & Execution Stages ({activePlan.schedule_stages_json.length} Phases)
            </h3>

            <div className="space-y-4">
              {activePlan.schedule_stages_json.map((stage, idx) => (
                <Card key={idx} className="p-6 border-l-4 border-l-agri-600 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-agri-100 text-agri-800 font-extrabold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900">{stage.stage_name}</h4>
                        <span className="text-xs text-slate-500 font-medium">{stage.key_objectives}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-bold text-xs">
                      Days {stage.day_start} – {stage.day_end}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl">
                      <span className="font-bold text-slate-800 uppercase text-[10px] block">Scheduled Field Operations:</span>
                      <ul className="space-y-1 text-slate-700 list-disc list-inside">
                        {stage.activities.map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1.5 p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                      <span className="font-bold text-emerald-900 uppercase text-[10px] block">Inputs & Dosages:</span>
                      <ul className="space-y-1 text-emerald-800 list-disc list-inside">
                        {stage.inputs_required.map((inp, i) => (
                          <li key={i}>{inp}</li>
                        ))}
                      </ul>
                      <span className="block text-[11px] font-bold text-emerald-900 pt-2 border-t border-emerald-100">
                        Est. Phase Cost: {formatINR(stage.cost_estimate_inr)}
                      </span>
                    </div>

                    <div className="space-y-1.5 p-3.5 bg-amber-50/60 rounded-2xl border border-amber-100">
                      <span className="font-bold text-amber-900 uppercase text-[10px] block">Precautions & Quality Checks:</span>
                      <ul className="space-y-1 text-amber-800 list-disc list-inside">
                        {stage.precautions.map((prec, i) => (
                          <li key={i}>{prec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Operational Protocols */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-2.5">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-600" /> Fertilizer & Fertigation Schedule
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">{activePlan.fertilizer_schedule}</p>
            </Card>

            <Card className="p-6 space-y-2.5">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-600" /> Irrigation & Moisture Protocol
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">{activePlan.irrigation_schedule}</p>
            </Card>

            <Card className="p-6 space-y-2.5">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" /> Integrated Pest & Disease Protocol
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">{activePlan.pest_disease_management}</p>
            </Card>

            <Card className="p-6 space-y-2.5">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sprout className="w-4 h-4 text-amber-600" /> Harvesting & Machinery Requirements
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">{activePlan.harvest_guidelines} Equipment: {activePlan.equipment_needed}</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

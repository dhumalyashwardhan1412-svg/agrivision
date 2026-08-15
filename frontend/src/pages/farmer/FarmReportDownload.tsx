import React, { useState, useEffect } from 'react';
import { FileText, Download, ShieldCheck, CheckCircle2, Sprout, Sparkles, Printer, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { reportApi } from '../../services/reportApi';
import { farmApi } from '../../services/farmApi';
import { cropApi } from '../../services/cropApi';
import { Farm, CropRecommendation } from '../../types';
import { formatINR } from '../../utils/formatters';

export const FarmReportDownload: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const farmList = await farmApi.getMyFarms();
        setFarms(farmList);
        if (farmList.length > 0) {
          setSelectedFarm(farmList[0]);
          const recs = await cropApi.getRecommendationsForFarm(farmList[0].id);
          setRecommendations(recs);
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const handleDownloadPDF = async () => {
    if (!selectedFarm) return;
    setIsDownloading(true);
    try {
      await reportApi.downloadFarmReportPDF(selectedFarm.id);
    } catch (err) {
      console.error('Download err', err);
      alert('Failed to generate PDF. Backend ReportLab service may be busy.');
    } finally {
      setIsDownloading(false);
    }
  };

  const topRec = recommendations.length > 0 ? recommendations[0] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-agri-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="green" size="sm">CERTIFIED AGRONOMIC INTELLIGENCE</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Smart Farm Advisory & Soil Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Generate and export official high-resolution PDF farm dossiers with ReportLab.
          </p>
        </div>

        <Button
          size="lg"
          className="bg-white text-agri-900 hover:bg-slate-100 font-extrabold shadow-lg"
          icon={Download}
          onClick={handleDownloadPDF}
          isLoading={isDownloading}
        >
          Download PDF Report
        </Button>
      </div>

      {/* Live Visual Dossier Preview */}
      <Card className="p-8 max-w-4xl mx-auto border-2 border-slate-300/80 shadow-2xl bg-white space-y-8">
        {/* Report Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-agri-800 text-white flex items-center justify-center shadow-md">
              <Sprout className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">AgriVision Smart Farm Report</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Certified Comprehensive Agronomic Advisory & Soil Health Dossier
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500">
            <span className="font-bold text-slate-900 block">Report Ref: #AGR-{selectedFarm?.id || 101}-{Date.now().toString().slice(-4)}</span>
            <span>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Farmer & Farm Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Farm Profile</span>
            <strong className="text-slate-900 text-sm block mt-0.5">{selectedFarm?.name || 'Green Valley Eco Farm'}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Location</span>
            <strong className="text-slate-900 text-sm block mt-0.5">{selectedFarm?.district || 'Ludhiana'}, {selectedFarm?.state || 'Punjab'}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Area</span>
            <strong className="text-slate-900 text-sm block mt-0.5">{selectedFarm?.total_area_acres || 3.5} Acres</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Irrigation Mode</span>
            <strong className="text-slate-900 text-sm block mt-0.5">{selectedFarm?.irrigation_system || 'Drip'} ({selectedFarm?.water_source || 'Borewell'})</strong>
          </div>
        </div>

        {/* Top Recommendation Highlight */}
        {topRec && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900">Ranked Crop Suitability & Financial Projection</h3>
              <Badge variant="green" size="sm">Score: {topRec.overall_suitability_score}%</Badge>
            </div>

            <div className="p-5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-emerald-950 text-base">{topRec.crop.name} ({topRec.crop.scientific_name})</h4>
                  <span className="text-emerald-800 font-medium">Duration: {topRec.crop.duration_days} Days • Season: {topRec.crop.growing_season}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Est. Net Profit</span>
                  <span className="text-xl font-extrabold text-emerald-900">{formatINR(topRec.estimated_profit_inr)}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center pt-2 border-t border-emerald-200/60">
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-[9px] font-bold text-slate-400 block">Soil</span>
                  <strong className="text-slate-800">{topRec.soil_score}%</strong>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-[9px] font-bold text-slate-400 block">Climate</span>
                  <strong className="text-slate-800">{topRec.climate_score}%</strong>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-[9px] font-bold text-slate-400 block">Water</span>
                  <strong className="text-slate-800">{topRec.water_score}%</strong>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-[9px] font-bold text-slate-400 block">Market</span>
                  <strong className="text-slate-800">{topRec.market_score}%</strong>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-[9px] font-bold text-slate-400 block">Profit</span>
                  <strong className="text-slate-800">{topRec.profit_score}%</strong>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-[9px] font-bold text-slate-400 block">Risk</span>
                  <strong className="text-emerald-700">Low ({topRec.risk_score}%)</strong>
                </div>
              </div>

              <p className="text-emerald-900 pt-1 leading-relaxed">
                <strong>Agronomist Rationale:</strong> {topRec.ai_explanation}
              </p>
            </div>
          </div>
        )}

        {/* Verification Footer */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>AgriVision Certified Decision-Support Intelligence Document</span>
          </div>

          <Button variant="primary" icon={Download} onClick={handleDownloadPDF} isLoading={isDownloading}>
            Download Certified PDF
          </Button>
        </div>
      </Card>
    </div>
  );
};

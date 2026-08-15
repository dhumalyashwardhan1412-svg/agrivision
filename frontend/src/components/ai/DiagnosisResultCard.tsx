import React from 'react';
import { ShieldCheck, AlertTriangle, Sprout, FlaskConical, CheckCircle2, Info } from 'lucide-react';
import { CropDiagnosis } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface DiagnosisResultCardProps {
  diagnosis: CropDiagnosis;
}

export const DiagnosisResultCard: React.FC<DiagnosisResultCardProps> = ({ diagnosis }) => {
  const isHealthy = diagnosis.condition_name.toLowerCase().includes('healthy') || diagnosis.health_status.toLowerCase().includes('optimal');

  return (
    <Card className="border-2 border-slate-200/90 shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between w-full">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={isHealthy ? 'green' : 'amber'} size="md">
                {isHealthy ? 'HEALTHY CROP' : 'ATTENTION REQUIRED'}
              </Badge>
              <span className="text-xs font-semibold text-slate-500">
                Confidence: {diagnosis.confidence_percentage.toFixed(1)}%
              </span>
            </div>
            <CardTitle className="mt-2 text-xl">{diagnosis.condition_name}</CardTitle>
            <CardDescription>Identified Crop: <strong className="text-slate-800">{diagnosis.detected_crop}</strong></CardDescription>
          </div>

          <div className={`p-3 rounded-2xl ${isHealthy ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            {isHealthy ? <ShieldCheck className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>
        </div>
      </CardHeader>

      <div className="space-y-4 text-xs sm:text-sm">
        {/* Symptoms */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <h5 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wide">
            <Info className="w-3.5 h-3.5 text-slate-500" /> Symptoms & Visual Indicators
          </h5>
          <p className="text-slate-600 leading-relaxed">{diagnosis.symptoms_observed}</p>
        </div>

        {/* Two Columns: Organic vs Chemical */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Organic */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl space-y-1.5">
            <h5 className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <Sprout className="w-4 h-4 text-emerald-700" /> Organic & Bio-Remedy
            </h5>
            <p className="text-emerald-800 leading-relaxed">{diagnosis.organic_solution}</p>
          </div>

          {/* Chemical */}
          <div className="p-4 bg-sky-50/70 border border-sky-200/70 rounded-2xl space-y-1.5">
            <h5 className="font-bold text-sky-900 flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <FlaskConical className="w-4 h-4 text-sky-700" /> Recommended Modern Treatment
            </h5>
            <p className="text-sky-800 leading-relaxed">{diagnosis.chemical_treatment}</p>
          </div>
        </div>

        {/* Preventive IPM */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <h5 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Preventive IPM Measures
          </h5>
          <p className="text-slate-600 leading-relaxed">{diagnosis.preventive_measures}</p>
        </div>

        {/* Laboratory Disclaimer */}
        <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl text-[11px] text-amber-800 leading-normal flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span><strong>Disclaimer:</strong> {diagnosis.disclaimer}</span>
        </div>
      </div>
    </Card>
  );
};

import React from 'react';
import { Eye, Droplets, Sparkles, AlertCircle, Info, Check } from 'lucide-react';
import { SoilObservation } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface SoilObservationCardProps {
  observation: SoilObservation;
}

export const SoilObservationCard: React.FC<SoilObservationCardProps> = ({ observation }) => {
  return (
    <Card className="border-2 border-slate-200/90 shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between w-full">
          <div>
            <Badge variant="amber" size="md">
              VISUAL PHOTO ESTIMATE
            </Badge>
            <CardTitle className="mt-2 text-xl">{observation.estimated_soil_type}</CardTitle>
            <CardDescription>Topsoil Visual Observation Analysis</CardDescription>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-700">
            <Eye className="w-8 h-8" />
          </div>
        </div>
      </CardHeader>

      <div className="space-y-4 text-xs sm:text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Color Tone</span>
            <span className="font-semibold text-slate-900 mt-0.5 block">{observation.visual_color_tone}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Moisture Appearance</span>
            <span className="font-semibold text-slate-900 mt-0.5 block">{observation.moisture_estimate}</span>
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl">
          <h5 className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1 text-xs uppercase">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" /> Organic Matter & Humus
          </h5>
          <p className="text-emerald-800 leading-relaxed">{observation.organic_humus_appearance}</p>
        </div>

        {observation.potential_challenges && observation.potential_challenges.length > 0 && (
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
            <h5 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Potential Challenges Observed
            </h5>
            <ul className="space-y-1 text-slate-600">
              {observation.potential_challenges.map((c, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <h5 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1 text-xs uppercase">
            <Check className="w-3.5 h-3.5 text-emerald-600" /> Preliminary Agronomic Advice
          </h5>
          <p className="text-slate-600 leading-relaxed">{observation.preliminary_advice}</p>
        </div>

        {/* Disclaimer */}
        <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span><strong>Notice:</strong> {observation.disclaimer}</span>
        </div>
      </div>
    </Card>
  );
};

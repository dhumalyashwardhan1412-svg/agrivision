import React from 'react';
import {
  Sparkles,
  FlaskConical,
  Droplets,
  Radio,
  Sun,
  Wind,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  Thermometer
} from 'lucide-react';
import { StoryStepInfo, WeatherType } from '../state/useFarm3DStore';

interface CinematicHUDProps {
  currentStep: StoryStepInfo;
  weather: WeatherType;
  growthProgress: number;
}

export const CinematicHUD: React.FC<CinematicHUDProps> = ({
  currentStep,
  weather,
  growthProgress,
}) => {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 p-6 flex justify-between items-start">
      {/* --- Left Telemetry HUD Card --- */}
      <div className="pointer-events-auto w-80 max-w-[calc(100vw-3rem)] bg-slate-950/80 backdrop-blur-xl border border-white/15 rounded-3xl p-5 shadow-2xl text-white space-y-4 animate-in fade-in slide-in-from-left duration-300">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight text-white">AgriVision 3D Twin</h3>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block -mt-0.5">
                Precision Agritech OS
              </span>
            </div>
          </div>

          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE
          </span>
        </div>

        {/* Step-Specific Dynamic Telemetry Display */}
        {currentStep.key === 'SOIL' || currentStep.key === 'ROOTS' || currentStep.key === 'AI_SCAN' ? (
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-sky-400" /> Soil Strata Assays
            </span>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Nitrogen (N)</span>
                <strong className="text-sky-300 text-sm">245</strong>
                <span className="text-[9px] text-slate-500 block">kg/ha</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Phosphorus (P)</span>
                <strong className="text-amber-300 text-sm">22.5</strong>
                <span className="text-[9px] text-slate-500 block">kg/ha</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Potassium (K)</span>
                <strong className="text-purple-300 text-sm">195</strong>
                <span className="text-[9px] text-slate-500 block">kg/ha</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-400 block">Soil pH Reaction</span>
                <strong className="text-emerald-400 font-extrabold">6.8 (Neutral)</strong>
              </div>
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-400 block">Organic Carbon</span>
                <strong className="text-emerald-400 font-extrabold">0.78% (High)</strong>
              </div>
            </div>
          </div>
        ) : currentStep.key === 'WATER' ? (
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-400" /> Smart Drip Telemetry
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-400 block">Flow Pressure</span>
                <strong className="text-sky-300 text-sm">2.4 Bar</strong>
              </div>
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-400 block">Flow Rate</span>
                <strong className="text-sky-300 text-sm">12.5 L/min</strong>
              </div>
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 col-span-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400">Root Zone Moisture</span>
                  <strong className="text-emerald-400 font-bold">68% Optimal</strong>
                </div>
              </div>
            </div>
          </div>
        ) : currentStep.key === 'DRONE' ? (
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" /> Hexacopter LiDAR Telemetry
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-400 block">Altitude</span>
                <strong className="text-white text-sm">8.5 meters</strong>
              </div>
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-400 block">NDVI Health Index</span>
                <strong className="text-emerald-400 text-sm">0.86 (Prime)</strong>
              </div>
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl col-span-2 text-emerald-300 text-xs">
                ✅ 94% Healthy Foliage • 6% Water Stressed Area Detected
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" /> Farm Status
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-400 block">Total Area</span>
                <strong className="text-white text-sm">3.5 Acres</strong>
              </div>
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-400 block">Growth Stage</span>
                <strong className="text-amber-400 text-sm">{Math.round(growthProgress * 100)}% Mature</strong>
              </div>
            </div>
          </div>
        )}

        {/* AI Insight Snippet */}
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[11px] text-emerald-200 leading-relaxed">
          <span className="font-bold flex items-center gap-1 text-emerald-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> AI Agronomy Advisory:
          </span>
          {currentStep.description}
        </div>
      </div>

      {/* --- Right Weather & Energy Telemetry Card --- */}
      <div className="pointer-events-auto hidden sm:flex flex-col gap-3 w-64 bg-slate-950/80 backdrop-blur-xl border border-white/15 rounded-3xl p-4 shadow-2xl text-white animate-in fade-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-extrabold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" /> Micro-Climate
          </span>
          <span className="text-[10px] text-slate-400">{weather}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[10px] text-slate-400 block">Air Temp</span>
            <strong className="text-white font-bold">{weather === 'RAIN' || weather === 'STORM' ? '22.4°C' : '28.5°C'}</strong>
          </div>
          <div className="p-2 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[10px] text-slate-400 block">Humidity</span>
            <strong className="text-white font-bold">{weather === 'RAIN' || weather === 'STORM' ? '88%' : '62%'}</strong>
          </div>
          <div className="p-2 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[10px] text-slate-400 block">Wind Velocity</span>
            <strong className="text-white font-bold">{weather === 'STORM' ? '38 km/h' : '12 km/h'}</strong>
          </div>
          <div className="p-2 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[10px] text-slate-400 block">Solar Power</span>
            <strong className="text-emerald-400 font-bold">{weather === 'RAIN' || weather === 'STORM' ? '1.2 kW' : '4.8 kW'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

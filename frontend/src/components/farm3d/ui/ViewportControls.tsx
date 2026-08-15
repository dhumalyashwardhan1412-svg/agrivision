import React from 'react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Compass,
  Layers,
  Sparkles,
  Eye
} from 'lucide-react';
import { CameraMode } from '../state/useFarm3DStore';

interface ViewportControlsProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  cameraMode: CameraMode;
  onChangeCameraMode: (mode: CameraMode) => void;
  freeOrbit: boolean;
  onToggleFreeOrbit: () => void;
}

export const ViewportControls: React.FC<ViewportControlsProps> = ({
  soundEnabled,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
  cameraMode,
  onChangeCameraMode,
  freeOrbit,
  onToggleFreeOrbit,
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Free Orbit Toggle */}
      <button
        onClick={onToggleFreeOrbit}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold border transition shadow-lg ${
          freeOrbit
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            : 'bg-slate-950/80 text-slate-300 border-white/15 hover:bg-white/10'
        }`}
        title="Toggle Free 360° Camera Orbit"
      >
        <Compass className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Free Orbit</span>
      </button>

      {/* Camera Mode Selector */}
      <select
        value={cameraMode}
        onChange={(e) => onChangeCameraMode(e.target.value as CameraMode)}
        className="bg-slate-950/80 backdrop-blur-xl border border-white/15 text-slate-200 text-xs font-bold rounded-2xl px-3 py-2 focus:outline-none focus:border-emerald-500 shadow-lg cursor-pointer"
      >
        <option value="CINEMATIC">🎬 Cinematic Cam</option>
        <option value="FREE_ORBIT">🔄 Orbit Mode</option>
        <option value="UNDERGROUND">🧪 Underground Strata</option>
        <option value="TOP_DOWN">🗺️ Aerial Satellite</option>
      </select>

      {/* Sound Synthesizer Ambience Toggle */}
      <button
        onClick={onToggleSound}
        className={`p-2.5 rounded-2xl border transition shadow-lg ${
          soundEnabled
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
            : 'bg-slate-950/80 text-slate-400 border-white/15 hover:bg-white/10'
        }`}
        title={soundEnabled ? 'Mute Farm Soundscape' : 'Enable Generative Farm Audio Ambience'}
      >
        {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>

      {/* Fullscreen Toggle */}
      <button
        onClick={onToggleFullscreen}
        className="p-2.5 bg-slate-950/80 backdrop-blur-xl border border-white/15 text-slate-300 hover:text-white rounded-2xl transition shadow-lg hover:bg-white/10"
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>
    </div>
  );
};

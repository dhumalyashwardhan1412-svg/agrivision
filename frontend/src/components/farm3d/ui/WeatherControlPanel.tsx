import React from 'react';
import { Sun, CloudSun, Cloud, CloudRain, Zap } from 'lucide-react';
import { WeatherType } from '../state/useFarm3DStore';

interface WeatherControlPanelProps {
  weather: WeatherType;
  onChangeWeather: (w: WeatherType) => void;
}

export const WeatherControlPanel: React.FC<WeatherControlPanelProps> = ({
  weather,
  onChangeWeather,
}) => {
  const options: { type: WeatherType; label: string; icon: any }[] = [
    { type: 'SUNNY', label: 'Sunny', icon: Sun },
    { type: 'PARTLY_CLOUDY', label: 'Cloudy', icon: CloudSun },
    { type: 'OVERCAST', label: 'Overcast', icon: Cloud },
    { type: 'RAIN', label: 'Rain', icon: CloudRain },
    { type: 'STORM', label: 'Storm', icon: Zap },
  ];

  return (
    <div className="bg-slate-950/80 backdrop-blur-xl border border-white/15 p-1.5 rounded-2xl shadow-xl flex items-center gap-1">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = weather === opt.type;

        return (
          <button
            key={opt.type}
            onClick={() => onChangeWeather(opt.type)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              isActive
                ? 'bg-white/20 text-white shadow-sm scale-105'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
            title={opt.label}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : ''}`} />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

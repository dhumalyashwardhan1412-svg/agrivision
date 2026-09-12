import React from 'react';
import { CloudSun, Droplets, Wind, Thermometer, Compass } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface WeatherWidgetProps {
  locationName?: string;
  temperature?: number;
  condition?: string;
  humidity?: number;
  windSpeed?: number;
  forecast?: { day: string; temp: number; icon: string }[];
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  locationName = 'Ludhiana, Punjab',
  temperature = 29,
  condition,
  humidity = 58,
  windSpeed = 12,
}) => {
  const { t } = useLanguage();
  const displayCondition = condition || t('weather.partlySunny', 'Partly Sunny / Optimal Sowing');

  return (
    <div className="bg-gradient-to-br from-slate-900 via-agri-950 to-slate-900 text-white rounded-3xl p-6 shadow-lg border border-agri-800/40 relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute -right-8 -top-8 w-40 h-40 bg-agri-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold tracking-wider uppercase">
            <Compass className="w-3.5 h-3.5" />
            <span>{t('weather.liveTitle', 'Farm Agro-Weather Live')}</span>
          </div>
          <h4 className="text-lg font-bold text-white mt-1">{locationName}</h4>
          <p className="text-xs text-slate-300 mt-0.5">{displayCondition}</p>
        </div>
        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
          <CloudSun className="w-8 h-8 text-amber-400" />
        </div>
      </div>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-4xl font-extrabold tracking-tight text-white">{temperature}°C</span>
        <span className="text-xs text-slate-400 font-medium">{t('weather.feelsLike', 'Feels like')} {temperature + 2}°C</span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-rose-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px]">{t('weather.soilTemp', 'Soil Temp')}</span>
            <span className="font-semibold text-slate-100">24°C</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px]">{t('weather.humidity', 'Humidity')}</span>
            <span className="font-semibold text-slate-100">{humidity}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px]">{t('weather.wind', 'Wind')}</span>
            <span className="font-semibold text-slate-100">{windSpeed} km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

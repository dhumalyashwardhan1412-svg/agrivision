import React from 'react';
import { TrendingUp, TrendingDown, Radio } from 'lucide-react';
import { MarketPrice } from '../../types';

interface LiveMandiTickerProps {
  prices: MarketPrice[];
}

export const LiveMandiTicker: React.FC<LiveMandiTickerProps> = ({ prices }) => {
  if (!prices || prices.length === 0) return null;

  return (
    <div className="w-full bg-slate-900 text-white py-2 px-4 overflow-hidden border-y border-slate-800 flex items-center shadow-inner">
      <div className="flex items-center gap-2 pr-4 border-r border-slate-700 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-bold tracking-wider text-emerald-400 flex items-center gap-1 uppercase">
          <Radio className="w-3 h-3" /> APMC Mandi Ticker
        </span>
      </div>

      <div className="flex items-center gap-8 overflow-x-auto no-scrollbar whitespace-nowrap pl-4 text-xs">
        {prices.map((p) => {
          const isUp = p.price_change_7d_percent >= 0;
          return (
            <div key={p.id} className="inline-flex items-center gap-2 font-medium">
              <span className="font-bold text-slate-100">{p.commodity}</span>
              <span className="text-slate-400">({p.market_name})</span>
              <span className="font-mono text-emerald-300">₹{p.price_per_kg}/kg</span>
              <span
                className={`inline-flex items-center text-[10px] font-bold ${
                  isUp ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {isUp ? '+' : ''}{p.price_change_7d_percent}%
              </span>
              <span className="text-[9px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                {p.data_type}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

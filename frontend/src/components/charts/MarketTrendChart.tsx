import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface MarketTrendChartProps {
  data: { date: string; price: number; arrival: number }[];
  commodityName?: string;
}

export const MarketTrendChart: React.FC<MarketTrendChartProps> = ({ data, commodityName = 'Commodity' }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#15803d" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#15803d" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v}`} domain={['dataMin - 100', 'dataMax + 100']} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
            formatter={(value: any) => [`₹${Number(value).toFixed(1)} / Quintal`, `${commodityName} Modal Price`]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#15803d"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

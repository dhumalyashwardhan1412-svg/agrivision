import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface YieldChartProps {
  data: {
    crop: string;
    suitability: number;
    estimated_profit: number;
    cost: number;
  }[];
}

export const YieldChart: React.FC<YieldChartProps> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="crop" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
            formatter={(value: any, name: any) => [
              `₹${Number(value).toLocaleString('en-IN')}`,
              name === 'estimated_profit' ? 'Net Profit' : 'Input Cost',
            ]}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
            formatter={(val) => (val === 'estimated_profit' ? 'Est. Net Profit (₹)' : 'Est. Input Cost (₹)')}
          />
          <Bar dataKey="estimated_profit" fill="#16a34a" radius={[6, 6, 0, 0]} maxBarSize={32} />
          <Bar dataKey="cost" fill="#cbd5e1" radius={[6, 6, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

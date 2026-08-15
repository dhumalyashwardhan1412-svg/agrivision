import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface NPKBarChartProps {
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
}

export const NPKBarChart: React.FC<NPKBarChartProps> = ({
  nitrogen = 245,
  phosphorus = 22.5,
  potassium = 195,
}) => {
  const data = [
    { nutrient: 'Nitrogen (N)', value: nitrogen, optimal_min: 280, optimal_max: 560, unit: 'kg/ha' },
    { nutrient: 'Phosphorus (P)', value: phosphorus, optimal_min: 10, optimal_max: 25, unit: 'kg/ha' },
    { nutrient: 'Potassium (K)', value: potassium, optimal_min: 110, optimal_max: 280, unit: 'kg/ha' },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="nutrient" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
            formatter={(val: any, _, item: any) => [
              `${val} ${item.payload.unit} (Optimal: ${item.payload.optimal_min}-${item.payload.optimal_max} ${item.payload.unit})`,
              'Measured Level',
            ]}
          />
          <Bar dataKey="value" fill="#0284c7" radius={[6, 6, 0, 0]} maxBarSize={45} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

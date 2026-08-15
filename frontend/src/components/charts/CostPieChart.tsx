import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { CostBreakdown } from '../../types';

interface CostPieChartProps {
  costBreakdown: CostBreakdown;
}

const COLORS = [
  '#16a34a', // Seeds
  '#0284c7', // Fertilizers
  '#d97706', // Labour
  '#0d9488', // Irrigation
  '#7c3aed', // Equipment
  '#ea580c', // Electricity/Fuel
  '#e11d48', // Crop Protection
  '#475569', // Transport & Packaging
];

export const CostPieChart: React.FC<CostPieChartProps> = ({ costBreakdown }) => {
  const data = [
    { name: 'Seeds & Seedlings', value: costBreakdown.seed_cost_inr },
    { name: 'Fertilizers & Nutrients', value: costBreakdown.fertilizer_cost_inr },
    { name: 'Labour Operations', value: costBreakdown.labour_cost_inr },
    { name: 'Irrigation', value: costBreakdown.irrigation_cost_inr },
    { name: 'Equipment & Rental', value: costBreakdown.equipment_cost_inr },
    { name: 'Electricity & Fuel', value: costBreakdown.electricity_fuel_cost_inr },
    { name: 'Crop Protection', value: costBreakdown.crop_protection_cost_inr },
    { name: 'Post-Harvest & Mandi', value: costBreakdown.transportation_cost_inr + costBreakdown.packaging_cost_inr + costBreakdown.other_costs_inr },
  ].filter((d) => d.value > 0);

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
            formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Cost']}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

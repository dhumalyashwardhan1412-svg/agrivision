import React, { useState, useEffect } from 'react';
import { Wrench, Plus, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { marketApi } from '../../services/marketApi';
import { Equipment } from '../../types';
import { formatINR } from '../../utils/formatters';

export const EquipmentManager: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  useEffect(() => {
    const loadEq = async () => {
      try {
        const data = await marketApi.getEquipment();
        setEquipment(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadEq();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Machinery Fleet & Custom Hiring Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure hourly and daily rental tariffs, availability slots, and specifications.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((eq) => (
          <Card key={eq.id} className="p-5 space-y-4 border-slate-200/90 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="amber" size="sm">{eq.category}</Badge>
                  <h4 className="font-bold text-slate-900 text-base mt-1">{eq.name}</h4>
                </div>
                <Badge variant={eq.is_available ? 'green' : 'red'} size="sm">
                  {eq.is_available ? 'AVAILABLE' : 'RENTED'}
                </Badge>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2">{eq.description}</p>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Daily Tariff</span>
                  <strong className="text-amber-800 text-sm font-extrabold">{formatINR(eq.daily_rental_rate_inr)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Hourly Tariff</span>
                  <strong className="text-slate-800 text-sm font-extrabold">{formatINR(eq.hourly_rental_rate_inr || eq.hourly_rate_inr || 0)}</strong>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Engine: {eq.power_hp ? `${eq.power_hp} HP` : 'Electric/Drone'}</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for dispatch
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Store, PackageCheck, Wrench, ShoppingBag, Plus, Star, MapPin } from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { marketApi } from '../../services/marketApi';
import { Equipment, Shop, ShopProduct } from '../../types';
import { formatINR } from '../../utils/formatters';

export const ShopkeeperDashboard: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const [eq, sh] = await Promise.all([
          marketApi.getEquipment(),
          marketApi.getShops(),
        ]);
        setEquipment(eq);
        setShops(sh);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="blue" size="sm">INPUT DEALER & MACHINERY HUB</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Agri Supplies & Rental Fleet Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Manage your store inventory of certified seeds, fertilizers, and custom hiring rental machinery.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Fleet Machinery Available"
          value={equipment.length.toString()}
          subtitle="Tractors, Drones, Levelers"
          icon={Wrench}
          color="amber"
        />
        <StatCard
          title="Managed Store Outlets"
          value={shops.length.toString()}
          subtitle="GPS Mapped & Verified"
          icon={Store}
          color="blue"
        />
        <StatCard
          title="Average Rating"
          value="4.9 / 5.0"
          subtitle="Farmer trust score"
          icon={Star}
          color="green"
        />
      </div>

      {/* Rental Machinery List */}
      <Card className="p-6">
        <CardHeader>
          <div>
            <CardTitle className="text-base">Registered Rental Machinery Fleet</CardTitle>
            <CardDescription>Machinery available for local farmer booking</CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Equipment Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Power (HP)</th>
                <th className="py-3 px-4">Daily Rate (INR)</th>
                <th className="py-3 px-4">Hourly Rate</th>
                <th className="py-3 px-4">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {equipment.map((eq) => (
                <tr key={eq.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{eq.name}</td>
                  <td className="py-3 px-4">{eq.category}</td>
                  <td className="py-3 px-4 font-mono">{eq.power_hp ? `${eq.power_hp} HP` : 'N/A'}</td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-700">{formatINR(eq.daily_rental_rate_inr)}</td>
                  <td className="py-3 px-4 font-mono font-semibold">{formatINR(eq.hourly_rental_rate_inr || eq.hourly_rate_inr || 0)}</td>
                  <td className="py-3 px-4">
                    <Badge variant={(eq.is_available ?? eq.is_available_for_rent ?? true) ? 'green' : 'red'} size="sm">
                      {(eq.is_available ?? eq.is_available_for_rent ?? true) ? 'AVAILABLE' : 'RENTED'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

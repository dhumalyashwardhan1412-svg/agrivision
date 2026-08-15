import React, { useState, useEffect } from 'react';
import { Wrench, MapPin, Store, Phone, Clock, Star, ShieldCheck, Plus, Calendar, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { AgriMap } from '../../components/maps/AgriMap';
import { marketApi } from '../../services/marketApi';
import { farmApi } from '../../services/farmApi';
import { Shop, Equipment, Farm, EquipmentRental } from '../../types';
import { formatINR } from '../../utils/formatters';

export const EquipmentAndShops: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [myRentals, setMyRentals] = useState<EquipmentRental[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [rentalNotes, setRentalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [shopData, eqData, rentals] = await Promise.all([
        marketApi.getShops({ user_lat: 30.9010, user_lng: 75.8573 }),
        marketApi.getEquipment(),
        marketApi.getMyRentals(),
      ]);
      setShops(shopData);
      setEquipmentList(eqData);
      setMyRentals(rentals);
    } catch (err) {
      console.error('Failed to load equipment and shops', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBookRental = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) return;
    setIsSubmitting(true);
    try {
      await marketApi.rentEquipment({
        equipment_id: selectedEquipment.id,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        notes: rentalNotes,
      });
      setIsRentModalOpen(false);
      await loadData();
      alert(`Booking Confirmed for ${selectedEquipment.name}!`);
    } catch (err) {
      console.error('Rental failed', err);
      alert('Failed to book rental.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-agri-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="amber" size="sm">FARM MECHANIZATION & INPUT DEALERS</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Machinery Rentals & Nearby Agricultural Stores
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Rent high-efficiency tractors, laser levelers, and drone sprayers, or locate certified seed & fertilizer outlets.
          </p>
        </div>
      </div>

      {/* Leaflet Interactive Map */}
      <div className="h-[480px]">
        <AgriMap
          centerLat={30.9010}
          centerLng={75.8573}
          shops={shops}
          farmLat={30.9010}
          farmLng={75.8573}
          farmName="Green Valley Eco Farm"
        />
      </div>

      {/* Farm Equipment Available for Rent */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Custom Hiring Centers & Machinery Rental</h3>
            <p className="text-xs text-slate-500">Rent certified farm equipment by the day or hour</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipmentList.map((eq) => (
            <Card key={eq.id} className="p-0 overflow-hidden flex flex-col justify-between border-slate-200/90 hover:border-amber-500 hover:shadow-xl transition-all">
              <div className="relative h-44 bg-slate-100">
                <img
                  src={eq.image_url || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=600&auto=format&fit=crop&q=80'}
                  alt={eq.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="amber" size="sm">{eq.category}</Badge>
                </div>
                {eq.power_hp && eq.power_hp > 0 && (
                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                    {eq.power_hp} HP Engine
                  </div>
                )}
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{eq.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{eq.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Daily Rental Rate</span>
                    <span className="text-lg font-extrabold text-amber-700">{formatINR(eq.daily_rental_rate_inr)}</span>
                    <span className="text-xs text-slate-500"> / day</span>
                  </div>

                  <Button
                    size="sm"
                    variant="amber"
                    icon={Wrench}
                    onClick={() => {
                      setSelectedEquipment(eq);
                      setIsRentModalOpen(true);
                    }}
                  >
                    Rent Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Nearby Agri Shops Cards */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xl font-extrabold text-slate-900">Nearby Certified Input Dealers ({shops.length})</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <Card key={shop.id} className="p-5 space-y-3 border-slate-200/90 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="blue" size="sm">{shop.shop_type}</Badge>
                    <h4 className="font-bold text-slate-900 text-base mt-1">{shop.shop_name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{shop.address}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {shop.rating}
                  </span>
                  <span className="font-bold text-slate-800">{shop.distance_km || 3.5} km away</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`tel:${shop.contact_phone}`}
                  className="flex-1 py-2 text-xs font-bold text-center bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Store
                </a>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Rent Booking Modal */}
      {selectedEquipment && (
        <Modal
          isOpen={isRentModalOpen}
          onClose={() => setIsRentModalOpen(false)}
          title={`Rent ${selectedEquipment.name}`}
          description="Book farm machinery for dispatch to your farm location."
          maxWidth="md"
        >
          <form onSubmit={handleBookRental} className="space-y-4 text-xs sm:text-sm">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Rental Rate</span>
                <span className="font-extrabold text-base text-amber-900">{formatINR(selectedEquipment.daily_rental_rate_inr)} / day</span>
              </div>
              <Badge variant="amber" size="sm">Available Immediately</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Rental Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <Input
                label="Rental Return Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Special Instructions / Operator Request</label>
              <textarea
                value={rentalNotes}
                onChange={(e) => setRentalNotes(e.target.value)}
                placeholder="e.g. Need certified tractor driver and laser transmitter tripod..."
                rows={3}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-600/30"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={() => setIsRentModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="amber" type="submit" isLoading={isSubmitting}>
                Confirm Rental Booking
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

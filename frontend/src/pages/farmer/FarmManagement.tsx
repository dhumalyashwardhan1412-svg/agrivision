import React, { useState, useEffect } from 'react';
import { Sprout, Plus, MapPin, Droplets, Wallet, Layers, Trash2, Edit3, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { farmApi } from '../../services/farmApi';
import { Farm } from '../../types';
import { formatINR } from '../../utils/formatters';

export const FarmManagement: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [state, setState] = useState('Punjab');
  const [district, setDistrict] = useState('Ludhiana');
  const [village, setVillage] = useState('');
  const [area, setArea] = useState('3.5');
  const [soilType, setSoilType] = useState('Loamy');
  const [waterSource, setWaterSource] = useState('Borewell');
  const [irrigation, setIrrigation] = useState('Drip');
  const [budget, setBudget] = useState('75000');
  const [isLoading, setIsLoading] = useState(false);

  const loadFarms = async () => {
    try {
      const data = await farmApi.getMyFarms();
      setFarms(data);
    } catch (err) {
      console.error('Failed to load farms', err);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await farmApi.createFarm({
        name,
        location_name: locationName,
        state,
        district,
        village,
        total_area_acres: parseFloat(area) || 1.0,
        primary_soil_type: soilType,
        water_source: waterSource,
        irrigation_system: irrigation,
        budget_inr: parseFloat(budget) || 50000,
        latitude: 30.9010,
        longitude: 75.8573,
      });
      setIsModalOpen(false);
      await loadFarms();
    } catch (err) {
      console.error('Failed to create farm', err);
      alert('Error creating farm record. Please verify fields.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFarm = async (farmId: number) => {
    if (confirm('Are you sure you want to remove this farm profile?')) {
      await farmApi.deleteFarm(farmId);
      await loadFarms();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Farm & Land Profiling
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your land parcels, irrigation infrastructure, and soil zones.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Register New Farm
        </Button>
      </div>

      {/* Farms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {farms.map((farm) => (
          <Card key={farm.id} className="p-6 space-y-5 border-slate-200/90 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-agri-700 bg-agri-50 px-2 py-0.5 rounded">
                    Farm #{farm.id}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">{farm.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{farm.location_name}, {farm.district}, {farm.state}</span>
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700">
                  <Sprout className="w-6 h-6" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Land Area</span>
                  <span className="font-extrabold text-slate-900 text-base">{farm.total_area_acres} Acres</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Soil Texture</span>
                  <span className="font-extrabold text-slate-900 text-base">{farm.primary_soil_type}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Irrigation System</span>
                  <span className="font-extrabold text-slate-900 text-base">{farm.irrigation_system}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Allocated Budget</span>
                  <span className="font-extrabold text-emerald-700 text-base">{formatINR(farm.budget_inr)}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Active Farm Entity
              </span>
              <button
                onClick={() => handleDeleteFarm(farm.id)}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Farm Profile"
        description="Provide agro-climatic and irrigation details for precision calculations."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateFarm} className="space-y-4 text-xs sm:text-sm">
          <Input
            label="Farm / Land Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Green Valley Farm"
            required
          />
          <Input
            label="Location / Landmark"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g. Bhamian Kalan Sector"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input label="State" value={state} onChange={(e) => setState(e.target.value)} required />
            <Input label="District" value={district} onChange={(e) => setDistrict(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Total Land Area (Acres)"
              type="number"
              step="0.5"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Primary Soil Type</label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-600/30"
              >
                <option value="Loamy">Loamy Soil</option>
                <option value="Alluvial">Alluvial Silt Loam</option>
                <option value="Black Cotton">Black Cotton Soil</option>
                <option value="Red Soil">Red Sandy Loam</option>
                <option value="Clay Loam">Clay Loam</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Water Source</label>
              <select
                value={waterSource}
                onChange={(e) => setWaterSource(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-600/30"
              >
                <option value="Borewell">Borewell Tubewell</option>
                <option value="Canal">Canal Irrigation</option>
                <option value="River">River / Stream</option>
                <option value="Rainfed">Rainfed / Monsoon</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Irrigation System</label>
              <select
                value={irrigation}
                onChange={(e) => setIrrigation(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-600/30"
              >
                <option value="Drip">Drip Irrigation</option>
                <option value="Sprinkler">Micro Sprinkler</option>
                <option value="Flood">Flood / Furrow</option>
                <option value="Rainfed">Rainfed</option>
              </select>
            </div>
          </div>

          <Input
            label="Allocated Input Budget (INR)"
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              Save Farm Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

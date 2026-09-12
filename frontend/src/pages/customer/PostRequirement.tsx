import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FilePlus,
  Send,
  Sparkles,
  MapPin,
  Tag,
  Package,
  Calendar,
  Truck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { requirementsApi, CreateRequirementInput } from '../../services/requirementsApi';

export const PostRequirement: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CreateRequirementInput>({
    title: '',
    crop_name: 'Wheat',
    variety: '',
    quantity: 50,
    unit: 'Quintal',
    min_quality_grade: 'Grade A (Standard)',
    target_price: 2200,
    price_unit: '₹/Quintal',
    required_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    delivery_preference: 'Farmer Farmgate Pickup',
    location_city: 'Pune',
    state: 'Maharashtra',
    description: ''
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const popularCrops = [
    'Wheat', 'Basmati Rice', 'Paddy', 'Tomato', 'Onion', 'Potato',
    'Cotton', 'Soybean', 'Mustard', 'Chana (Gram)', 'Tur (Arhar)', 'Maize'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      formData.title = `Looking for ${formData.quantity} ${formData.unit} of ${formData.crop_name}`;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await requirementsApi.createRequirement(formData);
      alert('Sourcing requirement posted successfully! Farmers can now view your requirement and propose offers.');
      navigate('/customer/requirements');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to publish requirement');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-6 rounded-2xl shadow-lg space-y-2">
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-[11px] font-bold tracking-wide uppercase">
          Buyer Direct Sourcing
        </span>
        <h1 className="text-2xl sm:text-3xl font-black">Post Crop Purchase Requirement</h1>
        <p className="text-xs sm:text-sm text-emerald-100/90">
          Specify your crop specs, quantity, and target price. AgriVision will instantly calculate match scores against registered farmers and dispatch alerts to local growers.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Requirement Title */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">Requirement Headline / Title</label>
          <input
            type="text"
            placeholder="e.g. Need 50 Quintals Premium Milling Wheat for Processing"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Crop Selection & Popular Pills */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">Crop Commodity</label>
          <div className="flex flex-wrap gap-1.5 pb-2">
            {popularCrops.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setFormData({ ...formData, crop_name: c })}
                className={`px-3 py-1 text-xs font-semibold rounded-full border transition ${
                  formData.crop_name === c
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Crop name (or custom crop)"
                value={formData.crop_name}
                onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                required
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Variety (e.g. Sharbati, Desi Organic, PBW-725)"
                value={formData.variety || ''}
                onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Quantity and Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Required Quantity & Unit</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0.1"
                step="any"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-2/3 p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
              />
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-1/3 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
              >
                <option value="Quintal">Quintal</option>
                <option value="kg">kg</option>
                <option value="Ton">Ton</option>
                <option value="Box">Box</option>
                <option value="Crate">Crate</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Target Budget Price</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={formData.target_price}
                onChange={(e) => setFormData({ ...formData, target_price: Number(e.target.value) })}
                className="w-full pl-8 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold text-emerald-700"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                /{formData.unit}
              </span>
            </div>
          </div>
        </div>

        {/* Quality & Required Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Minimum Quality Grade</label>
            <select
              value={formData.min_quality_grade}
              onChange={(e) => setFormData({ ...formData, min_quality_grade: e.target.value })}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
            >
              <option value="Grade A (Export/Premium)">Grade A (Export/Premium)</option>
              <option value="Grade A (Standard)">Grade A (Standard Commercial)</option>
              <option value="Grade B (Processing/Secondary)">Grade B (Processing/Secondary)</option>
              <option value="Certified Organic">Certified Organic Only</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Required Delivery / Harvest Date</label>
            <input
              type="date"
              value={formData.required_date || ''}
              onChange={(e) => setFormData({ ...formData, required_date: e.target.value })}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Delivery Mode & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Delivery Mode</label>
            <select
              value={formData.delivery_preference}
              onChange={(e) => setFormData({ ...formData, delivery_preference: e.target.value })}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="Farmer Farmgate Pickup">Farmer Farmgate Pickup</option>
              <option value="Buyer Warehouse Delivery">Buyer Warehouse Delivery</option>
              <option value="APMC Mandi Yard Handover">APMC Mandi Yard Handover</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Target District / City</label>
            <input
              type="text"
              required
              value={formData.location_city}
              onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">State</label>
            <input
              type="text"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Description / Special Instructions */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">Packaging / Quality Notes</label>
          <textarea
            rows={3}
            placeholder="e.g. Moisture content below 12%, packed in 50kg new jute bags, weighing scale calibration certificate needed."
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/customer/requirements')}
            className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Publishing Requirement...' : 'Publish Sourcing Requirement'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
export default PostRequirement;

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { marketplaceApi } from '../../services/marketplaceApi';
import { CropListing } from '../../types';
import { PlusCircle, Upload, Check } from 'lucide-react';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated: (listing: CropListing) => void;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onListingCreated,
}) => {
  const [title, setTitle] = useState('');
  const [cropName, setCropName] = useState('Tomato');
  const [category, setCategory] = useState('Vegetables');
  const [quantity, setQuantity] = useState('500');
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState('35');
  const [minOrder, setMinOrder] = useState('5');
  const [isOrganic, setIsOrganic] = useState(true);
  const [city, setCity] = useState('Ludhiana');
  const [state, setState] = useState('Punjab');
  const [description, setDescription] = useState('Freshly harvested farm produce, crisp, organic certified and grade-A quality.');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const created = await marketplaceApi.createListing({
        title,
        crop_name: cropName,
        category,
        quantity_available: parseFloat(quantity) || 100,
        unit,
        price_per_unit: parseFloat(price) || 20,
        min_order_quantity: parseFloat(minOrder) || 1,
        is_organic: isOrganic,
        location_city: city,
        state,
        description,
        image_url: imageUrl,
      });
      onListingCreated(created);
      onClose();
    } catch (err) {
      console.error('Failed to create listing', err);
      alert('Failed to post crop listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="List Fresh Farm Produce for Direct Sale"
      description="Connect directly with wholesale buyers and customers across India."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        <Input
          label="Listing Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Farm Fresh Organic Hybrid Tomatoes"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Crop / Commodity Name"
            value={cropName}
            onChange={(e) => setCropName(e.target.value)}
            placeholder="e.g. Tomato"
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-600/30"
            >
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Grains">Grains</option>
              <option value="Pulses">Pulses</option>
              <option value="Spices">Spices</option>
              <option value="Oilseeds">Oilseeds</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Available Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-600/30"
            >
              <option value="kg">kg</option>
              <option value="Quintal">Quintal (100 kg)</option>
              <option value="Ton">Ton (1000 kg)</option>
              <option value="Box">Crate / Box (25 kg)</option>
            </select>
          </div>
          <Input
            label="Price (₹ / Unit)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Mandi / Dispatch City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
          <Input
            label="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Product Photo URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-600/30"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Harvest Description & Quality Notes</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-600/30"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="is_organic_toggle"
            checked={isOrganic}
            onChange={(e) => setIsOrganic(e.target.checked)}
            className="w-4 h-4 text-agri-600 rounded border-slate-300 focus:ring-agri-500"
          />
          <label htmlFor="is_organic_toggle" className="text-xs font-semibold text-slate-800">
            Certified Organic / Zero Chemical Residue Produce
          </label>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" icon={PlusCircle} isLoading={isLoading}>
            Publish Produce Listing
          </Button>
        </div>
      </form>
    </Modal>
  );
};

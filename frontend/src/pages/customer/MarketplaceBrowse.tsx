import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, Sparkles, CheckCircle2, MapPin, Truck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ListingCard } from '../../components/marketplace/ListingCard';
import { marketplaceApi } from '../../services/marketplaceApi';
import { CropListing } from '../../types';
import { formatINR } from '../../utils/formatters';

export const MarketplaceBrowse: React.FC = () => {
  const [listings, setListings] = useState<CropListing[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [organicOnly, setOrganicOnly] = useState<boolean>(false);
  const [selectedListing, setSelectedListing] = useState<CropListing | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  // Order form state
  const [orderQuantity, setOrderQuantity] = useState('25');
  const [contactName, setContactName] = useState('Pooja Sharma');
  const [contactPhone, setContactPhone] = useState('+91 98123 45678');
  const [address, setAddress] = useState('Flat 402, Green Avenue Heights');
  const [city, setCity] = useState('Chandigarh');
  const [pincode, setPincode] = useState('160017');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const loadListings = async () => {
    try {
      const data = await marketplaceApi.getListings();
      setListings(data);
    } catch (err) {
      console.error('Failed to load listings', err);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const filteredListings = listings.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.crop_name.toLowerCase().includes(search.toLowerCase()) ||
      l.location_city.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'ALL' || l.category.toLowerCase() === category.toLowerCase();
    const matchesOrganic = !organicOnly || l.is_organic;
    return matchesSearch && matchesCat && matchesOrganic;
  });

  const handleOpenBuy = (item: CropListing) => {
    setSelectedListing(item);
    setOrderQuantity(item.min_order_quantity.toString());
    setIsBuyModalOpen(true);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;
    setIsPlacingOrder(true);
    try {
      const qty = parseFloat(orderQuantity) || selectedListing.min_order_quantity;
      await marketplaceApi.createOrder({
        delivery_address: address,
        delivery_city: city,
        delivery_pincode: pincode,
        delivery_contact_name: contactName,
        delivery_contact_phone: contactPhone,
        payment_method: paymentMethod,
        items: [
          {
            listing_id: selectedListing.id,
            quantity: qty,
          },
        ],
      });
      setIsBuyModalOpen(false);
      alert(`🎉 Order Placed Successfully! Your fresh produce order of ${qty} ${selectedListing.unit} has been routed directly to the farmer.`);
      await loadListings();
    } catch (err) {
      console.error('Order placement failure', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const calcTotalAmount = () => {
    if (!selectedListing) return 0;
    const qty = parseFloat(orderQuantity) || 0;
    return qty * selectedListing.price_per_unit;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-agri-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="green" size="sm">0% MIDDLEMAN COMMISSION</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Direct Farm Produce Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Buy grade-A farm-fresh vegetables, grains, pulses, and fruits directly from verified farmers.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="w-full sm:w-80">
          <Input
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crop, tomato, wheat, city..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'Vegetables', 'Grains', 'Fruits', 'Pulses'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                category === cat
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}

          <button
            onClick={() => setOrganicOnly(!organicOnly)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1 ${
              organicOnly
                ? 'bg-agri-700 text-white'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            🌱 Organic Only
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((item) => (
          <ListingCard key={item.id} listing={item} onBuyNow={handleOpenBuy} />
        ))}
      </div>

      {/* Buy Order Modal */}
      {selectedListing && (
        <Modal
          isOpen={isBuyModalOpen}
          onClose={() => setIsBuyModalOpen(false)}
          title={`Order Fresh ${selectedListing.title}`}
          description={`Direct harvest fulfillment by verified farmer in ${selectedListing.location_city}.`}
          maxWidth="lg"
        >
          <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Unit Price</span>
                <span className="font-extrabold text-lg text-emerald-950">{formatINR(selectedListing.price_per_unit)} / {selectedListing.unit}</span>
                <span className="text-xs text-emerald-800 block">Available: {selectedListing.quantity_available} {selectedListing.unit}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Total Order Payable</span>
                <span className="font-extrabold text-2xl text-emerald-900">{formatINR(calcTotalAmount())}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label={`Quantity (${selectedListing.unit})`}
                type="number"
                min={selectedListing.min_order_quantity}
                max={selectedListing.quantity_available}
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(e.target.value)}
                helperText={`Min order: ${selectedListing.min_order_quantity} ${selectedListing.unit}`}
                required
              />
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-600/30"
                >
                  <option value="UPI">UPI / Instant Bank Transfer</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="NETBANKING">Net Banking</option>
                  <option value="COD">Cash on Delivery (Farm Escrow)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Full Name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
              />
            </div>

            <Input
              label="Delivery Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Flat / House / Street Name"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
              <Input label="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={() => setIsBuyModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" icon={ShoppingBag} isLoading={isPlacingOrder}>
                Confirm Direct Farm Purchase
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

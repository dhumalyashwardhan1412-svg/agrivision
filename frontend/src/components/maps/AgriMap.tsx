import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Shop, Equipment } from '../../types';
import { MapPin, Phone, Clock, Star, ShieldCheck, Wrench, Sprout } from 'lucide-react';
import { Button } from '../ui/Button';

// Custom Leaflet DivIcon factories
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background-color: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const farmIcon = createCustomIcon('#15803d'); // Green for Farm
const shopIcon = createCustomIcon('#0284c7'); // Blue for Shops
const machineryIcon = createCustomIcon('#d97706'); // Amber for Machinery
const labIcon = createCustomIcon('#7c3aed'); // Purple for Soil Lab

interface AgriMapProps {
  centerLat?: number;
  centerLng?: number;
  shops?: Shop[];
  farmLat?: number;
  farmLng?: number;
  farmName?: string;
  onSelectShop?: (shop: Shop) => void;
}

export const AgriMap: React.FC<AgriMapProps> = ({
  centerLat = 30.9010,
  centerLng = 75.8573,
  shops = [],
  farmLat = 30.9010,
  farmLng = 75.8573,
  farmName = 'My Farm Location',
  onSelectShop,
}) => {
  const [filter, setFilter] = useState<string>('ALL');

  const filteredShops = shops.filter((s) => {
    if (filter === 'ALL') return true;
    if (filter === 'MACHINERY') return s.shop_type.toLowerCase().includes('machinery') || s.shop_type.toLowerCase().includes('drone');
    if (filter === 'INPUTS') return s.shop_type.toLowerCase().includes('seed') || s.shop_type.toLowerCase().includes('fertilizer');
    if (filter === 'SOIL') return s.shop_type.toLowerCase().includes('soil') || s.shop_type.toLowerCase().includes('clinic');
    return true;
  });

  return (
    <div className="w-full h-full min-h-[460px] flex flex-col rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white">
      {/* Map Control Toolbar */}
      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
              filter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Locations ({shops.length + 1})
          </button>
          <button
            onClick={() => setFilter('MACHINERY')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1 ${
              filter === 'MACHINERY' ? 'bg-amber-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Wrench className="w-3 h-3" /> Machinery & Rentals
          </button>
          <button
            onClick={() => setFilter('INPUTS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1 ${
              filter === 'INPUTS' ? 'bg-sky-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sprout className="w-3 h-3" /> Seeds & Nutrients
          </button>
          <button
            onClick={() => setFilter('SOIL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1 ${
              filter === 'SOIL' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-3 h-3" /> Soil Clinics
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-700"></span> Your Farm</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span> Supply Store</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> Machinery Hub</span>
        </div>
      </div>

      {/* Leaflet Map Frame */}
      <div className="flex-1 w-full relative min-h-[400px]">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Farmer Farm Marker */}
          {farmLat && farmLng && (
            <Marker position={[farmLat, farmLng]} icon={farmIcon}>
              <Popup>
                <div className="p-1 max-w-[200px]">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.5 rounded">
                    My Farm
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{farmName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Primary Farm Coordinates</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Shop / Hub Markers */}
          {filteredShops.map((shop) => {
            let iconToUse = shopIcon;
            if (shop.shop_type.toLowerCase().includes('machinery') || shop.shop_type.toLowerCase().includes('drone')) {
              iconToUse = machineryIcon;
            } else if (shop.shop_type.toLowerCase().includes('soil')) {
              iconToUse = labIcon;
            }

            return (
              <Marker
                key={shop.id}
                position={[shop.latitude, shop.longitude]}
                icon={iconToUse}
              >
                <Popup>
                  <div className="p-1 max-w-[240px] space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                        {shop.shop_type}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{shop.shop_name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{shop.address}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1 font-semibold text-amber-600">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {shop.rating}
                      </span>
                      {shop.distance_km && (
                        <span className="font-bold text-slate-800">
                          {shop.distance_km} km away
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{shop.opening_hours}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`tel:${shop.contact_phone}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 bg-slate-900 text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-slate-800"
                      >
                        <Phone className="w-3 h-3" /> Call
                      </a>
                      {onSelectShop && (
                        <button
                          onClick={() => onSelectShop(shop)}
                          className="flex-1 inline-flex items-center justify-center text-xs font-semibold py-1.5 rounded-lg bg-agri-100 text-agri-800 hover:bg-agri-200"
                        >
                          View Items
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

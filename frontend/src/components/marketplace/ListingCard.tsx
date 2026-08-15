import React from 'react';
import { CropListing } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ShoppingBag, Star, MapPin, User, Check } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface ListingCardProps {
  listing: CropListing;
  onBuyNow: (listing: CropListing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onBuyNow }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Image & Badges */}
      <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
        <img
          src={listing.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {listing.is_organic && (
            <Badge variant="green" size="sm">
              🌱 100% ORGANIC
            </Badge>
          )}
          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-900/80 backdrop-blur-md text-white rounded-full">
            {listing.category}
          </span>
        </div>

        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow text-xs font-bold text-slate-800 flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{listing.average_rating ? listing.average_rating.toFixed(1) : '5.0'}</span>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{listing.location_city}, {listing.state}</span>
          </div>

          <h4 className="font-bold text-slate-900 text-base mt-1 line-clamp-1 group-hover:text-agri-700 transition">
            {listing.title}
          </h4>

          {listing.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {listing.description}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between text-xs py-2 border-y border-slate-100">
            <span className="text-slate-500">Available Stock</span>
            <span className="font-bold text-slate-800">{listing.quantity_available} {listing.unit}</span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-2 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Direct Farm Price</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-agri-800">{formatINR(listing.price_per_unit)}</span>
              <span className="text-xs text-slate-500 font-medium">/{listing.unit}</span>
            </div>
          </div>

          <Button
            size="sm"
            variant="primary"
            icon={ShoppingBag}
            onClick={() => onBuyNow(listing)}
            disabled={listing.quantity_available <= 0}
          >
            {listing.quantity_available > 0 ? 'Buy Fresh' : 'Sold Out'}
          </Button>
        </div>
      </div>
    </div>
  );
};

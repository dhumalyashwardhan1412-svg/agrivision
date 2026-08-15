import React, { useState, useEffect } from 'react';
import { PackageCheck, Plus, Search, Tag, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { marketApi } from '../../services/marketApi';
import { ShopProduct } from '../../types';
import { formatINR } from '../../utils/formatters';

export const ProductInventory: React.FC = () => {
  const [products, setProducts] = useState<ShopProduct[]>([
    {
      id: 1,
      shop_id: 1,
      name: 'Urea Fertilizer (Neem Coated 46% N)',
      category: 'Fertilizer',
      brand: 'IFFCO',
      price: 268,
      unit: '45kg Bag',
      stock_quantity: 140,
      is_in_stock: true,
    },
    {
      id: 2,
      shop_id: 1,
      name: 'Di-Ammonium Phosphate (DAP 18:46:0)',
      category: 'Fertilizer',
      brand: 'KRIBHCO',
      price: 1350,
      unit: '50kg Bag',
      stock_quantity: 85,
      is_in_stock: true,
    },
    {
      id: 3,
      shop_id: 1,
      name: 'Tomato Hybrid Seed (Abhinav US-440)',
      category: 'Seeds',
      brand: 'Seminis',
      price: 820,
      unit: '10g Pack',
      stock_quantity: 250,
      is_in_stock: true,
    },
    {
      id: 4,
      shop_id: 1,
      name: 'MOP (Muriate of Potash 60% K2O)',
      category: 'Fertilizer',
      brand: 'IPL',
      price: 1700,
      unit: '50kg Bag',
      stock_quantity: 45,
      is_in_stock: true,
    },
    {
      id: 5,
      shop_id: 1,
      name: 'Bio-Organic Liquid Potash (Microbial)',
      category: 'Bio-Organic',
      brand: 'AgriVision Bio',
      price: 450,
      unit: '1 Litre Bottle',
      stock_quantity: 120,
      is_in_stock: true,
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Agricultural Store Product Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain stock levels, retail pricing, and supplier brands for local farmer lookup.
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Pack Unit</th>
                <th className="py-3 px-4">Stock on Hand</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                  <td className="py-3.5 px-4">{p.category}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-600">{p.brand}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{formatINR(p.price)}</td>
                  <td className="py-3.5 px-4">{p.unit}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{p.stock_quantity} Units</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={p.is_in_stock ? 'green' : 'red'} size="sm">
                      {p.is_in_stock ? 'IN STOCK' : 'OUT OF STOCK'}
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

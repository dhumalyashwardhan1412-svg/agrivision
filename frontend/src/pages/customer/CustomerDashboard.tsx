import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, Truck, Heart, ArrowRight, ShieldCheck, Star, Lock, Award } from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { OrderStatusBadge } from '../../components/marketplace/OrderStatusBadge';
import { marketplaceApi } from '../../services/marketplaceApi';
import { reviewsApi } from '../../services/reviewsApi';
import { useAuth } from '../../context/AuthContext';
import { Order, CropListing, UserRatingSummary, TransactionReview } from '../../types';
import { formatINR } from '../../utils/formatters';
import { StarRating } from '../../components/common/StarRating';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [featured, setFeatured] = useState<CropListing[]>([]);
  const [ratingSummary, setRatingSummary] = useState<UserRatingSummary | null>(null);
  const [reviews, setReviews] = useState<TransactionReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [ord, list] = await Promise.all([
          marketplaceApi.getMyOrders(),
          marketplaceApi.getListings(),
        ]);
        setOrders(ord);
        setFeatured(list.slice(0, 3));
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!user?.id) return;
      try {
        const [sum, revs] = await Promise.all([
          reviewsApi.getUserRatingSummary(user.id),
          reviewsApi.getUserReviews(user.id)
        ]);
        setRatingSummary(sum);
        setReviews(revs);
      } catch (err) {
        console.error('Failed to load ratings:', err);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchRatings();
  }, [user]);

  const totalSpent = orders.reduce((sum, o) => sum + o.total_amount_inr, 0);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-agri-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="green" size="sm">BUYER OVERVIEW</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Welcome to Direct Farm Commerce
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Access 100% verified farm harvests, zero middleman markup, and farm-to-table deliveries.
          </p>
        </div>

        <Link to="/marketplace">
          <Button variant="secondary" icon={ShoppingBag}>
            Explore Produce Marketplace
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Orders Placed"
          value={orders.length.toString()}
          subtitle="Direct from farms"
          icon={Package}
          color="green"
        />
        <StatCard
          title="Total Spend"
          value={formatINR(totalSpent)}
          subtitle="Saved ~18% vs retail prices"
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard
          title="Active Deliveries"
          value={orders.filter((o) => o.status === 'IN_TRANSIT' || o.status === 'CONFIRMED').length.toString()}
          subtitle="On schedule"
          icon={Truck}
          color="amber"
        />
      </div>

      {/* Recent Orders Overview */}
      <Card className="p-6">
        <CardHeader>
          <div>
            <CardTitle className="text-base">Recent Produce Orders</CardTitle>
            <CardDescription>Status and tracking for your recent farm purchases</CardDescription>
          </div>
          <Link to="/customer/orders">
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
              View All Orders
            </Button>
          </Link>
        </CardHeader>

        {orders.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No orders placed yet. Visit the marketplace to buy fresh produce.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((o) => (
              <div key={o.id} className="p-4 bg-slate-50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900">Order #{o.order_number}</strong>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <span className="text-slate-500 mt-0.5 block">{o.items.map((i) => `${i.crop_name} (${i.quantity} ${i.unit})`).join(', ')}</span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="font-extrabold text-sm text-emerald-700">{formatINR(o.total_amount_inr)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Buyer Rating & Reputation Section */}
      <Card className="p-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <span>My Buyer Rating & Farm Reputation</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Verified Reviews
                </span>
              </CardTitle>
              <CardDescription>
                Ratings submitted by verified farmers upon completed transactions and deliveries
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Permanent records</span>
          </div>
        </CardHeader>

        {loadingReviews ? (
          <div className="py-8 text-center text-xs text-slate-400 space-y-2">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <span>Loading reputation data...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Average Score Box */}
              <div className="p-5 bg-gradient-to-br from-amber-50/70 to-emerald-50/40 rounded-2xl border border-amber-100/80 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Overall Buyer Score
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900">
                      {(ratingSummary?.average_rating || 5.0).toFixed(1)}
                    </span>
                    <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
                  </div>
                  <div className="mt-2">
                    <StarRating
                      value={ratingSummary?.average_rating || 5.0}
                      size="md"
                      readOnly
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-xs text-slate-600 font-semibold">
                  <span>Total Verified Reviews</span>
                  <span className="px-2 py-0.5 bg-white rounded-md shadow-2xs font-bold text-slate-800">
                    {ratingSummary?.total_reviews || 0}
                  </span>
                </div>
              </div>

              {/* Rating Distribution (5★ to 1★ %) */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center space-y-2">
                <span className="text-xs font-bold text-slate-600 block mb-1">
                  Rating Distribution
                </span>
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingSummary?.rating_distribution?.[stars.toString()] || 0;
                  const total = ratingSummary?.total_reviews || 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : stars === 5 ? 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2 text-xs">
                      <span className="w-6 font-bold text-slate-600 text-right">{stars}★</span>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 text-[11px] text-slate-500 text-right font-medium">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Category Breakdown Scorecards */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5">
                <span className="text-xs font-bold text-slate-600 block mb-1">
                  Category Performance
                </span>
                {[
                  { key: 'Communication', label: 'Communication' },
                  { key: 'Payment Reliability', label: 'Payment Reliability' },
                  { key: 'Pickup / Delivery Experience', label: 'Pickup & Delivery' },
                  { key: 'Professional Behaviour', label: 'Professional Behaviour' }
                ].map((cat) => {
                  const val = ratingSummary?.category_averages?.[cat.key] || 5.0;
                  return (
                    <div key={cat.key} className="flex items-center justify-between text-xs p-1.5 bg-white rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-700">{cat.label}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-extrabold text-slate-800">{Number(val).toFixed(1)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Verified Reviews List */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Recent Verified Farmer Feedback ({reviews.length})
                </h4>
                <span className="text-[11px] text-slate-400 italic">
                  Reviews are strictly verified and cannot be modified by buyers
                </span>
              </div>

              {reviews.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-400 text-xs space-y-1">
                  <Award className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="font-semibold text-slate-600">No farmer reviews received yet</p>
                  <p className="text-[11px] text-slate-400">
                    Once you finalize and complete purchase offers with farmers, their verified ratings will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.slice(0, 5).map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                            {rev.reviewer_name ? rev.reviewer_name.charAt(0) : 'F'}
                          </div>
                          <div>
                            <strong className="text-slate-900 block font-bold">
                              {rev.reviewer_name || 'Verified Farmer'}
                            </strong>
                            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Verified Trade Participant
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <StarRating value={rev.rating} size="sm" readOnly />
                          <span className="text-[11px] text-slate-400">
                            {new Date(rev.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {rev.comment && (
                        <p className="text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 italic">
                          "{rev.comment}"
                        </p>
                      )}

                      {rev.category_ratings && Object.keys(rev.category_ratings).length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {Object.entries(rev.category_ratings).map(([cat, val]: [string, any]) => (
                            <span
                              key={cat}
                              className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200/60 text-slate-600"
                            >
                              {cat}: <strong className="text-slate-800">{val}★</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

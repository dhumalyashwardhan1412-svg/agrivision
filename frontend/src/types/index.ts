export type UserRole = 'FARMER' | 'CUSTOMER' | 'SHOPKEEPER' | 'ADMIN';

export type UserAccountStatus = 'ACTIVE' | 'WARNED' | 'SUSPENDED' | 'BLOCKED';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone_number?: string;
  role: UserRole;
  preferred_language?: string;
  status?: UserAccountStatus;
  warning_count?: number;
  suspension_until?: string;
  blocked_at?: string;
  blocked_reason?: string;
  is_active: boolean;
  avatar_url?: string;
  address?: string;
  state?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  farmer_profile?: FarmerProfile;
  customer_profile?: CustomerProfile;
  shopkeeper_profile?: ShopkeeperProfile;
  total_farm_land?: number;
  irrigation_source?: string;
}

export interface FarmerProfile {
  id: number;
  total_land_area: number;
  farming_experience_years: number;
  primary_crops?: string;
  irrigation_source?: string;
  organic_certified: boolean;
  kisan_credit_card: boolean;
}

export interface CustomerProfile {
  id: number;
  preferred_payment_method: string;
  delivery_address?: string;
}

export interface ShopkeeperProfile {
  id: number;
  business_license_number?: string;
  gstin?: string;
}

export interface Farm {
  id: number;
  farmer_id: number;
  name: string;
  location_name: string;
  state: string;
  district: string;
  village?: string;
  total_area_acres: number;
  latitude?: number;
  longitude?: number;
  elevation_meters?: number;
  primary_soil_type: string;
  water_source: string;
  irrigation_system: string;
  budget_inr: number;
  created_at: string;
  updated_at: string;
  activities?: FarmingActivity[];
}

export interface FarmingActivity {
  id: number;
  farm_id: number;
  title: string;
  activity_type: string;
  description?: string;
  cost_inr: number;
  scheduled_date: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

export type SoilSourceType = 'LABORATORY' | 'IMAGE_ESTIMATE';

export interface SoilTest {
  id: number;
  farm_id: number;
  source_type: SoilSourceType;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  ph?: number;
  electrical_conductivity?: number;
  organic_carbon?: number;
  moisture_percentage?: number;
  soil_texture?: string;
  zinc_ppm?: number;
  iron_ppm?: number;
  sulfur_ppm?: number;
  lab_name?: string;
  image_url?: string;
  visual_color_tone?: string;
  visual_texture_notes?: string;
  visual_moisture_level?: string;
  visual_cracking_observed?: string;
  health_grade: string;
  npk_status?: string;
  recommendations_summary?: string;
  notes?: string;
  created_at: string;
}

export interface SoilAnalysisResult {
  soil_test_id: number;
  health_grade: string;
  npk_balance: Record<string, any>;
  ph_status: string;
  fertility_index: number;
  organic_matter_status: string;
  deficiencies: string[];
  amendments_recommended: string[];
}

export interface CropRequirement {
  id: number;
  ideal_ph_min: number;
  ideal_ph_max: number;
  ideal_n_min: number;
  ideal_n_max: number;
  ideal_p_min: number;
  ideal_p_max: number;
  ideal_k_min: number;
  ideal_k_max: number;
  compatible_soil_types: string;
  ideal_temp_min_c: number;
  ideal_temp_max_c: number;
  ideal_rainfall_min_mm: number;
  ideal_rainfall_max_mm: number;
  water_requirement_mm: number;
}

export interface Crop {
  id: number;
  name: string;
  scientific_name?: string;
  category: string;
  variety?: string;
  image_url?: string;
  description?: string;
  duration_days: number;
  growing_season: string;
  water_need_level: string;
  labor_intensity: string;
  avg_yield_per_acre_kg: number;
  benchmark_cost_per_acre_inr: number;
  benchmark_market_price_per_kg: number;
  organic_suitability: string;
  risk_level: string;
  requirements?: CropRequirement;
}

export interface CropRecommendation {
  id: number;
  farm_id: number;
  crop_id: number;
  crop: Crop;
  overall_suitability_score: number;
  soil_score: number;
  climate_score: number;
  water_score: number;
  market_score: number;
  profit_score: number;
  risk_score: number;
  estimated_cost_inr: number;
  estimated_revenue_inr: number;
  estimated_profit_inr: number;
  roi_percentage: number;
  break_even_price_per_kg: number;
  scoring_breakdown_json?: {
    soil_score: number;
    climate_score: number;
    water_score: number;
    market_score: number;
    profit_score: number;
    risk_score: number;
    formula: string;
  };
  ai_explanation?: string;
  advantages?: string;
  risk_factors?: string;
  created_at: string;
}

export type FarmingMethodology = 'ORGANIC' | 'CONVENTIONAL' | 'MODERN';

export interface FarmingStage {
  stage_name: string;
  day_start: number;
  day_end: number;
  key_objectives: string;
  activities: string[];
  inputs_required: string[];
  cost_estimate_inr: number;
  precautions: string[];
}

export interface FarmingPlan {
  id: number;
  farm_id: number;
  crop_id: number;
  title: string;
  methodology: FarmingMethodology;
  target_area_acres: number;
  total_estimated_cost_inr: number;
  expected_yield_kg: number;
  expected_revenue_inr: number;
  estimated_net_profit_inr: number;
  roi_percent: number;
  schedule_stages_json: FarmingStage[];
  fertilizer_schedule?: string;
  irrigation_schedule?: string;
  pest_disease_management?: string;
  harvest_guidelines?: string;
  equipment_needed?: string;
  notes?: string;
  created_at: string;
  crop?: Crop;
}

export interface CostBreakdown {
  seed_cost_inr: number;
  fertilizer_cost_inr: number;
  organic_manure_cost_inr?: number;
  labour_cost_inr: number;
  irrigation_cost_inr: number;
  equipment_cost_inr: number;
  electricity_fuel_cost_inr: number;
  crop_protection_cost_inr: number;
  transportation_cost_inr: number;
  packaging_cost_inr: number;
  other_costs_inr: number;
  total_cost_inr: number;
}

export interface ProfitCalculationResponse {
  crop_name: string;
  area_acres: number;
  is_estimate: boolean;
  disclaimer: string;
  cost_breakdown: CostBreakdown;
  expected_yield_kg: number;
  expected_selling_price_per_kg: number;
  expected_revenue_inr: number;
  estimated_profit_inr: number;
  profit_margin_percent: number;
  return_on_investment_roi_percent: number;
  break_even_price_per_kg: number;
  break_even_yield_kg: number;
  profitability_rating: string;
  insights: string[];
}

export interface WhatIfCalculationParams {
  crop_id?: number;
  crop_name?: string;
  area_acres: number;
  seed_cost_inr?: number;
  fertilizer_cost_inr?: number;
  organic_manure_cost_inr?: number;
  labour_cost_inr?: number;
  irrigation_cost_inr?: number;
  equipment_cost_inr?: number;
  electricity_fuel_cost_inr?: number;
  crop_protection_cost_inr?: number;
  transportation_cost_inr?: number;
  packaging_cost_inr?: number;
  other_costs_inr?: number;
  expected_yield_kg?: number;
  expected_selling_price_per_kg?: number;
}

export interface WhatIfRequest {
  current: WhatIfCalculationParams;
  what_if: WhatIfCalculationParams;
}

export interface WhatIfComparisonResponse {
  current_plan: ProfitCalculationResponse;
  what_if_plan: ProfitCalculationResponse;
  profit_change_inr: number;
  revenue_change_inr: number;
  cost_change_inr: number;
  roi_change_percent: number;
  profit_change_percent: number;
  summary_verdict: string;
  is_estimate: boolean;
  disclaimer: string;
}

export interface ScenarioItem {
  name: string;
  tagline: string;
  assumed_yield_kg: number;
  assumed_price_per_kg: number;
  total_cost_inr: number;
  expected_revenue_inr: number;
  estimated_profit_inr: number;
  profit_margin_percent: number;
  roi_percent: number;
  risk_level: string;
}

export interface MultiScenarioRequest {
  crop_name: string;
  area_acres: number;
  seed_cost_inr?: number;
  fertilizer_cost_inr?: number;
  organic_manure_cost_inr?: number;
  labour_cost_inr?: number;
  irrigation_cost_inr?: number;
  equipment_cost_inr?: number;
  electricity_fuel_cost_inr?: number;
  crop_protection_cost_inr?: number;
  transportation_cost_inr?: number;
  packaging_cost_inr?: number;
  other_costs_inr?: number;
  expected_yield_kg?: number;
  expected_selling_price_per_kg?: number;
}

export interface MultiScenarioResponse {
  crop_name: string;
  area_acres: number;
  conservative: ScenarioItem;
  expected: ScenarioItem;
  best_case: ScenarioItem;
  is_estimate: boolean;
  disclaimer: string;
}

export type MarketDataType = 'LIVE' | 'RECENT' | 'HISTORICAL' | 'ESTIMATED' | 'DEMO';

export interface MarketPrice {
  id: number;
  source: string;
  market_name: string;
  state: string;
  district: string;
  commodity: string;
  variety?: string;
  grade: string;
  min_price_per_quintal: number;
  max_price_per_quintal: number;
  modal_price_per_quintal: number;
  price_per_kg: number;
  unit: string;
  arrival_quantity_tons: number;
  price_change_7d_percent: number;
  data_type: MarketDataType;
  date?: string;
  recorded_date?: string;
  last_updated?: string;
}

export interface MarketTrend {
  id: number;
  commodity: string;
  market_name: string;
  trend_direction: string;
  avg_price_30d: number;
  historical_30d_points: { date: string; price: number; arrival: number }[];
  forecast_next_15d_price: number;
  selling_recommendation: string;
  ai_market_insight?: string;
  data_type: MarketDataType;
  updated_at: string;
}

export interface MarketComparisonResponse {
  commodity: string;
  markets_comparison: MarketPrice[];
  highest_price_market: string;
  lowest_price_market: string;
  average_price_per_kg: number;
  price_spread_per_quintal: number;
  best_selling_mandi: string;
}

export interface ShopProduct {
  id: number;
  shop_id: number;
  name: string;
  category: string;
  brand?: string;
  price: number;
  unit: string;
  stock_quantity: number;
  is_organic?: boolean;
  is_in_stock?: boolean;
  description?: string;
  image_url?: string;
  created_at?: string;
}

export interface Shop {
  id: number;
  owner_id: number;
  shop_name: string;
  shop_type: string;
  address: string;
  state: string;
  district: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  contact_phone: string;
  email?: string;
  opening_hours: string;
  image_url?: string;
  rating: number;
  verified: boolean;
  distance_km?: number;
  created_at: string;
  products?: ShopProduct[];
}

export interface Equipment {
  id: number;
  name: string;
  category: string;
  brand?: string;
  power_hp?: number;
  daily_rental_rate_inr: number;
  hourly_rate_inr?: number;
  hourly_rental_rate_inr?: number;
  purchase_price_estimate_inr?: number;
  description?: string;
  image_url?: string;
  is_available?: boolean;
  is_available_for_rent?: boolean;
  created_at?: string;
}

export interface EquipmentRental {
  id: number;
  equipment_id: number;
  shop_id?: number;
  farmer_id: number;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_rate_applied: number;
  total_cost_inr: number;
  status: string;
  notes?: string;
  created_at: string;
  equipment?: Equipment;
}

export type ListingStatus = 'ACTIVE' | 'SOLD_OUT' | 'DRAFT' | 'CLOSED';

export interface Review {
  id: number;
  listing_id: number;
  reviewer_id: number;
  rating: number;
  comment?: string;
  reviewer_name?: string;
  created_at: string;
}

export interface CropListing {
  id: number;
  farmer_id: number;
  crop_id?: number;
  title: string;
  crop_name: string;
  category: string;
  variety?: string;
  quantity_available: number;
  unit: string;
  price_per_unit: number;
  min_order_quantity: number;
  harvest_date?: string;
  is_organic: boolean;
  quality_grade?: string;
  location_city: string;
  state: string;
  image_url?: string;
  description?: string;
  status: ListingStatus;
  farmer_name?: string;
  farmer_phone?: string;
  average_rating?: number;
  reviews?: Review[];
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PACKED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  listing_id?: number;
  crop_name?: string;
  item_title?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price?: number;
  subtotal_inr?: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  farmer_id?: number;
  total_amount_inr: number;
  status: OrderStatus;
  delivery_name?: string;
  delivery_contact_name?: string;
  delivery_phone?: string;
  delivery_contact_phone?: string;
  delivery_address: string;
  delivery_city: string;
  delivery_pincode: string;
  payment_method: string;
  payment_status?: string;
  tracking_notes?: string;
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
  customer_name?: string;
  farmer_name?: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  category: string;
  is_read: boolean;
  link_url?: string;
  created_at: string;
}

export interface CropDiagnosis {
  id?: number;
  detected_crop: string;
  health_status: string;
  condition_name: string;
  confidence_percentage: number;
  symptoms_observed: string;
  organic_solution: string;
  chemical_treatment: string;
  preventive_measures: string;
  image_url?: string;
  disclaimer: string;
  created_at?: string;
}

export interface SoilObservation {
  id?: number;
  visual_color_tone: string;
  estimated_soil_type: string;
  moisture_estimate: string;
  organic_humus_appearance: string;
  potential_challenges: string[];
  preliminary_advice: string;
  image_url?: string;
  disclaimer: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggested_actions?: string[];
  source?: string;
}

// Moderation & Safety Types
export type ModerationActionType = 'WARNING' | 'SUSPENSION' | 'BLOCK' | 'UNBLOCK';
export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';

export interface UserModerationSummary {
  id: number;
  email: string;
  full_name: string;
  phone_number?: string;
  role: UserRole;
  status: UserAccountStatus;
  warning_count: number;
  suspension_until?: string;
  blocked_at?: string;
  blocked_reason?: string;
  is_active: boolean;
  state?: string;
  district?: string;
  created_at: string;
  listings_count: number;
  orders_count: number;
  reports_received_count: number;
}

export interface ModerationActionResponse {
  id: number;
  user_id: number;
  admin_id: number;
  action: ModerationActionType;
  reason: string;
  description?: string;
  created_at: string;
  expires_at?: string;
  user_name?: string;
  user_email?: string;
  admin_name?: string;
}

export interface UserReportResponse {
  id: number;
  reporter_id: number;
  reported_user_id: number;
  reason: string;
  description?: string;
  status: ReportStatus;
  admin_id?: number;
  admin_notes?: string;
  created_at: string;
  resolved_at?: string;
  reporter_name?: string;
  reporter_email?: string;
  reported_user_name?: string;
  reported_user_email?: string;
  reported_user_role?: string;
}

export interface ModerationStatsResponse {
  total_users: number;
  active_users: number;
  warned_users: number;
  suspended_users: number;
  blocked_users: number;
  pending_reports: number;
  resolved_reports: number;
}

// ==========================================
// AGRIVISION VERSION 3 EXTENSIONS
// ==========================================

export type GovernmentType = 'CENTRAL' | 'STATE';
export type SchemeCategory = 'SUBSIDY' | 'INSURANCE' | 'LOAN_CREDIT' | 'EQUIPMENT' | 'IRRIGATION' | 'CROP_SUPPORT' | 'OTHER';

export interface GovernmentScheme {
  id: number;
  name: string;
  scheme_code: string;
  government_type: GovernmentType;
  state: string;
  category: SchemeCategory;
  short_description: string;
  full_description?: string;
  benefits: string;
  eligibility_criteria_text: string;
  eligible_farmer_categories: string;
  eligible_crops: string;
  min_land_acres: number;
  max_land_acres?: number;
  required_documents: string;
  official_website_url?: string;
  application_url?: string;
  start_date?: string;
  deadline_date?: string;
  is_verified: boolean;
  is_active: boolean;
  is_demo?: boolean;
  is_saved?: boolean;
  last_verified_date: string;
  created_at: string;
  updated_at?: string;
  eligibility_status?: 'ELIGIBLE' | 'POSSIBLY_ELIGIBLE' | 'NOT_ELIGIBLE';
  eligibility_reasons?: string[];
}

export interface SavedScheme {
  id: number;
  scheme_id: number;
  scheme: GovernmentScheme;
  notes?: string;
  saved_at: string;
}

export interface SchemeEligibilityResult {
  scheme_id: number;
  scheme_name: string;
  status: 'ELIGIBLE' | 'POSSIBLY_ELIGIBLE' | 'NOT_ELIGIBLE';
  score_percentage: number;
  matched_criteria: string[];
  unmatched_criteria: string[];
  disclaimer: string;
}

export type RequirementStatus = 'OPEN' | 'NEGOTIATING' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'EXPIRED' | 'CANCELLED';

export interface BuyerRequirement {
  id: number;
  buyer_id: number;
  buyer_name?: string;
  buyer_company?: string;
  title: string;
  crop_name: string;
  variety?: string;
  quantity: number;
  unit: string;
  min_quality_grade: string;
  target_price: number;
  price_unit: string;
  required_date?: string;
  delivery_preference: string;
  location_city: string;
  state: string;
  description?: string;
  status: RequirementStatus;
  expires_at?: string;
  created_at: string;
  updated_at?: string;
  total_offers_count?: number;
}

export interface FarmerBuyerRequirement extends BuyerRequirement {
  buyer_verified?: boolean;
  buyer_rating?: number;
  has_my_offer: boolean;
  my_offer_id?: number;
  my_offer_status?: string;
  my_offered_price?: number;
  my_offered_quantity?: number;
}

export interface CounterRequirementInput {
  counter_price: number;
  quantity?: number;
  message?: string;
}


export interface MatchedFarmerItem {
  listing_id: number;
  farmer_id: number;
  farmer_name: string;
  farm_location: string;
  crop_name: string;
  variety?: string;
  available_quantity: number;
  unit: string;
  asking_price: number;
  quality_grade: string;
  rating: number;
  match_score: number;
  match_breakdown: string[];
}

export type OfferStatus = 'PENDING' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'COMPLETED' | 'CANCELLED';
export type NegotiationActionType = 'OFFER_MADE' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface OfferNegotiation {
  id: number;
  sender_user_id: number;
  sender_name?: string;
  sender_role: string;
  action_type: NegotiationActionType;
  offered_price: number;
  quantity: number;
  message?: string;
  created_at: string;
}

export interface Offer {
  id: number;
  offer_code: string;
  requirement_id?: number;
  listing_id?: number;
  buyer_id: number;
  farmer_id: number;
  buyer_name?: string;
  buyer_phone?: string;
  buyer_rating?: number;
  farmer_name?: string;
  farmer_phone?: string;
  farmer_rating?: number;
  produce_name: string;
  quantity: number;
  unit: string;
  offered_price: number;
  price_unit: string;
  delivery_preference: string;
  location?: string;
  message?: string;
  status: OfferStatus;
  expires_at?: string;
  accepted_at?: string;
  completed_at?: string;
  buyer_user_id?: number;
  farmer_user_id?: number;
  farmer_reviewed?: boolean;
  farmer_rating_given?: number;
  buyer_reviewed?: boolean;
  buyer_rating_given?: number;
  created_at: string;
  negotiations: OfferNegotiation[];
}

export type ReviewType = 'FARMER_TO_BUYER' | 'BUYER_TO_FARMER' | 'CUSTOMER_TO_DEALER';

export interface TransactionReview {
  id: number;
  review_type: ReviewType;
  order_id?: number;
  offer_id?: number;
  shop_id?: number;
  reviewer_id: number;
  reviewer_name?: string;
  target_user_id: number;
  target_user_name?: string;
  rating: number;
  category_ratings?: Record<string, number>;
  comment?: string;
  created_at: string;
}

export interface UserRatingSummary {
  user_id: number;
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<string, number>;
  category_averages: Record<string, number>;
}

export type DiscountType = 'PERCENTAGE' | 'FLAT_AMOUNT';

export interface DealerDiscount {
  id: number;
  shop_id: number;
  product_id: number;
  product_name?: string;
  original_price?: number;
  discounted_price?: number;
  title: string;
  discount_type: DiscountType;
  discount_value: number;
  min_quantity: number;
  max_discount_inr?: number;
  start_date: string;
  end_date: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface LowStockProduct {
  product_id: number;
  shop_id: number;
  shop_name: string;
  product_name: string;
  category: string;
  current_stock: number;
  low_stock_threshold: number;
  status: 'HEALTHY' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK';
  suggested_restock: number;
  unit: string;
}

export interface DemandCategoryForecast {
  category: string;
  current_stock: number;
  sales_last_30_days: number;
  trend: 'RISING' | 'STABLE' | 'FALLING';
  demand_change_percent: number;
  recommended_stock: number;
  confidence: 'HIGH' | 'MODERATE' | 'LOW';
}

export interface DemandInsightsResponse {
  shop_id: number;
  shop_name: string;
  has_sufficient_data: boolean;
  data_notice?: string;
  forecasts: DemandCategoryForecast[];
  overall_trend: 'RISING' | 'STABLE' | 'FALLING';
  monthly_sales_chart: Array<{
    month: string;
    actual_sales_inr: number;
    projected_sales_inr: number;
  }>;
}

export type UserVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface AdminUserItem {
  id: number;
  email: string;
  full_name: string;
  phone_number?: string;
  role: UserRole;
  status: UserAccountStatus;
  verification_status: UserVerificationStatus;
  verified_at?: string;
  verification_notes?: string;
  rejection_reason?: string;
  warning_count: number;
  state?: string;
  district?: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  user_name?: string;
  user_role?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  description: string;
  before_state?: Record<string, any>;
  after_state?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface OfflineSyncMonitorItem {
  id: number;
  user_id: number;
  user_name?: string;
  user_role: string;
  client_session_id?: string;
  sync_item_type: string;
  client_item_id?: string;
  status: string;
  retry_count: number;
  error_message?: string;
  created_offline_at?: string;
  synced_at: string;
  created_at: string;
}

export interface OfflineSyncStats {
  total_sync_events: number;
  pending_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  conflicts: number;
  last_sync_timestamp?: string;
  records: OfflineSyncMonitorItem[];
}

export type NotificationPriority = 'INFO' | 'SUCCESS' | 'WARNING' | 'URGENT';

export interface NotificationItem {
  id: number;
  user_id: number;
  user_role?: string;
  notification_type: string;
  category: string;
  title: string;
  message: string;
  related_entity_type?: string;
  related_entity_id?: string;
  action_url?: string;
  link_url?: string;
  is_read: boolean;
  priority: NotificationPriority;
  event_key?: string;
  metadata_json?: Record<string, any>;
  read_at?: string;
  created_at: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}


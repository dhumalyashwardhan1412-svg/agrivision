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

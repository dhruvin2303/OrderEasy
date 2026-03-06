// User / Auth
export interface User {
  username: string;
  organization: string;
  is_admin: boolean;
  email?: string;
  logo_url?: string;
}

// Orders
export interface Order {
  order_id: number;
  org: string;
  receiver_name: string;
  date: string; // YYYY-MM-DD
  expected_delivery_date: string;
  product: string;
  description?: string;
  quantity: number;
  price: number;
  basic_price: number;
  gst: number;
  advance_payment: number;
  total_amount_with_gst: number;
  pending_amount: number;
  status: "Completed" | "Pending";
  delivered_quantity: number;
  url?: string;
  created_by?: string;
  custom_data?: Record<string, string>;
}

// Deliveries
export interface Delivery {
  order_id: number;
  delivery_id: number;
  org: string;
  delivery_quantity: number;
  delivery_date: string;
  total_amount_received: number;
  public_id?: string;
  url?: string;
  file_name?: string;
  upload_date?: string;
  resource_type?: string;
  custom_data?: Record<string, string>;
}

// Analytics - Dashboard Summary
export interface DashboardSummary {
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  total_units_delivered: number;
}

// Analytics - Advanced Dashboard (Current Month)
export interface CurrentMonthMetrics {
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  units_delivered: number;
}

// Dashboard - New Widgets
export interface BubbleChartData {
  name: string;
  quantity: number;
  revenue: number;
  orders: number;
}

export interface RecentActivityData {
  id: string;
  product: string;
  receiver: string;
  amount: number;
  quantity: number;
  status: string;
  payment_status: string;
  date: string;
}

export interface FulfillmentGapData {
  order_id: number;
  product: string;
  expected: string;
  actual: string;
  days_gap: number;
}

// Analytics - Forecasting
export interface ForecastResponse {
  r2_score: number;
  confidence_level: string;
  historical_data: {
    month: string;
    revenue: number;
  }[];
  forecast_12_months: {
    month: string;
    predicted_revenue: number;
    lower_bound: number;
    upper_bound: number;
  }[];
}

// Analytics - RFM
export interface RFMSegmentData {
  customers: string[];
  count: number;
  business_explanation: string;
}

export interface RFMResponse {
  segments: Record<string, RFMSegmentData>;
  rfm_table: any[];
}

// Admin
export interface OrganizationSummary {
  organization: string;
  orders_count: number;
  deliveries_count: number;
}

// Analytics - Financial Trends
export interface YearlyRevenue {
  [year: string]: number;
}

export interface MoMGrowth {
  [month: string]: number;
}

export interface PendingMonthly {
  [month: string]: number;
}

export interface TopCustomers {
  top_total: { [name: string]: number };
  top_yearly: { [year: string]: { [name: string]: number } }[];
  top_monthly: { [month: string]: { [name: string]: number } }[];
}

export interface ProductStat {
  name: string;
  quantity: number;
  revenue: number;
  order_count: number;
}

export interface ProductAnalyticsResponse {
  products: ProductStat[];
}

// Analytics - Delivery Performance
export interface DeliveryPerformanceMetrics {
  total_orders: number;
  total_deliveries: number;
  total_quantity: number;
  total_amount: number;
}

export interface DeliveryDistribution {
  range: string;
  count: number;
}

// Analytics - Revenue Scatter
export interface ScatterData {
  order_id: number;
  quantity: number;
  revenue: number;
  product: string;
}

// Analytics - Heatmap
export interface HeatmapData {
  date: string;
  count: number;
}

// Analytics - Schedule
export interface ExpectedScheduleData {
  date: string;
  total_quantity: number;
}
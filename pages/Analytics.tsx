import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import AnalyticsSkeleton from '../components/skeletons/AnalyticsSkeleton';
import { CustomerSegmentationDetails } from '../components/CustomerSegmentationDetails';

import {
  ForecastResponse,
  RFMResponse,
  RFMSegmentData,
  YearlyRevenue,
  MoMGrowth,
  PendingMonthly,
  TopCustomers,
  ChurnData,
  AOVData,
  ProductAnalyticsResponse,
  DeliveryPerformanceMetrics,
  DeliveryDistribution,
  ScatterData,
  HeatmapData,
  ExpectedScheduleData,
  DeliveryFragmentationData,
  RevenueHostageData
} from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  ComposedChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  Brush
} from 'recharts';
import {
  Sparkles,
  Users,
  TrendingUp,
  AlertCircle,
  Crown,
  Heart,
  UserCheck,
  UserMinus,
  DollarSign,
  Activity,
  Package,
  Truck,
  Calendar as CalendarIcon,
  Box,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { SEO } from '../components/SEO';

// ✅ Module-level cache — survives tab switches and page navigation.
// Only cleared on browser refresh or when user explicitly clicks "Refresh".
let aiSummaryModuleCache: string | null = null;

// Components
const KpiCard = ({ title, value, sub, icon: Icon, color }: any) => (
  <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-xs md:text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-xl md:text-2xl font-bold text-slate-900">{value}</h3>
      {sub && <p className="text-[10px] md:text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
    <div className={`p-2 md:p-3 rounded-lg ${color}`}>
      <Icon className="w-4 h-4 md:w-5 md:h-5" />
    </div>
  </div>
);

// Calendar Component
const InteractiveCalendar = ({ schedule }: { schedule: ExpectedScheduleData[] | null }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!schedule) return null;

  // Map data: date string -> quantity
  const scheduleMap = new Map<string, number>();
  schedule.forEach(s => scheduleMap.set(s.date, s.total_quantity));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0=Sun

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Generate grid cells
  const cells = [];
  // Padding
  for (let i = 0; i < startingDayOfWeek; i++) {
    cells.push(<div key={`pad-${i}`} className="h-24 bg-slate-50 border border-slate-100/50"></div>);
  }
  // Days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const qty = scheduleMap.get(dateStr) || 0;

    const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

    cells.push(
      <div
        key={d}
        className={`h-24 border border-slate-100 p-2 relative group transition-all hover:bg-slate-50
                  ${isToday ? 'bg-blue-50/50' : 'bg-white'}
              `}
      >
        <div className={`text-xs font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>{d}</div>
        {qty > 0 && (
          <div className="flex flex-col gap-1 mt-1">
            <div className={`
                          px-2 py-1 rounded text-xs font-bold text-center shadow-sm
                          ${qty > 100 ? 'bg-indigo-100 text-indigo-700' :
                qty > 50 ? 'bg-blue-100 text-blue-700' :
                  'bg-sky-100 text-sky-700'}
                      `}>
              {qty} Units
            </div>
            <span className="text-[10px] text-slate-400 text-center">Pending</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-lg text-slate-800">Expected Delivery Schedule</h3>
          <div className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded border border-slate-200 shadow-sm">
            {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">{day}</div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="grid grid-cols-7">
        {cells}
      </div>
    </div>
  );
};

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'revenue' | 'operations' | 'forecast' | 'customers'>('revenue');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Year State for Revenue Tab
  const [yearly, setYearly] = useState<YearlyRevenue | null>(null);
  const [mom, setMom] = useState<MoMGrowth | null>(null);
  const [pending, setPending] = useState<PendingMonthly | null>(null);
  const [products, setProducts] = useState<ProductAnalyticsResponse | null>(null);
  const [scatter, setScatter] = useState<ScatterData[] | null>(null);
  const [churn, setChurn] = useState<ChurnData[] | null>(null);
  const [aov, setAov] = useState<AOVData[] | null>(null);

  // Operations State
  const [delMetrics, setDelMetrics] = useState<DeliveryPerformanceMetrics | null>(null);
  const [delDist, setDelDist] = useState<DeliveryDistribution[] | null>(null);
  const [schedule, setSchedule] = useState<ExpectedScheduleData[] | null>(null);
  const [fragmentation, setFragmentation] = useState<DeliveryFragmentationData[] | null>(null);
  const [hostage, setHostage] = useState<RevenueHostageData[] | null>(null);

  // Forecast State
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);

  // Customer State
  const [rfm, setRfm] = useState<RFMResponse | null>(null);
  const [topCust, setTopCust] = useState<TopCustomers | null>(null);

  // AI Insights State
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiRetryKey, setAiRetryKey] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (signal: AbortSignal) => {
    // CRITICAL: Reset all data states immediately to prevent stale data rendering
    // and show loading spinner while fetching new data.
    setLoading(true);
    setYearly(null);
    setMom(null);
    setPending(null);
    setProducts(null);
    setScatter(null);
    setChurn(null);
    setAov(null);
    setDelMetrics(null);
    setDelDist(null);
    setSchedule(null);
    setFragmentation(null);
    setHostage(null);
    setForecast(null);
    setRfm(null);
    setTopCust(null);

    setError(null);

    try {
      if (activeTab === 'revenue') {
        const [yData, mData, pData, prodData, scatData, churnData, aovData] = await Promise.all([
          api.get<YearlyRevenue>('/analytics/revenue/yearly', signal),
          api.get<MoMGrowth>('/analytics/revenue/mom-growth', signal),
          api.get<PendingMonthly>('/analytics/pending/monthly', signal),
          api.get<ProductAnalyticsResponse>('/analytics/products/top', signal),
          api.get<ScatterData[]>('/analytics/charts/scatter-revenue-qty', signal),
          api.get<ChurnData[]>('/analytics/churn-retention', signal),
          api.get<AOVData[]>('/analytics/aov-tracker', signal)
        ]);
        if (!signal.aborted) {
          setYearly(yData);
          setMom(mData);
          setPending(pData);
          setProducts(prodData);
          setScatter(scatData);
          setChurn(churnData);
          setAov(aovData);
        }
      }
      else if (activeTab === 'operations') {
        const [metData, distData, schData, fragData, hostData] = await Promise.all([
          api.get<DeliveryPerformanceMetrics>('/analytics/metrics/delivery-performance', signal),
          api.get<DeliveryDistribution[]>('/analytics/charts/delivery-distribution', signal),
          api.get<ExpectedScheduleData[]>('/analytics/charts/expected-delivery-schedule', signal),
          api.get<DeliveryFragmentationData[]>('/analytics/delivery-fragmentation', signal),
          api.get<RevenueHostageData[]>('/analytics/revenue-held-hostage', signal)
        ]);
        if (!signal.aborted) {
          setDelMetrics(metData);
          setDelDist(distData);
          setSchedule(schData);
          setFragmentation(fragData);
          setHostage(hostData);
        }
      }
      else if (activeTab === 'forecast') {
        const res = await api.get<ForecastResponse>('/analytics/forecast', signal);
        if (!signal.aborted) {
          setForecast(res);
        }
      }
      else if (activeTab === 'customers') {
        const [rfmData, custData] = await Promise.all([
          api.get<RFMResponse>('/analytics/rfm', signal),
          api.get<TopCustomers>('/analytics/orders/top-customers', signal)
        ]);
        if (!signal.aborted) {
          setRfm(rfmData);
          setTopCust(custData);
        }
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.log('Request cancelled for tab change');
        return;
      }
      console.error(e);
      if (!signal.aborted) {
        setError(e.message || "Failed to load analytics data.");
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [activeTab]);

  // Fetch AI Summary Effect — only triggers on Forecast tab, uses module-level cache
  useEffect(() => {
    if (activeTab !== 'forecast') return;

    // Use the module-level cache if available (survives tab switches & navigation)
    if (aiSummaryModuleCache && !aiError) {
      setAiSummary(aiSummaryModuleCache);
      return;
    }

    const fetchAi = async () => {
      setAiLoading(true);
      setAiError(null);
      try {
        const res = await api.get<any>('/analytics/ai-summary');
        // Store in module cache — persists until hard refresh or explicit Refresh click
        aiSummaryModuleCache = res.summary;
        setAiSummary(res.summary);
      } catch (err: any) {
        console.error("Failed to fetch AI summary", err);
        setAiError(err.message?.includes('503') || err.message?.includes('temporarily')
          ? "AI is rate-limited. Please wait ~30 seconds and click Retry."
          : "Could not connect to the AI service.");
      } finally {
        setAiLoading(false);
      }
    };

    fetchAi();
  }, [activeTab, aiRetryKey]);

  // Handler: clear cache and force a fresh AI call
  const handleAiRefresh = () => {
    aiSummaryModuleCache = null;
    setAiSummary(null);
    setAiError(null);
    setAiRetryKey(k => k + 1);
  };

  // Helpers
  const toChartData = (data: any, keyName: string, valName: string) => {
    if (!data) return [];
    return Object.entries(data).map(([k, v]) => ({ [keyName]: k, [valName]: v }));
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  return (
    <div className="space-y-6">
      <SEO
        title="Analytics & Reports"
        description="Comprehensive data-driven analytics for your order management system. Analyze revenue, delivery performance, and business insights."
        keywords="analytics, business intelligence, data-driven, performance metrics, reports, revenue analysis, delivery performance"
      />
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-500">Business performance, delivery metrics, and AI forecasts.</p>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:flex bg-white p-1 rounded-lg border border-slate-200">
          {[
            { id: 'revenue', label: 'Revenue & Trends', icon: DollarSign },
            { id: 'operations', label: 'Operations & Delivery', icon: Truck },
            { id: 'forecast', label: 'Forecast & AI', icon: Sparkles },
            { id: 'customers', label: 'Customer Insights', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Advanced Interactive Mobile Dropdown */}
        <div className="w-full md:hidden relative z-50">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                {activeTab === 'revenue' && <DollarSign className="w-5 h-5" />}
                {activeTab === 'operations' && <Truck className="w-5 h-5" />}
                {activeTab === 'forecast' && <Sparkles className="w-5 h-5" />}
                {activeTab === 'customers' && <Users className="w-5 h-5" />}
              </div>
              <div className="text-left">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current View</p>
                <p className="text-sm font-bold text-slate-800">
                  {activeTab === 'revenue' && 'Revenue & Trends'}
                  {activeTab === 'operations' && 'Operations & Delivery'}
                  {activeTab === 'forecast' && 'Forecast & AI'}
                  {activeTab === 'customers' && 'Customer Insights'}
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                {/* Backdrop to close when clicking outside */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
                />

                {/* Floating Menu List */}
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="absolute top-[110%] left-0 w-full bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50 p-2"
                >
                  {[
                    { id: 'revenue', label: 'Revenue & Trends', icon: DollarSign, desc: 'Financials, MoM, Pricing' },
                    { id: 'operations', label: 'Operations & Delivery', icon: Truck, desc: 'Deliveries, Fragmentation' },
                    { id: 'forecast', label: 'Forecast & AI', icon: Sparkles, desc: 'Growth Predictions' },
                    { id: 'customers', label: 'Customer Insights', icon: Users, desc: 'RFM, Churn, Retention' }
                  ].map((tab, i) => (
                    <motion.button
                      key={tab.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === tab.id ? 'bg-brand-50 border border-brand-100' : 'hover:bg-slate-50 border border-transparent'}`}
                    >
                      <div className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30' : 'bg-slate-100 text-slate-500'}`}>
                        <tab.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${activeTab === tab.id ? 'text-brand-900' : 'text-slate-700'}`}>{tab.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{tab.desc}</p>
                      </div>
                      {activeTab === tab.id && (
                        <motion.div layoutId="active-indicator" className="ml-auto w-2 h-2 rounded-full bg-brand-500" />
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {loading ? (
        <AnalyticsSkeleton />
      ) : error ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center text-amber-800">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Failed to load data</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4">

          {/* 1. REVENUE & TRENDS */}
          {activeTab === 'revenue' && yearly && (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard
                  title="Total Revenue (All Time)"
                  value={`₹${Object.values(yearly).reduce((a, b) => a + b, 0).toLocaleString()}`}
                  sub="Based on yearly aggregation"
                  icon={DollarSign}
                  color="bg-emerald-100 text-emerald-600"
                />
                <KpiCard
                  title="Pending Payments"
                  value={`₹${Object.values(pending || {}).reduce((a, b) => a + b, 0).toLocaleString()}`}
                  sub="Total outstanding amount"
                  icon={AlertCircle}
                  color="bg-rose-100 text-rose-600"
                />
                <KpiCard
                  title="Unique Products Sold"
                  value={products?.products.length || 0}
                  sub="Active catalog items"
                  icon={Package}
                  color="bg-indigo-100 text-indigo-600"
                />
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-lg text-slate-800 mb-4">Revenue Trend (Yearly)</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={toChartData(yearly, 'year', 'revenue')}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={formatYAxis} />
                        <Tooltip formatter={(val: number) => `₹${val.toLocaleString()}`} />
                        <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-lg text-slate-800 mb-4">MoM Growth Rate</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={toChartData(mom, 'month', 'growth')}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip formatter={(val: number) => `${val.toFixed(1)}%`} />
                        <Area type="monotone" dataKey="growth" stroke="#10b981" fill="#d1fae5" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Charts Row 2 - Churn/Retention & AOV Tracker */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Churn vs Retention */}
                {churn && churn.length > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" /> Retention Trend
                      </h3>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">New vs Returning</span>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={churn} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorReturning" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend verticalAlign="top" height={36} iconType="circle" />
                          <Area type="monotone" dataKey="returning" name="Returning Customers" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorReturning)" />
                          <Area type="monotone" dataKey="new" name="New Customers" stroke="#3b82f6" fillOpacity={1} fill="url(#colorNew)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Average Order Value (AOV) Tracker */}
                {aov && aov.length > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-500" /> Average Order Value (AOV)
                    </h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={aov} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={formatYAxis}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip
                            formatter={(val: number, name: string) => {
                              if (name === 'aov') return `₹${val.toLocaleString()}`;
                              return val;
                            }}
                            labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend verticalAlign="top" height={36} iconType="circle" />
                          <Line
                            type="monotone"
                            dataKey="aov"
                            name="Average Order Value"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* Scatter Plot (Pricing Analysis) */}
              {scatter && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-slate-800">Pricing Consistency (Volume vs Revenue)</h3>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      Detect outliers (Low Price/High Qty)
                    </span>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid />
                        <XAxis type="number" dataKey="quantity" name="Quantity" unit=" units" />
                        <YAxis type="number" dataKey="revenue" name="Revenue" unit="₹" tickFormatter={formatYAxis} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="Orders" data={scatter} fill="#8884d8" shape="circle" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. OPERATIONS & DELIVERY */}
          {activeTab === 'operations' && delMetrics && (
            <div className="space-y-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard title="Total Orders" value={delMetrics.total_orders} icon={Box} color="bg-blue-100 text-blue-600" />
                <KpiCard title="Total Deliveries" value={delMetrics.total_deliveries} icon={Truck} color="bg-emerald-100 text-emerald-600" />
                <KpiCard title="Units Delivered" value={delMetrics.total_quantity.toLocaleString()} icon={Package} color="bg-purple-100 text-purple-600" />
                <KpiCard title="Amount Received" value={`₹${delMetrics.total_amount.toLocaleString()}`} icon={DollarSign} color="bg-amber-100 text-amber-600" />
              </div>

              {/* Calendar Schedule */}
              <InteractiveCalendar schedule={schedule} />

              {/* Advanced Operations Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

                {/* Delivery Fragmentation (PieChart) */}
                {fragmentation && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Package className="w-5 h-5 text-indigo-500" /> Delivery Fragmentation
                      </h3>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Trips per Order</span>
                    </div>
                    <div className="h-72 flex-grow">
                      {fragmentation.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={fragmentation}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {fragmentation.map((entry, index) => {
                                const colors = ['#10b981', '#f59e0b', '#ef4444'];
                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                              })}
                            </Pie>
                            <Tooltip
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              formatter={(value: number) => [`${value} Orders`, 'Count']}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400 font-medium">
                          No delivery data available yet
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-2 text-center">Measures how many separate dispatch trips are required to fulfill a single order.</p>
                  </div>
                )}

                {/* Revenue Held Hostage Tracker (ComposedChart) */}
                {hostage && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-500" /> Revenue Held Hostage
                      </h3>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Locked Cash Flow</span>
                    </div>
                    <div className="h-72 flex-grow">
                      {hostage.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={hostage} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} />

                            {/* Left Y-Axis for Unpaid Units (Bars) */}
                            <YAxis
                              yAxisId="left"
                              orientation="left"
                              axisLine={false}
                              tickLine={false}
                              label={{ value: 'Unpaid Units', angle: -90, position: 'insideLeft', offset: -10 }}
                            />

                            {/* Right Y-Axis for Held Revenue (Line) */}
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={formatYAxis}
                              label={{ value: 'Unpaid Cash (₹)', angle: 90, position: 'insideRight', offset: -10 }}
                            />

                            <Tooltip
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              formatter={(val: number, name: string) => {
                                if (name === 'Held Revenue') return `₹${val.toLocaleString()}`;
                                return `${val} Units`;
                              }}
                            />
                            <Legend verticalAlign="top" height={36} />

                            {/* Physical volume of items shipped but unpaid */}
                            <Bar yAxisId="left" dataKey="unpaid_units" name="Unpaid Units" fill="#fca5a5" radius={[4, 4, 0, 0]} />

                            {/* Actual Rupee value locked up */}
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="held_revenue"
                              name="Held Revenue"
                              stroke="#dc2626"
                              strokeWidth={3}
                              dot={{ r: 4, fill: '#dc2626', strokeWidth: 2, stroke: '#fff' }}
                              activeDot={{ r: 6 }}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400 font-medium">
                          No pending partially-delivered orders. Cash flow is healthy!
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-2 text-center">Tracks physical inventory delivered where the order remains unpaid/pending.</p>
                  </div>
                )}

              </div>

              {/* Advanced Delivery Size Histogram */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mt-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                      <Box className="w-6 h-6 text-indigo-500" /> Delivery Size Distribution
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Understanding average volumetric load per dispatch</p>
                  </div>
                  <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Peak: {[...(delDist || [])].sort((a, b) => b.count - a.count)[0]?.range || 'N/A'} units
                  </div>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={delDist || []} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#818cf8" stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="range"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ fill: '#f8fafc', opacity: 0.6 }}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(4px)'
                        }}
                        formatter={(value: number) => [
                          <span className="font-bold text-indigo-600">{value} Deliveries</span>,
                          <span className="text-slate-500">Frequency</span>
                        ]}
                        labelFormatter={(label) => <span className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-2 block">Size: {label} units</span>}
                      />
                      {/* Advanced animated foreground bar with subtle grey background */}
                      <Bar
                        dataKey="count"
                        fill="url(#colorCount)"
                        radius={[6, 6, 6, 6]}
                        barSize={40}
                        background={{ fill: '#f1f5f9', radius: 6 }}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* 3. FORECAST & AI */}
          {activeTab === 'forecast' && (
            <div className="space-y-6">

              {/* AI Executive Summary Card */}
              <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 p-6 md:p-8 rounded-2xl shadow-xl shadow-indigo-900/20 text-white relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-fuchsia-500 rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                        <Sparkles className="w-6 h-6 text-fuchsia-300" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">AI Executive Summary</h2>
                        <p className="text-indigo-300 text-xs mt-0.5">Powered by Google Gemini · Cached for this session</p>
                      </div>
                    </div>
                    {aiSummary && !aiLoading && (
                      <button
                        onClick={handleAiRefresh}
                        className="text-xs text-indigo-300 hover:text-white border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3 h-3" /> Refresh
                      </button>
                    )}
                  </div>

                  {aiLoading ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-4 bg-white/20 rounded w-3/4"></div>
                      <div className="h-4 bg-white/20 rounded w-1/2"></div>
                      <div className="h-4 bg-white/20 rounded w-5/6"></div>
                      <div className="h-4 bg-white/20 rounded w-2/3"></div>
                      <p className="text-indigo-200 text-sm mt-4 font-medium flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-indigo-200 border-t-white rounded-full animate-spin" />
                        Gemini is analyzing your business patterns...
                      </p>
                    </div>
                  ) : aiError ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-300 flex-shrink-0" />
                        <p className="text-indigo-100 text-sm">{aiError}</p>
                      </div>
                      <button
                        onClick={() => setAiRetryKey(k => k + 1)}
                        className="flex-shrink-0 text-sm font-bold bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg border border-white/30 transition-all flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" /> Retry
                      </button>
                    </div>
                  ) : aiSummary ? (
                    <div className="prose prose-invert max-w-none prose-p:text-indigo-50/90 prose-strong:text-white prose-strong:font-bold prose-ul:text-indigo-50/90 prose-p:leading-relaxed">
                      <ReactMarkdown>{aiSummary}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-indigo-300 text-sm">Loading revenue data to generate insights...</p>
                  )}
                </div>
              </div>

              {/* Forecast KPIs + Charts — only rendered when data is available */}
              {forecast && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KpiCard title="Model Accuracy (R²)" value={`${(forecast.r2_score * 100).toFixed(1)}%`} sub="Robust Log-Linear Regression" icon={Sparkles} color="bg-purple-100 text-purple-600" />
                    <KpiCard title="Next 12 Months" value={`₹${forecast.forecast_12_months.reduce((a, b) => a + b.predicted_revenue, 0).toLocaleString()}`} sub="Total Predicted Revenue" icon={TrendingUp} color="bg-blue-100 text-blue-600" />
                    <KpiCard title="Confidence Level" value={forecast.confidence_level} sub="Statistical Certainty" icon={AlertCircle} color="bg-emerald-100 text-emerald-600" />
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">Historical vs Forecast (12 Months)</h3>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={[
                          ...(forecast.historical_data || []).map(h => ({
                            month: h.month,
                            Actual: h.revenue,
                            Predicted: null,
                            upper_bound: null,
                            lower_bound: null
                          })),
                          ...forecast.forecast_12_months.map(f => ({
                            month: f.month,
                            Actual: null,
                            Predicted: f.predicted_revenue,
                            upper_bound: f.upper_bound,
                            lower_bound: f.lower_bound
                          }))
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tickFormatter={formatYAxis} 
                            scale="sqrt"
                            domain={[0, 'auto']}
                          />
                          <Tooltip formatter={(val: number) => `₹${val.toLocaleString()}`} />
                          <Legend verticalAlign="top" />
                          <Area type="monotone" dataKey="upper_bound" stroke="none" fill="#e9d5ff" fillOpacity={0.3} name="Confidence Interval" />
                          <Line type="monotone" dataKey="Actual" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} name="Actual Revenue" connectNulls={false} />
                          <Line type="monotone" dataKey="Predicted" stroke="#7c3aed" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} name="AI Prediction" connectNulls={false} />
                          <Brush 
                            dataKey="month" 
                            height={30} 
                            stroke="#7c3aed" 
                            fill="#f8fafc" 
                            travellerWidth={10} 
                            tickFormatter={() => ''} 
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 4. CUSTOMER INSIGHTS */}
          {activeTab === 'customers' && rfm && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Customers List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-lg text-slate-800 mb-4">Top Customers (Lifetime Value)</h3>
                  <div className="space-y-3 h-80 overflow-y-auto pr-2">
                    {toChartData(topCust?.top_total, 'name', 'revenue').map((c: any, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">{i + 1}</div>
                          <span className="font-medium">{c.name}</span>
                        </div>
                        <span className="font-bold">₹{c.revenue.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RFM Segments */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-lg text-slate-800 mb-4">Customer Segments (RFM)</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {Object.entries(rfm.segments).map(([key, data]) => (
                      <div key={key} className="p-4 border rounded-lg bg-slate-50 border-slate-100 text-center">
                        <h4 className="font-bold text-slate-700">{key}</h4>
                        <p className="text-3xl font-bold my-2 text-brand-600">{data.count}</p>
                        <p className="text-xs text-slate-500">{data.business_explanation.split('.')[0]}</p>
                      </div>
                    ))}
                  </div>

                </div>
              </div>


              <CustomerSegmentationDetails segments={rfm.segments} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;


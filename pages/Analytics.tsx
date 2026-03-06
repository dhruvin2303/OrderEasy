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
  ProductAnalyticsResponse,
  DeliveryPerformanceMetrics,
  DeliveryDistribution,
  ScatterData,
  HeatmapData,
  ExpectedScheduleData
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
  ScatterChart,
  Scatter,
  ZAxis
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
  PieChart,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// ✅ Module-level cache — survives tab switches and page navigation.
// Only cleared on browser refresh or when user explicitly clicks "Refresh".
let aiSummaryModuleCache: string | null = null;

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'revenue' | 'operations' | 'forecast' | 'customers'>('revenue');

  // Year State for Revenue Tab
  const [yearly, setYearly] = useState<YearlyRevenue | null>(null);
  const [mom, setMom] = useState<MoMGrowth | null>(null);
  const [pending, setPending] = useState<PendingMonthly | null>(null);
  const [products, setProducts] = useState<ProductAnalyticsResponse | null>(null);
  const [scatter, setScatter] = useState<ScatterData[] | null>(null);

  // Operations State
  const [delMetrics, setDelMetrics] = useState<DeliveryPerformanceMetrics | null>(null);
  const [delDist, setDelDist] = useState<DeliveryDistribution[] | null>(null);
  const [schedule, setSchedule] = useState<ExpectedScheduleData[] | null>(null);

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
    setDelMetrics(null);
    setDelDist(null);
    setSchedule(null);
    setForecast(null);
    setRfm(null);
    setTopCust(null);

    setError(null);

    try {
      if (activeTab === 'revenue') {
        const [yData, mData, pData, prodData, scatData] = await Promise.all([
          api.get<YearlyRevenue>('/analytics/revenue/yearly', signal),
          api.get<MoMGrowth>('/analytics/revenue/mom-growth', signal),
          api.get<PendingMonthly>('/analytics/pending/monthly', signal),
          api.get<ProductAnalyticsResponse>('/analytics/products/top', signal),
          api.get<ScatterData[]>('/analytics/charts/scatter-revenue-qty', signal)
        ]);
        if (!signal.aborted) {
          setYearly(yData);
          setMom(mData);
          setPending(pData);
          setProducts(prodData);
          setScatter(scatData);
        }
      }
      else if (activeTab === 'operations') {
        const [metData, distData, schData] = await Promise.all([
          api.get<DeliveryPerformanceMetrics>('/analytics/metrics/delivery-performance', signal),
          api.get<DeliveryDistribution[]>('/analytics/charts/delivery-distribution', signal),
          api.get<ExpectedScheduleData[]>('/analytics/charts/expected-delivery-schedule', signal)
        ]);
        if (!signal.aborted) {
          setDelMetrics(metData);
          setDelDist(distData);
          setSchedule(schData);
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

  // Components
  const KpiCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );

  // Calendar Component
  const InteractiveCalendar = () => {
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

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-500">Business performance, delivery metrics, and AI forecasts.</p>
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 overflow-x-auto">
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

        {/* Export Button */}

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
              <InteractiveCalendar />

              {/* Delivery Size Histogram */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg text-slate-800 mb-4">Delivery Size Distribution</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={delDist || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="range" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: '#f1f5f9' }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Deliveries" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  Most deliveries are in the <b>{delDist?.sort((a, b) => b.count - a.count)[0]?.range}</b> unit range.
                </p>
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
                          <YAxis axisLine={false} tickLine={false} tickFormatter={formatYAxis} />
                          <Tooltip formatter={(val: number) => `₹${val.toLocaleString()}`} />
                          <Legend verticalAlign="top" />
                          <Area type="monotone" dataKey="upper_bound" stroke="none" fill="#e9d5ff" fillOpacity={0.3} name="Confidence Interval" />
                          <Line type="monotone" dataKey="Actual" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} name="Actual Revenue" connectNulls={false} />
                          <Line type="monotone" dataKey="Predicted" stroke="#7c3aed" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} name="AI Prediction" connectNulls={false} />
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


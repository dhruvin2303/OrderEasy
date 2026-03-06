import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CurrentMonthMetrics, DashboardSummary } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { ArrowUpRight, CheckCircle, Clock, Package, DollarSign, Activity, Truck } from 'lucide-react';
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';
import { BubbleChartData, RecentActivityData, FulfillmentGapData } from '../types';

const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color} transition-transform duration-300 group-hover:scale-110`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    {subtext && <p className="text-xs text-slate-400 mt-4">{subtext}</p>}
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [currentMonth, setCurrentMonth] = useState<CurrentMonthMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [statusDist, setStatusDist] = useState<any[]>([]);
  const [bubbleData, setBubbleData] = useState<BubbleChartData[]>([]);
  const [activityFeed, setActivityFeed] = useState<RecentActivityData[]>([]);
  const [gapData, setGapData] = useState<FulfillmentGapData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, monthRes, revRes, statusRes, bubbleRes, activityRes, gapRes] = await Promise.all([
          api.get<DashboardSummary>('/analytics/summary'),
          api.get<CurrentMonthMetrics>('/analytics/dashboard/current-month'),
          api.get<Record<string, number>>('/analytics/revenue/monthly'),
          api.get<Record<string, number>>('/analytics/orders/status-distribution'),
          api.get<BubbleChartData[]>('/analytics/dashboard/product-bubble'),
          api.get<RecentActivityData[]>('/analytics/dashboard/recent-activity'),
          api.get<FulfillmentGapData[]>('/analytics/dashboard/fulfillment-gap'),
        ]);

        setSummary(sumRes);
        setCurrentMonth(monthRes);
        setBubbleData(bubbleRes);
        setActivityFeed(activityRes);
        setGapData(gapRes);

        // Transform Revenue Map to Array
        const revArray = Object.entries(revRes).map(([date, amount]) => ({
          name: date,
          amount: amount
        }));
        setRevenueData(revArray);

        // Transform Status Map to Array
        const statusArray = Object.entries(statusRes).map(([status, count]) => ({
          name: status,
          value: count
        }));
        setStatusDist(statusArray);

      } catch (error) {
        console.error("Dashboard fetch error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back, here's what's happening with your orders.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up delay-200">
        <StatCard
          title="Total Orders"
          value={summary?.total_orders}
          subtext={`${currentMonth?.total_orders} this month`}
          icon={Package}
          color="bg-indigo-500"
        />
        <StatCard
          title="Completed"
          value={summary?.completed_orders}
          subtext={`${currentMonth?.completed_orders} this month`}
          icon={CheckCircle}
          color="bg-emerald-500"
        />
        <StatCard
          title="Pending"
          value={summary?.pending_orders}
          subtext={`${currentMonth?.pending_orders} this month`}
          icon={Clock}
          color="bg-amber-500"
        />
        <StatCard
          title="Units Delivered"
          value={summary?.total_units_delivered}
          subtext={`${currentMonth?.units_delivered} this month`}
          icon={ArrowUpRight}
          color="bg-brand-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up delay-300">
        {/* Revenue Trend - Takes up 2 columns */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Revenue Trend</h2>
            <button
              className="text-sm text-brand-600 font-medium hover:text-brand-700"
              onClick={() => navigate('/analytics')}
            >
              View Report
            </button>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b' }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                    return value;
                  }}
                  width={60}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#7c3aed" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution - Takes up 1 column */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Order Status</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusDist}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3 - New Charts (Bubble & Feed) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in-up delay-500">
        {/* Bubble Chart: Products by Volume vs Revenue */}
        <div className="xl:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Product Matrix</h2>
              <p className="text-sm text-slate-500">Revenue vs Quantity Solid (Bubble size = Order Count)</p>
            </div>
          </div>
          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  dataKey="quantity"
                  name="Quantity Sold"
                  tick={{ fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="revenue"
                  name="Revenue (₹)"
                  tick={{ fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <ZAxis type="number" dataKey="orders" range={[100, 1500]} name="Total Orders" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-800 text-white p-3 rounded-lg shadow-xl border border-slate-700">
                          <p className="font-bold text-brand-300 mb-1">{data.name}</p>
                          <p className="text-sm">Revenue: ₹{data.revenue.toLocaleString()}</p>
                          <p className="text-sm">Quantity: {data.quantity}</p>
                          <p className="text-sm text-slate-300 mt-1">{data.orders} total orders</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter
                  name="Products"
                  data={bubbleData}
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                  stroke="#7c3aed"
                  strokeWidth={2}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col max-h-[460px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-500" /> Recent Activity
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {activityFeed.map((activity, idx) => (
              <div key={`${activity.id}-${idx}`} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                {/* Status Indicator Dot */}
                <div className="mt-1.5 relative flex items-center justify-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${activity.status === 'Completed' ? 'bg-emerald-500 group-hover:animate-ping' : 'bg-amber-500'}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-semibold text-slate-800 truncate pr-2">{activity.product}</p>
                    <p className="text-sm font-bold text-slate-900 flex-shrink-0">₹{activity.amount.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500 truncate">{activity.receiver} • {activity.quantity} units</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activity.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                      activity.payment_status === 'Partial' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                      {activity.payment_status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {activityFeed.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <p>No recent activity found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Row 4 - Fulfillment Gap Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-fade-in-up delay-[600ms]">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-500" /> Fulfillment Gap Analysis
            </h2>
            <p className="text-sm text-slate-500 mt-1">Expected Delivery Date vs. Actual Delivery Date</p>
          </div>
          <div className="flex gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-500 opacity-70"></div> Late</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500 opacity-70"></div> Early / On Time</div>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                type="category"
                dataKey="actual"
                name="Delivery Date"
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                type="number"
                dataKey="days_gap"
                name="Days Gap"
                tick={{ fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                label={{ value: '← Early | Late →', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
              />
              <ZAxis type="number" range={[100, 100]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as FulfillmentGapData;
                    const isLate = data.days_gap > 0;
                    return (
                      <div className="bg-slate-800 text-white p-3 rounded-lg shadow-xl border border-slate-700 min-w-[200px]">
                        <p className="font-bold mb-2 break-words">{data.product}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                          <span className="text-slate-400">Expected:</span>
                          <span>{data.expected}</span>
                          <span className="text-slate-400">Delivered:</span>
                          <span>{data.actual}</span>
                        </div>
                        <div className={`mt-2 pt-2 border-t border-slate-600 text-sm font-bold ${isLate ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {isLate ? `${data.days_gap} days late` : data.days_gap === 0 ? 'Exactly on time' : `${Math.abs(data.days_gap)} days early`}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Plot points dynamically: Red for late, Green for early/on-time */}
              <Scatter name="Late Deliveries" data={gapData.filter(d => d.days_gap > 0)} fill="#f43f5e" fillOpacity={0.7} />
              <Scatter name="Early Deliveries" data={gapData.filter(d => d.days_gap <= 0)} fill="#10b981" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
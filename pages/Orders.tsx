import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../services/api';
import { Order } from '../types';
import { Link } from 'react-router-dom';
import { Plus, Download, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [showPendingPayment, setShowPendingPayment] = useState(false);
  const [showRemainingDelivery, setShowRemainingDelivery] = useState(false);

  // Sort State
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Alert State
  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: ''
  });

  // New Order Form State
  const [formData, setFormData] = useState({
    receiver_name: '',
    date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    product: '',
    quantity: 0,
    price: 0,
    gst: 0,
    advance_payment: 0,
    description: '',
    url: ''
  });

  const fetchOrders = async () => {
    try {
      const data = await api.get<Order[]>('/orders/');
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const showAlert = (title: string, message: string) => {
    setAlertState({ isOpen: true, title, message });
  };

  const handleExport = async () => {
    try {
      await api.download('/exports/orders?status=all', 'orders.xlsx');
    } catch (e) {
      showAlert('Export Failed', 'Could not download the orders report. Please try again.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/orders/', {
        ...formData,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        gst: Number(formData.gst),
        advance_payment: Number(formData.advance_payment)
      });
      setIsModalOpen(false);
      fetchOrders();
      // Reset form (simplified)
      setFormData({
        receiver_name: '',
        date: new Date().toISOString().split('T')[0],
        expected_delivery_date: '',
        product: '',
        quantity: 0,
        price: 0,
        gst: 0,
        advance_payment: 0,
        description: '',
        url: ''
      });
    } catch (error: any) {
      if (error.message && error.message.includes("Network Error")) {
        // Bypass: Assume success if backend is working but frontend is glitching
        console.warn("Bypassing Network Error as per user request. Refreshing orders...");
        setIsModalOpen(false);

        // Give the backend a slight moment to process, then fetch
        setTimeout(() => {
          fetchOrders();
        }, 500);

        // clear form
        setFormData({
          receiver_name: '',
          date: new Date().toISOString().split('T')[0],
          expected_delivery_date: '',
          product: '',
          quantity: 0,
          price: 0,
          gst: 0,
          advance_payment: 0,
          description: '',
          url: ''
        });
      } else {
        showAlert('Error Creating Order', error.message);
      }
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.receiver_name.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase()) ||
      String(o.order_id).includes(search);

    if (!matchesSearch) return false;

    // Status Filter
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;

    // Date Filter (Removed as per request, replaced by sorting)
    // if (dateFilter && o.date !== dateFilter) return false;

    // Pending Amount Filter
    if (showPendingPayment && o.pending_amount <= 0) return false;

    // Remaining Delivery Filter
    const remaining = o.quantity - (o.delivered_quantity || 0);
    if (showRemainingDelivery && remaining <= 0) return false;

    return true;
  });

  // Sort Logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!sortConfig) return 0;

    const { key, direction } = sortConfig;
    let aVal: any = a[key as keyof Order];
    let bVal: any = b[key as keyof Order];

    // Computed values
    if (key === 'remaining') {
      aVal = a.quantity - (a.delivered_quantity || 0);
      bVal = b.quantity - (b.delivered_quantity || 0);
    }

    if (key === 'total') aVal = a.total_amount_with_gst;
    if (key === 'total') bVal = b.total_amount_with_gst;

    if (key === 'pending') aVal = a.pending_amount;
    if (key === 'pending') bVal = b.pending_amount;

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key: string) => {
    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        setSortConfig({ key, direction: 'desc' });
      } else {
        setSortConfig(null);
      }
    } else {
      setSortConfig({ key, direction: 'asc' });
    }
  };

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortConfig?.key === colKey) {
      return sortConfig.direction === 'asc'
        ? <ArrowUp className="w-4 h-4 text-brand-600" />
        : <ArrowDown className="w-4 h-4 text-brand-600" />
    }
    // Default state: Show neutral sort icon to indicate interactivity
    return <ArrowUpDown className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
  };

  return (
    <div className="space-y-6">

      {/* Alert Modal */}
      <ConfirmModal
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        confirmText="OK"
        cancelText="" // Hide cancel button effectively making it an alert
        onConfirm={() => setAlertState({ ...alertState, isOpen: false })}
        onCancel={() => setAlertState({ ...alertState, isOpen: false })}
      />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" /> New Order
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by ID, Customer, or Product..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-brand-100 text-brand-700' : 'text-slate-500 hover:text-brand-600 hover:bg-brand-50'}`}
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Expanded Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 animate-slide-in-right flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="block w-40 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-4 py-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPendingPayment}
                onChange={(e) => setShowPendingPayment(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
              />
              <span className="text-sm font-medium text-slate-700">Pending Payment</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showRemainingDelivery}
                onChange={(e) => setShowRemainingDelivery(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
              />
              <span className="text-sm font-medium text-slate-700">Remaining Delivery</span>
            </label>
          </div>

          <div className="flex-1" /> {/* Spacer */}

          <button
            onClick={() => {
              setStatusFilter('All');
              setShowPendingPayment(false);
              setShowRemainingDelivery(false);
              setSortConfig(null);
            }}
            className="text-sm text-slate-500 hover:text-rose-600 hover:underline px-2"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Product</th>

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 transition-colors select-none group" onClick={() => requestSort('date')}>
                  <div className="flex items-center gap-1">Date <SortIcon colKey="date" /></div>
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 transition-colors select-none group" onClick={() => requestSort('total')}>
                  <div className="flex items-center gap-1">Total <SortIcon colKey="total" /></div>
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 transition-colors select-none group" onClick={() => requestSort('remaining')}>
                  <div className="flex items-center gap-1">Remaining <SortIcon colKey="remaining" /></div>
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 transition-colors select-none group" onClick={() => requestSort('pending')}>
                  <div className="flex items-center gap-1">Pending <SortIcon colKey="pending" /></div>
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={9} className="p-8 text-center text-slate-500">Loading orders...</td></tr>
              ) : sortedOrders.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-slate-500">No orders found.</td></tr>
              ) : (
                sortedOrders.map((order) => {
                  const remaining = order.quantity - order.delivered_quantity;
                  return (
                    <tr key={order.order_id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">#{order.order_id}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{order.receiver_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{order.product}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{order.date}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">₹{order.total_amount_with_gst.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`font-medium ${remaining > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                          {remaining}
                        </span>
                        <span className="text-xs text-slate-400"> / {order.quantity}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.pending_amount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          ₹{order.pending_amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${order.status === 'Completed'
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                          : 'bg-amber-50 border-amber-100 text-amber-700'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/orders/${order.order_id}`}
                          className="text-brand-600 hover:text-brand-700 text-sm font-medium hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">Create New Order</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><Plus className="rotate-45" /></button>
            </div>

            <form onSubmit={handleCreate} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Receiver Name</label>
                <input required type="text" className="w-full border p-2 rounded-lg" value={formData.receiver_name} onChange={e => setFormData({ ...formData, receiver_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Date</label>
                <input required type="date" className="w-full border p-2 rounded-lg" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Expected Delivery</label>
                <input type="date" className="w-full border p-2 rounded-lg" value={formData.expected_delivery_date} onChange={e => setFormData({ ...formData, expected_delivery_date: e.target.value })} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-slate-700">Product</label>
                <input required type="text" className="w-full border p-2 rounded-lg" value={formData.product} onChange={e => setFormData({ ...formData, product: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Quantity</label>
                <input required type="number" className="w-full border p-2 rounded-lg" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Price (per unit)</label>
                <input required type="number" className="w-full border p-2 rounded-lg" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">GST (%)</label>
                <input required type="number" className="w-full border p-2 rounded-lg" value={formData.gst} onChange={e => setFormData({ ...formData, gst: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Advance Payment</label>
                <input required type="number" className="w-full border p-2 rounded-lg" value={formData.advance_payment} onChange={e => setFormData({ ...formData, advance_payment: Number(e.target.value) })} />
              </div>

              <div className="md:col-span-2 pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 shadow-lg shadow-brand-500/30">Create Order</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Orders;
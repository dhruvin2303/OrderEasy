import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileDown, Calendar, Filter, AlertCircle, Truck, FileText, ReceiptText, ClipboardList, User } from 'lucide-react';
import { SEO } from '../components/SEO';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type Format = 'excel' | 'pdf';

// ─────────────────────────────────────────────
// DUAL DOWNLOAD BUTTON
// ─────────────────────────────────────────────
interface DualBtnProps {
    onExcel: () => void;
    onPdf: () => void;
    loading: boolean;
}
const DualDownload: React.FC<DualBtnProps> = ({ onExcel, onPdf, loading }) => (
    <div className="mt-6 grid grid-cols-2 gap-3">
        <button
            onClick={onExcel}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50"
        >
            <FileDown className="w-4 h-4" /> Excel
        </button>
        <button
            onClick={onPdf}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50"
        >
            <FileText className="w-4 h-4" /> PDF
        </button>
    </div>
);

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const Exports: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Orders
    const [orderStatus, setOrderStatus] = useState('All');
    const [orderStart, setOrderStart] = useState('');
    const [orderEnd, setOrderEnd] = useState('');

    // Revenue
    const [revStartYear, setRevStartYear] = useState('');
    const [revEndYear, setRevEndYear] = useState('');

    // Deliveries
    const [delStart, setDelStart] = useState('');
    const [delEnd, setDelEnd] = useState('');

    // Customer Statement
    const [customerName, setCustomerName] = useState('');
    const [customerList, setCustomerList] = useState<string[]>([]);

    // GST Report
    const [gstStart, setGstStart] = useState('');
    const [gstEnd, setGstEnd] = useState('');

    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

    // Load customer list on mount
    useEffect(() => {
        api.get('/exports/customers/list')
            .then((res: any) => setCustomerList(res.customers || []))
            .catch(() => { });
    }, []);

    // ── Helpers ──────────────────────────────────────────────────
    const download = async (url: string, filename: string) => {
        setLoading(true);
        setError('');
        try {
            await api.download(url, filename);
        } catch (e: any) {
            setError(e.message || 'Export failed');
        } finally {
            setLoading(false);
        }
    };

    // ── Order Export ──────────────────────────────────────────────
    const orderParams = () => {
        const p = new URLSearchParams();
        if (orderStatus !== 'All') p.append('status', orderStatus);
        if (orderStart) p.append('start_date', orderStart);
        if (orderEnd) p.append('end_date', orderEnd);
        return p.toString();
    };

    // ── Revenue Export ────────────────────────────────────────────
    const revParams = () => {
        const p = new URLSearchParams();
        if (revStartYear) p.append('start_year', revStartYear);
        if (revEndYear) p.append('end_year', revEndYear);
        return p.toString();
    };

    // ── Delivery Export ───────────────────────────────────────────
    const delParams = () => {
        const p = new URLSearchParams();
        if (delStart) p.append('start_date', delStart);
        if (delEnd) p.append('end_date', delEnd);
        return p.toString();
    };

    // ── GST Params ────────────────────────────────────────────────
    const gstParams = () => {
        const p = new URLSearchParams();
        if (gstStart) p.append('start_date', gstStart);
        if (gstEnd) p.append('end_date', gstEnd);
        return p.toString();
    };

    // ─────────────────────────────────────────────────────────────
    // CARD WRAPPER
    // ─────────────────────────────────────────────────────────────
    const Card: React.FC<{
        icon: React.ElementType;
        iconBg: string;
        title: string;
        sub: string;
        badge?: string;
        children: React.ReactNode;
    }> = ({ icon: Icon, iconBg, title, sub, badge, children }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full relative z-10 hover:z-20">
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg flex-shrink-0 ${iconBg}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800">{title}</h3>
                        {badge && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                                {badge}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500">{sub}</p>
                </div>
            </div>
            <div className="space-y-3 flex-1">{children}</div>
        </div>
    );

    const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <label className="text-xs font-semibold text-slate-500 mb-1 block">{children}</label>
    );

    const DateInput: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
        <div>
            <Label>{label}</Label>
            <input type="date" className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                value={value} onChange={e => onChange(e.target.value)} />
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <SEO
                title="Data Exports"
                description="Generate, schedule, and download advanced data exports and custom business reports from the OrderEazy platform."
                keywords="export, csv export, pdf generation, scheduled reports, business report, data extraction, ordereazy export"
            />
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Data Exports</h1>
                <p className="text-slate-500 mt-1">Download your business data as <span className="font-semibold text-emerald-600">Excel</span> or a branded <span className="font-semibold text-indigo-600">PDF</span>.</p>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* ── Section 1: Core Exports ──────────────────────────────── */}
            <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Core Exports</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Orders */}
                    <Card icon={ClipboardList} iconBg="bg-blue-50 text-blue-600" title="Orders Report" sub="Full order list with amounts & status.">
                        <div>
                            <Label>Status</Label>
                            <select value={orderStatus} onChange={e => setOrderStatus(e.target.value)}
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm">
                                <option value="All">All Statuses</option>
                                <option value="Completed">Completed</option>
                                <option value="Pending">Pending</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <DateInput label="From" value={orderStart} onChange={setOrderStart} />
                            <DateInput label="To" value={orderEnd} onChange={setOrderEnd} />
                        </div>
                        <DualDownload
                            loading={loading}
                            onExcel={() => download(`/exports/orders?${orderParams()}`, 'orders.xlsx')}
                            onPdf={() => download(`/exports/orders/pdf?${orderParams()}`, 'orders_report.pdf')}
                        />
                    </Card>

                    {/* Revenue */}
                    <Card icon={Calendar} iconBg="bg-purple-50 text-purple-600" title="Revenue Report" sub="Monthly and yearly revenue summaries.">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label>Start Year</Label>
                                <input type="number" placeholder="2024" className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                    value={revStartYear} onChange={e => setRevStartYear(e.target.value)} />
                            </div>
                            <div>
                                <Label>End Year</Label>
                                <input type="number" placeholder="2025" className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                    value={revEndYear} onChange={e => setRevEndYear(e.target.value)} />
                            </div>
                        </div>
                        <DualDownload
                            loading={loading}
                            onExcel={() => download(`/exports/revenue-summary?${revParams()}`, 'revenue_summary.xlsx')}
                            onPdf={() => download(`/exports/revenue-summary/pdf?${revParams()}`, 'revenue_summary.pdf')}
                        />
                    </Card>

                    {/* Deliveries */}
                    <Card icon={Truck} iconBg="bg-emerald-50 text-emerald-600" title="Deliveries Report" sub="All delivery records by date range.">
                        <div className="grid grid-cols-2 gap-2">
                            <DateInput label="From" value={delStart} onChange={setDelStart} />
                            <DateInput label="To" value={delEnd} onChange={setDelEnd} />
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => download(`/exports/deliveries-zip?${delParams()}`, 'deliveries.zip')}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50"
                            >
                                <FileDown className="w-4 h-4" /> ZIP
                            </button>
                            <button
                                onClick={() => download(`/exports/deliveries/pdf?${delParams()}`, 'deliveries_report.pdf')}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50"
                            >
                                <FileText className="w-4 h-4" /> PDF
                            </button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* ── Section 2: Advanced Exports ─────────────────────────── */}
            <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Advanced Exports</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Customer Statement */}
                    <Card icon={User} iconBg="bg-rose-50 text-rose-600" title="Customer Statement" sub="Complete account statement for one client." badge="New">
                        <div className="relative z-50">
                            <Label>Select Customer</Label>
                            <button
                                onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white text-left flex justify-between items-center"
                            >
                                <span className={customerName ? "text-slate-900" : "text-slate-400"}>
                                    {customerName || "— Choose a customer —"}
                                </span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 transition-transform ${isCustomerDropdownOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
                            </button>

                            {isCustomerDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50 animate-fade-in-up">
                                    <div className="max-h-60 overflow-y-auto overscroll-contain">
                                        {customerList.map(c => (
                                            <button
                                                key={c}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setCustomerName(c);
                                                    setIsCustomerDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-sm hover:bg-brand-50 transition-colors ${customerName === c ? "bg-brand-50 text-brand-600 font-medium" : "text-slate-700"}`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-400">Includes all orders, payments, and outstanding balance.</p>
                        <DualDownload
                            loading={loading}
                            onExcel={() => {
                                if (!customerName) { setError('Please select a customer.'); return; }
                                download(`/exports/customer-statement?customer=${encodeURIComponent(customerName)}`, `statement_${customerName}.xlsx`);
                            }}
                            onPdf={() => {
                                if (!customerName) { setError('Please select a customer.'); return; }
                                download(`/exports/customer-statement/pdf?customer=${encodeURIComponent(customerName)}`, `statement_${customerName}.pdf`);
                            }}
                        />
                    </Card>

                    {/* GST Report */}
                    <Card icon={ReceiptText} iconBg="bg-amber-50 text-amber-600" title="GST Tax Report" sub="Tax-ready slab-wise revenue breakdown." badge="New">
                        <div className="grid grid-cols-2 gap-2">
                            <DateInput label="From" value={gstStart} onChange={setGstStart} />
                            <DateInput label="To" value={gstEnd} onChange={setGstEnd} />
                        </div>
                        <p className="text-xs text-slate-400">Groups orders by GST % slab. Excel has 2 sheets: All Orders + Slab Summary.</p>
                        <DualDownload
                            loading={loading}
                            onExcel={() => download(`/exports/gst-report?${gstParams()}`, 'gst_report.xlsx')}
                            onPdf={() => download(`/exports/gst-report/pdf?${gstParams()}`, 'gst_report.pdf')}
                        />
                    </Card>

                    {/* Pending Orders PDF */}
                    <Card icon={AlertCircle} iconBg="bg-orange-50 text-orange-600" title="Pending Orders Report" sub="Urgency-sorted snapshot for the warehouse." badge="New">
                        <p className="text-sm text-slate-600">
                            Lists all currently <span className="font-semibold text-orange-600">Pending</span> orders sorted by closest due date first. Overdue orders are flagged.
                        </p>
                        <p className="text-xs text-slate-400 mt-2">Print it every morning for the warehouse team.</p>
                        <div className="mt-6">
                            <button
                                onClick={() => download('/exports/pending-orders/pdf', 'pending_orders_urgent.pdf')}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50"
                            >
                                <FileText className="w-4 h-4" /> Download PDF
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Exports;

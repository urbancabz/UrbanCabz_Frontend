import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CompanyFleetManage from "./CompanyFleetManage";
import useDragScroll from "../../hooks/useDragScroll";
import { recordCompanyPayment, updateCompany } from "../../services/adminService";
import { toast } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api/v1";

export default function CompanyDetails({ company, onClose }) {
    const { ref: bookingsRef, ...bookingsDrag } = useDragScroll();
    const { ref: paymentsRef, ...paymentsDrag } = useDragScroll();

    const [bookings, setBookings] = useState([]);
    const [payments, setPayments] = useState([]);
    const [allTimeStats, setAllTimeStats] = useState({ totalBilled: 0, totalPaid: 0, outstanding: 0, totalBookings: 0 });
    const [monthlyBreakdown, setMonthlyBreakdown] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("BOOKINGS");
    const [selectedMonth, setSelectedMonth] = useState("ALL");

    const [showFleetModal, setShowFleetModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Edit Form State
    const [editForm, setEditForm] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    // Payment Form State
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMode, setPaymentMode] = useState("CASH");
    const [paymentReference, setPaymentReference] = useState("");
    const [paymentNote, setPaymentNote] = useState("");
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        loadCompanyData();
    }, [company.id]);

    const loadCompanyData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("adminToken");
            const response = await fetch(`${API_BASE_URL}/b2b/companies/${company.id}/bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setBookings(data.data.bookings || []);
                setPayments(data.data.payments || []);
                setAllTimeStats(data.data.billingSummary);
                setMonthlyBreakdown(data.data.monthlyBreakdown || {});
            }
        } catch (error) {
            console.error("Error loading company data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPayment = async () => {
        if (!paymentAmount || isNaN(paymentAmount) || parseFloat(paymentAmount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (!window.confirm(`Confirm payment of ₹${paymentAmount} via ${paymentMode}?`)) return;

        setPaymentLoading(true);
        const res = await recordCompanyPayment({
            company_id: company.id,
            amount: parseFloat(paymentAmount),
            payment_mode: paymentMode,
            reference_no: paymentReference,
            notes: paymentNote
        });
        setPaymentLoading(false);

        if (res.success) {
            toast.success("Payment recorded successfully");
            setShowPaymentModal(false);
            setPaymentAmount("");
            setPaymentNote("");
            setPaymentReference("");
            loadCompanyData();
        } else {
            toast.error(res.message || "Failed to record payment");
        }
    };

    const openEditModal = () => {
        setEditForm({
            company_name: company.company_name,
            company_email: company.company_email,
            company_phone: company.company_phone,
            address: company.address || '',
            city: company.city || '',
            state: company.state || '',
            pincode: company.pincode || '',
            gst_number: company.gst_number || ''
        });
        setShowEditModal(true);
    };

    const handleEditCompany = async (e) => {
        e.preventDefault();
        setIsEditing(true);
        const res = await updateCompany(company.id, editForm);
        setIsEditing(false);

        if (res.success) {
            toast.success("Company details updated");
            setShowEditModal(false);
            // We need to refresh the parent list too, but strictly speaking calling onClose() might be better 
            // but we want to stay here. We can reload local data but the parent list won't update until close.
            // For now, let's just update local view if we had local state for company details (we use props).
            // Since we use props 'company', we can't easily update the view without parent update.
            // Ideally we should have a callback onUpdate.
            // For now, let's just close the modal and maybe the parent will refresh if we trigger something?
            // Actually, let's just reload the data if we were fetching company details ourselves?
            // Wait, we are fetching 'bookings' but company details come from props.
            // The user will see old data in header until they close and reopen CompanyDetails.
            // To fix this properly, we should refetch company details here or ask parent to refresh.
            // Let's rely on the user closing and reopening for now or just reload the page/component?
            // Actually, we can just call onClose() to force refresh from list.
            onClose();
        } else {
            toast.error(res.message || "Failed to update company");
        }
    };

    const handleMarkPaid = async (bookingId) => {
        if (!window.confirm("Mark this booking as paid?")) return;
        try {
            const token = localStorage.getItem("adminToken");
            const response = await fetch(`${API_BASE_URL}/b2b/bookings/${bookingId}/mark-paid`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                loadCompanyData();
            }
        } catch (error) {
            console.error("Error marking as paid:", error);
        }
    };

    // Calculate dynamic stats based on filter
    const displayedStats = useMemo(() => {
        if (selectedMonth === "ALL") return allTimeStats;
        return {
            totalBilled: Math.round(monthlyBreakdown[selectedMonth]?.billed || 0),
            totalPaid: Math.round(monthlyBreakdown[selectedMonth]?.paid || 0),
            outstanding: Math.round((monthlyBreakdown[selectedMonth]?.billed || 0) - (monthlyBreakdown[selectedMonth]?.paid || 0)),
            totalBookings: monthlyBreakdown[selectedMonth]?.count || 0
        };
    }, [selectedMonth, allTimeStats, monthlyBreakdown]);

    const filteredBookings = useMemo(() => {
        if (selectedMonth === "ALL") return bookings;
        return bookings.filter(b => {
            const date = new Date(b.created_at);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            return key === selectedMonth;
        });
    }, [bookings, selectedMonth]);

    const filteredPayments = useMemo(() => {
        if (selectedMonth === "ALL") return payments;
        return payments.filter(p => {
            const date = new Date(p.payment_date || p.paid_at || p.created_at);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            return key === selectedMonth;
        });
    }, [payments, selectedMonth]);

    const availableMonths = Object.keys(monthlyBreakdown).sort().reverse();

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
            case 'CANCELLED': return 'bg-rose-100 text-rose-700';
            case 'PAID': return 'bg-emerald-500 text-white';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-600/20">
                            {company.company_name[0]}
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{company.company_name}</h2>
                            <div className="flex gap-4 mt-1 text-sm font-medium text-slate-500">
                                <span>📧 {company.company_email}</span>
                                <span>📞 {company.company_phone}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFleetModal(true)}
                            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            🚕 Manage Fleet
                        </button>
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            💸 Record Payment
                        </button>
                        <button
                            onClick={openEditModal}
                            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            ✏️ Edit Details
                        </button>
                        <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-600 transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {!loading ? (
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 CustomScrollbar">
                        {/* Billing Summary Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Billing Summary</h3>
                                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                                    <button
                                        onClick={() => setSelectedMonth("ALL")}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedMonth === "ALL" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                                    >
                                        All Time
                                    </button>
                                    {availableMonths.slice(0, 3).map(month => (
                                        <button
                                            key={month}
                                            onClick={() => setSelectedMonth(month)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedMonth === month ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                                        >
                                            {new Date(month + "-01").toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                        </button>
                                    ))}
                                    {availableMonths.length > 3 && (
                                        <select
                                            value={availableMonths.includes(selectedMonth) && availableMonths.indexOf(selectedMonth) >= 3 ? selectedMonth : ""}
                                            onChange={(e) => setSelectedMonth(e.target.value)}
                                            className="bg-transparent border-none text-xs font-bold text-slate-500 outline-none pr-2"
                                        >
                                            <option value="" disabled>More...</option>
                                            {availableMonths.slice(3).map(month => (
                                                <option key={month} value={month}>{month}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-6">
                                {[
                                    { label: "Total Bookings", val: displayedStats.totalBookings, color: "text-indigo-600", bg: "bg-indigo-50" },
                                    { label: "Billed Amount", val: `₹${displayedStats.totalBilled.toLocaleString()}`, color: "text-blue-600", bg: "bg-blue-50" },
                                    { label: "Total Paid", val: `₹${displayedStats.totalPaid.toLocaleString()}`, color: "text-emerald-600", bg: "bg-emerald-50" },
                                    { label: "Outstanding", val: `₹${displayedStats.outstanding.toLocaleString()}`, color: "text-rose-600", bg: "bg-rose-50" },
                                ].map((stat, i) => (
                                    <div key={i} className={`${stat.bg} p-6 rounded-2xl border border-white shadow-sm`}>
                                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">{stat.label}</span>
                                        <p className={`text-2xl font-black ${stat.color} mt-1`}>{stat.val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-slate-100 flex gap-8">
                            {["BOOKINGS", "PAYMENTS"].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 text-sm font-bold tracking-tight transition-all relative ${activeTab === tab ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                                >
                                    {tab === "BOOKINGS" ? "Recent Bookings" : "Payment History"}
                                    {activeTab === tab && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" />}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="min-h-[400px]">
                            {activeTab === "BOOKINGS" ? (
                                <div
                                    ref={bookingsRef}
                                    {...bookingsDrag}
                                    className={`overflow-x-auto CustomScrollbar select-none ${bookingsDrag.isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                                >
                                    <table className="min-w-[1200px] w-full">
                                        <thead>
                                            <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                                                <th className="px-8 py-6 pl-2">Booking ID</th>
                                                <th className="px-8 py-6">Date & Time</th>
                                                <th className="px-8 py-6">User</th>
                                                <th className="px-8 py-6">Route</th>
                                                <th className="px-8 py-6">Amount</th>
                                                <th className="px-8 py-6">Status</th>
                                                <th className="px-8 py-6 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredBookings.map(booking => (
                                                <tr key={booking.id} className="text-sm font-medium text-slate-600 group hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-6 font-bold text-slate-900">#B2B-{booking.id}</td>
                                                    <td className="px-8 py-6 text-xs font-semibold text-slate-500">
                                                        {new Date(booking.created_at).toLocaleString('en-IN', {
                                                            day: '2-digit', month: 'short', year: 'numeric',
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <p className="text-xs font-bold">{booking.bookedByUser.name}</p>
                                                        <p className="text-[10px] text-slate-400">{booking.bookedByUser.email}</p>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <p className="text-xs truncate max-w-[150px]">{booking.pickup_location.split(',')[0]} → {booking.drop_location.split(',')[0]}</p>
                                                    </td>
                                                    <td className="px-8 py-6 font-black text-slate-900">₹{parseFloat(booking.total_amount).toLocaleString()}</td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(booking.status)}`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        {booking.status === 'COMPLETED' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleMarkPaid(booking.id); }}
                                                                className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800"
                                                            >
                                                                Mark Paid
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div
                                    ref={paymentsRef}
                                    {...paymentsDrag}
                                    className={`overflow-x-auto CustomScrollbar select-none ${paymentsDrag.isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                                >
                                    <table className="min-w-[1000px] w-full">
                                        <thead>
                                            <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                                                <th className="px-8 py-6 pl-2">Date</th>
                                                <th className="px-8 py-6">Amount</th>
                                                <th className="px-8 py-6">Mode</th>
                                                <th className="px-8 py-6">Reference</th>
                                                <th className="px-8 py-6">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredPayments.map(payment => (
                                                <tr key={payment.id} className="text-sm font-medium text-slate-600">
                                                    <td className="px-8 py-6 pl-2 font-bold text-slate-900">
                                                        {new Date(payment.payment_date || payment.paid_at || payment.created_at).toLocaleString('en-IN', {
                                                            day: '2-digit', month: 'short', year: 'numeric',
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </td>
                                                    <td className="px-8 py-6 font-black text-emerald-600">₹{payment.amount.toLocaleString()}</td>
                                                    <td className="px-8 py-6">
                                                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">{payment.payment_mode}</span>
                                                    </td>
                                                    <td className="px-8 py-6 text-xs">{payment.reference_no || '-'}</td>
                                                    <td className="px-8 py-6 text-xs text-slate-400 italic">{payment.notes || '-'}</td>
                                                </tr>
                                            ))}
                                            {filteredPayments.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="py-20 text-center text-slate-400 font-bold italic">No payment history available</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                            <p className="text-slate-400 font-bold animate-pulse">Synchronizing Records...</p>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Fleet Management Modal */}
            <AnimatePresence>
                {showFleetModal && (
                    <CompanyFleetManage
                        company={company}
                        onClose={() => setShowFleetModal(false)}
                    />
                )}
            </AnimatePresence>

            {/* Payment Recording Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setShowPaymentModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-black text-slate-900">Record Offline Payment</h3>
                            <p className="text-sm text-slate-500">Log a payment received from {company.company_name}.</p>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-slate-500">Amount Received (₹)</label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    placeholder="e.g. 50000"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-slate-500">Payment Mode</label>
                                <select
                                    value={paymentMode}
                                    onChange={(e) => setPaymentMode(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="CHEQUE">Cheque</option>
                                    <option value="UPI">UPI</option>
                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-slate-500">Reference No. (Optional)</label>
                                <input
                                    type="text"
                                    value={paymentReference}
                                    onChange={(e) => setPaymentReference(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    placeholder="Cheque No, UPI Ref, etc."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-slate-500">Notes (Optional)</label>
                                <textarea
                                    value={paymentNote}
                                    onChange={(e) => setPaymentNote(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[60px]"
                                    placeholder="Any additional notes..."
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                                    disabled={paymentLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRecordPayment}
                                    disabled={paymentLoading}
                                    className="flex-[2] py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                                >
                                    {paymentLoading ? 'Recording...' : 'Record Payment'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Company Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="text-xl font-black text-slate-900">Edit Company Details</h3>
                            </div>
                            <form onSubmit={handleEditCompany} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-500">Company Name</label>
                                        <input required type="text" value={editForm.company_name} onChange={e => setEditForm({ ...editForm, company_name: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-500">GST Number</label>
                                        <input type="text" value={editForm.gst_number} onChange={e => setEditForm({ ...editForm, gst_number: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-500">Email</label>
                                        <input required type="email" value={editForm.company_email} onChange={e => setEditForm({ ...editForm, company_email: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-500">Phone</label>
                                        <input required type="text" value={editForm.company_phone} onChange={e => setEditForm({ ...editForm, company_phone: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-indigo-500" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-500">Address</label>
                                    <input type="text" value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-500">City</label>
                                        <input type="text" value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-500">State</label>
                                        <input type="text" value={editForm.state} onChange={e => setEditForm({ ...editForm, state: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-500">Pincode</label>
                                        <input type="text" value={editForm.pincode} onChange={e => setEditForm({ ...editForm, pincode: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                                    <button type="submit" disabled={isEditing} className="flex-[2] py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50">
                                        {isEditing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}

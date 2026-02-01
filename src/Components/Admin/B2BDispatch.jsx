import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    fetchB2BBookings,
    upsertB2BTaxiAssignment,
    markB2BBillPaid,
    updateB2BBookingStatus,
    completeB2BTrip,
    cancelB2BBooking
} from "../../services/adminService";

const getStatusColor = (status) => {
    switch (status) {
        case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'CANCELLED': return 'bg-rose-100 text-rose-700 border-rose-200';
        case 'PAID': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
        case 'IN_PROGRESS': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'READY': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
};

export default function B2BDispatch() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [activeTab, setActiveTab] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("all");

    // Modal states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentForm, setPaymentForm] = useState({ mode: "Cash", remarks: "" });
    const [saving, setSaving] = useState(false);

    // Assignment form
    const [assignForm, setAssignForm] = useState({
        driverName: "",
        driverNumber: "",
        cabNumber: "",
        cabName: ""
    });

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        setLoading(true);
        const result = await fetchB2BBookings();
        if (result.success) {
            setBookings(result.data?.bookings || []);
        }
        setLoading(false);
    };

    // Generate month options
    const monthOptions = useMemo(() => {
        const months = new Set();
        bookings.forEach(b => {
            const date = new Date(b.scheduled_at || b.created_at);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months.add(key);
        });
        return Array.from(months).sort().reverse();
    }, [bookings]);

    const formatMonthLabel = (monthKey) => {
        if (!monthKey) return "";
        const [year, month] = monthKey.split("-");
        const date = new Date(year, parseInt(month) - 1);
        return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    };

    // Filter bookings
    const filteredBookings = useMemo(() => {
        let list = bookings;

        // Filter by tab
        if (activeTab === "READY") {
            list = list.filter(t => t.status !== "COMPLETED" && t.status !== "CANCELLED" && (!t.taxi_assign_status || t.taxi_assign_status === "NOT_ASSIGNED"));
        } else if (activeTab === "ASSIGNED") {
            list = list.filter(t => t.taxi_assign_status === "ASSIGNED" && t.status !== "COMPLETED");
        } else if (activeTab === "PAID") {
            list = list.filter(t => t.status === "PAID" || t.status === "COMPLETED");
        }

        // Filter by month
        if (selectedMonth !== "all") {
            list = list.filter(b => {
                const date = new Date(b.scheduled_at || b.created_at);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                return key === selectedMonth;
            });
        }

        // Filter by search
        if (searchQuery.trim()) {
            const lower = searchQuery.toLowerCase();
            list = list.filter(b =>
                b.id.toString().includes(lower) ||
                b.company?.company_name?.toLowerCase().includes(lower) ||
                b.pickup_location?.toLowerCase().includes(lower) ||
                b.drop_location?.toLowerCase().includes(lower)
            );
        }

        return list;
    }, [bookings, activeTab, selectedMonth, searchQuery]);

    // Billing summary
    const billingSummary = useMemo(() => {
        let totalBilled = 0, totalPaid = 0;
        filteredBookings.forEach(b => {
            const amount = parseFloat(b.total_amount) || 0;
            totalBilled += amount;
            if (b.status === 'PAID' || b.status === 'COMPLETED') {
                totalPaid += amount;
            }
        });
        return { totalBilled: Math.round(totalBilled), totalPaid: Math.round(totalPaid), amountDue: Math.round(totalBilled - totalPaid) };
    }, [filteredBookings]);

    // Modal for assignment
    const [showAssignModal, setShowAssignModal] = useState(false);

    const handleSelectBooking = (booking) => {
        setSelectedBooking(booking);
        setAssignForm({
            driverName: booking.assignments?.[0]?.driver_name || "",
            driverNumber: booking.assignments?.[0]?.driver_number || "",
            cabNumber: booking.assignments?.[0]?.cab_number || "",
            cabName: booking.assignments?.[0]?.cab_name || booking.car_model || ""
        });
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBooking) return;
        setSaving(true);
        const result = await upsertB2BTaxiAssignment(selectedBooking.id, { ...assignForm, markAssigned: true });
        setSaving(false);
        if (result.success) {
            setShowAssignModal(false);
            loadBookings();
        } else {
            alert(result.message || "Failed to assign taxi");
        }
    };

    const handleStartTrip = async () => {
        if (!selectedBooking || !window.confirm("Start this trip?")) return;
        setSaving(true);
        const result = await updateB2BBookingStatus(selectedBooking.id, "IN_PROGRESS");
        setSaving(false);
        if (result.success) loadBookings();
    };

    const handleCompleteTrip = async () => {
        if (!selectedBooking) return;
        const actual_km = prompt("Enter actual KM run:", selectedBooking.distance_km);
        if (actual_km === null) return;

        setSaving(true);
        const result = await completeB2BTrip(selectedBooking.id, { actual_km: parseFloat(actual_km) });
        setSaving(false);
        if (result.success) loadBookings();
    };

    const handleCancelBooking = async () => {
        if (!selectedBooking) return;
        const reason = prompt("Reason for cancellation:");
        if (!reason) return;

        setSaving(true);
        const result = await cancelB2BBooking(selectedBooking.id, reason);
        setSaving(false);
        if (result.success) loadBookings();
    };

    const handleMarkPaid = async (paymentData) => {
        if (!selectedBooking) return;
        setSaving(true);
        const result = await markB2BBillPaid(selectedBooking.id, paymentData);
        setSaving(false);
        if (result.success) {
            setShowPaymentModal(false);
            loadBookings();
        }
    };

    return (
        <div className="relative space-y-6">
            {/* Top Right Floating Info (Small letters) */}
            <AnimatePresence>
                {selectedBooking && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: 20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: -20, x: 20 }}
                        className="fixed top-24 right-8 z-[60] w-72 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl p-4 space-y-3 pointer-events-auto"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Active Focus: #{selectedBooking.id}</span>
                            <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <div className="text-[10px] space-y-1.5 text-slate-500 font-bold uppercase leading-tight">
                            <p className="text-slate-900 line-clamp-1">🏢 {selectedBooking.company?.company_name}</p>
                            <p>👤 {selectedBooking.passenger_details?.name} ({selectedBooking.passenger_details?.phone})</p>
                            <p className="line-clamp-1">📍 {selectedBooking.pickup_location?.split(',')[0]} → {selectedBooking.drop_location?.split(',')[0]}</p>
                            <div className="pt-1 flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded border ${getStatusColor(selectedBooking.status)}`}>{selectedBooking.status}</span>
                                <span className="text-slate-900 text-xs">₹{selectedBooking.total_amount}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            {selectedBooking.status === "CONFIRMED" && (
                                <button onClick={() => setShowAssignModal(true)} className="col-span-2 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
                                    {selectedBooking.taxi_assign_status === "ASSIGNED" ? "Update Driver" : "Assign Driver"}
                                </button>
                            )}
                            {selectedBooking.taxi_assign_status === "ASSIGNED" && selectedBooking.status === "CONFIRMED" && (
                                <button onClick={handleStartTrip} disabled={saving} className="py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-emerald-700 transition-all">Start Trip</button>
                            )}
                            {selectedBooking.status === "IN_PROGRESS" && (
                                <button onClick={handleCompleteTrip} disabled={saving} className="col-span-2 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-blue-700 transition-all">Complete Trip</button>
                            )}
                            <button onClick={handleCancelBooking} className="py-2 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-rose-50 hover:text-rose-600 transition-all">Cancel</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header and Summary (Compact) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-[10px] uppercase text-slate-400 font-black tracking-widest">Active B2B</p>
                    <p className="text-2xl font-black text-slate-900">{filteredBookings.length}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-[10px] uppercase text-slate-400 font-black tracking-widest">Revenue</p>
                    <p className="text-2xl font-black text-slate-900">₹{billingSummary.totalBilled.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 shadow-sm">
                    <p className="text-[10px] uppercase text-emerald-600 font-black tracking-widest">Paid</p>
                    <p className="text-2xl font-black text-emerald-700">₹{billingSummary.totalPaid.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 shadow-sm text-right">
                    <p className="text-[10px] uppercase text-rose-600 font-black tracking-widest">Outstanding</p>
                    <p className="text-2xl font-black text-rose-700">₹{billingSummary.amountDue.toLocaleString('en-IN')}</p>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {[{ id: "ALL", label: "All" }, { id: "READY", label: "Ready" }, { id: "ASSIGNED", label: "Assigned" }, { id: "COMPLETED", label: "Completed" }].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                    <option value="all">All Time</option>
                    {monthOptions.map(m => <option key={m} value={m}>{formatMonthLabel(m)}</option>)}
                </select>
                <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Search ID, Company, or Route..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                </div>
            </div>

            {/* List View (Full Width) */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-500">
                    Dispatch Queue
                </div>
                <div className="divide-y divide-slate-100 overflow-y-auto max-h-[calc(100vh-350px)]">
                    {filteredBookings.length === 0 ? (
                        <div className="p-20 text-center">
                            <span className="text-4xl">🏢</span>
                            <h4 className="text-slate-400 mt-4 font-bold">No active B2B operations found</h4>
                        </div>
                    ) : (
                        filteredBookings.map(booking => (
                            <div
                                key={booking.id}
                                onClick={() => handleSelectBooking(booking)}
                                className={`p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 cursor-pointer transition-all hover:bg-slate-50 ${selectedBooking?.id === booking.id ? 'bg-indigo-50/50' : ''}`}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-xs ${selectedBooking?.id === booking.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        #{booking.id}
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate">
                                            {booking.company?.company_name || "Corporate Partner"}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <span className="text-indigo-500">🟢 {booking.pickup_location?.split(',')[0]}</span>
                                            <span>→</span>
                                            <span className="text-rose-500">🔴 {booking.drop_location?.split(',')[0]}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex grow items-center gap-8 lg:gap-16">
                                    <div className="hidden sm:block">
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-0.5">Passenger</p>
                                        <p className="text-xs font-bold text-slate-700">{booking.passenger_details?.name || "Employee"}</p>
                                    </div>
                                    <div className="hidden md:block">
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-0.5">Status</p>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter border ${getStatusColor(booking.status)}`}>
                                            {booking.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-0.5">Amount</p>
                                        <p className="text-sm font-black text-slate-900">₹{booking.total_amount}</p>
                                    </div>
                                    <div className="lg:w-8 flex justify-end">
                                        <span className="text-slate-300">→</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Multi-Purpose Modals */}
            <AnimatePresence>
                {/* Assignment Modal */}
                {showAssignModal && selectedBooking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
                        >
                            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight">Assign Dispatch 🚕</h3>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Booking #{selectedBooking.id} • {selectedBooking.company?.company_name}</p>
                                </div>
                                <button onClick={() => setShowAssignModal(false)} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all">✕</button>
                            </div>

                            <form onSubmit={handleAssignSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.1em]">Driver Name</label>
                                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" placeholder="Enter name" value={assignForm.driverName} onChange={e => setAssignForm({ ...assignForm, driverName: e.target.value })} required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.1em]">Driver Phone</label>
                                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" placeholder="Contact number" value={assignForm.driverNumber} onChange={e => setAssignForm({ ...assignForm, driverNumber: e.target.value })} required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.1em]">Vehicle Model</label>
                                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" placeholder="e.g. Innova" value={assignForm.cabName} onChange={e => setAssignForm({ ...assignForm, cabName: e.target.value })} required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.1em]">Vehicle Plate</label>
                                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" placeholder="Plate number" value={assignForm.cabNumber} onChange={e => setAssignForm({ ...assignForm, cabNumber: e.target.value })} required />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const text = `*UrbanCabz Corporate Confirmation* 🏢\nBooking ID: ${selectedBooking.id}\nCompany: ${selectedBooking.company?.company_name}\nPassenger: ${selectedBooking.passenger_details?.name || "Employee"}\n------------------\nVehicle: ${assignForm.cabName} (${assignForm.cabNumber})\nDriver: ${assignForm.driverName} (${assignForm.driverNumber})\n------------------\nPickup: ${new Date(selectedBooking.scheduled_at || selectedBooking.created_at).toLocaleString()}\nFrom: ${selectedBooking.pickup_location}\nTo: ${selectedBooking.drop_location}`;
                                            navigator.clipboard.writeText(text);
                                            alert("Template copied!");
                                        }}
                                        className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100"
                                    >
                                        📱 WhatsApp Msg
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
                                    >
                                        {saving ? "Processing..." : "Assign & Confirm"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Mark Paid Modal (Condensed) */}
                {showPaymentModal && selectedBooking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200"
                        >
                            <div className="p-4 bg-amber-500 text-white flex justify-between items-center">
                                <h3 className="text-sm font-black uppercase tracking-widest">Financial Resolution</h3>
                                <button onClick={() => setShowPaymentModal(false)}>✕</button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-slate-500">Method</label>
                                    <select value={paymentForm.mode} onChange={e => setPaymentForm({ ...paymentForm, mode: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold">
                                        <option value="Cash">Cash</option>
                                        <option value="Bank Transfer">NEFT/RTGS</option>
                                        <option value="UPI">UPI / Digital</option>
                                        <option value="Cheque">Corporate Cheque</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-slate-500">Transaction Notes</label>
                                    <textarea value={paymentForm.remarks} onChange={e => setPaymentForm({ ...paymentForm, remarks: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold min-h-[80px]" />
                                </div>
                                <button onClick={() => handleMarkPaid(paymentForm)} disabled={saving} className="w-full py-4 bg-amber-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-500/20">
                                    {saving ? "Saving..." : "Clear Outstanding"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

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
        <div className="p-6 space-y-8 bg-slate-50/30 min-h-screen relative">
            {/* Top Right Floating Detail (Compact) */}
            <AnimatePresence>
                {selectedBooking && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="fixed top-24 right-8 z-[60] w-80 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden"
                    >
                        <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                            <div>
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-0.5">Corporate Focus</span>
                                <h4 className="text-sm font-black tracking-tight">Booking #{selectedBooking.id}</h4>
                            </div>
                            <button onClick={() => setSelectedBooking(null)} className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold">✕</button>
                        </div>

                        <div className="p-5 space-y-5">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center text-lg shadow-sm">🏢</div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-slate-900 truncate leading-none mb-1">{selectedBooking.company?.company_name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">{selectedBooking.passenger_details?.name} ({selectedBooking.passenger_details?.phone})</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-3">
                                    <div className="flex items-start gap-2.5">
                                        <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-emerald-500 ring-4 ring-emerald-100"></div>
                                        <p className="text-[10px] font-black text-slate-700 leading-snug line-clamp-2">{selectedBooking.pickup_location}</p>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-rose-500 ring-4 ring-rose-100"></div>
                                        <p className="text-[10px] font-black text-slate-700 leading-snug line-clamp-2">{selectedBooking.drop_location}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-1">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Financial</span>
                                    <div className="text-[10px] font-black text-slate-900">₹{selectedBooking.total_amount}</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span>
                                    <div className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusColor(selectedBooking.status)}`}>
                                        {selectedBooking.status}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                                {selectedBooking.status === "CONFIRMED" && (
                                    <button onClick={() => setShowAssignModal(true)} className="col-span-2 py-3.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                                        {selectedBooking.taxi_assign_status === "ASSIGNED" ? "Update Driver 🚕" : "Dispatch Driver 🚕"}
                                    </button>
                                )}
                                {selectedBooking.taxi_assign_status === "ASSIGNED" && selectedBooking.status === "CONFIRMED" && (
                                    <button onClick={handleStartTrip} disabled={saving} className="col-span-2 py-3.5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
                                        Start Expedition
                                    </button>
                                )}
                                {selectedBooking.status === "IN_PROGRESS" && (
                                    <button onClick={handleCompleteTrip} disabled={saving} className="col-span-2 py-3.5 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                                        Complete Entry
                                    </button>
                                )}
                                <button onClick={handleCancelBooking} className="py-3 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all">Cancel</button>
                                <button onClick={() => setSelectedBooking(null)} className="py-3 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Minimize</button>

                                {/* Quick WhatsApp Actions (Post-Assignment) */}
                                {selectedBooking.assignments?.[0] && (
                                    <div className="col-span-2 grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-slate-100">
                                        <button
                                            onClick={() => {
                                                const phone = (selectedBooking.passenger_details?.phone || "").replace(/\D/g, "");
                                                const taxi = selectedBooking.assignments[0];
                                                const msg = encodeURIComponent(
                                                    `🏢 *UrbanCabz Corporate Booking*\n\n` +
                                                    `Booking ID: #${selectedBooking.id}\n` +
                                                    `Company: ${selectedBooking.company?.company_name}\n` +
                                                    `---------------------\n` +
                                                    `🚘 Vehicle: ${taxi.cab_name} (${taxi.cab_number})\n` +
                                                    `👤 Driver: ${taxi.driver_name}\n` +
                                                    `📞 Driver Contact: ${taxi.driver_number}\n` +
                                                    `---------------------\n` +
                                                    `📍 Pickup: ${selectedBooking.pickup_location}\n` +
                                                    `🏁 Drop: ${selectedBooking.drop_location}\n` +
                                                    `📅 Pickup Time: ${new Date(selectedBooking.scheduled_at || selectedBooking.created_at).toLocaleString()}\n\n` +
                                                    `Thank you for choosing UrbanCabz! 🙏`
                                                );
                                                window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank");
                                            }}
                                            className="py-2.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-1.5"
                                        >
                                            <span>📱</span> Client WA
                                        </button>
                                        <button
                                            onClick={() => {
                                                const taxi = selectedBooking.assignments[0];
                                                const phone = (taxi.driver_number || "").replace(/\D/g, "");
                                                const msg = encodeURIComponent(
                                                    `🏢 *UrbanCabz Corporate Pickup*\n\n` +
                                                    `Booking ID: #${selectedBooking.id}\n` +
                                                    `Company: ${selectedBooking.company?.company_name}\n` +
                                                    `---------------------\n` +
                                                    `👤 Passenger: ${selectedBooking.passenger_details?.name || "Employee"}\n` +
                                                    `📞 Passenger Contact: ${selectedBooking.passenger_details?.phone}\n` +
                                                    `---------------------\n` +
                                                    `📍 Pickup: ${selectedBooking.pickup_location}\n` +
                                                    `🏁 Drop: ${selectedBooking.drop_location}\n` +
                                                    `📅 Pickup Time: ${new Date(selectedBooking.scheduled_at || selectedBooking.created_at).toLocaleString()}\n` +
                                                    `📏 Distance: ${selectedBooking.distance_km} km\n\n` +
                                                    `Please reach the pickup location on time. 🙏`
                                                );
                                                window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank");
                                            }}
                                            className="py-2.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-1.5"
                                        >
                                            <span>📱</span> Driver WA
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header & Stats Summary */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Corporate Dispatch</h2>
                    <p className="text-slate-500 font-medium">Manage enterprise bookings and fleet allocation</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full md:w-auto">
                    {[
                        { label: 'Revenue', value: `₹${billingSummary.totalBilled.toLocaleString('en-IN')}`, color: 'indigo', icon: '💰' },
                        { label: 'Paid', value: `₹${billingSummary.totalPaid.toLocaleString('en-IN')}`, color: 'emerald', icon: '✅' },
                        { label: 'Queue', value: filteredBookings.length, color: 'blue', icon: '📋' },
                        { label: 'Due', value: `₹${billingSummary.amountDue.toLocaleString('en-IN')}`, color: 'rose', icon: '⚠️' }
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm min-w-[140px]"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-lg">{stat.icon}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                            </div>
                            <div className={`text-xl font-black text-slate-900 tracking-tight leading-none`}>
                                {stat.value}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Live Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {[{ id: "ALL", label: "All" }, { id: "READY", label: "Ready" }, { id: "ASSIGNED", label: "Assigned" }, { id: "PAID", label: "Settled" }].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 relative group w-full">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search ID, Company, or Route..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                </div>

                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-700 outline-none focus:border-indigo-500 transition-all w-full md:w-auto"
                >
                    <option value="all">📅 Full History</option>
                    {monthOptions.map(m => <option key={m} value={m}>{formatMonthLabel(m)}</option>)}
                </select>
            </div>

            {/* Dispatch List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Dispatch Queue</h3>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Live Queue</span>
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredBookings.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl py-20 text-center">
                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🏢</div>
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No entries matching criteria</p>
                        </div>
                    ) : (
                        filteredBookings.map((booking, idx) => (
                            <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`group relative bg-white border rounded-2xl p-5 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer ${selectedBooking?.id === booking.id ? 'border-indigo-500 ring-4 ring-indigo-50 shadow-lg' : 'border-slate-200 shadow-sm'}`}
                                onClick={() => handleSelectBooking(booking)}
                            >
                                <div className="flex flex-wrap items-center gap-6">
                                    <div className="w-24">
                                        <span className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">#{booking.id}</span>
                                        <div className="text-xs font-black text-slate-900 truncate">
                                            {booking.company?.company_name || booking.b2b_company?.name || "Corporate"}
                                        </div>
                                    </div>

                                    <div className="w-32">
                                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Departure</span>
                                        <div className="text-xs font-bold text-slate-700">
                                            {new Date(booking.scheduled_at || booking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-bold font-mono">
                                            {new Date(booking.scheduled_at || booking.created_at).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-[240px]">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100"></div>
                                                <div className="w-px h-4 bg-slate-200"></div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 ring-2 ring-rose-100"></div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[11px] font-bold text-slate-700 truncate leading-none mb-2">{booking.pickup_location}</p>
                                                <p className="text-[11px] font-bold text-slate-700 truncate leading-none">{booking.drop_location}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-44 text-right">
                                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fare Breakdown</span>
                                        <div className="text-sm font-black text-slate-900">₹{booking.total_amount}</div>
                                        {booking.payment_status === 'PAID' ?
                                            <span className="text-[9px] font-black text-emerald-600 uppercase">Settled</span> :
                                            <span className="text-[9px] font-black text-amber-600 uppercase">Pending Billed</span>
                                        }
                                    </div>

                                    <div className="flex items-center gap-4 ml-auto lg:ml-0">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border-2 shadow-sm ${getStatusColor(booking.status)}`}>
                                            {booking.status === "CONFIRMED" ? "● Ready" : booking.status}
                                        </span>
                                        <button
                                            className={`h-10 w-10 flex items-center justify-center rounded-2xl border-2 transition-all ${selectedBooking?.id === booking.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-300 border-slate-100 hover:border-indigo-200 hover:text-indigo-500'}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelectBooking(booking);
                                            }}
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showAssignModal && selectedBooking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
                        >
                            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight">Assign Dispatch 🚕</h3>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Booking #{selectedBooking.id} • {selectedBooking.company?.company_name}</p>
                                </div>
                                <button onClick={() => setShowAssignModal(false)} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold">✕</button>
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

                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const phone = (selectedBooking.passenger_details?.phone || "").replace(/\D/g, "");
                                            const msg = encodeURIComponent(
                                                `🏢 *UrbanCabz Corporate Booking*\n\n` +
                                                `Booking ID: #${selectedBooking.id}\n` +
                                                `Company: ${selectedBooking.company?.company_name}\n` +
                                                `---------------------\n` +
                                                `🚘 Vehicle: ${assignForm.cabName} (${assignForm.cabNumber})\n` +
                                                `👤 Driver: ${assignForm.driverName}\n` +
                                                `📞 Driver Contact: ${assignForm.driverNumber}\n` +
                                                `---------------------\n` +
                                                `📍 Pickup: ${selectedBooking.pickup_location}\n` +
                                                `🏁 Drop: ${selectedBooking.drop_location}\n` +
                                                `📅 Pickup Time: ${new Date(selectedBooking.scheduled_at || selectedBooking.created_at).toLocaleString()}\n\n` +
                                                `Thank you for choosing UrbanCabz! 🙏`
                                            );
                                            window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank");
                                        }}
                                        className="py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 flex items-center justify-center gap-2"
                                    >
                                        <span>📱</span> WhatsApp to Client
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const phone = (assignForm.driverNumber || "").replace(/\D/g, "");
                                            const msg = encodeURIComponent(
                                                `🏢 *UrbanCabz Corporate Pickup*\n\n` +
                                                `Booking ID: #${selectedBooking.id}\n` +
                                                `Company: ${selectedBooking.company?.company_name}\n` +
                                                `---------------------\n` +
                                                `👤 Passenger: ${selectedBooking.passenger_details?.name || "Employee"}\n` +
                                                `📞 Passenger Contact: ${selectedBooking.passenger_details?.phone}\n` +
                                                `---------------------\n` +
                                                `📍 Pickup: ${selectedBooking.pickup_location}\n` +
                                                `🏁 Drop: ${selectedBooking.drop_location}\n` +
                                                `📅 Pickup Time: ${new Date(selectedBooking.scheduled_at || selectedBooking.created_at).toLocaleString()}\n` +
                                                `📏 Distance: ${selectedBooking.distance_km} km\n\n` +
                                                `Please reach the pickup location on time. 🙏`
                                            );
                                            window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank");
                                        }}
                                        className="py-3 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 flex items-center justify-center gap-2"
                                    >
                                        <span>📱</span> WhatsApp to Driver
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="col-span-2 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
                                    >
                                        {saving ? "Processing..." : "Assign & Confirm"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showPaymentModal && selectedBooking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
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

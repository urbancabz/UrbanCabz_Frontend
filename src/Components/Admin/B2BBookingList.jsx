import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function B2BBookingList({
    bookings = [],
    onSelect,
    selectedId
}) {
    const [activeTab, setActiveTab] = useState("READY");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredBookings = useMemo(() => {
        let list = bookings;

        // 1. Filter by Tab
        if (activeTab === "READY") {
            // Ready = Confirmed but not assigned yet
            list = list.filter(t =>
                t.status === "CONFIRMED" &&
                (!t.taxi_assign_status || t.taxi_assign_status === "NOT_ASSIGNED")
            );
        } else if (activeTab === "TRIP_START") {
            // Trip Start = Driver assigned or In Progress, not finished
            list = list.filter(t =>
                (t.taxi_assign_status === "ASSIGNED" || t.status === "IN_PROGRESS") &&
                t.status !== "COMPLETED" &&
                t.status !== "CANCELLED"
            );
        }

        // 2. Filter by Search
        if (searchQuery.trim()) {
            const lower = searchQuery.toLowerCase();
            list = list.filter(
                (b) =>
                    b.id.toString().includes(lower) ||
                    b.company?.company_name?.toLowerCase().includes(lower) ||
                    b.passenger_details?.name?.toLowerCase().includes(lower) ||
                    b.pickup_location?.toLowerCase().includes(lower) ||
                    b.drop_location?.toLowerCase().includes(lower)
            );
        }

        return list;
    }, [bookings, activeTab, searchQuery]);

    const tabs = [
        { id: "READY", label: "Ready", icon: "🟢" },
        { id: "TRIP_START", label: "Trip Start", icon: "🚕" },
    ];

    return (
        <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Search & Filter Header */}
            <div className="p-5 border-b border-slate-200 space-y-5 bg-slate-50/50">
                <div className="relative group">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search Company, ID, or Route..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                    />
                </div>

                <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === tab.id
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 font-bold"
                                }`}
                        >
                            <span className="text-xs">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {filteredBookings.map((booking) => (
                        <B2BBookingListItem
                            key={booking.id}
                            booking={booking}
                            isSelected={selectedId === booking.id}
                            onClick={() => onSelect(booking)}
                        />
                    ))}
                    {filteredBookings.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-20 text-slate-400"
                        >
                            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-2xl">🏢</div>
                            <p className="text-sm font-black uppercase tracking-widest opacity-40">No Corporate entries</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function B2BBookingListItem({ booking, isSelected, onClick }) {
    return (
        <motion.button
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={onClick}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 group ${isSelected
                ? "bg-slate-900 border-slate-800 shadow-lg transform scale-[1.02]"
                : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50 shadow-sm"
                }`}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest border shadow-sm ${isSelected ? "bg-indigo-600 text-white border-indigo-400" : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}>
                        #{booking.id}
                    </span>
                    <div className="min-w-0">
                        <p className={`text-xs font-black transition-colors truncate max-w-[150px] ${isSelected ? "text-white" : "text-slate-900 group-hover:text-indigo-600"}`}>
                            {booking.company?.company_name || "Corporate Partner"}
                        </p>
                        <p className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? "text-slate-400" : "text-slate-400"}`}>
                            {booking.passenger_details?.name || "Employee"}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <span className={`text-[10px] font-black uppercase tracking-tighter block ${isSelected ? "text-slate-400" : "text-slate-400"}`}>
                        {new Date(booking.scheduled_at || booking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`text-[9px] font-bold uppercase ${isSelected ? "text-slate-500" : "text-slate-400"}`}>
                        {new Date(booking.scheduled_at || booking.created_at).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                    </span>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className={`flex items-center gap-2 text-[11px] font-bold ${isSelected ? "text-slate-300" : "text-slate-600"}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
                    <span className="truncate flex-1">{booking.pickup_location}</span>
                </div>
                <div className={`flex items-center gap-2 text-[11px] font-bold ${isSelected ? "text-slate-300" : "text-slate-600"}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20"></div>
                    <span className="truncate flex-1">{booking.drop_location}</span>
                </div>
            </div>

            <div className={`flex items-center justify-between pt-3 border-t ${isSelected ? "border-slate-800" : "border-slate-100"}`}>
                <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${booking.payment_status === 'PAID'
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}>
                        ₹{booking.total_amount}
                    </span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-tighter ${isSelected ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                        🚕 {booking.car_model || "Fleet"}
                    </span>
                </div>

                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-sm border ${booking.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        booking.status === "CANCELLED" ? "bg-rose-50 text-rose-600 border-rose-100" :
                            booking.status === "IN_PROGRESS" ? "bg-purple-50 text-purple-600 border-purple-100" :
                                booking.taxi_assign_status === "ASSIGNED" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                    "bg-amber-50 text-amber-600 border-amber-100"
                    }`}>
                    {booking.status === "IN_PROGRESS" ? "ON TRIP" :
                        booking.taxi_assign_status === "ASSIGNED" ? "READY" :
                            booking.status}
                </span>
            </div>
        </motion.button>
    );
}

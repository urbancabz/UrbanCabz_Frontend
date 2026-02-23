import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function B2BBookingList({
    bookings = [],
    onSelect,
    selectedId,
    onRefresh,
    loading = false
}) {
    const [activeTab, setActiveTab] = useState("READY");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredBookings = useMemo(() => {
        let list = bookings;

        if (activeTab === "READY") {
            list = list.filter(b =>
                b.status !== "COMPLETED" &&
                b.status !== "CANCELLED" &&
                (!b.taxi_assign_status || b.taxi_assign_status === "NOT_ASSIGNED")
            );
        } else if (activeTab === "IN_TRIP") {
            list = list.filter(b =>
                b.status !== "COMPLETED" &&
                b.status !== "CANCELLED" &&
                b.taxi_assign_status === "ASSIGNED"
            );
        }

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
        { id: "READY", label: "Ready to Dispatch", icon: "🟢", count: bookings.filter(b => b.status !== "COMPLETED" && b.status !== "CANCELLED" && (!b.taxi_assign_status || b.taxi_assign_status === "NOT_ASSIGNED")).length },
        { id: "IN_TRIP", label: "Active Trips", icon: "🚕", count: bookings.filter(b => b.status !== "COMPLETED" && b.status !== "CANCELLED" && b.taxi_assign_status === "ASSIGNED").length },
    ];

    return (
        <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
            {/* Header */}
            <div className="p-5 bg-white border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Corporate Dispatch</h2>
                        <p className="text-sm font-medium text-slate-500">B2B Partner Operations</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onRefresh}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 font-bold rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                            title="Refresh B2B Bookings"
                        >
                            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                        <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
                            <div className="h-2.5 w-2.5 rounded-full bg-purple-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">B2B</span>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative group mb-4">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search company, passenger, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === tab.id
                                ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            <span className="text-sm">{tab.label}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    <AnimatePresence initial={false}>
                        {filteredBookings.map((booking) => (
                            <B2BBookingCard
                                key={booking.id}
                                booking={booking}
                                isSelected={selectedId === booking.id}
                                onClick={() => onSelect(booking)}
                            />
                        ))}
                    </AnimatePresence>
                </div>
                {filteredBookings.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-3xl">🏢</div>
                        <p className="text-base font-bold text-slate-400">No corporate bookings</p>
                        <p className="text-sm text-slate-400 mt-1">Waiting for partner requests...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function B2BBookingCard({ booking, isSelected, onClick }) {
    const isAssigned = booking.taxi_assign_status === "ASSIGNED";

    return (
        <motion.button
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={onClick}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${isSelected
                ? "bg-purple-50 border-purple-500 shadow-lg shadow-purple-100 ring-2 ring-purple-500"
                : "bg-white border-slate-200 hover:border-purple-300 hover:shadow-md"
                }`}
        >
            {/* Header Row */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2.5">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg ${isSelected ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-600"}`}>
                        🏢
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 leading-tight">
                            {booking.company?.company_name || "Corporate Partner"}
                        </p>
                        <p className="text-xs text-slate-500">
                            👤 {booking.passenger_details?.name || "Employee"}
                        </p>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${isSelected ? "bg-purple-600 text-white" : "bg-slate-100 text-purple-600"}`}>
                    #{booking.id}
                </span>
            </div>

            {/* Route */}
            <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-100">
                <div className="flex items-start gap-2 mb-2">
                    <div className="mt-1 w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
                    <p className="text-xs font-semibold text-slate-700 line-clamp-1">{booking.pickup_location}</p>
                </div>
                <div className="flex items-start gap-2">
                    <div className="mt-1 w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0"></div>
                    <p className="text-xs font-semibold text-slate-700 line-clamp-1">{booking.drop_location}</p>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-900">₹{booking.total_amount || 0}</span>
                    <span className="text-xs font-semibold text-slate-400">{booking.distance_km} km</span>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${isAssigned
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}>
                    {isAssigned ? "Active" : "Pending"}
                </span>
            </div>
        </motion.button>
    );
}

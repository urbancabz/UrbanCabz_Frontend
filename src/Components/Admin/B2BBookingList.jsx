import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function B2BBookingList({
    bookings = [],
    onSelect,
    selectedId
}) {
    const [activeTab, setActiveTab] = useState("ALL");
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
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/60 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/60">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Corporate Dispatch</h2>
                        <p className="text-sm font-medium text-slate-400 mt-1">B2B Partner Operations</p>
                    </div>
                    <div className="flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-xl border border-purple-500/30">
                        <div className="h-3 w-3 rounded-full bg-purple-400 animate-pulse"></div>
                        <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">Enterprise</span>
                    </div>
                </div>

                {/* Search */}
                <div className="relative group mb-5">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search company, passenger, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-base font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-4 px-5 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 ${activeTab === tab.id
                                ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-[1.02]"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
                                }`}
                        >
                            <span className="text-xl">{tab.icon}</span>
                            <span className="text-sm">{tab.label}</span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-black ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-700 text-slate-400"}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {filteredBookings.map((booking) => (
                        <B2BBookingCard
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
                            className="flex flex-col items-center justify-center py-20 text-slate-500"
                        >
                            <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center mb-5 text-4xl border border-slate-700">🏢</div>
                            <p className="text-lg font-bold text-slate-400">No corporate bookings</p>
                            <p className="text-sm text-slate-500 mt-1">Waiting for partner requests...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
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
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 group ${isSelected
                ? "bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500 shadow-xl shadow-purple-500/30 transform scale-[1.02]"
                : "bg-slate-800/80 border-slate-700 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-900/20 hover:scale-[1.01]"
                }`}
        >
            {/* Header Row */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl ${isSelected ? "bg-white/20" : "bg-slate-700"}`}>
                        🏢
                    </div>
                    <div>
                        <p className={`text-lg font-bold ${isSelected ? "text-white" : "text-white"}`}>
                            {booking.company?.company_name || "Corporate Partner"}
                        </p>
                        <p className={`text-sm ${isSelected ? "text-purple-200" : "text-slate-400"}`}>
                            👤 {booking.passenger_details?.name || "Employee"} • {booking.passenger_details?.phone}
                        </p>
                    </div>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${isSelected ? "bg-white/20 text-white" : "bg-slate-700 text-purple-300 border border-slate-600"}`}>
                    #{booking.id}
                </div>
            </div>

            {/* Route */}
            <div className={`rounded-xl p-4 mb-4 ${isSelected ? "bg-white/10" : "bg-slate-900/50"}`}>
                <div className="flex items-start gap-3 mb-3">
                    <div className="mt-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
                    <p className={`text-sm font-semibold leading-snug ${isSelected ? "text-white" : "text-slate-300"}`}>
                        {booking.pickup_location}
                    </p>
                </div>
                <div className="flex items-start gap-3">
                    <div className="mt-1.5 w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-500/20"></div>
                    <p className={`text-sm font-semibold leading-snug ${isSelected ? "text-white" : "text-slate-300"}`}>
                        {booking.drop_location}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className={`text-xl font-black ${isSelected ? "text-white" : "text-white"}`}>
                        ₹{booking.total_amount || 0}
                    </span>
                    <span className={`text-sm ${isSelected ? "text-purple-200" : "text-slate-500"}`}>
                        {booking.distance_km} km
                    </span>
                </div>
                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${isAssigned
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}>
                    {isAssigned ? "🚕 Active" : "⏳ Pending"}
                </span>
            </div>
        </motion.button>
    );
}

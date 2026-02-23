import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingList({
    tickets = [],
    onSelect,
    selectedId,
    onRefresh,
    loading = false
}) {
    const [activeTab, setActiveTab] = useState("READY");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredTickets = useMemo(() => {
        let list = tickets;

        if (activeTab === "READY") {
            list = list.filter(t =>
                t.status !== "COMPLETED" &&
                t.status !== "CANCELLED" &&
                (!t.taxi_assign_status || t.taxi_assign_status === "NOT_ASSIGNED")
            );
        } else if (activeTab === "IN_TRIP") {
            list = list.filter(t =>
                t.status !== "COMPLETED" &&
                t.status !== "CANCELLED" &&
                t.taxi_assign_status === "ASSIGNED"
            );
        }

        if (searchQuery.trim()) {
            const lower = searchQuery.toLowerCase();
            list = list.filter(
                (b) =>
                    b.id.toString().includes(lower) ||
                    b.user?.name?.toLowerCase().includes(lower) ||
                    b.user?.email?.toLowerCase().includes(lower) ||
                    b.pickup_location?.toLowerCase().includes(lower) ||
                    b.drop_location?.toLowerCase().includes(lower)
            );
        }

        return list;
    }, [tickets, activeTab, searchQuery]);

    const tabs = [
        { id: "READY", label: "Ready to Dispatch", icon: "🟢", count: tickets.filter(t => t.status !== "COMPLETED" && t.status !== "CANCELLED" && (!t.taxi_assign_status || t.taxi_assign_status === "NOT_ASSIGNED")).length },
        { id: "IN_TRIP", label: "Active Trips", icon: "🚕", count: tickets.filter(t => t.status !== "COMPLETED" && t.status !== "CANCELLED" && t.taxi_assign_status === "ASSIGNED").length },
    ];

    return (
        <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
            {/* Header */}
            <div className="p-5 bg-white border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Live Dispatch</h2>
                        <p className="text-sm font-medium text-slate-500">Real-time booking management</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onRefresh}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 font-bold rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                            title="Refresh Bookings"
                        >
                            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Live</span>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative group mb-4">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by ID, customer, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === tab.id
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
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
                        {filteredTickets.map((ticket) => (
                            <BookingCard
                                key={ticket.id}
                                ticket={ticket}
                                isSelected={selectedId === ticket.id}
                                onClick={() => onSelect(ticket)}
                            />
                        ))}
                    </AnimatePresence>
                </div>
                {filteredTickets.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-3xl">🚕</div>
                        <p className="text-base font-bold text-slate-400">No bookings found</p>
                        <p className="text-sm text-slate-400 mt-1">Waiting for new requests...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function BookingCard({ ticket, isSelected, onClick }) {
    const getAmounts = (b) => {
        const total = b.total_amount || 0;
        const paid = (b.payments || []).reduce((sum, p) =>
            (p.status === 'SUCCESS' || p.status === 'PAID') ? sum + (p.amount || 0) : sum, 0
        );
        const due = Math.max(0, total - paid);
        return { total, paid, due };
    };

    const { total, paid, due } = getAmounts(ticket);
    const isAssigned = ticket.taxi_assign_status === "ASSIGNED";

    return (
        <motion.button
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={onClick}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${isSelected
                ? "bg-indigo-50 border-indigo-500 shadow-lg shadow-indigo-100 ring-2 ring-indigo-500"
                : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md"
                }`}
        >
            {/* Header Row */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2.5">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black ${isSelected ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-600"}`}>
                        #{ticket.id}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 leading-tight">
                            {ticket.user?.name || "Guest User"}
                        </p>
                        <p className="text-xs text-slate-500">
                            {ticket.user?.phone || "No phone"}
                        </p>
                    </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${isAssigned
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}>
                    {isAssigned ? "Ready" : "Pending"}
                </span>
            </div>

            {/* Route */}
            <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-100">
                <div className="flex items-start gap-2 mb-2">
                    <div className="mt-1 w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
                    <p className="text-xs font-semibold text-slate-700 line-clamp-1">{ticket.pickup_location}</p>
                </div>
                <div className="flex items-start gap-2">
                    <div className="mt-1 w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0"></div>
                    <p className="text-xs font-semibold text-slate-700 line-clamp-1">{ticket.drop_location}</p>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-900">₹{total}</span>
                    {due > 0 ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700">
                            ₹{due} DUE
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            PAID
                        </span>
                    )}
                </div>
                <span className="text-xs font-semibold text-slate-400">
                    {new Date(ticket.scheduled_at || ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </motion.button>
    );
}

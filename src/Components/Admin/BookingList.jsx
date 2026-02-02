import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingList({
    tickets = [],
    onSelect,
    selectedId
}) {
    const [activeTab, setActiveTab] = useState("ALL");
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
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
            {/* Header */}
            <div className="p-6 bg-white border-b border-slate-200/60">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Live Dispatch</h2>
                        <p className="text-sm font-medium text-slate-500 mt-1">Real-time booking management</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live</span>
                    </div>
                </div>

                {/* Search */}
                <div className="relative group mb-5">
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
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-base font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-4 px-5 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 ${activeTab === tab.id
                                ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-[1.02]"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            <span className="text-xl">{tab.icon}</span>
                            <span className="text-sm">{tab.label}</span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-black ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {filteredTickets.map((ticket) => (
                        <BookingCard
                            key={ticket.id}
                            ticket={ticket}
                            isSelected={selectedId === ticket.id}
                            onClick={() => onSelect(ticket)}
                        />
                    ))}
                    {filteredTickets.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-20 text-slate-400"
                        >
                            <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-5 text-4xl">🚕</div>
                            <p className="text-lg font-bold text-slate-400">No bookings found</p>
                            <p className="text-sm text-slate-400 mt-1">Waiting for new requests...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
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
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 group ${isSelected
                ? "bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-500 shadow-xl shadow-indigo-500/30 transform scale-[1.02]"
                : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100 hover:scale-[1.01]"
                }`}
        >
            {/* Header Row */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl font-black ${isSelected ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-600"}`}>
                        #{ticket.id}
                    </div>
                    <div>
                        <p className={`text-lg font-bold ${isSelected ? "text-white" : "text-slate-900"}`}>
                            {ticket.user?.name || "Guest User"}
                        </p>
                        <p className={`text-sm ${isSelected ? "text-indigo-200" : "text-slate-500"}`}>
                            {ticket.user?.phone || "No phone"}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className={`text-xs font-bold uppercase tracking-wider ${isSelected ? "text-indigo-200" : "text-slate-400"}`}>
                        {new Date(ticket.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                    </p>
                    <p className={`text-sm font-bold ${isSelected ? "text-white" : "text-slate-600"}`}>
                        {new Date(ticket.scheduled_at || ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>

            {/* Route */}
            <div className={`rounded-xl p-4 mb-4 ${isSelected ? "bg-white/10" : "bg-slate-50"}`}>
                <div className="flex items-start gap-3 mb-3">
                    <div className="mt-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
                    <p className={`text-sm font-semibold leading-snug ${isSelected ? "text-white" : "text-slate-700"}`}>
                        {ticket.pickup_location}
                    </p>
                </div>
                <div className="flex items-start gap-3">
                    <div className="mt-1.5 w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-500/20"></div>
                    <p className={`text-sm font-semibold leading-snug ${isSelected ? "text-white" : "text-slate-700"}`}>
                        {ticket.drop_location}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className={`text-xl font-black ${isSelected ? "text-white" : "text-slate-900"}`}>
                        ₹{total}
                    </span>
                    {due > 0 ? (
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            ₹{due} DUE
                        </span>
                    ) : (
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            PAID
                        </span>
                    )}
                </div>
                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${isAssigned
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}>
                    {isAssigned ? "🚕 Ready" : "⏳ Pending"}
                </span>
            </div>
        </motion.button>
    );
}

const stringToArray = (val) => val ? val.split(' ') : [];

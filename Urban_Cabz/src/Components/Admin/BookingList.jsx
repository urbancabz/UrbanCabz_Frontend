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

        // 1. Filter by Tab
        if (activeTab === "READY") {
            // Phase 1: Ready = Not Assigned yet, and not finished
            list = list.filter(t =>
                t.status !== "COMPLETED" &&
                t.status !== "CANCELLED" &&
                (!t.taxi_assign_status || t.taxi_assign_status === "NOT_ASSIGNED")
            );
        } else if (activeTab === "IN_TRIP") {
            // Phase 2: In Trip = Driver assigned, and not finished
            list = list.filter(t =>
                t.status !== "COMPLETED" &&
                t.status !== "CANCELLED" &&
                t.taxi_assign_status === "ASSIGNED"
            );
        }

        // 2. Filter by Search
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

    // Simplified 2-phase workflow: Ready → Trip Start
    const tabs = [
        { id: "READY", label: "Ready", icon: "🟢" },        // Phase 1: Waiting for driver
        { id: "IN_TRIP", label: "Trip Start", icon: "🚕" }, // Phase 2: Driver assigned, trip ongoing
    ];

    return (
        <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Search & Filter Header */}
            <div className="p-4 border-b border-slate-200 space-y-4 bg-slate-50">
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by ID, Name, Location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1 ${activeTab === tab.id
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-2">
                <AnimatePresence initial={false}>
                    {filteredTickets.map((ticket) => (
                        <BookingListItem
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
                            className="flex flex-col items-center justify-center py-12 text-slate-400"
                        >
                            <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-sm">No bookings found</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function BookingListItem({ ticket, isSelected, onClick }) {
    const getAmounts = (b) => {
        const total = b.total_amount || 0;
        const paid = (b.payments || []).reduce((sum, p) =>
            (p.status === 'SUCCESS' || p.status === 'PAID') ? sum + (p.amount || 0) : sum, 0
        );
        const due = Math.max(0, total - paid);
        return { total, paid, due };
    };

    const { total, paid, due } = getAmounts(ticket);

    return (
        <motion.button
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            onClick={onClick}
            className={`w-full text-left mb-2 p-3 rounded-lg border transition-all duration-200 group ${isSelected
                ? "bg-indigo-50 border-indigo-300 shadow-sm ring-2 ring-indigo-500/20"
                : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm"
                }`}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${isSelected ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                        #{ticket.id}
                    </span>
                    <span className="ml-2 text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                        {ticket.user?.name || ticket.user?.email || "Guest"}
                    </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(ticket.created_at).toLocaleDateString()}
                </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <span className="truncate max-w-[80px]" title={ticket.pickup_location}>{ticket.pickup_location.split(',')[0]}</span>
                        <span className="text-slate-300">→</span>
                        <span className="truncate max-w-[80px]" title={ticket.drop_location}>{ticket.drop_location.split(',')[0]}</span>
                    </div>
                    {ticket.car_model && (
                        <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold bg-indigo-50 w-fit px-1.5 py-0.5 rounded border border-indigo-100">
                            🚕 {ticket.car_model}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between text-[10px] border-t border-slate-100 pt-2 mt-1">
                <div className="flex gap-2">
                    {due > 0 ? (
                        <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Due: ₹{due}</span>
                    ) : (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Paid</span>
                    )}
                </div>

                {/* Status Badge */}
                {ticket.status === "COMPLETED" ? (
                    <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                        ✅ Completed
                    </span>
                ) : ticket.status === "CANCELLED" ? (
                    <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 font-bold">
                        ❌ Cancelled
                    </span>
                ) : ticket.status === "IN_PROGRESS" ? (
                    <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-bold">
                        🚕 In Trip
                    </span>
                ) : ticket.taxi_assign_status === "ASSIGNED" ? (
                    <span className="flex items-center gap-1 text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 font-bold">
                        ✓ Assigned
                    </span>
                ) : ticket.status === "PENDING_PAYMENT" ? (
                    <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-bold">
                        ⏳ Pending
                    </span>
                ) : (
                    <span className="text-slate-400">Unassigned</span>
                )}
            </div>
        </motion.button>
    );
}

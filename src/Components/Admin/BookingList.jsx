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
        <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Search & Filter Header */}
            <div className="p-5 border-b border-slate-200 space-y-5 bg-slate-50/50">
                <div className="relative group">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search ID, Name, or Route..."
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
                            className="flex flex-col items-center justify-center py-20 text-slate-400"
                        >
                            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <p className="text-sm font-black uppercase tracking-widest opacity-40">Zero Bookings</p>
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={onClick}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 group ${isSelected
                ? "bg-indigo-50 border-indigo-500 shadow-md transform scale-[1.02]"
                : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50 shadow-sm"
                }`}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest border shadow-sm ${isSelected ? "bg-indigo-600 text-white border-indigo-400" : "bg-slate-900 text-white border-slate-800"
                        }`}>
                        #{ticket.id}
                    </span>
                    <span className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[120px]">
                        {ticket.user?.name || "Guest User"}
                    </span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    {new Date(ticket.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                </span>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="truncate flex-1">{ticket.pickup_location.split(',')[0]}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                    <span className="truncate flex-1">{ticket.drop_location.split(',')[0]}</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                    {due > 0 ? (
                        <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-widest">
                            ₹{due} DUE
                        </span>
                    ) : (
                        <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-widest">
                            PAID
                        </span>
                    )}
                    {stringToArray(ticket.car_model).length > 0 && (
                        <span className="text-[9px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 uppercase tracking-tighter">
                            🚕 {ticket.car_model.split(' ')[0]}
                        </span>
                    )}
                </div>

                {/* Status Badge */}
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-sm border ${ticket.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        ticket.status === "CANCELLED" ? "bg-rose-50 text-rose-600 border-rose-100" :
                            "bg-indigo-50 text-indigo-600 border-indigo-100"
                    }`}>
                    {ticket.status === "IN_PROGRESS" ? "TRIP" :
                        ticket.taxi_assign_status === "ASSIGNED" ? "READY" :
                            ticket.status}
                </span>
            </div>
        </motion.button>
    );
}

// Helper for safe splitting
const stringToArray = (val) => val ? val.split(' ') : [];


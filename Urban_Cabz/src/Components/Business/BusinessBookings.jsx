import React, { useState, useEffect, useMemo } from "react";
import { getCompanyBookings } from "../../services/authService";
import {
    CalendarDaysIcon,
    MapPinIcon,
    CurrencyRupeeIcon,
    ClockIcon,
    TagIcon,
    FunnelIcon,
    BanknotesIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ChevronRightIcon
} from "@heroicons/react/24/outline";


export default function BusinessBookings({ company }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState("all");

    useEffect(() => {
        async function fetchBookings() {
            const result = await getCompanyBookings();
            if (result.success) {
                setBookings(result.data || []);
            }
            setLoading(false);
        }
        fetchBookings();
    }, []);

    // Generate month options from bookings data
    const monthOptions = useMemo(() => {
        const months = new Set();
        bookings.forEach(b => {
            const date = new Date(b.scheduled_at || b.created_at);
            const key = `${date.getFullYear()} -${String(date.getMonth() + 1).padStart(2, '0')} `;
            months.add(key);
        });
        return Array.from(months).sort().reverse();
    }, [bookings]);

    // Filter bookings by selected month
    const filteredBookings = useMemo(() => {
        if (selectedMonth === "all") return bookings;
        return bookings.filter(b => {
            const date = new Date(b.scheduled_at || b.created_at);
            const key = `${date.getFullYear()} -${String(date.getMonth() + 1).padStart(2, '0')} `;
            return key === selectedMonth;
        });
    }, [bookings, selectedMonth]);

    // Billing calculations based on filtered bookings
    const billingStats = useMemo(() => {
        let totalBilled = 0;
        let totalPaid = 0;

        filteredBookings.forEach(b => {
            const amount = parseFloat(b.total_amount) || 0;
            totalBilled += amount;
            if (b.status === 'PAID' || b.status === 'COMPLETED') {
                totalPaid += amount;
            }
        });

        return {
            totalBilled: Math.round(totalBilled),
            totalPaid: Math.round(totalPaid),
            amountDue: Math.round(totalBilled - totalPaid)
        };
    }, [filteredBookings]);

    const formatMonthLabel = (monthKey) => {
        if (!monthKey) return "";
        const [year, month] = monthKey.split("-");
        const date = new Date(year, parseInt(month) - 1);
        return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex justify-center p-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-400"></div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'CONFIRMED': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'PENDING_PAYMENT': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'CANCELLED': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'COMPLETED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'IN_PROGRESS': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    return (
        <div className="space-y-10">
            {/* Page Header & Compact Stats */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-white/5">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                            <CalendarDaysIcon className="h-5 w-5 text-violet-400" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-white uppercase">Dispatch Logs</h2>
                    </div>
                    <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] pl-0.5">
                        Operational oversight for <span className="text-violet-400">{company?.company_name}</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 lg:gap-8 bg-neutral-900/50 backdrop-blur-md border border-white/5 p-4 lg:p-6 rounded-3xl shadow-xl">
                    {[
                        { label: 'Billed', value: billingStats.totalBilled, color: 'text-white' },
                        { label: 'Settled', value: billingStats.totalPaid, color: 'text-emerald-400' },
                        { label: 'Outstanding', value: billingStats.amountDue, color: 'text-rose-400' }
                    ].map((stat) => (
                        <div key={stat.label} className="min-w-[100px] lg:min-w-[120px]">
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">{stat.label}</p>
                            <div className={`text-lg lg:text-xl font-black ${stat.color} flex items-center tracking-tighter`}>
                                <CurrencyRupeeIcon className="h-4 w-4 lg:h-5 lg:h-5 mr-0.5 opacity-50" />
                                {stat.value.toLocaleString('en-IN')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Control Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-neutral-900/30 border border-white/5 rounded-3xl p-5 shadow-inner">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-focus-within:border-violet-500/50 transition-colors">
                        <FunnelIcon className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div className="relative group">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="bg-transparent text-sm font-black text-white hover:text-violet-400 transition-colors focus:outline-none appearance-none cursor-pointer pr-8 tracking-tight uppercase"
                        >
                            <option value="all" className="bg-neutral-900">Full Archive</option>
                            {monthOptions.map(month => (
                                <option key={month} value={month} className="bg-neutral-900">{formatMonthLabel(month)}</option>
                            ))}
                        </select>
                        <ChevronRightIcon className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 rotate-90 pointer-events-none group-hover:text-violet-400 transition-colors" />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 lg:gap-10">
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-violet-500 ring-4 ring-violet-500/10"></div>
                        <div>
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Queue</p>
                            <p className="text-sm font-black text-white">{filteredBookings.length}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10"></div>
                        <div>
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Success</p>
                            <p className="text-sm font-black text-white">{filteredBookings.filter(b => b.status === "COMPLETED" || b.status === "PAID").length}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 ring-4 ring-amber-500/10"></div>
                        <div>
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Active</p>
                            <p className="text-sm font-black text-white">{filteredBookings.filter(b => b.status === "CONFIRMED" || b.status === "IN_PROGRESS").length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bookings List */}
            <div className="grid gap-4">
                {filteredBookings.length === 0 ? (
                    <div className="bg-white/5 border border-dashed border-white/20 rounded-3xl p-20 text-center">
                        <CalendarDaysIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">No bookings found</h3>
                        <p className="text-gray-400">
                            {selectedMonth !== "all"
                                ? `No rides were booked in ${formatMonthLabel(selectedMonth)}.`
                                : "Rides booked by your company employees will appear here."}
                        </p>
                    </div>
                ) : (
                    filteredBookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="bg-black border border-white/10 rounded-3xl p-6 hover:border-yellow-400/30 transition-all group"
                        >
                            <div className="flex flex-col lg:flex-row gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-yellow-400 h-10 w-10 rounded-xl flex items-center justify-center text-black font-bold text-sm">
                                                #{booking.id}
                                            </div>
                                            <div>
                                                <p className="font-bold">{booking.bookedByUser?.name || "Employee"}</p>
                                                <p className="text-xs text-gray-500">{booking.bookedByUser?.email}</p>
                                            </div>
                                        </div>
                                        <span className={`px - 4 py - 1.5 rounded - full text - xs font - bold border ${getStatusColor(booking.status)} `}>
                                            {booking.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 bg-white/5 rounded-2xl p-4">
                                        <div className="flex gap-3">
                                            <MapPinIcon className="h-5 w-5 text-yellow-400 shrink-0 mt-1" />
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Pickup</p>
                                                <p className="text-sm font-medium line-clamp-1">{booking.pickup_location}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-4">
                                            <MapPinIcon className="h-5 w-5 text-red-400 shrink-0 mt-1" />
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Drop</p>
                                                <p className="text-sm font-medium line-clamp-1">{booking.drop_location}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:w-64 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-6 flex flex-col justify-between">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <CalendarDaysIcon className="h-4 w-4" />
                                                <span>Date</span>
                                            </div>
                                            <span className="font-medium text-white">
                                                {new Date(booking.scheduled_at || booking.created_at).toLocaleDateString('en-IN')}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <ClockIcon className="h-4 w-4" />
                                                <span>Time</span>
                                            </div>
                                            <span className="font-medium text-white">
                                                {new Date(booking.scheduled_at || booking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <TagIcon className="h-4 w-4" />
                                                <span>Model</span>
                                            </div>
                                            <span className="font-medium text-white">{booking.car_model || "N/A"}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-baseline justify-between pt-4 border-t border-white/5">
                                        <span className="text-xs text-gray-500 font-bold uppercase">Fare</span>
                                        <div className="flex items-center text-xl font-bold text-yellow-400">
                                            <CurrencyRupeeIcon className="h-5 w-5" />
                                            <span>{booking.total_amount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}


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
    ExclamationCircleIcon
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
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months.add(key);
        });
        return Array.from(months).sort().reverse();
    }, [bookings]);

    // Filter bookings by selected month
    const filteredBookings = useMemo(() => {
        if (selectedMonth === "all") return bookings;
        return bookings.filter(b => {
            const date = new Date(b.scheduled_at || b.created_at);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
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
        <div className="space-y-8">
            {/* Page Header */}
            <div className="pb-6 border-b border-white/10">
                <h2 className="text-3xl font-bold tracking-tight">Company Bookings</h2>
                <p className="text-gray-400 mt-1">View and manage all rides booked under <span className="text-yellow-400 font-medium">{company?.company_name}</span></p>
            </div>

            {/* Billing Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <DocumentTextIcon className="h-24 w-24 text-yellow-500" />
                    </div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Billed</p>
                    <p className="text-3xl font-black mt-2 flex items-center">
                        <CurrencyRupeeIcon className="h-7 w-7 mr-1" />
                        {billingStats.totalBilled.toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">{selectedMonth === "all" ? "All time" : formatMonthLabel(selectedMonth)}</p>
                </div>

                <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-500/20 rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <CheckCircleIcon className="h-24 w-24 text-green-500" />
                    </div>
                    <p className="text-xs text-green-400 uppercase font-bold tracking-wider">Amount Paid</p>
                    <p className="text-3xl font-black mt-2 flex items-center text-green-400">
                        <CurrencyRupeeIcon className="h-7 w-7 mr-1" />
                        {billingStats.totalPaid.toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-green-500/50 mt-2">Cleared payments</p>
                </div>

                <div className="bg-gradient-to-br from-red-900/30 to-orange-800/10 border border-red-500/20 rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ExclamationCircleIcon className="h-24 w-24 text-red-500" />
                    </div>
                    <p className="text-xs text-red-400 uppercase font-bold tracking-wider">Amount Due</p>
                    <p className="text-3xl font-black mt-2 flex items-center text-red-400">
                        <CurrencyRupeeIcon className="h-7 w-7 mr-1" />
                        {billingStats.amountDue.toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-red-500/50 mt-2">Outstanding balance</p>
                </div>
            </div>

            {/* Filters and Quick Stats Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                {/* Month Filter */}
                <div className="flex items-center gap-3">
                    <FunnelIcon className="h-5 w-5 text-gray-400" />
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-black border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-400 appearance-none cursor-pointer min-w-[180px]"
                    >
                        <option value="all">All Months</option>
                        {monthOptions.map(month => (
                            <option key={month} value={month}>{formatMonthLabel(month)}</option>
                        ))}
                    </select>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <span className="text-sm text-gray-400">Total Rides:</span>
                        <span className="font-bold">{filteredBookings.length}</span>
                    </div>
                    <div className="h-6 w-px bg-white/10 hidden md:block" />
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <span className="text-sm text-gray-400">Completed:</span>
                        <span className="font-bold">{filteredBookings.filter(b => b.status === "COMPLETED" || b.status === "PAID").length}</span>
                    </div>
                    <div className="h-6 w-px bg-white/10 hidden md:block" />
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                        <span className="text-sm text-gray-400">Active:</span>
                        <span className="font-bold">{filteredBookings.filter(b => b.status === "CONFIRMED" || b.status === "IN_PROGRESS").length}</span>
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
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
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

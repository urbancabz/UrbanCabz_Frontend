import React, { useState, useEffect, useMemo } from "react";
import { getCompanyPayments } from "../../services/authService";
import {
    CalendarDaysIcon,
    CurrencyRupeeIcon,
    ClockIcon,
    BanknotesIcon,
    CreditCardIcon,
    FunnelIcon,
    ChevronRightIcon,
    CheckCircleIcon,
    ExclamationCircleIcon
} from "@heroicons/react/24/outline";

export default function BusinessPayments({ company }) {
    const [payments, setPayments] = useState([]);
    const [billingSummary, setBillingSummary] = useState({ totalBilled: 0, totalPaid: 0, outstanding: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState("all");

    useEffect(() => {
        async function fetchPayments() {
            const result = await getCompanyPayments();
            if (result.success) {
                // Handle both direct array and nested object structure
                const data = result.data?.payments || result.data || [];
                setPayments(Array.isArray(data) ? data : []);

                // Extract billing summary if available
                if (result.data?.billingSummary) {
                    setBillingSummary(result.data.billingSummary);
                } else if (result.data?.stats) {
                    setBillingSummary(result.data.stats);
                }
            }
            setLoading(false);
        }
        fetchPayments();
    }, []);

    // Helper to get date from payment object
    const getPaymentDate = (p) => {
        return new Date(p.payment_date || p.paid_at || p.created_at);
    };

    // Generate month options from payments data
    const monthOptions = useMemo(() => {
        const months = new Set();
        payments.forEach(p => {
            const date = getPaymentDate(p);
            if (!isNaN(date.getTime())) {
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                months.add(key);
            }
        });
        return Array.from(months).sort().reverse();
    }, [payments]);

    // Filter payments by selected month
    const filteredPayments = useMemo(() => {
        if (selectedMonth === "all") return payments;
        return payments.filter(p => {
            const date = getPaymentDate(p);
            if (isNaN(date.getTime())) return false;
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            return key === selectedMonth;
        });
    }, [payments, selectedMonth]);

    const formatMonthLabel = (monthKey) => {
        if (!monthKey || monthKey === "all") return "Full Archive";
        try {
            const [year, month] = monthKey.split("-");
            const date = new Date(year, parseInt(month) - 1);
            return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        } catch (e) {
            return monthKey;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'PAID':
            case 'SUCCESS':
            case 'COMPLETED':
                return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'PENDING':
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'FAILED':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'OFFLINE':
                return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
            default:
                return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-400"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Page Header & Stats */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-white/5">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                            <CreditCardIcon className="h-5 w-5 text-violet-400" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-white uppercase">Payment History</h2>
                    </div>
                    <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] pl-0.5">
                        Financial ledger for <span className="text-violet-400">{company?.company_name}</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 lg:gap-8 bg-neutral-900/50 backdrop-blur-md border border-white/5 p-4 lg:p-6 rounded-3xl shadow-xl">
                    {[
                        { label: 'Total Billed', value: billingSummary.totalBilled, color: 'text-white' },
                        { label: 'Settled', value: billingSummary.totalPaid, color: 'text-emerald-400' },
                        { label: 'Outstanding', value: billingSummary.outstanding, color: 'text-rose-400' }
                    ].map((stat) => (
                        <div key={stat.label} className="min-w-[100px] lg:min-w-[120px]">
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">{stat.label}</p>
                            <div className={`text-lg lg:text-xl font-black ${stat.color} flex items-center tracking-tighter`}>
                                <CurrencyRupeeIcon className="h-4 w-4 lg:h-5 lg:h-5 mr-0.5 opacity-50" />
                                {Math.round(stat.value || 0).toLocaleString('en-IN')}
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

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-violet-500 ring-4 ring-violet-500/10"></div>
                        <div>
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Total Records</p>
                            <p className="text-sm font-black text-white">{filteredPayments.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payments List */}
            <div className="grid gap-4">
                {filteredPayments.length === 0 ? (
                    <div className="bg-white/5 border border-dashed border-white/20 rounded-3xl p-20 text-center">
                        <BanknotesIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">No payments found</h3>
                        <p className="text-gray-400">
                            {selectedMonth !== "all"
                                ? `No payments were recorded in ${formatMonthLabel(selectedMonth)}.`
                                : "Your company's payment history will appear here."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-3xl border border-white/10">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/10">
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Mode</th>
                                    <th className="px-6 py-4">Reference</th>
                                    <th className="px-6 py-4">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredPayments.map((payment) => {
                                    const pDate = getPaymentDate(payment);
                                    return (
                                        <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <CalendarDaysIcon className="h-4 w-4 text-zinc-500" />
                                                    <span className="text-sm text-zinc-300">
                                                        {!isNaN(pDate.getTime()) ? pDate.toLocaleDateString('en-IN') : 'N/A'}
                                                    </span>
                                                    <div className="w-1 h-1 rounded-full bg-zinc-700 mx-1"></div>
                                                    <ClockIcon className="h-4 w-4 text-zinc-500" />
                                                    <span className="text-sm text-zinc-300">
                                                        {!isNaN(pDate.getTime()) ? pDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center text-lg font-black text-emerald-400 tracking-tighter">
                                                    <CurrencyRupeeIcon className="h-4 w-4 mr-0.5 opacity-50" />
                                                    {parseFloat(payment.amount || 0).toLocaleString('en-IN')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-lg bg-zinc-800 flex items-center justify-center">
                                                        <CreditCardIcon className="h-3.5 w-3.5 text-zinc-400" />
                                                    </div>
                                                    <span className="text-sm font-bold text-zinc-300 uppercase tracking-tight">
                                                        {payment.payment_mode || "Online"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-xs font-mono text-zinc-400">
                                                    {payment.reference_no || "-"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-xs text-zinc-500 italic">
                                                    {payment.notes || "-"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

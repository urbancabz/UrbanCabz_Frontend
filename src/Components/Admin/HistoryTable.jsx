import React from "react";
import { motion } from "framer-motion";

/**
 * HistoryTable - Reusable table component for displaying ride history
 * Props:
 *  - bookings: Array of booking objects
 *  - type: "completed" | "cancelled" | "pending" (to customize display)
 *  - onRowClick: Optional function to handle row clicks
 */
export default function HistoryTable({ bookings = [], type = "completed", onRowClick }) {
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatAmount = (amount) => {
        if (amount === null || amount === undefined) return "—";
        return `₹${Number(amount).toLocaleString("en-IN")}`;
    };

    // Helper to extract successful payment details
    const getPaymentDetails = (b) => {
        const successPayments = b.payments?.filter(
            (p) => p.status === "SUCCESS" || p.status === "PAID"
        ) || [];

        const totalPaid = successPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const transactionIds = successPayments.map(p => p.provider_txn_id).filter(Boolean).join(", ");

        // Determine payment type
        let paymentType = "Unpaid";
        if (totalPaid > 0) {
            if (totalPaid >= (b.total_amount || 0)) {
                paymentType = "Full Online";
            } else {
                paymentType = "Partial / Cash";
            }
        }

        return { transactionIds: transactionIds || "—", totalPaid, paymentType };
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "COMPLETED":
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "CANCELLED":
                return "bg-rose-100 text-rose-700 border-rose-200";
            case "PENDING_PAYMENT":
                return "bg-amber-100 text-amber-700 border-amber-200";
            default:
                return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    if (bookings.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-slate-400"
            >
                <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-base">No {type} bookings found</p>
            </motion.div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
            <table className="min-w-full divide-y divide-slate-200">
                <thead>
                    <tr className="bg-slate-50/80">
                        <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">ID & Schedule</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[160px]">Customer</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[240px]">Route Details</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[200px]">Dispatch Info</th>
                        <th className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Distance</th>
                        <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[150px]">Billing Info</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[160px]">Payment</th>
                        <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {bookings.map((booking) => {
                        const { transactionIds, paymentType } = getPaymentDetails(booking);
                        const assignment = booking.assign_taxis?.[0] || {};
                        const estFare = (booking.total_amount || 0) - (booking.extra_charge || 0);

                        return (
                            <motion.tr
                                key={booking.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.02)" }}
                                className="group cursor-pointer transition-all"
                                onClick={() => onRowClick && onRowClick(booking)}
                            >
                                <td className="px-6 py-6 text-left whitespace-nowrap align-top">
                                    <span className="block text-sm font-black text-indigo-600 mb-1">#{booking.id}</span>
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                        {formatDate(booking.created_at)}
                                    </span>
                                </td>
                                <td className="px-6 py-6 text-left align-top">
                                    <div className="text-sm font-black text-slate-900 mb-0.5 group-hover:text-indigo-600 transition-colors">
                                        {booking.user?.name || "Guest User"}
                                    </div>
                                    <div className="text-[11px] font-bold text-slate-500 mb-1">{booking.user?.phone}</div>
                                    <div className="text-[10px] text-slate-400 truncate max-w-[140px] italic">
                                        {booking.user?.email}
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-left align-top">
                                    <div className="space-y-3 relative">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1.5 min-w-[8px] h-[8px] rounded-full bg-emerald-500 ring-4 ring-emerald-50"></div>
                                            <span className="text-xs font-bold text-slate-700 leading-tight">
                                                {booking.pickup_location}
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1.5 min-w-[8px] h-[8px] rounded-full bg-rose-500 ring-4 ring-rose-50"></div>
                                            <span className="text-xs font-bold text-slate-700 leading-tight">
                                                {booking.drop_location}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-left align-top">
                                    {assignment.cab_name ? (
                                        <div className="space-y-2">
                                            <div className="text-xs font-black text-slate-900 group-hover:text-indigo-600">
                                                🚕 {assignment.cab_name}
                                            </div>
                                            <div className="inline-block text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded shadow-sm">
                                                {assignment.cab_number}
                                            </div>
                                            <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                                                👤 {assignment.driver_name}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-bold text-slate-300 italic">No Active Assignment</span>
                                            {booking.car_model && (
                                                <div className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 w-fit">
                                                    Requested: {booking.car_model}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-6 text-center align-top whitespace-nowrap">
                                    <div className="text-sm font-black text-slate-900 mb-1">{booking.actual_km || booking.distance_km || "—"} <span className="text-[10px] uppercase text-slate-400">KM</span></div>
                                    {booking.extra_km > 0 && (
                                        <div className="inline-block text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 uppercase">
                                            +{booking.extra_km} Overshoot
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-6 text-right align-top whitespace-nowrap">
                                    <div className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">
                                        {formatAmount(booking.total_amount)}
                                    </div>
                                    {booking.extra_charge > 0 && (
                                        <div className="text-[10px] font-bold text-amber-600 mb-1 uppercase tracking-tighter">
                                            +{formatAmount(booking.extra_charge)} Extra Fees
                                        </div>
                                    )}
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic opacity-60">
                                        Base: {formatAmount(estFare)}
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-left align-top">
                                    <div className="space-y-2">
                                        <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${paymentType.includes("Full") ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                paymentType === "Unpaid" ? 'bg-slate-50 text-slate-400 border-slate-100' :
                                                    'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                            {paymentType}
                                        </span>
                                        {getPaymentDetails(booking).totalPaid > 0 && (
                                            <div className="text-xs font-black text-emerald-600 tracking-tight">
                                                Received: {formatAmount(getPaymentDetails(booking).totalPaid)}
                                            </div>
                                        )}
                                        {transactionIds !== "—" && (
                                            <div className="text-[9px] text-slate-400 font-mono break-all leading-tight opacity-70">
                                                TXN: {transactionIds.split(',')[0]}...
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-right align-top">
                                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border-2 tracking-widest shadow-sm ${getStatusColor(booking.status)}`}>
                                        {booking.status === "COMPLETED" ? "✓ Done" :
                                            booking.status === "CANCELLED" ? "✕ Void" :
                                                booking.status}
                                    </span>
                                </td>
                            </motion.tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

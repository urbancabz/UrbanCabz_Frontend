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
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 bg-white">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">ID & Date</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 min-w-[140px]">Customer</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 min-w-[220px]">Route</th>

                        {/* Vehicle & Driver - show for all types */}
                        <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 min-w-[180px]">Vehicle & Driver</th>
                        <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Distance (KM)</th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap min-w-[140px]">Fare Breakdown</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 min-w-[160px]">Payment Info</th>

                        {type === "cancelled" && (
                            <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 min-w-[180px]">Reason</th>
                        )}
                        <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {bookings.map((booking) => {
                        const { transactionIds, paymentType } = getPaymentDetails(booking);
                        const assignment = booking.assign_taxis?.[0] || {};
                        const estFare = (booking.total_amount || 0) - (booking.extra_charge || 0);

                        return (
                            <motion.tr
                                key={booking.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.05)" }}
                                className="cursor-pointer transition-colors"
                                onClick={() => onRowClick && onRowClick(booking)}
                            >
                                <td className="px-6 py-4 text-left whitespace-nowrap align-top">
                                    <span className="block text-xs font-mono font-bold text-indigo-600">#{booking.id}</span>
                                    <span className="block text-[10px] text-slate-500">{formatDate(booking.created_at)}</span>
                                </td>
                                <td className="px-6 py-4 text-left align-top">
                                    <div className="text-sm font-semibold text-slate-900">{booking.user?.name || "Guest"}</div>
                                    <div className="text-xs text-slate-500 font-mono">{booking.user?.phone}</div>
                                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]" title={booking.user?.email}>{booking.user?.email}</div>
                                </td>
                                <td className="px-6 py-4 text-left align-top">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-start gap-1.5">
                                            <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-emerald-500"></div>
                                            <span className="text-xs text-slate-700 leading-snug">{booking.pickup_location}</span>
                                        </div>
                                        <div className="flex items-start gap-1.5">
                                            <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-rose-500"></div>
                                            <span className="text-xs text-slate-700 leading-snug">{booking.drop_location}</span>
                                        </div>
                                    </div>
                                </td>

                                {/* Vehicle & Driver - Now shows for ALL types */}
                                <td className="px-6 py-4 text-left align-top">
                                    {assignment.cab_name ? (
                                        <div className="space-y-1">
                                            <div className="text-xs font-bold text-slate-800">
                                                {assignment.cab_name}
                                            </div>
                                            <div className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded w-fit">
                                                {assignment.cab_number}
                                            </div>
                                            <div className="text-xs text-slate-600 flex items-center gap-1">
                                                👤 {assignment.driver_name}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">Not Assigned</span>
                                    )}
                                    {booking.car_model && (
                                        <div className="text-[10px] text-indigo-600 font-bold mt-1 bg-indigo-50 px-1.5 py-0.5 rounded w-fit">
                                            Req: {booking.car_model}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center align-top whitespace-nowrap">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="text-xs font-bold text-slate-800">{booking.actual_km || booking.distance_km || "—"} km</div>
                                        {booking.extra_km > 0 && (
                                            <div className="text-[10px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded font-bold">
                                                +{booking.extra_km} km extra
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right align-top whitespace-nowrap">
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="text-sm font-bold text-slate-900">{formatAmount(booking.total_amount)}</div>
                                        {booking.extra_charge > 0 && (
                                            <div className="text-[10px] text-amber-600">
                                                (+{formatAmount(booking.extra_charge)} extra)
                                            </div>
                                        )}
                                        <div className="text-[10px] text-slate-400">
                                            Base: {formatAmount(estFare)}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-left align-top">
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit ${paymentType.includes("Full") ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : paymentType === "Unpaid" ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                            {paymentType}
                                        </span>
                                        {getPaymentDetails(booking).totalPaid > 0 && (
                                            <div className="text-xs font-bold text-emerald-600">
                                                Received: {formatAmount(getPaymentDetails(booking).totalPaid)}
                                            </div>
                                        )}
                                        {transactionIds !== "—" && (
                                            <div className="text-[10px] text-slate-500 font-mono break-all leading-tight">
                                                {transactionIds}
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {type === "cancelled" && (
                                    <td className="px-6 py-4 text-left align-top max-w-[200px]">
                                        <span className="text-xs text-slate-600 block italic leading-snug bg-rose-50 p-2 rounded border border-rose-100">
                                            "{booking.cancellation_reason || "No reason provided"}"
                                        </span>
                                    </td>
                                )}

                                <td className="px-6 py-4 text-right align-top">
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${getStatusColor(booking.status)}`}>
                                        {booking.status === "COMPLETED" && "✅ "}
                                        {booking.status === "CANCELLED" && "❌ "}
                                        {booking.status}
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

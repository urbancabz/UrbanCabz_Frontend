import React from "react";
import { motion } from "framer-motion";

export default function AdminStats({ summary = {} }) {
    const { total = 0, paidCount = 0, readyToAssign = 0, pendingPayment = 0 } = summary;

    const stats = [
        {
            label: "Total Bookings",
            value: total,
            bgColor: "bg-white",
            borderColor: "border-slate-200",
            textColor: "text-slate-700",
            labelColor: "text-slate-500",
            icon: (
                <svg className="w-5 h-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
        },
        {
            label: "Confirmed (Paid)",
            value: paidCount,
            bgColor: "bg-emerald-50",
            borderColor: "border-emerald-200",
            textColor: "text-emerald-700",
            labelColor: "text-emerald-600",
            isHighlight: true,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            label: "Action Needed",
            value: readyToAssign,
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            textColor: "text-blue-700",
            labelColor: "text-blue-600",
            isHighlight: true,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            label: "Pending Payment",
            value: pendingPayment,
            bgColor: "bg-amber-50",
            borderColor: "border-amber-200",
            textColor: "text-amber-700",
            labelColor: "text-amber-600",
            icon: (
                <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative overflow-hidden rounded-xl p-5 border ${stat.bgColor} ${stat.borderColor} shadow-sm hover:shadow-md transition-shadow`}
                >
                    <div className="flex flex-col justify-between h-full gap-4">
                        <div className="flex items-start justify-between">
                            <span className={`text-xs font-bold uppercase tracking-wider ${stat.labelColor}`}>
                                {stat.label}
                            </span>
                            <span className={stat.labelColor}>
                                {stat.icon}
                            </span>
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className={`text-3xl font-extrabold tracking-tight ${stat.textColor}`}>
                                {stat.value}
                            </span>
                            {stat.value > 0 && stat.label === "Action Needed" && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

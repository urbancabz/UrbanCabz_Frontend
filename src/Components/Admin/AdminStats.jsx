import React from "react";
import { motion } from "framer-motion";

export default function AdminStats({ summary = {} }) {
    // Map backend stat names to frontend labels
    const { 
        totalBookings = 0, 
        completedBookings = 0, 
        readyToAssign = 0, 
        b2bBookings = 0 
    } = summary;

    const stats = [
        {
            label: "Total Bookings",
            value: totalBookings,
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
            label: "Completed Rides",
            value: completedBookings,
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
            label: "Pending Dispatch",
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
            label: "Corporate (B2B)",
            value: b2bBookings,
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200",
            textColor: "text-purple-700",
            labelColor: "text-purple-600",
            icon: (
                <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
                            {stat.value > 0 && stat.label === "Pending Dispatch" && (
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

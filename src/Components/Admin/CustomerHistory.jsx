import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchUserBookings } from '../../services/adminService';

// Helper for status colors
const getStatusColor = (status) => {
    switch (status) {
        case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
        case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
        case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'ASSIGNED': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'PAID': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
};

export default function CustomerHistory({ user, onClose }) {
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({ totalRides: 0, totalSpent: 0 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        loadHistory();
    }, [user.id, page]);

    const loadHistory = async () => {
        setLoading(true);
        console.log("CustomerHistory loading for user:", user);
        try {
            const res = await fetchUserBookings(user.id, page);
            console.log("fetchUserBookings response:", res);
            if (res.success) {
                setBookings(res.data.bookings || []); // Ensure array
                setStats(res.data.stats || { totalRides: 0, totalSpent: 0 });
                setPagination(res.data.pagination);
            } else {
                console.warn("Failed to fetch history:", res.message);
            }
        } catch (err) {
            console.error("Error in loadHistory:", err);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            📜 Customer History
                            <span className="text-sm font-medium text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full">
                                ID: {user.id}
                            </span>
                        </h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            {user.name} • {user.phone}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-full transition-colors">
                        ✖️
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 p-6 bg-white border-b border-slate-100">
                    <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">
                            🚖
                        </div>
                        <div>
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Total Rides</p>
                            <p className="text-2xl font-black text-indigo-900">{stats.totalRides}</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl">
                            💰
                        </div>
                        <div>
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Total Spent</p>
                            <p className="text-2xl font-black text-emerald-900">₹{stats.totalSpent?.toLocaleString() || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Bookings Table */}
                <div className="flex-1 overflow-auto CustomScrollbar p-6 pt-0">
                    <table className="w-full min-w-[700px] border-collapse">
                        <thead className="sticky top-0 bg-white z-10">
                            <tr>
                                <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">Date & ID</th>
                                <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">Route</th>
                                <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">Cab & Driver</th>
                                <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">Amount</th>
                                <th className="text-left py-3 px-4 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-slate-400 font-bold animate-pulse">
                                        Loading history...
                                    </td>
                                </tr>
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-slate-400 font-bold">
                                        No bookings found
                                    </td>
                                </tr>
                            ) : (
                                bookings.map(booking => (
                                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-3 px-4">
                                            <p className="text-xs font-bold text-slate-700">
                                                {new Date(booking.created_at).toLocaleDateString()}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-mono">#{booking.id}</p>
                                        </td>
                                        <td className="py-3 px-4 max-w-[200px]">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-600 truncate" title={booking.pickup_location}>
                                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0"></span>
                                                    {booking.pickup_location}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-600 truncate" title={booking.drop_location}>
                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                                                    {booking.drop_location}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {booking.assign_taxis?.[0] ? (
                                                <div className="text-xs">
                                                    <p className="font-bold text-slate-700">{booking.assign_taxis[0].cab_name}</p>
                                                    <p className="text-slate-400">{booking.assign_taxis[0].cab_number}</p>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 italic">Not Assigned</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-xs">
                                                <p className="font-bold text-slate-900">₹{booking.total_amount}</p>
                                                <p className="text-[10px] text-slate-500 capitalize">
                                                    {booking.payments?.[0]?.provider || 'Unpaid'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getStatusColor(booking.status)}`}>
                                                {booking.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination footer */}
                {pagination && pagination.pages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <span className="text-xs text-slate-400 font-medium">Page {page} of {pagination.pages}</span>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                disabled={page === pagination.pages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

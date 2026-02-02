import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    upsertTaxiAssignment,
    fetchAdminBookingTicket,
    updateBookingStatus,
    completeTrip,
    cancelBooking,
    getBookingNotes,
    addBookingNote,
} from "../../services/adminService";

export default function BookingDetailView({
    booking,
    onUpdate,
    onClose
}) {
    const [saving, setSaving] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);

    // Assignment form
    const [assignForm, setAssignForm] = useState({
        driverName: booking.assignments?.[0]?.driver_name || "",
        driverNumber: booking.assignments?.[0]?.driver_number || "",
        cabNumber: booking.assignments?.[0]?.cab_number || "",
        cabName: booking.assignments?.[0]?.cab_name || booking.car_model || ""
    });

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const result = await upsertTaxiAssignment(booking.id, { ...assignForm, markAssigned: true });
        setSaving(false);
        if (result.success) {
            setShowAssignModal(false);
            onUpdate?.();
        } else {
            alert(result.message || "Failed to assign taxi");
        }
    };

    const handleStartTrip = async () => {
        if (!window.confirm("Start this ride?")) return;
        setSaving(true);
        const result = await updateBookingStatus(booking.id, "IN_PROGRESS");
        setSaving(false);
        if (result.success) onUpdate?.();
    };

    const handleCompleteTrip = async () => {
        const actual_km = prompt("Enter actual KM driven:", booking.distance_km);
        if (actual_km === null) return;

        setSaving(true);
        const result = await completeTrip(booking.id, { actual_km: parseFloat(actual_km) });
        setSaving(false);
        if (result.success) onUpdate?.();
    };

    const handleCancelBooking = async () => {
        const reason = prompt("Reason for cancellation:");
        if (!reason) return;

        setSaving(true);
        const result = await cancelBooking(booking.id, reason);
        setSaving(false);
        if (result.success) onUpdate?.();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'CANCELLED': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
            case 'PAID': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
            case 'IN_PROGRESS': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'READY': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        }
    };

    const getAmounts = (b) => {
        const total = b.total_amount || 0;
        const paid = (b.payments || []).reduce((sum, p) =>
            (p.status === 'SUCCESS' || p.status === 'PAID') ? sum + (p.amount || 0) : sum, 0
        );
        const due = Math.max(0, total - paid);
        return { total, paid, due };
    };

    const { total, paid, due } = getAmounts(booking);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="fixed top-20 right-6 z-[60] w-[420px] bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/60 rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-black text-indigo-200 uppercase tracking-widest block mb-1">Active Focus</span>
                            <h4 className="text-2xl font-black tracking-tight">Booking #{booking.id}</h4>
                        </div>
                        <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-2xl bg-white/20 hover:bg-white/30 transition-all font-bold text-lg backdrop-blur-sm">✕</button>
                    </div>
                </div>

                <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                    {/* Customer Info */}
                    <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-2xl border border-indigo-500/30">👤</div>
                        <div className="min-w-0 flex-1">
                            <p className="text-lg font-bold text-white truncate">{booking.user?.name || "Guest User"}</p>
                            <p className="text-sm font-semibold text-slate-400">{booking.user?.phone || "—"}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border ${getStatusColor(booking.status)}`}>
                            {booking.status}
                        </div>
                    </div>

                    {/* Route */}
                    <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="mt-1.5 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 flex-shrink-0"></div>
                            <div>
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1">Pickup</span>
                                <p className="text-sm font-bold text-white leading-snug">{booking.pickup_location}</p>
                            </div>
                        </div>
                        <div className="ml-2 border-l-2 border-dashed border-slate-600 h-4"></div>
                        <div className="flex items-start gap-4">
                            <div className="mt-1.5 w-4 h-4 rounded-full bg-rose-500 ring-4 ring-rose-500/20 flex-shrink-0"></div>
                            <div>
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1">Drop-off</span>
                                <p className="text-sm font-bold text-white leading-snug">{booking.drop_location}</p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 text-center">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1">Total</span>
                            <p className="text-xl font-black text-white">₹{total}</p>
                        </div>
                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block mb-1">Paid</span>
                            <p className="text-xl font-black text-emerald-400">₹{paid}</p>
                        </div>
                        <div className={`p-4 rounded-2xl border text-center ${due > 0 ? "bg-amber-500/10 border-amber-500/20" : "bg-slate-800/50 border-slate-700/50"}`}>
                            <span className={`text-xs font-black uppercase tracking-widest block mb-1 ${due > 0 ? "text-amber-400" : "text-slate-500"}`}>Due</span>
                            <p className={`text-xl font-black ${due > 0 ? "text-amber-400" : "text-slate-500"}`}>₹{due}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4 border-t border-slate-700/50">
                        {booking.status === "CONFIRMED" && (
                            <button onClick={() => setShowAssignModal(true)} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:from-indigo-500 hover:to-indigo-600 shadow-lg shadow-indigo-500/30 transition-all">
                                {booking.taxi_assign_status === "ASSIGNED" ? "Update Driver 🚕" : "Dispatch Driver 🚕"}
                            </button>
                        )}
                        {booking.taxi_assign_status === "ASSIGNED" && booking.status === "CONFIRMED" && (
                            <button onClick={handleStartTrip} disabled={saving} className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-emerald-500/30">
                                Start Trip ▶️
                            </button>
                        )}
                        {booking.status === "IN_PROGRESS" && (
                            <button onClick={handleCompleteTrip} disabled={saving} className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-500/30">
                                Complete Trip ✅
                            </button>
                        )}

                        {/* WhatsApp Quick Actions */}
                        {booking.assignments?.[0] && (
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700/50">
                                <button
                                    onClick={() => {
                                        const phone = (booking.user?.phone || "").replace(/\D/g, "");
                                        const taxi = booking.assignments[0];
                                        const msg = encodeURIComponent(
                                            `🚕 *UrbanCabz Booking Confirmed*\n\n` +
                                            `Booking ID: #${booking.id}\n` +
                                            `---------------------\n` +
                                            `🚘 Vehicle: ${taxi.cab_name} (${taxi.cab_number})\n` +
                                            `👤 Driver: ${taxi.driver_name}\n` +
                                            `📞 Driver: ${taxi.driver_number}\n` +
                                            `---------------------\n` +
                                            `📍 Pickup: ${booking.pickup_location}\n` +
                                            `🏁 Drop: ${booking.drop_location}\n` +
                                            `📅 Time: ${new Date(booking.scheduled_at || booking.created_at).toLocaleString()}\n\n` +
                                            `Thank you for choosing UrbanCabz! 🙏`
                                        );
                                        window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank");
                                    }}
                                    className="py-3.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2"
                                >
                                    📱 Client WA
                                </button>
                                <button
                                    onClick={() => {
                                        const taxi = booking.assignments[0];
                                        const phone = (taxi.driver_number || "").replace(/\D/g, "");
                                        const msg = encodeURIComponent(
                                            `🚕 *UrbanCabz Pickup Request*\n\n` +
                                            `Booking ID: #${booking.id}\n` +
                                            `---------------------\n` +
                                            `👤 Customer: ${booking.user?.name || "Guest"}\n` +
                                            `📞 Customer: ${booking.user?.phone}\n` +
                                            `---------------------\n` +
                                            `📍 Pickup: ${booking.pickup_location}\n` +
                                            `🏁 Drop: ${booking.drop_location}\n` +
                                            `📅 Time: ${new Date(booking.scheduled_at || booking.created_at).toLocaleString()}\n` +
                                            `📏 Distance: ${booking.distance_km} km\n\n` +
                                            `Please reach on time. 🙏`
                                        );
                                        window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank");
                                    }}
                                    className="py-3.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2"
                                >
                                    📱 Driver WA
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button onClick={handleCancelBooking} className="py-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all">Cancel</button>
                            <button onClick={onClose} className="py-3 bg-slate-700/50 text-slate-400 border border-slate-600/50 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-all">Minimize</button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Assignment Modal */}
            <AnimatePresence>
                {showAssignModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-700">
                            <div className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight">Assign Driver 🚕</h3>
                                    <p className="text-xs text-indigo-200 uppercase font-bold tracking-widest mt-1">Booking #{booking.id}</p>
                                </div>
                                <button onClick={() => setShowAssignModal(false)} className="h-10 w-10 flex items-center justify-center rounded-2xl bg-white/20 hover:bg-white/30 transition-all font-bold backdrop-blur-sm">✕</button>
                            </div>

                            <form onSubmit={handleAssignSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase font-black text-slate-500 tracking-widest">Driver Name</label>
                                        <input className="w-full bg-slate-700/50 border border-slate-600 rounded-xl p-4 text-base font-bold text-white focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all placeholder-slate-500" placeholder="Enter name" value={assignForm.driverName} onChange={e => setAssignForm({ ...assignForm, driverName: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase font-black text-slate-500 tracking-widest">Driver Phone</label>
                                        <input className="w-full bg-slate-700/50 border border-slate-600 rounded-xl p-4 text-base font-bold text-white focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all placeholder-slate-500" placeholder="Phone number" value={assignForm.driverNumber} onChange={e => setAssignForm({ ...assignForm, driverNumber: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase font-black text-slate-500 tracking-widest">Vehicle Model</label>
                                        <input className="w-full bg-slate-700/50 border border-slate-600 rounded-xl p-4 text-base font-bold text-white focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all placeholder-slate-500" placeholder="e.g. Innova" value={assignForm.cabName} onChange={e => setAssignForm({ ...assignForm, cabName: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase font-black text-slate-500 tracking-widest">Vehicle Plate</label>
                                        <input className="w-full bg-slate-700/50 border border-slate-600 rounded-xl p-4 text-base font-bold text-white focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all placeholder-slate-500" placeholder="Plate number" value={assignForm.cabNumber} onChange={e => setAssignForm({ ...assignForm, cabNumber: e.target.value })} required />
                                    </div>
                                </div>

                                <button type="submit" disabled={saving} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-500/30 hover:from-indigo-500 hover:to-indigo-600 transition-all">
                                    {saving ? "Processing..." : "Assign & Confirm ✅"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

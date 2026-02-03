import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    upsertTaxiAssignment,
    fetchAdminBookingTicket,
    updateBookingStatus,
    completeTrip,
    cancelBooking,
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
        driverName: booking.assign_taxis?.[0]?.driver_name || "",
        driverNumber: booking.assign_taxis?.[0]?.driver_number || "",
        cabNumber: booking.assign_taxis?.[0]?.cab_number || "",
        cabName: booking.assign_taxis?.[0]?.cab_name || booking.car_model || ""
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
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'CANCELLED': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'PAID': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'IN_PROGRESS': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'READY': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
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
                className="fixed top-20 right-6 z-[60] w-[400px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-5 bg-indigo-600 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest block mb-1">Active Focus</span>
                            <h4 className="text-xl font-black tracking-tight">Booking #{booking.id}</h4>
                        </div>
                        <button onClick={onClose} className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition-all font-bold text-lg">✕</button>
                    </div>
                </div>

                <div className="p-5 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Customer Info */}
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">👤</div>
                        <div className="min-w-0 flex-1">
                            <p className="text-base font-bold text-slate-900 truncate">{booking.user?.name || "Guest User"}</p>
                            <p className="text-sm font-medium text-slate-500">{booking.user?.phone || "—"}</p>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border ${getStatusColor(booking.status)}`}>
                            {booking.status}
                        </div>
                    </div>

                    {/* Route */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0"></div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Pickup</span>
                                <p className="text-sm font-semibold text-slate-900 leading-snug">{booking.pickup_location}</p>
                            </div>
                        </div>
                        <div className="ml-1.5 border-l-2 border-dashed border-slate-300 h-3"></div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1 w-3 h-3 rounded-full bg-rose-500 flex-shrink-0"></div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Drop-off</span>
                                <p className="text-sm font-semibold text-slate-900 leading-snug">{booking.drop_location}</p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Total</span>
                            <p className="text-lg font-black text-slate-900">₹{total}</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-0.5">Paid</span>
                            <p className="text-lg font-black text-emerald-700">₹{paid}</p>
                        </div>
                        <div className={`p-3 rounded-xl border text-center ${due > 0 ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"}`}>
                            <span className={`text-[10px] font-bold uppercase tracking-widest block mb-0.5 ${due > 0 ? "text-amber-600" : "text-slate-400"}`}>Due</span>
                            <p className={`text-lg font-black ${due > 0 ? "text-amber-700" : "text-slate-400"}`}>₹{due}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                        {booking.status !== "COMPLETED" && booking.status !== "CANCELLED" && (
                            <button onClick={() => setShowAssignModal(true)} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                                {booking.taxi_assign_status === "ASSIGNED" ? "Update Driver 🚕" : "Dispatch Driver 🚕"}
                            </button>
                        )}
                        {booking.taxi_assign_status === "ASSIGNED" && booking.status !== "IN_PROGRESS" && booking.status !== "COMPLETED" && booking.status !== "CANCELLED" && (
                            <button onClick={handleStartTrip} disabled={saving} className="w-full py-3.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-200">
                                Start Trip ▶️
                            </button>
                        )}
                        {booking.status === "IN_PROGRESS" && (
                            <button onClick={handleCompleteTrip} disabled={saving} className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200">
                                Complete Trip ✅
                            </button>
                        )}

                        {/* WhatsApp Quick Actions */}
                        {booking.assign_taxis?.[0] && (
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
                                <button
                                    onClick={() => {
                                        const phone = (booking.user?.phone || "").replace(/\D/g, "");
                                        const taxi = booking.assign_taxis[0];
                                        const msg = encodeURIComponent(
                                            `🚕 *UrbanCabz Booking Details*\n\n` +
                                            `Booking ID: #${booking.id}\n` +
                                            `🚘 Vehicle: ${taxi.cab_name} (${taxi.cab_number})\n` +
                                            `👤 Driver: ${taxi.driver_name}\n` +
                                            `📞 Driver: ${taxi.driver_number}\n\n` +
                                            `📍 Pickup: ${booking.pickup_location}\n` +
                                            `🏁 Drop: ${booking.drop_location}\n\n` +
                                            `Thank you for choosing UrbanCabz! 🙏`
                                        );
                                        window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank");
                                    }}
                                    className="py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                                >
                                    📱 Client WA
                                </button>
                                <button
                                    onClick={() => {
                                        const taxi = booking.assign_taxis[0];
                                        const phone = (taxi.driver_number || "").replace(/\D/g, "");
                                        const msg = encodeURIComponent(
                                            `🚕 *UrbanCabz Trip Assignment*\n\n` +
                                            `Booking ID: #${booking.id}\n\n` +
                                            `👤 Customer: ${booking.user?.name || "Guest"}\n` +
                                            `📞 Customer: ${booking.user?.phone}\n` +
                                            `📍 Pickup: ${booking.pickup_location}\n` +
                                            `🏁 Drop: ${booking.drop_location}\n` +
                                            `📏 Distance: ${booking.distance_km} km\n\n` +
                                            `Please reach on time and drive safely. 🙏`
                                        );
                                        window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank");
                                    }}
                                    className="py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                                >
                                    📱 Driver WA
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleCancelBooking} className="py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all">Cancel</button>
                            <button onClick={onClose} className="py-2.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all">Minimize</button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Assignment Modal */}
            <AnimatePresence>
                {showAssignModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
                            <div className="p-5 bg-indigo-600 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">Assign Driver 🚕</h3>
                                    <p className="text-xs text-indigo-200 uppercase font-bold tracking-widest mt-0.5">Booking #{booking.id}</p>
                                </div>
                                <button onClick={() => setShowAssignModal(false)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition-all font-bold">✕</button>
                            </div>

                            <form onSubmit={handleAssignSubmit} className="p-5 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs uppercase font-bold text-slate-500 tracking-widest">Driver Name</label>
                                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all placeholder-slate-400" placeholder="Enter name" value={assignForm.driverName} onChange={e => setAssignForm({ ...assignForm, driverName: e.target.value })} required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs uppercase font-bold text-slate-500 tracking-widest">Driver Phone</label>
                                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all placeholder-slate-400" placeholder="Phone number" value={assignForm.driverNumber} onChange={e => setAssignForm({ ...assignForm, driverNumber: e.target.value })} required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs uppercase font-bold text-slate-500 tracking-widest">Vehicle Model</label>
                                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all placeholder-slate-400" placeholder="e.g. Innova" value={assignForm.cabName} onChange={e => setAssignForm({ ...assignForm, cabName: e.target.value })} required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs uppercase font-bold text-slate-500 tracking-widest">Vehicle Plate</label>
                                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all placeholder-slate-400" placeholder="Plate number" value={assignForm.cabNumber} onChange={e => setAssignForm({ ...assignForm, cabNumber: e.target.value })} required />
                                    </div>
                                </div>

                                <button type="submit" disabled={saving} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
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

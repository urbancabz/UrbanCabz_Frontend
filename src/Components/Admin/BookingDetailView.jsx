import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    upsertTaxiAssignment,
    updateBookingStatus,
    completeTrip,
    cancelBooking,
    addBookingNote
} from "../../services/adminService";

export default function BookingDetailView({
    booking,
    onUpdate,
    onClose
}) {
    const [saving, setSaving] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);

    const [cancelReason, setCancelReason] = useState("");
    const [completeForm, setCompleteForm] = useState({
        actual_km: booking?.distance_km || 0,
        toll_charges: 0,
    });
    const [assignForm, setAssignForm] = useState({
        driverName: booking?.assign_taxis?.[0]?.driver_name || "",
        driverNumber: booking?.assign_taxis?.[0]?.driver_number || "",
        cabNumber: booking?.assign_taxis?.[0]?.cab_number || "",
        cabName: booking?.assign_taxis?.[0]?.cab_name || (booking?.car_model || ""),
    });

    const getPaymentBreakdown = (b) => {
        const total = b.total_amount || 0;
        const paid = (b.payments || []).reduce((sum, p) =>
            (p.status === 'SUCCESS' || p.status === 'PAID') ? sum + (p.amount || 0) : sum, 0
        );
        const due = Math.max(0, total - paid);
        return { total, paid, due };
    };

    const { total, paid, due } = getPaymentBreakdown(booking);

    const handleAssignmentSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const result = await upsertTaxiAssignment(booking.id, {
            ...assignForm,
            markAssigned: true
        });
        setSaving(false);
        if (result.success) {
            setShowAssignModal(false);
            onUpdate?.();
        } else {
            alert(result.message || "Failed to save assignment");
        }
    };

    const handleStartTrip = async () => {
        if (!window.confirm("Start this trip?")) return;
        setSaving(true);
        const result = await updateBookingStatus(booking.id, "IN_PROGRESS", "Trip started by admin");
        setSaving(false);
        if (result.success) onUpdate?.();
    };

    const handleCompleteTrip = async () => {
        setSaving(true);
        const result = await completeTrip(booking.id, completeForm);
        setSaving(false);
        setShowCompleteModal(false);
        if (result.success) {
            alert(`Trip completed! Final: ₹${result.data.adjustments.new_total}`);
            onUpdate?.();
        }
    };

    const handleCancelBooking = async () => {
        if (!cancelReason.trim()) return alert("Provide reason");
        setSaving(true);
        const result = await cancelBooking(booking.id, cancelReason);
        setSaving(false);
        setShowCancelModal(false);
        if (result.success) onUpdate?.();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'CANCELLED': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'PAID': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'IN_PROGRESS': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    return (
        <>
            {/* Top Right Floating Detail - Dispatch Command Center Style */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="fixed top-24 right-8 z-[60] w-80 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden"
            >
                <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                    <div>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-0.5">Dispatch Focus</span>
                        <h4 className="text-sm font-black tracking-tight">Booking #{booking.id}</h4>
                    </div>
                    <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold">✕</button>
                </div>

                <div className="p-5 space-y-5">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center text-lg shadow-sm">👤</div>
                            <div className="min-w-0">
                                <p className="text-xs font-black text-slate-900 truncate leading-none mb-1">{booking.user?.name || "Guest User"}</p>
                                <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">{booking.user?.phone}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-3">
                            <div className="flex items-start gap-2.5">
                                <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-emerald-500 ring-4 ring-emerald-100"></div>
                                <p className="text-[10px] font-black text-slate-700 leading-snug line-clamp-2">{booking.pickup_location}</p>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-rose-500 ring-4 ring-rose-100"></div>
                                <p className="text-[10px] font-black text-slate-700 leading-snug line-clamp-2">{booking.drop_location}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Financial Status</span>
                            <div className="flex bg-slate-50 border border-slate-100 rounded text-[10px] font-bold overflow-hidden">
                                <span className="px-2 py-0.5 border-r border-slate-100">Paid: ₹{paid}</span>
                                <span className={`px-2 py-0.5 ${due > 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                                    {due > 0 ? `Due: ₹${due}` : "Settled"}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Status</span>
                            <div className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                                {booking.status === 'PENDING_PAYMENT' && paid > 0 ? 'PARTIAL PAID' : booking.status}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                        {/* Allow dispatch if Paid OR (Pending Payment with actual amount paid) */}
                        {(booking.status === "PAID" || (booking.status === "PENDING_PAYMENT" && paid > 0)) && (
                            <button
                                onClick={() => setShowAssignModal(true)}
                                className="col-span-2 py-3.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                            >
                                Dispatch Driver 🚕
                            </button>
                        )}
                        {(booking.status === "PAID" || (booking.status === "PENDING_PAYMENT" && paid > 0)) && booking.assign_taxis?.[0] && (
                            <button onClick={handleStartTrip} className="col-span-2 py-3.5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
                                Start Expedition
                            </button>
                        )}
                        {booking.status === "IN_PROGRESS" && (
                            <button onClick={() => setShowCompleteModal(true)} className="col-span-2 py-3.5 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                                Complete Ride
                            </button>
                        )}
                        <button
                            onClick={() => setShowCancelModal(true)}
                            className="py-3 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95"
                        >
                            Void Booking
                        </button>
                        <button
                            onClick={onClose}
                            className="py-3 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                        >
                            Minimize
                        </button>

                        {/* Quick WhatsApp Actions (Post-Assignment) */}
                        {booking.assign_taxis?.[0] && (
                            <div className="col-span-2 grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => {
                                        const phone = (booking.user?.phone || "").replace(/\D/g, "");
                                        const taxi = booking.assign_taxis[0];
                                        const msg = encodeURIComponent(
                                            `🚕 *UrbanCabz Booking Confirmed*\n\n` +
                                            `Booking ID: #${booking.id}\n` +
                                            `---------------------\n` +
                                            `🚘 Vehicle: ${taxi.cab_name} (${taxi.cab_number})\n` +
                                            `👤 Driver: ${taxi.driver_name}\n` +
                                            `📞 Driver Contact: ${taxi.driver_number}\n` +
                                            `---------------------\n` +
                                            `📍 Pickup: ${booking.pickup_location}\n` +
                                            `🏁 Drop: ${booking.drop_location}\n` +
                                            `📅 Date: ${new Date(booking.scheduled_at || booking.created_at).toLocaleString()}\n` +
                                            `💰 Fare: ₹${booking.total_amount}\n\n` +
                                            `Thank you for choosing UrbanCabz! 🙏`
                                        );
                                        window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank");
                                    }}
                                    className="py-2.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-1.5"
                                >
                                    <span>📱</span> Client WA
                                </button>
                                <button
                                    onClick={() => {
                                        const taxi = booking.assign_taxis[0];
                                        const phone = (taxi.driver_number || "").replace(/\D/g, "");
                                        const msg = encodeURIComponent(
                                            `🚕 *UrbanCabz New Booking*\n\n` +
                                            `Booking ID: #${booking.id}\n` +
                                            `---------------------\n` +
                                            `👤 Customer: ${booking.user?.name || "Guest"}\n` +
                                            `📞 Customer Contact: ${booking.user?.phone}\n` +
                                            `---------------------\n` +
                                            `📍 Pickup: ${booking.pickup_location}\n` +
                                            `🏁 Drop: ${booking.drop_location}\n` +
                                            `📅 Pickup Time: ${new Date(booking.scheduled_at || booking.created_at).toLocaleString()}\n` +
                                            `📏 Distance: ${booking.distance_km} km\n\n` +
                                            `Please reach the pickup location on time. 🙏`
                                        );
                                        window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank");
                                    }}
                                    className="py-2.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-1.5"
                                >
                                    <span>📱</span> Driver WA
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Modals */}
            <AnimatePresence>
                {showAssignModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
                                <h3 className="text-xl font-black">Dispatch Assignment 🚕</h3>
                                <button onClick={() => setShowAssignModal(false)}>✕</button>
                            </div>
                            <form onSubmit={handleAssignmentSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {['driverName', 'driverNumber', 'cabName', 'cabNumber'].map(field => (
                                        <div key={field} className="space-y-1">
                                            <label className="text-[10px] uppercase font-black text-slate-500">{field.replace(/([A-Z])/g, ' $1')}</label>
                                            <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold" value={assignForm[field]} onChange={e => setAssignForm({ ...assignForm, [field]: e.target.value })} required />
                                        </div>
                                    ))}
                                </div>
                                <button type="submit" disabled={saving} className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20">
                                    Confirm Dispatch
                                </button>

                                {/* WhatsApp Quick Actions */}
                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const phone = (booking.user?.phone || "").replace(/\D/g, "");
                                            const msg = encodeURIComponent(
                                                `🚕 *UrbanCabz Booking Confirmed*\n\n` +
                                                `Booking ID: #${booking.id}\n` +
                                                `---------------------\n` +
                                                `🚘 Vehicle: ${assignForm.cabName} (${assignForm.cabNumber})\n` +
                                                `👤 Driver: ${assignForm.driverName}\n` +
                                                `📞 Driver Contact: ${assignForm.driverNumber}\n` +
                                                `---------------------\n` +
                                                `📍 Pickup: ${booking.pickup_location}\n` +
                                                `🏁 Drop: ${booking.drop_location}\n` +
                                                `📅 Date: ${new Date(booking.scheduled_at || booking.created_at).toLocaleString()}\n` +
                                                `💰 Fare: ₹${booking.total_amount}\n\n` +
                                                `Thank you for choosing UrbanCabz! 🙏`
                                            );
                                            window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank");
                                        }}
                                        className="py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 flex items-center justify-center gap-2"
                                    >
                                        <span>📱</span> WhatsApp to Client
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const phone = (assignForm.driverNumber || "").replace(/\D/g, "");
                                            const msg = encodeURIComponent(
                                                `🚕 *UrbanCabz New Booking*\n\n` +
                                                `Booking ID: #${booking.id}\n` +
                                                `---------------------\n` +
                                                `👤 Customer: ${booking.user?.name || "Guest"}\n` +
                                                `📞 Customer Contact: ${booking.user?.phone}\n` +
                                                `---------------------\n` +
                                                `📍 Pickup: ${booking.pickup_location}\n` +
                                                `🏁 Drop: ${booking.drop_location}\n` +
                                                `📅 Pickup Time: ${new Date(booking.scheduled_at || booking.created_at).toLocaleString()}\n` +
                                                `📏 Distance: ${booking.distance_km} km\n\n` +
                                                `Please reach the pickup location on time. 🙏`
                                            );
                                            window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank");
                                        }}
                                        className="py-3 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 flex items-center justify-center gap-2"
                                    >
                                        <span>📱</span> WhatsApp to Driver
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Cancel Modal */}
                {showCancelModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm">
                            <h3 className="text-lg font-black text-rose-600 mb-4">Cancel Trip?</h3>
                            <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold mb-4" rows={3} placeholder="Reason for cancellation..." value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
                            <div className="flex gap-3">
                                <button onClick={handleCancelBooking} className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase">Confirm</button>
                                <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase">Back</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Complete Modal */}
                {showCompleteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm">
                            <h3 className="text-lg font-black text-indigo-600 mb-4">Complete Trip</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase">Actual Km Run</label>
                                    <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold" value={completeForm.actual_km} onChange={e => setCompleteForm({ ...completeForm, actual_km: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase">Toll / Parking</label>
                                    <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold" value={completeForm.toll_charges} onChange={e => setCompleteForm({ ...completeForm, toll_charges: e.target.value })} />
                                </div>
                                <button onClick={handleCompleteTrip} className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase">Complete & Calculate</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

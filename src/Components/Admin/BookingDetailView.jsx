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
            {/* Top Right Floating Compact Detail (Small Letters) */}
            <motion.div
                initial={{ opacity: 0, y: -20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                className="fixed top-24 right-8 z-[60] w-72 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl p-4 space-y-3"
            >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Selected: #{booking.id}</span>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <div className="text-[10px] space-y-1.5 text-slate-500 font-bold uppercase leading-tight">
                    <p className="text-slate-900 line-clamp-1">👤 {booking.user?.name || "Guest"}</p>
                    <p>📞 {booking.user?.phone}</p>
                    <p className="line-clamp-1">📍 {booking.pickup_location?.split(',')[0]} → {booking.drop_location?.split(',')[0]}</p>
                    <div className="pt-1 flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded border ${getStatusColor(booking.status)}`}>{booking.status}</span>
                        <p className="text-slate-900 text-xs">Due: ₹{due}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                    {booking.status === "PAID" && (
                        <button onClick={() => setShowAssignModal(true)} className="col-span-2 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md">
                            Assign & Dispatch
                        </button>
                    )}
                    {booking.status === "PAID" && booking.assign_taxis?.[0] && (
                        <button onClick={handleStartTrip} className="col-span-2 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-emerald-700">
                            Start Trip
                        </button>
                    )}
                    {booking.status === "IN_PROGRESS" && (
                        <button onClick={() => setShowCompleteModal(true)} className="col-span-2 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-blue-700">
                            Complete Trip
                        </button>
                    )}
                    <button onClick={() => setShowCancelModal(true)} className="py-2 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-rose-50 hover:text-rose-600">Cancel</button>
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

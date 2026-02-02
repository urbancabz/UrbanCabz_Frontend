import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    upsertB2BTaxiAssignment,
    updateB2BBookingStatus,
    completeB2BTrip,
    cancelB2BBooking,
    markB2BBillPaid
} from "../../services/adminService";

export default function B2BBookingDetailView({
    booking,
    onUpdate,
    onClose
}) {
    const [saving, setSaving] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentForm, setPaymentForm] = useState({ mode: "Cash", remarks: "" });

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
        const result = await upsertB2BTaxiAssignment(booking.id, { ...assignForm, markAssigned: true });
        setSaving(false);
        if (result.success) {
            setShowAssignModal(false);
            onUpdate?.();
        } else {
            alert(result.message || "Failed to assign taxi");
        }
    };

    const handleStartTrip = async () => {
        if (!window.confirm("Start this corporate expedition?")) return;
        setSaving(true);
        const result = await updateB2BBookingStatus(booking.id, "IN_PROGRESS");
        setSaving(false);
        if (result.success) onUpdate?.();
    };

    const handleCompleteTrip = async () => {
        const actual_km = prompt("Enter actual KM run for this corporate trip:", booking.distance_km);
        if (actual_km === null) return;

        setSaving(true);
        const result = await completeB2BTrip(booking.id, { actual_km: parseFloat(actual_km) });
        setSaving(false);
        if (result.success) onUpdate?.();
    };

    const handleCancelBooking = async () => {
        const reason = prompt("Reason for corporate cancellation:");
        if (!reason) return;

        setSaving(true);
        const result = await cancelB2BBooking(booking.id, reason);
        setSaving(false);
        if (result.success) onUpdate?.();
    };

    const handleMarkPaid = async (e) => {
        e.preventDefault();
        setSaving(true);
        const result = await markB2BBillPaid(booking.id, paymentForm);
        setSaving(false);
        if (result.success) {
            setShowPaymentModal(false);
            onUpdate?.();
        } else {
            alert(result.message || "Failed to mark paid");
        }
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

    return (
        <>
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="fixed top-24 right-8 z-[60] w-80 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden"
            >
                <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                    <div>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-0.5">Corporate Focus</span>
                        <h4 className="text-sm font-black tracking-tight">Booking #{booking.id}</h4>
                    </div>
                    <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold">✕</button>
                </div>

                <div className="p-5 space-y-5">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center text-lg shadow-sm">🏢</div>
                            <div className="min-w-0">
                                <p className="text-xs font-black text-slate-900 truncate leading-none mb-1">{booking.company?.company_name}</p>
                                <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">{booking.passenger_details?.name} ({booking.passenger_details?.phone})</p>
                            </div>
                        </div>

                        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-3">
                            <div className="flex items-start gap-2.5">
                                <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-emerald-500 ring-4 ring-emerald-100"></div>
                                <p className="text-[10px] font-black text-slate-700 leading-snug line-clamp-2">{booking.pickup_location}</p>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-rose-500 ring-4 ring-rose-100"></div>
                                <p className="text-[10px] font-black text-slate-700 leading-snug line-clamp-2">{booking.drop_location}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fare (Company)</span>
                            <div className="text-[10px] font-black text-slate-900">₹{booking.total_amount}</div>
                        </div>
                        <div className="text-right">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span>
                            <div className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                                {booking.status}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                        {booking.status === "CONFIRMED" && (
                            <button onClick={() => setShowAssignModal(true)} className="col-span-2 py-3.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                                {booking.taxi_assign_status === "ASSIGNED" ? "Update Driver 🚕" : "Dispatch Driver 🚕"}
                            </button>
                        )}
                        {booking.taxi_assign_status === "ASSIGNED" && booking.status === "CONFIRMED" && (
                            <button onClick={handleStartTrip} disabled={saving} className="col-span-2 py-3.5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
                                Start Expedition
                            </button>
                        )}
                        {booking.status === "IN_PROGRESS" && (
                            <button onClick={handleCompleteTrip} disabled={saving} className="col-span-2 py-3.5 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                                Complete Entry
                            </button>
                        )}
                        {booking.status === "COMPLETED" && booking.payment_status !== "PAID" && (
                            <button onClick={() => setShowPaymentModal(true)} className="col-span-2 py-3.5 bg-amber-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-amber-600 shadow-lg shadow-amber-500/20 active:scale-95">
                                Financial Resolution 💰
                            </button>
                        )}
                        <button onClick={handleCancelBooking} className="py-3 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all">Cancel</button>
                        <button onClick={onClose} className="py-3 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Minimize</button>

                        {/* WhatsApp Quick Actions (Post-Assignment) */}
                        {booking.assignments?.[0] && (
                            <div className="col-span-2 grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => {
                                        const phone = (booking.passenger_details?.phone || "").replace(/\D/g, "");
                                        const taxi = booking.assignments[0];
                                        const msg = encodeURIComponent(
                                            `🏢 *UrbanCabz Corporate Booking*\n\n` +
                                            `Booking ID: #${booking.id}\n` +
                                            `Company: ${booking.company?.company_name}\n` +
                                            `---------------------\n` +
                                            `🚘 Vehicle: ${taxi.cab_name} (${taxi.cab_number})\n` +
                                            `👤 Driver: ${taxi.driver_name}\n` +
                                            `📞 Driver Contact: ${taxi.driver_number}\n` +
                                            `---------------------\n` +
                                            `📍 Pickup: ${booking.pickup_location}\n` +
                                            `🏁 Drop: ${booking.drop_location}\n` +
                                            `📅 Pickup Time: ${new Date(booking.scheduled_at || booking.created_at).toLocaleString()}\n\n` +
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
                                        const taxi = booking.assignments[0];
                                        const phone = (taxi.driver_number || "").replace(/\D/g, "");
                                        const msg = encodeURIComponent(
                                            `🏢 *UrbanCabz Corporate Pickup*\n\n` +
                                            `Booking ID: #${booking.id}\n` +
                                            `Company: ${booking.company?.company_name}\n` +
                                            `---------------------\n` +
                                            `👤 Passenger: ${booking.passenger_details?.name || "Employee"}\n` +
                                            `📞 Passenger Contact: ${booking.passenger_details?.phone}\n` +
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

            {/* Assignment Modal */}
            <AnimatePresence>
                {showAssignModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
                            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight">Assign Dispatch 🚕</h3>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Corporate Dispatch</p>
                                </div>
                                <button onClick={() => setShowAssignModal(false)} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold">✕</button>
                            </div>

                            <form onSubmit={handleAssignSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.1em]">Driver Name</label>
                                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" placeholder="Enter name" value={assignForm.driverName} onChange={e => setAssignForm({ ...assignForm, driverName: e.target.value })} required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.1em]">Driver Phone</label>
                                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" placeholder="Contact number" value={assignForm.driverNumber} onChange={e => setAssignForm({ ...assignForm, driverNumber: e.target.value })} required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.1em]">Vehicle Model</label>
                                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" placeholder="e.g. Innova" value={assignForm.cabName} onChange={e => setAssignForm({ ...assignForm, cabName: e.target.value })} required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.1em]">Vehicle Plate</label>
                                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" placeholder="Plate number" value={assignForm.cabNumber} onChange={e => setAssignForm({ ...assignForm, cabNumber: e.target.value })} required />
                                    </div>
                                </div>

                                <button type="submit" disabled={saving} className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all">
                                    {saving ? "Processing..." : "Assign & Confirm"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Payment Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200">
                            <div className="p-4 bg-amber-500 text-white flex justify-between items-center">
                                <h3 className="text-sm font-black uppercase tracking-widest">Financial Resolution</h3>
                                <button onClick={() => setShowPaymentModal(false)}>✕</button>
                            </div>
                            <form onSubmit={handleMarkPaid} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-slate-500">Method</label>
                                    <select value={paymentForm.mode} onChange={e => setPaymentForm({ ...paymentForm, mode: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500/20">
                                        <option value="Cash">Cash</option>
                                        <option value="Bank Transfer">NEFT/RTGS</option>
                                        <option value="UPI">UPI / Digital</option>
                                        <option value="Cheque">Corporate Cheque</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-slate-500">Transaction Notes</label>
                                    <textarea value={paymentForm.remarks} onChange={e => setPaymentForm({ ...paymentForm, remarks: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold min-h-[80px] outline-none focus:ring-2 focus:ring-amber-500/20" />
                                </div>
                                <button type="submit" disabled={saving} className="w-full py-4 bg-amber-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-500/20">
                                    {saving ? "Saving..." : "Clear Outstanding"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

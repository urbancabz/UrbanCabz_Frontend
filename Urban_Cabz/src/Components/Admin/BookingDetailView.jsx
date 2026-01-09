import React, { useState, useMemo } from "react";
import {
    upsertTaxiAssignment,
    updateBookingStatus,
    completeTrip,
    cancelBooking,
    addBookingNote
} from "../../services/adminService";

export default function BookingDetailView({
    booking,
    onUpdate
}) {
    const [activeTab, setActiveTab] = useState("OVERVIEW"); // OVERVIEW, ASSIGN, NOTES
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [completeForm, setCompleteForm] = useState({
        actual_km: booking?.distance_km || 0,
        toll_charges: 0,
    });
    const [form, setForm] = useState({
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
            ...form,
            markAssigned: true
        });
        setSaving(false);
        if (result.success && onUpdate) {
            onUpdate();
        } else {
            alert(result.message || "Failed to save assignment");
        }
    };

    const handleStartTrip = async () => {
        if (!window.confirm("Start this trip?")) return;
        setSaving(true);
        const result = await updateBookingStatus(booking.id, "IN_PROGRESS", "Trip started by admin");
        setSaving(false);
        if (result.success && onUpdate) {
            onUpdate();
        } else {
            alert(result.message || "Failed to start trip");
        }
    };

    const handleCompleteTrip = async () => {
        setSaving(true);
        const result = await completeTrip(booking.id, completeForm);
        setSaving(false);
        setShowCompleteModal(false);
        if (result.success && onUpdate) {
            alert(`Trip completed! Total: ₹${result.data.adjustments.new_total}`);
            onUpdate();
        } else {
            alert(result.message || "Failed to complete trip");
        }
    };

    const handleCancelBooking = async () => {
        if (!cancelReason.trim()) {
            alert("Please provide a cancellation reason");
            return;
        }
        setSaving(true);
        const result = await cancelBooking(booking.id, cancelReason);
        setSaving(false);
        setShowCancelModal(false);
        if (result.success && onUpdate) {
            onUpdate();
        } else {
            alert(result.message || "Failed to cancel booking");
        }
    };

    const handleSaveNote = async () => {
        if (!note.trim()) return;
        setSaving(true);
        const result = await addBookingNote(booking.id, note);
        setSaving(false);
        if (result.success) {
            setNote("");
            alert("Note saved!");
        } else {
            alert(result.message || "Failed to save note");
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    const whatsappText = useMemo(() => {
        if (!booking) return "";
        const lines = [
            `*UrbanCabz Booking Confirmation* 🚖`,
            `Booking ID: ${booking.id}`,
            `Pickup: ${new Date(booking.created_at).toLocaleString()}`, // Simplification for now, ideal to use scheduled_at
            `From: ${booking.pickup_location}`,
            `To: ${booking.drop_location}`,
            `------------------`,
            `Vehicle: ${form.cabName} (${form.cabNumber})`,
            `Driver: ${form.driverName} (${form.driverNumber})`,
            `------------------`,
            `Thank you for choosing UrbanCabz!`
        ];
        return lines.join("\n");
    }, [booking, form]);

    const driverText = useMemo(() => {
        if (!booking) return "";
        const lines = [
            `*New Trip Assignment* 🚨`,
            `Customer: ${booking.user?.name} (${booking.user?.phone})`,
            `From: ${booking.pickup_location}`,
            `To: ${booking.drop_location}`,
            `Fare to Collect: ₹${due > 0 ? due : 0}`, // Focus on what driver needs to collect
        ];
        return lines.join("\n");
    }, [booking, due]);

    return (
        <section className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm relative">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-mono">
                            #{booking.id}
                        </span>
                        {booking.car_model && (
                            <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                                🚕 {booking.car_model}
                            </span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${booking.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                            booking.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                                'bg-amber-100 text-amber-700'
                            }`}>
                            {booking.status}
                        </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Trip Details</h2>
                </div>

                {/* Manual Controls */}
                <div className="flex gap-2">
                    {booking.status === 'PAID' && (
                        <button
                            onClick={handleStartTrip}
                            disabled={saving}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-50"
                        >
                            Start Trip
                        </button>
                    )}
                    {booking.status === 'IN_PROGRESS' && (
                        <button
                            onClick={() => setShowCompleteModal(true)}
                            disabled={saving}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-50"
                        >
                            Complete Trip
                        </button>
                    )}
                    {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                        <button
                            onClick={() => setShowCancelModal(true)}
                            disabled={saving}
                            className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* Overview / Tabs */}
            <div className="flex border-b border-slate-200 bg-white">
                {['OVERVIEW', 'ASSIGNMENT', 'NOTES'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === tab ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        {tab}
                    </button>
                ))
                }
            </div >

            <div className="flex-1 overflow-y-auto p-5 space-y-6">

                {activeTab === 'OVERVIEW' && (
                    <div className="space-y-6">
                        {/* Consumer Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                                <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Customer</p>
                                <p className="text-sm font-semibold text-slate-900">{booking.user?.name || "Guest"}</p>
                                <p className="text-xs text-slate-500">{booking.user?.phone}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                                <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Route</p>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-700 truncate" title={booking.pickup_location}>🟢 {booking.pickup_location}</span>
                                    <span className="text-xs text-slate-700 truncate" title={booking.drop_location}>🔴 {booking.drop_location}</span>
                                </div>
                            </div>
                            {booking.car_model && (
                                <div className="col-span-2 p-3 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase text-indigo-500 font-bold mb-0.5">Requested Vehicle</p>
                                        <p className="text-sm font-bold text-indigo-900">{booking.car_model}</p>
                                    </div>
                                    <div className="text-2xl">🚖</div>
                                </div>
                            )}
                        </div>

                        {/* Financials */}
                        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">Payment Ledger</h3>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-600">Total Fare Base</span>
                                <span className="text-sm font-mono text-slate-800">₹{total}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-emerald-600">Paid Online</span>
                                <span className="text-sm font-mono text-emerald-600">- ₹{paid}</span>
                            </div>
                            <div className="h-px bg-slate-200 my-2" />
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-900">Balance Due</span>
                                <span className={`text-lg font-mono font-bold ${due > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                                    ₹{due}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'ASSIGNMENT' && (
                    <div className="space-y-6">
                        <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-500">Driver Name</label>
                                    <input
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        value={form.driverName}
                                        onChange={e => setForm({ ...form, driverName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-500">Driver Phone</label>
                                    <input
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        value={form.driverNumber}
                                        onChange={e => setForm({ ...form, driverNumber: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-500">Cab Model</label>
                                    <input
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        value={form.cabName}
                                        onChange={e => setForm({ ...form, cabName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-500">Cab Number</label>
                                    <input
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        value={form.cabNumber}
                                        onChange={e => setForm({ ...form, cabNumber: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-all disabled:opacity-50"
                            >
                                {saving ? "Saving Assignment..." : "Update Assignment & Notify"}
                            </button>
                        </form>

                        <div className="h-px bg-slate-200" />

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold uppercase text-slate-500">Communication Center</h4>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => copyToClipboard(whatsappText)}
                                    className="p-3 rounded-lg border border-dashed border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all text-left"
                                >
                                    <span className="block mb-1 text-[10px] opacity-70 uppercase">Customer Msg</span>
                                    Copy WhatsApp Confirm
                                </button>
                                <button
                                    onClick={() => copyToClipboard(driverText)}
                                    className="p-3 rounded-lg border border-dashed border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all text-left"
                                >
                                    <span className="block mb-1 text-[10px] opacity-70 uppercase">Driver Msg</span>
                                    Copy Assignment Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'NOTES' && (
                    <div className="flex flex-col h-full">
                        <textarea
                            className="flex-1 bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                            placeholder="Add internal notes about this trip (e.g., 'Customer requested child seat', 'Payment collected in cash')..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            rows={8}
                        />
                        <button className="mt-3 self-end px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all">
                            Save Note
                        </button>
                    </div>
                )}

            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-rose-50 border-b border-rose-100 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-rose-800 uppercase tracking-wide">Confirm Cancellation</h3>
                            <button onClick={() => setShowCancelModal(false)} className="text-rose-400 hover:text-rose-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <p className="text-sm text-slate-600">
                                Are you sure you want to cancel this booking? This action cannot be undone and will be logged.
                            </p>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Cancellation Reason</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm text-slate-900 focus:border-rose-500 outline-none resize-none"
                                    rows={3}
                                    placeholder="e.g., Customer requested, Driver unavailable..."
                                    value={cancelReason}
                                    onChange={e => setCancelReason(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleCancelBooking}
                                    disabled={saving}
                                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-sm transition-all"
                                >
                                    {saving ? "Cancelling..." : "Confirm Cancel"}
                                </button>
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm transition-all"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Complete Trip Modal */}
            {
                showCompleteModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wide">Complete Trip</h3>
                                <button onClick={() => setShowCompleteModal(false)} className="text-indigo-400 hover:text-indigo-600">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-4 space-y-3">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Actual Km Run</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900 focus:border-indigo-500 outline-none"
                                        value={completeForm.actual_km}
                                        onChange={e => setCompleteForm({ ...completeForm, actual_km: e.target.value })}
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        Initial Estimate: {booking.distance_km || 0} km. Extra fare will be added for excess.
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Toll Charges</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900 focus:border-indigo-500 outline-none"
                                        value={completeForm.toll_charges}
                                        onChange={e => setCompleteForm({ ...completeForm, toll_charges: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleCompleteTrip}
                                        disabled={saving}
                                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm transition-all"
                                    >
                                        {saving ? "Completing..." : "Complete & Calculate Fare"}
                                    </button>
                                    <button
                                        onClick={() => setShowCompleteModal(false)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm transition-all"
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </section >
    );
}

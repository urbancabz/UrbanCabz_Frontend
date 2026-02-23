import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    fetchDrivers,
    createDriver,
    updateDriver,
    deleteDriver,
} from "../../services/driverService";

let cachedDrivers = null;

export default function DriverList() {
    const [drivers, setDrivers] = useState(cachedDrivers ?? []);
    const [loading, setLoading] = useState(!cachedDrivers);
    const [editingDriver, setEditingDriver] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const [form, setForm] = useState({
        name: "",
        phone: "",
        license_no: "",
        is_active: true,
    });

    useEffect(() => {
        if (!cachedDrivers) {
            loadDrivers();
        }
    }, []);

    const loadDrivers = async (force = false) => {
        setLoading(true);
        const res = await fetchDrivers();
        if (res.success) {
            const fetchedDrivers = res.data?.drivers ?? [];
            cachedDrivers = fetchedDrivers;
            setDrivers(fetchedDrivers);
        }
        setLoading(false);
    };

    const resetForm = () => {
        setForm({
            name: "",
            phone: "",
            license_no: "",
            is_active: true,
        });
        setEditingDriver(null);
        setShowForm(false);
    };

    const handleEdit = (driver) => {
        setForm({
            name: driver.name,
            phone: driver.phone,
            license_no: driver.license_no || "",
            is_active: driver.is_active,
        });
        setEditingDriver(driver);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        let res;
        if (editingDriver) {
            res = await updateDriver(editingDriver.id, form);
        } else {
            res = await createDriver(form);
        }

        if (res.success) {
            setMessage(res.message || "Saved successfully!");
            await loadDrivers();
            resetForm();
        } else {
            setMessage(res.message || "Failed to save");
        }
        setSaving(false);
    };

    const handleDelete = async (driver) => {
        if (!window.confirm(`Deactivate driver "${driver.name}"?`)) return;
        const res = await deleteDriver(driver.id);
        if (res.success) {
            setMessage("Driver deactivated");
            await loadDrivers();
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Driver Registry</h2>
                        <p className="text-sm text-slate-500">
                            Manage authorized drivers and their contact info
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            cachedDrivers = null;
                            loadDrivers(true);
                        }}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 font-bold rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all"
                >
                    + Register Driver
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-sm">
                    {message}
                </div>
            )}

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
                    >
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            {editingDriver ? "Edit Driver Info" : "Register New Driver"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        placeholder="e.g., Rajesh Kumar"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 outline-none"
                                        placeholder="e.g., +91 9876543210"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                        License Number (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={form.license_no}
                                        onChange={(e) => setForm({ ...form, license_no: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 outline-none"
                                        placeholder="e.g., DL-1234567890"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={form.is_active}
                                            onChange={(e) =>
                                                setForm({ ...form, is_active: e.target.checked })
                                            }
                                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                        />
                                        <label
                                            htmlFor="is_active"
                                            className="text-sm text-slate-700"
                                        >
                                            Active Status
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-all disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingDriver
                                            ? "Update Driver"
                                            : "Register Driver"}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Driver List */}
            {loading ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-300 border-t-indigo-500" />
                </div>
            ) : drivers.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-white border border-dashed border-slate-300 rounded-xl">
                    No drivers registered yet. Start by adding one.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {drivers.map((driver) => (
                        <motion.div
                            key={driver.id}
                            layout
                            className={`bg-white border rounded-xl p-4 shadow-sm transition-all ${driver.is_active
                                ? "border-slate-200 hover:shadow-md"
                                : "border-slate-100 opacity-60"
                                }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                {!driver.is_active && (
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-600 font-bold">
                                        INACTIVE
                                    </span>
                                )}
                            </div>

                            <h4 className="text-lg font-bold text-slate-900 mb-1">
                                {driver.name}
                            </h4>
                            <p className="text-sm font-medium text-indigo-600 mb-1">
                                {driver.phone}
                            </p>
                            {driver.license_no && (
                                <p className="text-xs text-slate-500 mb-3">
                                    Lic: {driver.license_no}
                                </p>
                            )}

                            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 mt-3">
                                <button
                                    onClick={() => handleEdit(driver)}
                                    className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-all"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(driver)}
                                    className="text-xs px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-bold transition-all"
                                >
                                    Deactivate
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

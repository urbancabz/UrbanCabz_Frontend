import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    createFleetVehicle,
    updateFleetVehicle,
    deleteFleetVehicle,
    uploadFleetImage,
} from "../../services/fleetService";

const CATEGORIES = ["SEDAN", "SUV", "LUXURY", "TRAVELER"];

export default function FleetManager({ fleet = [], onUpdate }) {
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const [form, setForm] = useState({
        name: "",
        seats: 4,
        base_price_per_km: 12,
        category: "SEDAN",
        description: "",
        image_url: "",
        is_active: true,
    });

    const resetForm = () => {
        setForm({
            name: "",
            seats: 4,
            base_price_per_km: 12,
            category: "SEDAN",
            description: "",
            image_url: "",
            is_active: true,
        });
        setEditingVehicle(null);
        setShowForm(false);
        setImageFile(null);
        setImagePreview("");
    };

    const handleEdit = (vehicle) => {
        setForm({
            name: vehicle.name,
            seats: vehicle.seats,
            base_price_per_km: vehicle.base_price_per_km,
            category: vehicle.category,
            description: vehicle.description || "",
            image_url: vehicle.image_url || "",
            is_active: vehicle.is_active,
        });
        setEditingVehicle(vehicle);
        setShowForm(true);
        setImagePreview(vehicle.image_url || "");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        let res;
        if (editingVehicle) {
            res = await updateFleetVehicle(editingVehicle.id, form);
        } else {
            res = await createFleetVehicle(form);
        }

        if (res.success) {
            setMessage(res.message || "Saved successfully!");
            if (onUpdate) onUpdate();
            resetForm();
        } else {
            setMessage(res.message || "Failed to save");
        }
        setSaving(false);
    };

    const handleDelete = async (vehicle) => {
        if (!window.confirm(`Deactivate "${vehicle.name}"?`)) return;
        const res = await deleteFleetVehicle(vehicle.id);
        if (res.success) {
            setMessage("Vehicle deactivated");
            if (onUpdate) onUpdate();
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Fleet Manager</h2>
                        <p className="text-sm text-slate-500">
                            Manage vehicle models and pricing
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                >
                    + Add Vehicle
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
                            {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                        Vehicle Name
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        placeholder="e.g., Innova Crysta"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={form.category}
                                        onChange={(e) =>
                                            setForm({ ...form, category: e.target.value })
                                        }
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 outline-none"
                                    >
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                        Seats
                                    </label>
                                    <input
                                        type="number"
                                        value={form.seats}
                                        onChange={(e) =>
                                            setForm({ ...form, seats: parseInt(e.target.value) })
                                        }
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 outline-none"
                                        min={1}
                                        max={12}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                        Price per KM (₹)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={form.base_price_per_km}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                base_price_per_km: parseFloat(e.target.value),
                                            })
                                        }
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 outline-none"
                                        min={1}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                    Description (optional)
                                </label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({ ...form, description: e.target.value })
                                    }
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 outline-none"
                                    placeholder="e.g., Premium 7-seater SUV with AC"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                    Vehicle Image (optional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setImageFile(file);
                                            setImagePreview(URL.createObjectURL(file));
                                            setUploading(true);
                                            const res = await uploadFleetImage(file);
                                            setUploading(false);
                                            if (res.success) {
                                                setForm({ ...form, image_url: res.data.image_url });
                                            } else {
                                                setMessage(res.message || "Failed to upload image");
                                            }
                                        }
                                    }}
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                                {uploading && <p className="text-xs text-indigo-600 mt-1">Uploading...</p>}
                                {imagePreview && (
                                    <img src={imagePreview} alt="Preview" className="mt-2 h-20 w-auto rounded-lg object-cover border border-slate-200" />
                                )}
                            </div>
                            <div className="flex items-center gap-2">
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
                                    Active (visible to customers)
                                </label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={saving || uploading}
                                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-all disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : uploading
                                            ? "Uploading Image..."
                                            : editingVehicle
                                                ? "Update Vehicle"
                                                : "Add Vehicle"}
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

            {/* Vehicle List */}
            {fleet.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    No vehicles in fleet. Add your first vehicle above.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fleet.filter(v => v.is_active).map((vehicle) => (
                        <motion.div
                            key={vehicle.id}
                            layout
                            className={`bg-white border rounded-xl p-4 shadow-sm transition-all ${vehicle.is_active
                                ? "border-slate-200 hover:shadow-md"
                                : "border-slate-100 opacity-60"
                                }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <span
                                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${vehicle.category === "LUXURY"
                                            ? "bg-amber-100 text-amber-700"
                                            : vehicle.category === "SUV"
                                                ? "bg-blue-100 text-blue-700"
                                                : vehicle.category === "TRAVELER"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-slate-100 text-slate-600"
                                            }`}
                                    >
                                        {vehicle.category}
                                    </span>
                                </div>
                                {!vehicle.is_active && (
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-600 font-bold">
                                        INACTIVE
                                    </span>
                                )}
                            </div>

                            <h4 className="text-lg font-bold text-slate-900 mb-1">
                                {vehicle.name}
                            </h4>
                            {vehicle.image_url && (
                                <img
                                    src={vehicle.image_url}
                                    alt={vehicle.name}
                                    className="w-full h-24 object-cover rounded-lg mb-3"
                                />
                            )}
                            {vehicle.description && (
                                <p className="text-xs text-slate-500 mb-3">
                                    {vehicle.description}
                                </p>
                            )}

                            <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-3 mt-3">
                                <div className="flex gap-4">
                                    <span className="text-slate-600">
                                        <strong className="text-slate-900">{vehicle.seats}</strong>{" "}
                                        Seats
                                    </span>
                                    <span className="text-slate-600">
                                        <strong className="text-indigo-600">
                                            ₹{vehicle.base_price_per_km}
                                        </strong>
                                        /km
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(vehicle)}
                                        className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-all"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(vehicle)}
                                        className="text-xs px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded transition-all"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

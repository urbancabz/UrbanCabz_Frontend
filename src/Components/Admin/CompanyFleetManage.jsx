import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api/v1";

export default function CompanyFleetManage({ company, onClose }) {
    const [assignedFleet, setAssignedFleet] = useState([]);
    const [allFleet, setAllFleet] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form state for adding/editing
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [customPrice, setCustomPrice] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [company.id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');

            const [assignedRes, allRes] = await Promise.all([
                fetch(`${API_BASE_URL}/b2b/companies/${company.id}/fleet`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE_URL}/fleet`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const assignedData = await assignedRes.json();
            const allData = await allRes.json();

            if (assignedData.success) setAssignedFleet(assignedData.data);
            if (allData.success) setAllFleet(allData.data.vehicles);

        } catch (error) {
            console.error('Error fetching fleet data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/b2b/companies/${company.id}/fleet`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fleet_vehicle_id: parseInt(selectedVehicle),
                    custom_price_per_km: parseFloat(customPrice)
                })
            });

            const data = await response.json();
            if (data.success) {
                setShowAddModal(false);
                fetchData();
                setSelectedVehicle('');
                setCustomPrice('');
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error saving fleet:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (fleetId) => {
        if (!window.confirm("Remove this vehicle from company fleet?")) return;
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/b2b/fleet-assignment/${fleetId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                fetchData();
            }
        } catch (error) {
            console.error('Error deleting fleet assignment:', error);
        }
    };

    const openEdit = (item) => {
        setSelectedVehicle(item.fleet_vehicle_id.toString());
        setCustomPrice(item.custom_price_per_km.toString());
        setShowAddModal(true);
    };

    const getBasePrice = (id) => {
        const v = allFleet.find(v => v.id === parseInt(id));
        return v ? v.base_price_per_km : 0;
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Fleet Pricing: {company.company_name}</h2>
                        <p className="text-slate-500 text-sm font-medium">Configure vehicle models and custom rates</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 CustomScrollbar">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Assigned Fleet</h3>
                        <button
                            onClick={() => {
                                setSelectedVehicle('');
                                setCustomPrice('');
                                setShowAddModal(true);
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
                        >
                            <span>+ Assign New Vehicle</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                            <p className="text-slate-400 font-bold">Checking Fleet compatibility...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {assignedFleet.length === 0 ? (
                                <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl">
                                    <span className="text-4xl block mb-4">🚕</span>
                                    <p className="text-slate-400 font-bold">No vehicles assigned to this partner yet.</p>
                                </div>
                            ) : (
                                assignedFleet.map(item => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:border-indigo-500/20 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-16 bg-white rounded-xl overflow-hidden border border-slate-200">
                                                <img
                                                    src={item.vehicle.image_url || "/Dzire.avif"}
                                                    className="w-full h-full object-cover"
                                                    alt={item.vehicle.name}
                                                    onError={(e) => e.target.src = "/Dzire.avif"}
                                                />
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900">{item.vehicle.name}</div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                                                    {item.vehicle.category} • {item.vehicle.seats} Seats
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right mr-2">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Custom Rate</div>
                                                <div className="text-xl font-black text-indigo-600">₹{item.custom_price_per_km}<span className="text-[10px] text-slate-400">/km</span></div>
                                            </div>
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEdit(item)}
                                                    className="p-2 bg-white text-indigo-600 rounded-lg shadow-sm border border-slate-200 hover:bg-indigo-50"
                                                    title="Edit Price"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 bg-white text-rose-600 rounded-lg shadow-sm border border-slate-200 hover:bg-rose-50"
                                                    title="Remove"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Add/Edit Modal Overlay */}
                <AnimatePresence>
                    {showAddModal && (
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-[70] p-4" onClick={() => setShowAddModal(false)}>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100"
                                onClick={e => e.stopPropagation()}
                            >
                                <h3 className="text-xl font-black text-slate-900 mb-6">
                                    {assignedFleet.some(f => f.fleet_vehicle_id === parseInt(selectedVehicle)) ? 'Update Rate' : 'Assign Vehicle'}
                                </h3>

                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vehicle Model</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            value={selectedVehicle}
                                            onChange={(e) => {
                                                setSelectedVehicle(e.target.value);
                                                const base = getBasePrice(e.target.value);
                                                if (base && !customPrice) setCustomPrice(base.toString());
                                            }}
                                            required
                                        >
                                            <option value="">-- Choose Vehicle --</option>
                                            {allFleet.map(v => (
                                                <option key={v.id} value={v.id}>
                                                    {v.name} (Base: ₹{v.base_price_per_km})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Custom Rate (₹ per KM)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            value={customPrice}
                                            onChange={e => setCustomPrice(e.target.value)}
                                            placeholder="e.g. 12.5"
                                            required
                                        />
                                        <p className="text-[10px] text-slate-400 font-bold italic">Default rate applied unless overridden here.</p>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddModal(false)}
                                            className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex-[2] py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                                        >
                                            {saving ? 'Updating...' : 'Confirm Assignment'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

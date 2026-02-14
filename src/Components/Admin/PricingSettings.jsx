import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function PricingSettings() {
    const [settings, setSettings] = useState({
        min_km_threshold: 100,
        min_km_airport_apply: false,
        min_km_oneway_apply: false,
        min_km_roundtrip_apply: false,
        service_airport_enabled: true,
        service_oneway_enabled: true,
        service_roundtrip_enabled: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api/v1";

    useEffect(() => {
        loadSettings();
    }, []);

    const getAuthToken = () => localStorage.getItem("adminToken");

    const loadSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/pricing`, {
                headers: { Authorization: `Bearer ${getAuthToken()}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                setSettings({
                    min_km_threshold: data.data.min_km_threshold,
                    min_km_airport_apply: data.data.min_km_airport_apply,
                    min_km_oneway_apply: data.data.min_km_oneway_apply,
                    min_km_roundtrip_apply: data.data.min_km_roundtrip_apply,
                    service_airport_enabled: data.data.service_airport_enabled ?? true,
                    service_oneway_enabled: data.data.service_oneway_enabled ?? true,
                    service_roundtrip_enabled: data.data.service_roundtrip_enabled ?? true
                });
            }
        } catch (error) {
            console.error("Failed to load settings:", error);
            setMessage("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            const res = await fetch(`${API_BASE_URL}/pricing`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify(settings)
            });
            const data = await res.json();
            if (data.success) {
                setMessage("Settings updated successfully!");
            } else {
                setMessage(data.message || "Failed to update settings");
            }
        } catch (error) {
            console.error("Failed to save settings:", error);
            setMessage("Error saving settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Global Pricing Settings</h2>
                    <p className="text-sm text-slate-500">Configure system-wide distance rules</p>
                </div>
            </div>

            {message && (
                <div className={`px-4 py-2 rounded-lg text-sm ${message.includes("success")
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                    {message}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Minimum Base Distance */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">
                            Minimum Distance Logic
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                    Base Distance Threshold (km)
                                </label>
                                <input
                                    type="number"
                                    value={settings.min_km_threshold}
                                    onChange={(e) => setSettings({ ...settings, min_km_threshold: parseFloat(e.target.value) })}
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 outline-none"
                                    min={0}
                                />
                                <p className="text-[10px] text-slate-400 mt-1">
                                    The "Min 300km/day" rule will ONLY apply if the trip distance is GREATER than this value.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Toggles */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">
                            Rule Applicability
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div>
                                    <h4 className="font-bold text-slate-700 text-sm">Airport Transfers</h4>
                                    <p className="text-xs text-slate-500">Apply 300km min charge for airport trips &gt; threshold</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.min_km_airport_apply}
                                        onChange={(e) => setSettings({ ...settings, min_km_airport_apply: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div>
                                    <h4 className="font-bold text-slate-700 text-sm">One-Way Drops</h4>
                                    <p className="text-xs text-slate-500">Apply 300km min charge for one-way trips &gt; threshold</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.min_km_oneway_apply}
                                        onChange={(e) => setSettings({ ...settings, min_km_oneway_apply: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div>
                                    <h4 className="font-bold text-slate-700 text-sm">Round Trips</h4>
                                    <p className="text-xs text-slate-500">Apply 300km/day min charge for round trips &gt; threshold</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.min_km_roundtrip_apply}
                                        onChange={(e) => setSettings({ ...settings, min_km_roundtrip_apply: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Service Visibility */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">
                            Service Visibility
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Enable or disable services globally. Disabled services will be hidden from the website.
                        </p>
                        <div className="space-y-3">
                            <div className={`flex items-center justify-between p-3 rounded-lg border ${!settings.service_airport_enabled ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
                                <div>
                                    <h4 className="font-bold text-slate-700 text-sm">Airport Transfer</h4>
                                    <p className="text-xs text-slate-500">Show airport transfer option on booking forms</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.service_airport_enabled}
                                        onChange={(e) => setSettings({ ...settings, service_airport_enabled: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>

                            <div className={`flex items-center justify-between p-3 rounded-lg border ${!settings.service_oneway_enabled ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
                                <div>
                                    <h4 className="font-bold text-slate-700 text-sm">One-Way</h4>
                                    <p className="text-xs text-slate-500">Show one-way trip option on booking forms</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.service_oneway_enabled}
                                        onChange={(e) => setSettings({ ...settings, service_oneway_enabled: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>

                            <div className={`flex items-center justify-between p-3 rounded-lg border ${!settings.service_roundtrip_enabled ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
                                <div>
                                    <h4 className="font-bold text-slate-700 text-sm">Round Trip</h4>
                                    <p className="text-xs text-slate-500">Show round trip option on booking forms</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.service_roundtrip_enabled}
                                        onChange={(e) => setSettings({ ...settings, service_roundtrip_enabled: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition-all disabled:opacity-50"
                        >
                            {saving ? "Saving Changes..." : "Save Settings"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

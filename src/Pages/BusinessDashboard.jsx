import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import BusinessBookings from "../Components/Business/BusinessBookings";
import BusinessProfile from "../Components/Business/BusinessProfile";
import { getCompanyProfile } from "../services/authService";
import {
    BuildingOfficeIcon,
    MapIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    ChevronRightIcon
} from "@heroicons/react/24/outline";

export default function BusinessDashboard() {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState("bookings"); // "bookings" or "profile"
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const result = await getCompanyProfile();
            if (result.success) {
                setCompany(result.data);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const menuItems = [
        { id: "bookings", label: "Bookings", icon: MapIcon },
        { id: "profile", label: "Profile", icon: UserCircleIcon },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-black border-r border-white/10 flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                        <BuildingOfficeIcon className="h-6 w-6 text-yellow-400" />
                        <h1 className="text-xl font-bold tracking-tight">Business</h1>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{company?.company_name || "Urban Cabz Partner"}</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => window.location.href = '/business/book-ride'}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-yellow-400 text-black font-bold shadow-lg shadow-yellow-400/20 mb-6 hover:bg-yellow-300 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <MapIcon className="h-5 w-5" />
                            <span>Book a Ride</span>
                        </div>
                        <ChevronRightIcon className="h-4 w-4" />
                    </button>

                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeTab === item.id
                                ? "bg-yellow-400 text-black font-semibold shadow-lg shadow-yellow-400/10"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </div>
                            {activeTab === item.id && <ChevronRightIcon className="h-4 w-4" />}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 md:p-10 max-w-6xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === "bookings" && <BusinessBookings company={company} />}
                            {activeTab === "profile" && <BusinessProfile company={company} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

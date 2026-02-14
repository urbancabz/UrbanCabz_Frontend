import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import BusinessBookings from "../Components/Business/BusinessBookings";
import BusinessProfile from "../Components/Business/BusinessProfile";
import BusinessPayments from "../Components/Business/BusinessPayments";
import { getCompanyProfile } from "../services/authService";
import {
    BuildingOfficeIcon,
    MapIcon,
    UserCircleIcon,
    CreditCardIcon,
    ArrowRightOnRectangleIcon,
    ChevronRightIcon
} from "@heroicons/react/24/outline";

export default function BusinessDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
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

    const handleLogout = () => {
        logout();
        navigate("/b2b");
    };

    const menuItems = [
        { id: "bookings", label: "Bookings", icon: MapIcon },
        { id: "payments", label: "Payments", icon: CreditCardIcon },
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
        <div className="min-h-screen bg-black text-white flex flex-col md:flex-row font-sans selection:bg-violet-500/30">
            {/* Sidebar */}
            <aside className="w-full md:w-72 bg-neutral-950 border-r border-white/5 flex flex-col relative z-20 shadow-2xl">
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-3.5 mb-2.5">
                        <div className="h-10 w-10 rounded-2xl bg-zinc-800 flex items-center justify-center shadow-lg border border-white/10">
                            <BuildingOfficeIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-white uppercase">Corporate</h1>
                            <div className="h-1 w-8 bg-violet-500 rounded-full mt-1"></div>
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest truncate pl-0.5">
                        {company?.company_name || "Urban Cabz Partner"}
                    </p>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-6">
                    <div className="px-2">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Launch Command</p>
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => window.location.href = '/business/book-ride'}
                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-zinc-800 to-black text-white font-black shadow-xl border border-white/10 hover:border-violet-500/50 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <MapIcon className="h-5 w-5" />
                                </div>
                                <span className="text-sm tracking-tight text-zinc-300 group-hover:text-white transition-colors">Book Dispatch</span>
                            </div>
                            <ChevronRightIcon className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </div>

                    <div className="px-2 space-y-2">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Operations</p>
                        {menuItems.map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`relative w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 group overflow-hidden ${isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white/5 border border-white/10"
                                            initial={false}
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            style={{ borderRadius: '1rem' }}
                                        />
                                    )}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute left-0 w-1 h-6 bg-violet-500 rounded-full"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}

                                    <item.icon className={`h-5 w-5 transition-colors relative z-10 ${isActive ? "text-violet-400" : "group-hover:text-zinc-300"}`} />
                                    <span className={`text-sm font-black tracking-tight relative z-10 ${isActive ? "" : ""}`}>
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl text-zinc-500 hover:bg-rose-500/5 hover:text-rose-400 transition-all group font-black uppercase tracking-widest text-[10px]"
                    >
                        <div className="h-8 w-8 rounded-xl bg-zinc-900 flex items-center justify-center group-hover:bg-rose-500/10 transition-colors">
                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        </div>
                        <span>Termination</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-black">
                <div className="p-6 md:p-12 max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            {activeTab === "bookings" && <BusinessBookings company={company} />}
                            {activeTab === "payments" && <BusinessPayments company={company} />}
                            {activeTab === "profile" && <BusinessProfile company={company} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

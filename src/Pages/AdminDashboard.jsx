import { useEffect, useMemo, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

import AdminStats from "../Components/Admin/AdminStats";
import BookingList from "../Components/Admin/BookingList";
import BookingDetailView from "../Components/Admin/BookingDetailView";
import HistoryTable from "../Components/Admin/HistoryTable";
import B2BRequestsList from "../Components/Admin/B2BRequestsList";
import CompanyList from "../Components/Admin/CompanyList";
import B2BBookingList from "../Components/Admin/B2BBookingList";
import B2BBookingDetailView from "../Components/Admin/B2BBookingDetailView";
import FleetManager from "../Components/Admin/FleetManager";
import DriverList from "../Components/Admin/DriverList";
import PricingSettings from "../Components/Admin/PricingSettings";
import CustomerManager from "../Components/Admin/CustomerManager";

import {
  fetchAdminDashboardSync,
  fetchAdminBookings,
  fetchB2BBookings,
  fetchAdminDrivers,
  fetchAdminFleet,
  fetchUsers
} from "../services/adminService";

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const adminInfo = user || null;
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedB2BBooking, setSelectedB2BBooking] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("STATS");

  const isFetching = useRef(false);
  const hasFetched = useRef(false);

  const loadDashboardData = async (force = false) => {
    if (!force && (isFetching.current || hasFetched.current)) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const syncRes = await fetchAdminDashboardSync();
      if (syncRes.success) {
        setDashboardData(syncRes.data);
        hasFetched.current = true;
      }
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleGlobalRefresh = async () => {
    await loadDashboardData(true);
  };

  // /admin/bookings → { bookings: [...] }
  const refreshBookings = async () => {
    const res = await fetchAdminBookings();
    if (res.success) {
      const arr = Array.isArray(res.data) ? res.data
        : Array.isArray(res.data?.data) ? res.data.data
          : Array.isArray(res.data?.bookings) ? res.data.bookings
            : [];
      setDashboardData(prev => ({ ...prev, bookings: arr }));
    }
  };

  // /b2b/... → varies; fall through to global refresh for correctness
  const refreshB2BBookings = async () => {
    const res = await fetchB2BBookings();
    if (res.success) {
      const arr = Array.isArray(res.data) ? res.data
        : Array.isArray(res.data?.data) ? res.data.data
          : Array.isArray(res.data?.bookings) ? res.data.bookings
            : [];
      setDashboardData(prev => ({ ...prev, b2bBookings: arr }));
    }
  };

  // /admin/drivers → { success, data: { drivers: [...] } }
  const refreshDrivers = async () => {
    const res = await fetchAdminDrivers();
    if (res.success) {
      const arr = Array.isArray(res.data) ? res.data
        : Array.isArray(res.data?.data) ? res.data.data
          : Array.isArray(res.data?.drivers) ? res.data.drivers
            : Array.isArray(res.data?.data?.drivers) ? res.data.data.drivers
              : [];
      setDashboardData(prev => ({ ...prev, drivers: arr }));
    }
  };

  // /admin/fleet → { success, data: { vehicles: [...] } }
  const refreshFleet = async () => {
    const res = await fetchAdminFleet();
    if (res.success) {
      const arr = Array.isArray(res.data) ? res.data
        : Array.isArray(res.data?.data) ? res.data.data
          : Array.isArray(res.data?.vehicles) ? res.data.vehicles
            : Array.isArray(res.data?.fleet) ? res.data.fleet
              : Array.isArray(res.data?.data?.vehicles) ? res.data.data.vehicles
                : [];
      setDashboardData(prev => ({ ...prev, fleet: arr }));
    }
  };

  // /admin/users → varies
  const refreshUsers = async () => {
    const res = await fetchUsers("", 1);
    if (res.success) {
      const arr = Array.isArray(res.data) ? res.data
        : Array.isArray(res.data?.data) ? res.data.data
          : Array.isArray(res.data?.users) ? res.data.users
            : Array.isArray(res.data?.data?.users) ? res.data.data.users
              : [];
      setDashboardData(prev => ({ ...prev, users: arr }));
    }
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const menuGroups = [
    {
      title: "Overview",
      items: [
        { id: "STATS", label: "Stats & KPIs", icon: "📊" },
      ]
    },
    {
      title: "B2C Operations",
      items: [
        { id: "DISPATCH", label: "Live Dispatch", icon: "⚡" },
        { id: "CUSTOMERS", label: "Customers", icon: "👥" },
        { id: "PENDING", label: "Pending Payments", icon: "⏳" },
        { id: "HISTORY", label: "Completed Rides", icon: "✅" },
        { id: "CANCELLED", label: "Cancelled Rides", icon: "❌" },
      ]
    },
    {
      title: "B2B Operations",
      items: [
        { id: "B2B_DISPATCH", label: "Corporate Dispatch", icon: "🏢" },
        { id: "B2B", label: "Service Requests", icon: "📋" },
        { id: "COMPANIES", label: "Partner Companies", icon: "🏦" },
      ]
    },
    {
      title: "System Management",
      items: [
        { id: "FLEET", label: "Fleet Manager", icon: "🚕" },
        { id: "DRIVERS", label: "Driver Registry", icon: "👨‍✈️" },
        { id: "PRICING", label: "Pricing Rules", icon: "💰" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tighter text-indigo-400 font-sans">URBAN CABZ</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Admin Control</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-8 CustomScrollbar">
            {menuGroups.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{group.title}</h3>
                <div className="space-y-1">
                  {group.items.map(item => {
                    const isB2B = ["B2B_DISPATCH", "B2B", "COMPANIES"].includes(item.id);
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleViewChange(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group ${isActive
                          ? isB2B ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {adminInfo && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white border border-indigo-400/20">
                  {adminInfo?.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Active User</span>
                  <span className="text-xs font-bold text-slate-200 truncate">{adminInfo.email}</span>
                </div>
              </div>
              <button
                onClick={() => { logout(); window.location.href = "/"; }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 text-rose-400 text-xs font-black uppercase tracking-widest hover:bg-rose-500/10 transition-all border border-slate-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200 relative z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg lg:text-xl font-black text-slate-800 hidden sm:block">Admin Workspace</h1>
          </div>

          {/* THE GLOBAL REFRESH BUTTON */}
          <button
            onClick={handleGlobalRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </header>

        <div className={`flex-1 overflow-y-auto ${(activeView === "DISPATCH" || activeView === "B2B_DISPATCH") ? "p-2 lg:p-2" : "p-4 lg:p-8"} CustomScrollbar`}>
          {!dashboardData && loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                <p className="text-slate-400 font-bold">Synchronizing Dashboard...</p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`${(activeView === "DISPATCH" || activeView === "B2B_DISPATCH") ? "w-full" : "max-w-7xl mx-auto"} space-y-6 px-1`}
              >
                {activeView === "STATS" && <AdminStats summary={dashboardData?.stats || {}} recentUsers={dashboardData?.recentUsers || []} />}

                {activeView === "DISPATCH" && (
                  <div className="h-[calc(100vh-140px)]">
                    <BookingList
                      tickets={dashboardData?.bookings || []}
                      selectedId={selectedTicket?.id}
                      onSelect={setSelectedTicket}
                    />
                    <AnimatePresence>
                      {selectedTicket && (
                        <BookingDetailView
                          booking={selectedTicket}
                          onClose={() => setSelectedTicket(null)}
                          onUpdate={refreshBookings}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {activeView === "B2B_DISPATCH" && (
                  <div className="h-[calc(100vh-140px)]">
                    <B2BBookingList
                      bookings={dashboardData?.b2bBookings || []}
                      selectedId={selectedB2BBooking?.id}
                      onSelect={setSelectedB2BBooking}
                    />
                    <AnimatePresence>
                      {selectedB2BBooking && (
                        <B2BBookingDetailView
                          booking={selectedB2BBooking}
                          onClose={() => setSelectedB2BBooking(null)}
                          onUpdate={refreshB2BBookings}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {activeView === "B2B" && <B2BRequestsList requests={dashboardData?.b2bRequests || []} onUpdate={handleGlobalRefresh} />}
                {activeView === "COMPANIES" && <CompanyList companies={dashboardData?.b2bCompanies || []} onUpdate={handleGlobalRefresh} />}
                {activeView === "CUSTOMERS" && <CustomerManager users={dashboardData?.users || []} onUpdate={refreshUsers} />}
                {activeView === "FLEET" && <FleetManager fleet={dashboardData?.fleet || []} onUpdate={refreshFleet} />}
                {activeView === "DRIVERS" && <DriverList drivers={dashboardData?.drivers || []} onUpdate={refreshDrivers} />}
                {activeView === "PRICING" && <PricingSettings />}

                {["HISTORY", "CANCELLED", "PENDING"].includes(activeView) && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-10">
                    <div className="mb-8">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        {activeView === "HISTORY" && "Trip Continuity 🗺️"}
                        {activeView === "CANCELLED" && "Voided Records ❌"}
                        {activeView === "PENDING" && "Financial Resolution ⏳"}
                      </h2>
                      <p className="text-slate-500 text-sm font-medium mt-1">Reviewing logs for historical and financial accuracy.</p>
                    </div>

                    <HistoryTable
                      bookings={
                        activeView === "HISTORY" ? (dashboardData?.completedBookings || []) :
                          activeView === "CANCELLED" ? (dashboardData?.cancelledBookings || []) :
                            (dashboardData?.pendingPayments || [])
                      }
                      type={activeView === "HISTORY" ? "completed" : activeView === "CANCELLED" ? "cancelled" : "pending"}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}

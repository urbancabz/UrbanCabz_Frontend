import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

import AdminStats from "../Components/Admin/AdminStats";
import BookingList from "../Components/Admin/BookingList";
import BookingDetailView from "../Components/Admin/BookingDetailView";
import HistoryTable from "../Components/Admin/HistoryTable";
import {
  fetchAdminBookings,
  fetchAdminBookingTicket,
  fetchAdminMe,
  fetchCompletedBookings,
  fetchCancelledBookings,
  fetchPendingPayments,
} from "../services/adminService";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [adminInfo, setAdminInfo] = useState(null);

  // New state for view mode and history data
  const [activeView, setActiveView] = useState("DISPATCH"); // DISPATCH, HISTORY, CANCELLED, PENDING
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setError("");
      const result = await fetchAdminBookings();
      if (!result.success) {
        if (!cancelled) {
          setError(result.message || "Failed to load tickets.");
        }
        return;
      }
      if (!cancelled) {
        setTickets(result.data.bookings || []);
      }
    };

    (async () => {
      setLoading(true);
      const me = await fetchAdminMe();
      if (!me.success) {
        setError(
          me.message || "You are not authorized to view the admin panel."
        );
        setLoading(false);
        return;
      }
      setAdminInfo(me.data?.user || null);

      await load();
      setLoading(false);

      // Poll every 10 seconds for live updates
      const intervalId = setInterval(load, 10000);
      return () => {
        cancelled = true;
        clearInterval(intervalId);
      };
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const total = tickets.length;
    const paidCount = tickets.filter((b) => {
      const isPaid = b.status === "PAID";
      // Partial payment counts as "attention needed" if at least one payment is SUCCESS
      const hasPartial = b.status === "PENDING_PAYMENT" && b.payments?.some(p => p.status === 'SUCCESS');
      return isPaid || hasPartial;
    }).length;

    const pendingPayment = tickets.filter(
      (b) => b.status === "PENDING_PAYMENT" && !b.payments?.some(p => p.status === 'SUCCESS')
    ).length;

    const assigned = tickets.filter(
      (b) => (b.status === "PAID" || (b.status === "PENDING_PAYMENT" && b.payments?.some(p => p.status === 'SUCCESS')))
        && b.taxi_assign_status === "ASSIGNED"
    ).length;

    const readyToAssign = paidCount - assigned;
    return { total, assigned, readyToAssign, pendingPayment, paidCount };
  }, [tickets]);

  // Load history data when view changes
  const loadHistoryData = async (view) => {
    setHistoryLoading(true);
    setHistoryData([]);
    let result;

    if (view === "HISTORY") {
      result = await fetchCompletedBookings();
    } else if (view === "CANCELLED") {
      result = await fetchCancelledBookings();
    } else if (view === "PENDING") {
      result = await fetchPendingPayments();
    }

    if (result?.success) {
      setHistoryData(result.data.bookings || []);
    }
    setHistoryLoading(false);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    if (view !== "DISPATCH") {
      loadHistoryData(view);
    }
  };

  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setMessage("");
    setError("");

    const result = await fetchAdminBookingTicket(ticket.id);
    if (!result.success) {
      setError(result.message || "Unable to load ticket details.");
      return;
    }
    const booking = result.data.booking;
    const assignment = booking.assign_taxis?.[0] || null;
    setSelectedTicket(booking);
    setForm({
      driverName: assignment?.driver_name || "",
      driverNumber: assignment?.driver_number || "",
      cabNumber: assignment?.cab_number || "",
      cabName: assignment?.cab_name || "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setSaving(true);
    setMessage("");
    setError("");
    if (!customerNotified) {
      setError("Please share the WhatsApp message with the customer before marking as assigned.");
      return;
    }
    const result = await upsertTaxiAssignment(selectedTicket.id, {
      ...form,
      markAssigned: customerNotified,
    });
    setSaving(false);
    if (!result.success) {
      setError(result.message || "Unable to save assignment.");
      return;
    }
    setMessage("Taxi assignment saved and ticket updated.");
  };

  const handleCopyWhatsapp = async () => {
    if (!whatsappText) return;
    try {
      await navigator.clipboard.writeText(whatsappText);
      setMessage("WhatsApp message copied to clipboard.");
      setCustomerNotified(true);
    } catch {
      setError("Unable to copy message. Please copy manually.");
    }
  };

  const handleCopyDriver = async () => {
    if (!driverText) return;
    try {
      await navigator.clipboard.writeText(driverText);
      setMessage("Driver message copied to clipboard.");
    } catch {
      setError("Unable to copy message. Please copy manually.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Command Center
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Real-time dispatch management
            </p>
          </div>
          {adminInfo && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-white rounded-full px-4 py-1.5 border border-slate-200 shadow-sm">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                  {adminInfo.email[0].toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Dispatcher</span>
                  <span className="text-sm font-semibold text-slate-700">{adminInfo.email}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  window.location.href = "/";
                }}
                className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 active:scale-95 shadow-sm"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </header>


        {/* Content */}
        <>
          {/* KPI Stats Section */}
          <AdminStats summary={summary} />

          {/* View Switcher Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm mb-6 w-fit">
            {[
              { id: "DISPATCH", label: "Dispatch", icon: "⚡" },
              { id: "PENDING", label: "Pending Payments", icon: "⏳" },
              { id: "HISTORY", label: "Completed", icon: "✅" },
              { id: "CANCELLED", label: "Cancelled", icon: "❌" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleViewChange(tab.id)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-2 ${activeView === tab.id
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center text-slate-500">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-indigo-500" />
                <p className="animate-pulse font-medium">Loading command center...</p>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}
              {message && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </div>
              )}

              {/* Conditional View Rendering */}
              {activeView === "DISPATCH" ? (
                <div className="grid gap-6 lg:grid-cols-[minmax(350px,1fr)_minmax(0,2fr)] h-[calc(100vh-140px)]">
                  {/* Left Column: Advanced List */}
                  <BookingList
                    tickets={tickets}
                    selectedId={selectedTicket?.id}
                    onSelect={setSelectedTicket}
                  />

                  {/* Right Column: Ticket Details */}
                  {selectedTicket ? (
                    <BookingDetailView
                      booking={selectedTicket}
                      onUpdate={() => {
                        // Trigger a refresh (simplified)
                        fetchAdminBookingTicket(selectedTicket.id).then(res => {
                          if (res.success) setSelectedTicket(res.data.booking);
                        });
                      }}
                    />
                  ) : (
                    <section className="rounded-xl border border-slate-200 bg-white p-10 shadow-sm overflow-hidden h-full flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                      </div>
                      <h3 className="text-slate-900 font-bold text-lg mb-1">Ready to Dispatch</h3>
                      <p className="text-slate-500 text-sm max-w-xs">Select a booking from the list to view details, assign drivers, or manage trip status.</p>
                    </section>
                  )}
                </div>
              ) : (
                /* History / Cancelled / Pending Views */
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">
                    {activeView === "HISTORY" && "Completed Rides"}
                    {activeView === "CANCELLED" && "Cancelled Rides"}
                    {activeView === "PENDING" && "Pending Payments"}
                  </h2>
                  {historyLoading ? (
                    <div className="flex h-32 items-center justify-center text-slate-500">
                      <div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-300 border-t-indigo-500" />
                    </div>
                  ) : (
                    <HistoryTable
                      bookings={historyData}
                      type={activeView === "HISTORY" ? "completed" : activeView === "CANCELLED" ? "cancelled" : "pending"}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </>
      </div>
    </div>
  );
}

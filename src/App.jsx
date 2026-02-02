import React, { useEffect, useState } from "react";
import Footer from "./Components/Footer/Footer";
import Navbar from "./Components/Navigation/Navbar";
import B2BLandingPage from "./Pages/B2BLandingPage";
import LandingPage from "./Pages/LandingPage";
import CabBooking from "./Pages/CabBooking";
import CabBookingDetails from "./Pages/CabBookingDetails";
import AdminDashboard from "./Pages/AdminDashboard";
import BusinessDashboard from "./Pages/BusinessDashboard";
import BusinessBookRide from "./Pages/BusinessBookRide";
import BusinessBookingDetails from "./Pages/BusinessBookingDetails";
import CompanyList from "./Components/Admin/CompanyList";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import AdminRoute from "./Components/Navigation/AdminRoute";

// Lightweight page transition wrapper
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
    className="min-h-[calc(100vh-200px)]"
  >
    {children}
  </motion.div>
);

// Routes with AnimatePresence for smooth page transitions
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageWrapper>
              <LandingPage />
            </PageWrapper>
          }
        />
        <Route
          path="/b2b"
          element={
            <PageWrapper>
              <B2BLandingPage />
            </PageWrapper>
          }
        />
        <Route
          path="/cab-booking"
          element={
            <PageWrapper>
              <CabBooking />
            </PageWrapper>
          }
        />
        <Route
          path="/cab-booking-details"
          element={
            <PageWrapper>
              <CabBookingDetails />
            </PageWrapper>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/companies"
          element={
            <AdminRoute>
              <CompanyList />
            </AdminRoute>
          }
        />
        <Route
          path="/business/dashboard"
          element={
            <PageWrapper>
              <BusinessDashboard />
            </PageWrapper>
          }
        />
        <Route
          path="/business/book-ride"
          element={
            <PageWrapper>
              <BusinessBookRide />
            </PageWrapper>
          }
        />
        <Route
          path="/business/booking-details"
          element={
            <PageWrapper>
              <BusinessBookingDetails />
            </PageWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

// Layout wrapper so we can hide Navbar/Footer on admin routes
const AppLayout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isBusinessRoute = location.pathname.startsWith("/business");

  const hideNavFooter = isAdminRoute || isBusinessRoute;

  // Check if user is admin - first from localStorage (fast), then verify with backend
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(() => {
    // Quick check from localStorage (set during login)
    return localStorage.getItem("isAdmin") === "true";
  });

  useEffect(() => {
    let cancelled = false;

    // Only verify with backend if localStorage suggests we might be an admin
    const userType = localStorage.getItem("userType");
    if (userType !== "admin") {
      setCheckingAdmin(false);
      return;
    }

    (async () => {
      try {
        const { fetchAdminMe } = await import("./services/adminService");
        const me = await fetchAdminMe();
        if (!cancelled) {
          const adminStatus = !!me.success;
          setIsAdmin(adminStatus);
          // Sync localStorage with actual backend status
          if (adminStatus) {
            localStorage.setItem("isAdmin", "true");
          } else {
            localStorage.removeItem("isAdmin");
          }
        }
      } catch {
        if (!cancelled) {
          setIsAdmin(false);
          localStorage.removeItem("isAdmin");
        }
      } finally {
        if (!cancelled) {
          setCheckingAdmin(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // If user is an admin (from localStorage or backend check) and tries to access any non-admin page,
  // immediately redirect them to the admin dashboard.
  if (isAdmin && !isAdminRoute) {
    return <Navigate to="/admin" replace />;
  }

  // While we are checking admin status, if localStorage says admin, redirect immediately
  // (don't show landing page even briefly)
  if (checkingAdmin && !isAdminRoute && localStorage.getItem("isAdmin") === "true") {
    return <Navigate to="/admin" replace />;
  }

  // While we are checking admin status, show minimal UI for regular users
  if (checkingAdmin && !isAdminRoute) {
    return (
      <>
        {!isAdminRoute && <Navbar />}
        <AnimatedRoutes />
        {!isAdminRoute && <Footer />}
      </>
    );
  }

  return (
    <>
      {!hideNavFooter && <Navbar />}
      <AnimatedRoutes />
      {!hideNavFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <div className="">
      <Router>
        <AppLayout />
      </Router>
    </div>
  );
}

export default App;
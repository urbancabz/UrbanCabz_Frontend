import React, { useEffect, useState, Suspense, lazy } from "react";
import Footer from "./Components/Footer/Footer";
import Navbar from "./Components/Navigation/Navbar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import AdminRoute from "./Components/Navigation/AdminRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "react-hot-toast";

// Lazy load pages for better code splitting
const LandingPage = lazy(() => import("./Pages/LandingPage"));
const B2BLandingPage = lazy(() => import("./Pages/B2BLandingPage"));
const CabBooking = lazy(() => import("./Pages/CabBooking"));
const CabBookingDetails = lazy(() => import("./Pages/CabBookingDetails"));
const AdminDashboard = lazy(() => import("./Pages/AdminDashboard"));
const BusinessDashboard = lazy(() => import("./Pages/BusinessDashboard"));
const BusinessBookRide = lazy(() => import("./Pages/BusinessBookRide"));
const BusinessBookingDetails = lazy(() => import("./Pages/BusinessBookingDetails"));
const PrivacyPolicy = lazy(() => import("./Pages/Legal/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./Pages/Legal/TermsAndConditions"));
const RefundPolicy = lazy(() => import("./Pages/Legal/RefundPolicy"));
const ContactUs = lazy(() => import("./Pages/ContactUs"));
const ShippingPolicy = lazy(() => import("./Pages/Legal/ShippingPolicy"));
const CompanyList = lazy(() => import("./Components/Admin/CompanyList"));

// Loading spinner for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 dark:border-slate-800 border-t-yellow-500" />
      <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading...</p>
    </div>
  </div>
);

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
        <Route
          path="/privacy-policy"
          element={
            <PageWrapper>
              <PrivacyPolicy />
            </PageWrapper>
          }
        />
        <Route
          path="/terms-and-conditions"
          element={
            <PageWrapper>
              <TermsAndConditions />
            </PageWrapper>
          }
        />
        <Route
          path="/refund-policy"
          element={
            <PageWrapper>
              <RefundPolicy />
            </PageWrapper>
          }
        />
        <Route
          path="/contact-us"
          element={
            <PageWrapper>
              <ContactUs />
            </PageWrapper>
          }
        />
        <Route
          path="/shipping-policy"
          element={
            <PageWrapper>
              <ShippingPolicy />
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
        <Suspense fallback={<PageLoader />}>
          <AnimatedRoutes />
        </Suspense>
        {!isAdminRoute && <Footer />}
      </>
    );
  }

  return (
    <>
      {!hideNavFooter && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <AnimatedRoutes />
      </Suspense>
      {!hideNavFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <div className="">
      <ThemeProvider>
        <Toaster position="top-center" />
        <Router>
          <AppLayout />
        </Router>
      </ThemeProvider>
    </div>
  );
}

export default App;
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { fetchAdminMe } from "../../services/adminService";

/**
 * Simple route guard for admin-only pages.
 * Calls the backend /admin/me endpoint to verify the current user.
 * If not authorized, the user is redirected away from the admin panel.
 */
export default function AdminRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const me = await fetchAdminMe();
        if (!cancelled && me.success) {
          setAllowed(true);
        } else if (!cancelled) {
          setAllowed(false);
        }
      } catch (err) {
        if (!cancelled) {
          setAllowed(false);
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // While we are checking, show a minimal screen instead of the dashboard.
  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200 text-sm">
        Verifying admin access...
      </div>
    );
  }

  // If not allowed, kick back to home (or any public page you prefer)
  if (!allowed) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}




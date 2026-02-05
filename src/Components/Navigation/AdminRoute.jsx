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
        console.log('🛡️ AdminRoute: verifying access...');
        // Small delay to ensure localStorage is updated if coming from login
        await new Promise(r => setTimeout(r, 100));

        const me = await fetchAdminMe();
        if (!cancelled) {
          if (me.success) {
            console.log('✅ AdminRoute: allowed');
            setAllowed(true);
          } else {
            console.warn('⛔ AdminRoute: denied', me.message);
            setAllowed(false);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('💥 AdminRoute: error', err);
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




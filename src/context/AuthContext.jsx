import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  customerLogin as apiCustomerLogin,
  fetchCustomerProfile,
  logout as clearAuthStorage,
  updateCustomerProfile as apiUpdateCustomerProfile,
} from "../services/authService";

const AuthContext = createContext({
  user: null,
  loading: false,
  authReady: false,
  loginCustomer: async () => ({ success: false }),
  logout: () => {},
  updateProfile: async () => ({ success: false }),
  refreshProfile: async () => ({ success: false }),
});

const getStoredProfile = () => {
  try {
    const raw = localStorage.getItem("customerProfile");
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("Failed to parse stored profile", err);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredProfile);
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [lastError, setLastError] = useState(null);

  const persistProfile = useCallback((profile) => {
    if (profile) {
      localStorage.setItem("customerProfile", JSON.stringify(profile));
      setUser(profile);
    } else {
      localStorage.removeItem("customerProfile");
      setUser(null);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthStorage();
    persistProfile(null);
  }, [persistProfile]);

  const refreshProfile = useCallback(async () => {
    if (!localStorage.getItem("customerToken")) {
      persistProfile(null);
      return { success: false, message: "Not authenticated" };
    }

    setLoading(true);
    const result = await fetchCustomerProfile();
    setLoading(false);

    if (result.success && result.data) {
      persistProfile(result.data);
    } else if (result.status === 401) {
      logout();
    }

    return result;
  }, [logout, persistProfile]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (mounted) {
        await refreshProfile();
        setAuthReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refreshProfile]);

  const loginCustomer = useCallback(
    async (credentials) => {
      setLoading(true);
      setLastError(null);
      const result = await apiCustomerLogin(credentials);
      setLoading(false);

      if (result.success) {
        if (result.data?.user) {
          persistProfile(result.data.user);
        } else {
          await refreshProfile();
        }
      } else {
        setLastError(result.message);
      }

      return result;
    },
    [persistProfile, refreshProfile]
  );

  const updateProfile = useCallback(
    async (payload) => {
      setLoading(true);
      setLastError(null);
      const result = await apiUpdateCustomerProfile(payload);
      setLoading(false);

      if (result.success && result.data) {
        persistProfile(result.data);
      } else if (result.status === 401) {
        logout();
      } else {
        setLastError(result.message);
      }

      return result;
    },
    [logout, persistProfile]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      authReady,
      lastError,
      loginCustomer,
      updateProfile,
      logout,
      refreshProfile,
    }),
    [authReady, lastError, loading, loginCustomer, logout, refreshProfile, updateProfile, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}


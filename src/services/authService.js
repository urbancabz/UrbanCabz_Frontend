// src/services/authService.js
import { apiClient } from "./apiClient";

const CUSTOMER_PROFILE_KEY = 'customerProfile';

function setAdminSession(token) {
  if (token) {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('userType', 'admin');
    localStorage.setItem('isAdmin', 'true');
  }
}

function clearAdminSession() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('isAdmin');
}

function isAdminUser(data) {
  const role =
    data?.user?.role ||
    data?.user?.role_name ||
    data?.role ||
    data?.user?.roles?.[0];
  return (role || '').toString().toLowerCase() === 'admin';
}

function persistCustomerProfile(profile) {
  if (profile) {
    localStorage.setItem(CUSTOMER_PROFILE_KEY, JSON.stringify(profile));
  } else {
    localStorage.removeItem(CUSTOMER_PROFILE_KEY);
  }
}

/**
 * Customer Login
 */
export async function customerLogin(credentials) {
  const res = await apiClient.post("/auth/login", {
    email: credentials.email,
    password: credentials.password,
  });

  if (res.success && res.data.token) {
    if (isAdminUser(res.data)) {
      setAdminSession(res.data.token);
    } else {
      localStorage.setItem('customerToken', res.data.token);
      localStorage.setItem('userType', 'customer');
      clearAdminSession();
    }
    if (res.data.user) {
      persistCustomerProfile(res.data.user);
    }
  }
  return res;
}

/**
 * Customer Signup
 */
export async function customerSignup(userData) {
  const res = await apiClient.post("/auth/register", {
    name: userData.fullName,
    phone: userData.mobile,
    email: userData.email,
    password: userData.password,
  });

  if (res.success && res.data.token) {
    if (isAdminUser(res.data)) {
      setAdminSession(res.data.token);
    } else {
      localStorage.setItem('customerToken', res.data.token);
      localStorage.setItem('userType', 'customer');
      clearAdminSession();
    }
    if (res.data.user) {
      persistCustomerProfile(res.data.user);
    }
  }
  return res;
}

/**
 * Business Login
 */
export async function businessLogin(credentials) {
  const res = await apiClient.post("/auth/b2b/login", {
    email: credentials.email,
    password: credentials.password,
  });

  if (res.success && res.data.token) {
    if (isAdminUser(res.data)) {
      setAdminSession(res.data.token);
    } else {
      localStorage.setItem('businessToken', res.data.token);
      localStorage.setItem('userType', 'business');
      clearAdminSession();
    }
  }
  return res;
}

/**
 * Business Signup
 */
export async function businessSignup(businessData) {
  const res = await apiClient.post("/auth/business/signup", {
    companyName: businessData.companyName,
    companyEmail: businessData.companyEmail,
    gstNumber: businessData.gstNumber || null,
    email: businessData.email,
    password: businessData.password,
  });

  if (res.success && res.data.token) {
    if (isAdminUser(res.data)) {
      setAdminSession(res.data.token);
    } else {
      localStorage.setItem('businessToken', res.data.token);
      localStorage.setItem('userType', 'business');
      clearAdminSession();
    }
  }
  return res;
}

/**
 * Register B2B Interest/Request
 */
export async function registerB2BRequest(formData) {
  return apiClient.post("/b2b/register", formData);
}

/**
 * Logout (clears tokens)
 */
export function logout() {
  localStorage.removeItem('customerToken');
  localStorage.removeItem('businessToken');
  clearAdminSession();
  localStorage.removeItem('userType');
  persistCustomerProfile(null);
}

/**
 * Get stored auth token
 */
export function getAuthToken() {
  const userType = localStorage.getItem('userType');
  if (userType === 'admin') {
    return localStorage.getItem('adminToken');
  } else if (userType === 'customer') {
    return localStorage.getItem('customerToken');
  } else if (userType === 'business') {
    return localStorage.getItem('businessToken');
  }
  return (
    localStorage.getItem('adminToken') ||
    localStorage.getItem('customerToken') ||
    localStorage.getItem('businessToken')
  );
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return !!getAuthToken();
}

/**
 * Fetch authenticated customer profile
 */
export async function fetchCustomerProfile() {
  const res = await apiClient.get("/auth/me");
  if (res.success && res.data.user) {
    persistCustomerProfile(res.data.user);
  }
  return res;
}

/**
 * Fetch B2B Dashboard Sync
 */
export async function getB2BDashboardSync() {
  return apiClient.get("/b2b/dashboard-sync");
}

/**
 * Update authenticated customer profile
 */
export async function updateCustomerProfile(payload) {
  const res = await apiClient.put("/auth/me", payload);
  if (res.success && res.data.user) {
    persistCustomerProfile(res.data.user);
  }
  return res;
}

/**
 * Request password reset OTP
 */
export async function requestPasswordReset(payload) {
  const body = {};
  if (payload.email) body.email = payload.email;
  if (payload.phone) body.phone = payload.phone;
  if (payload.otpTo) body.otpTo = payload.otpTo;
  return apiClient.post("/auth/password/forgot", body);
}

/**
 * Complete password reset with OTP
 */
export async function completePasswordReset(payload) {
  return apiClient.post("/auth/password/reset", {
    resetId: payload.resetId,
    otp: payload.otp,
    newPassword: payload.newPassword,
  });
}

/**
 * Set B2B permanent password
 */
export async function b2bSetPassword(payload) {
  const res = await apiClient.post("/auth/b2b/set-password", {
    email: payload.email,
    password: payload.password
  });

  if (res.success && res.data.token) {
    localStorage.setItem('businessToken', res.data.token);
    localStorage.setItem('userType', 'business');
  }
  return res;
}

/**
 * Fetch B2B Company Profile
 */
export async function getCompanyProfile() {
  return apiClient.get("/b2b/company/my");
}

/**
 * Book Business Ride
 */
export async function bookBusinessRide(bookingData) {
  return apiClient.post("/b2b/bookings", bookingData);
}

/**
 * Verify phone number with OTP
 */
export async function verifyPhone(userId, otp) {
  return apiClient.post("/auth/verify-phone", { userId, otp });
}

/**
 * Resend verification OTP
 */
export async function resendVerificationOtp(userId) {
  return apiClient.post("/auth/resend-verification-otp", { userId });
}

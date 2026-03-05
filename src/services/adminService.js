// src/services/adminService.js
// Small helper wrapper around admin APIs for booking tickets and taxi assignment.
import { apiClient } from "./apiClient";

/**
 * Fetch current admin profile
 */
export function fetchAdminMe() {
  // Use a longer cache TTL for profile to prevent repeated calls
  return apiClient.get("/admin/me", { cacheTTL: 60000 });
}

/**
 * Fetch all admin bookings
 */
export async function fetchAdminBookings() {
  return apiClient.get("/admin/bookings");
}

/**
 * Fetch all drivers (admin view)
 */
export async function fetchAdminDrivers() {
  return apiClient.get("/admin/drivers");
}

/**
 * Fetch all fleet vehicles (admin view)
 */
export async function fetchAdminFleet() {
  return apiClient.get("/admin/fleet");
}

/**
 * Fetch dashboard sync data
 */
export async function fetchAdminDashboardSync() {
  return apiClient.get("/admin/dashboard-sync");
}

/**
 * Fetch a single booking ticket
 */
export async function fetchAdminBookingTicket(bookingId) {
  return apiClient.get(`/admin/bookings/${bookingId}`);
}

/**
 * Assign taxi to a booking
 */
export async function upsertTaxiAssignment(bookingId, payload) {
  // Map frontend fields to backend expected fields
  const backendPayload = {
    driverName: payload.driverName,
    driverNumber: payload.driverPhone || payload.driverNumber, // Map phone to number
    cabNumber: payload.carNumber || payload.cabNumber,        // Map car to cab
    cabName: payload.carModel || payload.cabName              // Map model to name
  };
  return apiClient.post(`/admin/bookings/${bookingId}/assign-taxi`, backendPayload);
}

// ===================== BOOKING LIFECYCLE OPERATIONS =====================

/**
 * Update booking status (start trip, end trip)
 */
export async function updateBookingStatus(bookingId, status, reason = "") {
  return apiClient.patch(`/admin/bookings/${bookingId}/status`, { status, reason });
}

/**
 * Complete trip with fare adjustments
 */
export async function completeTrip(bookingId, payload) {
  return apiClient.post(`/admin/bookings/${bookingId}/complete`, payload);
}

/**
 * Cancel booking with reason
 */
export async function cancelBooking(bookingId, reason) {
  return apiClient.post(`/admin/bookings/${bookingId}/cancel`, { reason });
}

/**
 * Get booking notes
 */
export async function getBookingNotes(bookingId) {
  return apiClient.get(`/admin/bookings/${bookingId}/notes`);
}

/**
 * Add booking note
 */
export async function addBookingNote(bookingId, content) {
  return apiClient.post(`/admin/bookings/${bookingId}/notes`, { content });
}

// ===================== HISTORY & PENDING PAYMENT OPERATIONS =====================

/**
 * Fetch completed bookings for History table
 */
export async function fetchCompletedBookings() {
  return apiClient.get("/admin/history/completed");
}

/**
 * Fetch cancelled bookings for Cancelled History table
 */
export async function fetchCancelledBookings() {
  return apiClient.get("/admin/history/cancelled");
}

// ===================== B2B DISPATCH OPERATIONS =====================

/**
 * Fetch all B2B bookings for admin dispatch
 */
export async function fetchB2BBookings() {
  return apiClient.get("/admin/b2b-bookings");
}

/**
 * Assign taxi to a B2B booking
 */
export async function upsertB2BTaxiAssignment(bookingId, payload) {
  return apiClient.post(`/admin/b2b-bookings/${bookingId}/assign-taxi`, payload);
}

/**
 * Mark B2B bill as paid (offline)
 */
export async function markB2BBillPaid(bookingId, payload) {
  return apiClient.post(`/admin/b2b-bookings/${bookingId}/mark-paid`, payload);
}

/**
 * Update B2B booking status
 */
export async function updateB2BBookingStatus(bookingId, status, reason = "") {
    return apiClient.patch(`/admin/b2b-bookings/${bookingId}/status`, { status, reason });
}

/**
 * Complete B2B trip
 */
export async function completeB2BTrip(bookingId, payload) {
  return apiClient.post(`/admin/b2b-bookings/${bookingId}/complete`, payload);
}

/**
 * Cancel B2B booking
 */
export async function cancelB2BBooking(bookingId, reason) {
  return apiClient.post(`/admin/b2b-bookings/${bookingId}/cancel`, { reason });
}

/**
 * Record B2B Payment
 */
export async function recordCompanyPayment(payload) {
  return apiClient.post("/b2b/payments", payload);
}

/**
 * Create new company
 */
export async function createCompany(payload) {
  return apiClient.post("/b2b/companies", payload);
}

/**
 * Update company details
 */
export async function updateCompany(id, payload) {
  return apiClient.put(`/b2b/companies/${id}`, payload);
}

/**
 * Fetch B2C users list
 */
export async function fetchUsers(search = "", page = 1) {
  const params = { page };
  if (search) params.search = search;
  return apiClient.get("/admin/users", { params });
}

/**
 * Update user details
 */
export async function updateUser(id, payload) {
  return apiClient.put(`/admin/users/${id}`, payload);
}

/**
 * Fetch User Bookings (History)
 */
export async function fetchUserBookings(userId, page = 1, limit = 10) {
  return apiClient.get(`/admin/users/${userId}/bookings`, { params: { page, limit } });
}

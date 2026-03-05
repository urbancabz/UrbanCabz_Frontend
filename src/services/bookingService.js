// src/services/bookingService.js
import { apiClient } from "./apiClient";

/**
 * Create a direct booking
 */
export async function createDirectBooking(payload) {
  return apiClient.post("/bookings/create", payload);
}

// Legacy/Mock if needed
export function createBooking(payload) {
  console.log("Booking request:", payload);
  return { data: true, error: null };
}

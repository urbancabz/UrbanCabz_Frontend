// src/services/fleetService.js
import { apiClient } from "./apiClient";

/**
 * Fetch all fleet vehicles (public endpoint)
 */
export async function fetchPublicFleet() {
    return apiClient.get("/fleet/public", { params: { activeOnly: "true" } });
}

/**
 * Fetch global pricing settings
 */
export function fetchPricingSettings() {
    // This is the one specifically mentioned by the user.
    // apiClient.get handles deduplication and brief caching automatically.
    return apiClient.get("/pricing/public");
}

/**
 * Fetch global pricing settings (admin view)
 */
export async function fetchAdminPricingSettings() {
    return apiClient.get("/pricing");
}

/**
 * Update global pricing settings (admin)
 */
export async function updatePricingSettings(settings) {
    return apiClient.put("/pricing", settings);
}

/**
 * Fetch all fleet vehicles (admin endpoint)
 */
export async function fetchFleetVehicles() {
    return apiClient.get("/fleet");
}

/**
 * Create a new fleet vehicle
 */
export async function createFleetVehicle(vehicleData) {
    return apiClient.post("/fleet", vehicleData);
}

/**
 * Update a fleet vehicle
 */
export async function updateFleetVehicle(id, vehicleData) {
    return apiClient.put(`/fleet/${id}`, vehicleData);
}

/**
 * Delete (deactivate) a fleet vehicle
 */
export async function deleteFleetVehicle(id) {
    return apiClient.delete(`/fleet/${id}`);
}

/**
 * Fetch fleet assigned to the current user's company (B2B)
 */
export async function fetchMyFleet() {
    return apiClient.get("/b2b/my-fleet");
}

/**
 * Upload a fleet vehicle image
 */
export async function uploadFleetImage(file) {
    const formData = new FormData();
    formData.append("image", file);
    return apiClient.upload("/fleet/upload-image", formData);
}

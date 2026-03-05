// src/services/driverService.js
import { apiClient } from "./apiClient";

/**
 * Fetch all drivers (admin registry)
 */
export async function fetchDrivers(activeOnly = false) {
    return apiClient.get("/admin/drivers", { params: activeOnly ? { activeOnly: "true" } : {} });
}

/**
 * Create a new driver registry entry
 */
export async function createDriver(driverData) {
    return apiClient.post("/admin/drivers", driverData);
}

/**
 * Update a driver entry
 */
export async function updateDriver(id, driverData) {
    return apiClient.put(`/admin/drivers/${id}`, driverData);
}

/**
 * Delete (deactivate) a driver
 */
export async function deleteDriver(id) {
    return apiClient.delete(`/admin/drivers/${id}`);
}

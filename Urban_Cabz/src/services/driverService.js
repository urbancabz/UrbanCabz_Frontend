const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api/v1";

function getAuthToken() {
    const userType = localStorage.getItem("userType");
    if (userType === "admin") {
        return localStorage.getItem("adminToken");
    }
    return localStorage.getItem("adminToken");
}

function buildAuthHeaders() {
    const token = getAuthToken();
    const headers = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
}

/**
 * Fetch all drivers (admin registry)
 */
export async function fetchDrivers(activeOnly = false) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/drivers${activeOnly ? '?activeOnly=true' : ''}`, {
            method: "GET",
            headers: buildAuthHeaders(),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            return { success: false, message: data.message || "Failed to fetch drivers" };
        }
        return { success: true, data: data.data };
    } catch (error) {
        console.error("Error fetching drivers:", error);
        return { success: false, message: "Network error while fetching drivers" };
    }
}

/**
 * Create a new driver registry entry
 */
export async function createDriver(driverData) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/drivers`, {
            method: "POST",
            headers: buildAuthHeaders(),
            body: JSON.stringify(driverData),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            return { success: false, message: data.message || "Failed to create driver" };
        }
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        console.error("Error creating driver:", error);
        return { success: false, message: "Network error while creating driver" };
    }
}

/**
 * Update a driver entry
 */
export async function updateDriver(id, driverData) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/drivers/${id}`, {
            method: "PUT",
            headers: buildAuthHeaders(),
            body: JSON.stringify(driverData),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            return { success: false, message: data.message || "Failed to update driver" };
        }
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        console.error("Error updating driver:", error);
        return { success: false, message: "Network error while updating driver" };
    }
}

/**
 * Delete (deactivate) a driver
 */
export async function deleteDriver(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/drivers/${id}`, {
            method: "DELETE",
            headers: buildAuthHeaders(),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            return { success: false, message: data.message || "Failed to delete driver" };
        }
        return { success: true, message: data.message };
    } catch (error) {
        console.error("Error deleting driver:", error);
        return { success: false, message: "Network error while deleting driver" };
    }
}

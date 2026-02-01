const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api/v1";

function getAuthToken() {
    const userType = localStorage.getItem("userType");
    if (userType === "admin") {
        return localStorage.getItem("adminToken");
    } else if (userType === "customer") {
        return localStorage.getItem("customerToken");
    } else if (userType === "business") {
        return localStorage.getItem("businessToken");
    }
    return (
        localStorage.getItem("adminToken") ||
        localStorage.getItem("customerToken") ||
        localStorage.getItem("businessToken")
    );
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
 * Fetch all fleet vehicles (public endpoint)
 */
export async function fetchPublicFleet() {
    try {
        const response = await fetch(`${API_BASE_URL}/fleet/public?activeOnly=true`, {
            method: "GET",
            headers: buildAuthHeaders(),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            return { success: false, message: data.message || "Failed to fetch vehicles" };
        }
        return { success: true, data: data.data };
    } catch (error) {
        console.error("Error fetching public fleet:", error);
        return { success: false, message: "Network error while fetching vehicles" };
    }
}

/**
 * Fetch all fleet vehicles (admin endpoint)
 */
export async function fetchFleetVehicles() {
    try {
        const response = await fetch(`${API_BASE_URL}/fleet`, {
            method: "GET",
            headers: buildAuthHeaders(),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            return { success: false, message: data.message || "Failed to fetch vehicles" };
        }
        return { success: true, data: data.data };
    } catch (error) {
        console.error("Error fetching fleet:", error);
        return { success: false, message: "Network error while fetching vehicles" };
    }
}

/**
 * Create a new fleet vehicle
 */
export async function createFleetVehicle(vehicleData) {
    try {
        const response = await fetch(`${API_BASE_URL}/fleet`, {
            method: "POST",
            headers: buildAuthHeaders(),
            body: JSON.stringify(vehicleData),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            return { success: false, message: data.message || "Failed to create vehicle" };
        }
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        console.error("Error creating vehicle:", error);
        return { success: false, message: "Network error while creating vehicle" };
    }
}

/**
 * Update a fleet vehicle
 */
export async function updateFleetVehicle(id, vehicleData) {
    try {
        const response = await fetch(`${API_BASE_URL}/fleet/${id}`, {
            method: "PUT",
            headers: buildAuthHeaders(),
            body: JSON.stringify(vehicleData),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            return { success: false, message: data.message || "Failed to update vehicle" };
        }
        return { success: true, data: data.data, message: data.message };
    } catch (error) {
        console.error("Error updating vehicle:", error);
        return { success: false, message: "Network error while updating vehicle" };
    }
}

/**
 * Delete (deactivate) a fleet vehicle
 */
export async function deleteFleetVehicle(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/fleet/${id}`, {
            method: "DELETE",
            headers: buildAuthHeaders(),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            return { success: false, message: data.message || "Failed to delete vehicle" };
        }
        return { success: true, message: data.message };
    } catch (error) {
        console.error("Error deleting vehicle:", error);
        return { success: false, message: "Network error while deleting vehicle" };
    }
}

/**
 * Fetch fleet assigned to the current user's company (B2B)
 */
export async function fetchMyFleet() {
    try {
        const response = await fetch(`${API_BASE_URL}/b2b/my-fleet`, {
            method: "GET",
            headers: buildAuthHeaders(),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            return { success: false, message: data.message || "Failed to fetch company fleet" };
        }
        return { success: true, data: data.data };
    } catch (error) {
        console.error("Error fetching company fleet:", error);
        return { success: false, message: "Network error while fetching company fleet" };
    }
}

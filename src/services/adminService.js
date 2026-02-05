// src/services/adminService.js
// Small helper wrapper around admin APIs for booking tickets and taxi assignment.

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
  // Fallback: try any token so admin check still works if userType not set
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

export async function fetchAdminMe() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/me`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: data.message || "Unable to fetch admin profile",
      };
    }
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("fetchAdminMe error:", error);
    return {
      success: false,
      message: "Network error while fetching admin profile: " + error.message,
      error: error.message,
    };
  }
}

export async function fetchAdminBookings() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: data.message || "Unable to load booking tickets",
      };
    }
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("fetchAdminBookings error:", error);
    return {
      success: false,
      message: "Network error while loading bookings",
      error: error.message,
    };
  }
}

export async function fetchAdminBookingTicket(bookingId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/bookings/${bookingId}`,
      {
        method: "GET",
        headers: buildAuthHeaders(),
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: data.message || "Unable to load booking ticket",
      };
    }
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("fetchAdminBookingTicket error:", error);
    return {
      success: false,
      message: "Network error while loading booking ticket",
      error: error.message,
    };
  }
}

export async function upsertTaxiAssignment(bookingId, payload) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/bookings/${bookingId}/assign-taxi`,
      {
        method: "POST",
        headers: buildAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: data.message || "Unable to save taxi assignment",
      };
    }
    return {
      success: true,
      data,
      message: data.message || "Taxi assignment saved",
    };
  } catch (error) {
    console.error("upsertTaxiAssignment error:", error);
    return {
      success: false,
      message: "Network error while saving taxi assignment",
      error: error.message,
    };
  }
}

// ===================== BOOKING LIFECYCLE OPERATIONS =====================

/**
 * Update booking status (start trip, end trip)
 */
export async function updateBookingStatus(bookingId, status, reason = "") {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/bookings/${bookingId}/status`,
      {
        method: "PATCH",
        headers: buildAuthHeaders(),
        body: JSON.stringify({ status, reason }),
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, message: data.message || "Failed to update status" };
    }
    return { success: true, data, message: data.message };
  } catch (error) {
    console.error("updateBookingStatus error:", error);
    return { success: false, message: "Network error" };
  }
}

/**
 * Complete trip with fare adjustments
 */
export async function completeTrip(bookingId, payload) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/bookings/${bookingId}/complete`,
      {
        method: "POST",
        headers: buildAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, message: data.message || "Failed to complete trip" };
    }
    return { success: true, data, message: data.message };
  } catch (error) {
    console.error("completeTrip error:", error);
    return { success: false, message: "Network error" };
  }
}

/**
 * Cancel booking with reason
 */
export async function cancelBooking(bookingId, reason) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/bookings/${bookingId}/cancel`,
      {
        method: "POST",
        headers: buildAuthHeaders(),
        body: JSON.stringify({ reason }),
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, message: data.message || "Failed to cancel booking" };
    }
    return { success: true, data, message: data.message };
  } catch (error) {
    console.error("cancelBooking error:", error);
    return { success: false, message: "Network error" };
  }
}

/**
 * Get booking notes
 */
export async function getBookingNotes(bookingId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/bookings/${bookingId}/notes`,
      {
        method: "GET",
        headers: buildAuthHeaders(),
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, message: data.message || "Failed to fetch notes" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("getBookingNotes error:", error);
    return { success: false, message: "Network error" };
  }
}

/**
 * Add booking note
 */
export async function addBookingNote(bookingId, content) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/bookings/${bookingId}/notes`,
      {
        method: "POST",
        headers: buildAuthHeaders(),
        body: JSON.stringify({ content }),
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, message: data.message || "Failed to add note" };
    }
    return { success: true, data, message: data.message };
  } catch (error) {
    console.error("addBookingNote error:", error);
    return { success: false, message: "Network error" };
  }
}

// ===================== HISTORY & PENDING PAYMENT OPERATIONS =====================

/**
 * Fetch completed bookings for History table
 */
export async function fetchCompletedBookings() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/history/completed`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, message: data.message || "Unable to load completed bookings" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("fetchCompletedBookings error:", error);
    return { success: false, message: "Network error" };
  }
}

/**
 * Fetch cancelled bookings for Cancelled History table
 */
export async function fetchCancelledBookings() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/history/cancelled`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, message: data.message || "Unable to load cancelled bookings" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("fetchCancelledBookings error:", error);
    return { success: false, message: "Network error" };
  }
}

/**
 * Fetch pending payment bookings
 */
export async function fetchPendingPayments() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/pending-payments`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, message: data.message || "Unable to load pending payments" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("fetchPendingPayments error:", error);
  }
}

// ===================== B2B DISPATCH OPERATIONS =====================

/**
 * Fetch all B2B bookings for admin dispatch
 */
export async function fetchB2BBookings() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/b2b-bookings`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, message: data.message || "Unable to load B2B bookings" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("fetchB2BBookings error:", error);
    return { success: false, message: "Network error" };
  }
}

/**
 * Assign taxi to a B2B booking
 */
export async function upsertB2BTaxiAssignment(bookingId, payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/b2b-bookings/${bookingId}/assign-taxi`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, message: data.message || "Failed to assign B2B taxi" };
    }
    return { success: true, data, message: data.message };
  } catch (error) {
    console.error("upsertB2BTaxiAssignment error:", error);
    return { success: false, message: "Network error" };
  }
}

/**
 * Mark B2B bill as paid (offline)
 */
export async function markB2BBillPaid(bookingId, payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/b2b-bookings/${bookingId}/mark-paid`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, message: data.message || "Failed to mark paid" };
    }
    return { success: true, data, message: data.message };
  } catch (error) {
    console.error("markB2BBillPaid error:", error);
    return { success: false, message: "Network error" };
  }
}

/**
 * Update B2B booking status
 */
export async function updateB2BBookingStatus(bookingId, status, reason = "") {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/b2b-bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: buildAuthHeaders(),
      body: JSON.stringify({ status, reason }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, message: data.message || "Failed to update B2B status" };
    }
    return { success: true, data, message: data.message };
  } catch (error) {
    console.error("updateB2BBookingStatus error:", error);
    return { success: false, message: "Network error" };
  }
}

/**
 * Complete B2B trip
 */
export async function completeB2BTrip(bookingId, payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/b2b-bookings/${bookingId}/complete`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, message: data.message || "Failed to complete B2B trip" };
    }
    return { success: true, data, message: data.message };
  } catch (error) {
    console.error("completeB2BTrip error:", error);
    return { success: false, message: "Network error" };
  }
}

/**
 * Cancel B2B booking
 */
export async function cancelB2BBooking(bookingId, reason) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/b2b-bookings/${bookingId}/cancel`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, message: data.message || "Failed to cancel B2B booking" };
    }
    return { success: true, data, message: data.message };
  } catch (error) {
    console.error("cancelB2BBooking error:", error);
    return { success: false, message: "Network error" };
  }
}

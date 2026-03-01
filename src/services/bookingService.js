const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api/v1";

export function createBooking(payload) {
  console.log("Booking request:", payload);
  return { data: true, error: null };
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken() {
  const userType = localStorage.getItem("userType");
  if (userType === "customer") {
    return localStorage.getItem("customerToken");
  } else if (userType === "business") {
    return localStorage.getItem("businessToken");
  }
  return null;
}

/**
 * Create a direct booking without payment integration (bypassing Razorpay)
 */
export async function createDirectBooking(payload) {
  try {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/bookings/create`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to create booking",
        status: response.status,
      };
    }

    return {
      success: true,
      ...data,
    };
  } catch (error) {
    console.error("createDirectBooking error:", error);
    return {
      success: false,
      message: "Unable to create booking. Please try again.",
      error: error.message,
    };
  }
}




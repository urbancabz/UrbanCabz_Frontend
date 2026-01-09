// src/services/paymentService.js
// Helper utilities to integrate Razorpay Checkout from the frontend.

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

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
 * Dynamically load Razorpay's checkout.js script if it's not already present.
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Call backend to create an order.
 * Expects backend endpoint: POST /api/v1/payments/create-order
 * (Base URL taken from VITE_API_BASE_URL, which should include `/api/v1`).
 */
export async function createPaymentOrder(payload) {
  try {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/payments/create-order`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to create payment order",
        status: response.status,
      };
    }

    // Expecting: { keyId, orderId, amount, currency }
    return {
      success: true,
      ...data,
    };
  } catch (error) {
    console.error("createPaymentOrder error:", error);
    return {
      success: false,
      message: "Unable to initiate payment. Please try again.",
      error: error.message,
    };
  }
}

/**
 * After successful payment on Razorpay, call backend to verify signature
 * and create booking.
 *
 * Expects backend endpoint: POST /api/v1/payments/verify-and-book
 */
export async function verifyAndBookPayment(payload) {
  try {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/payments/verify-and-book`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Payment verification failed",
        status: response.status,
      };
    }

    return {
      success: true,
      ...data,
    };
  } catch (error) {
    console.error("verifyAndBookPayment error:", error);
    return {
      success: false,
      message: "Unable to verify payment. Please contact support.",
      error: error.message,
    };
  }
}

/**
 * High-level helper that:
 *  1. Loads Razorpay JS SDK
 *  2. Calls backend to create order
 *  3. Opens Razorpay Checkout
 *  4. On success, calls backend to verify & create booking
 *
 * Resolves to the result of verifyAndBookPayment or a failure object.
 */
export async function initiateRazorpayPayment({
  amount,
  currency = "INR",
  bookingDetails = {},
  prefill = {},
}) {
  if (!amount || amount <= 0) {
    return {
      success: false,
      message: "Invalid payment amount",
    };
  }

  // Basic required fields before hitting backend validators
  if (!bookingDetails.from || !bookingDetails.to) {
    return {
      success: false,
      message: "Pickup and drop locations are required.",
    };
  }

  const sdkLoaded = await loadRazorpayScript();
  if (!sdkLoaded) {
    return {
      success: false,
      message: "Razorpay SDK failed to load. Please check your network.",
    };
  }

  // Transform bookingDetails to match backend expected format
  const formatScheduledAt = (date, time) => {
    if (!date || !time) return null;
    // Defensive: ignore placeholder values
    if (date === "—" || time === "—") return null;
    const dateTimeString = `${date}T${time}:00`;
    const ts = Date.parse(dateTimeString);
    if (Number.isNaN(ts)) {
      console.warn("Invalid scheduledAt value, skipping:", { date, time });
      return null;
    }
    return new Date(ts).toISOString();
  };

  const createOrderPayload = {
    amount,
    currency,
    pickupLocation: bookingDetails.from || "",
    dropLocation: bookingDetails.to || "",
    totalAmount: bookingDetails.totalFare || amount,
    scheduledAt: formatScheduledAt(bookingDetails.pickupDate, bookingDetails.pickupTime),
    distanceKm: bookingDetails.distanceKm || 0,
    estimatedFare: bookingDetails.totalFare || amount,
    carModel: bookingDetails.vehicleName || "",
  };

  const orderResult = await createPaymentOrder(createOrderPayload);

  if (!orderResult.success) {
    return orderResult;
  }

  const { keyId, orderId, amount: orderAmount, currency: orderCurrency } =
    orderResult;

  if (!window.Razorpay) {
    return {
      success: false,
      message: "Razorpay SDK not available on window.",
    };
  }

  return new Promise((resolve) => {
    const options = {
      key: keyId,
      amount: orderAmount,
      currency: orderCurrency,
      order_id: orderId,
      handler: async function (response) {
        // response.razorpay_payment_id
        // response.razorpay_order_id
        // response.razorpay_signature
        try {
          const result = await verifyAndBookPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            bookingDetails,
          });
          resolve(result);
        } catch (error) {
          console.error("verifyAndBookPayment handler error:", error);
          resolve({
            success: false,
            message: "Payment captured but verification failed. Please contact support.",
            error: error.message,
          });
        }
      },
      prefill: {
        name: prefill.name || "",
        email: prefill.email || "",
        contact: prefill.contact || "",
      },
      notes: bookingDetails || {},
      theme: {
        color: "#facc15", // Tailwind yellow-400
      },
      modal: {
        ondismiss: function () {
          resolve({
            success: false,
            cancelled: true,
            message: "Payment popup closed by user.",
          });
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  });
}



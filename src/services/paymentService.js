// src/services/paymentService.js
import { apiClient } from "./apiClient";

/**
 * Dynamically load Razorpay's checkout.js script
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
 * Create a payment order
 */
export async function createPaymentOrder(payload) {
  return apiClient.post("/payments/create-order", payload);
}

/**
 * Verify payment and create booking
 */
export async function verifyAndBookPayment(payload) {
  return apiClient.post("/payments/verify-and-book", payload);
}

/**
 * High-level helper for Razorpay payment flow
 */
export async function initiateRazorpayPayment({
  amount,
  currency = "INR",
  bookingDetails = {},
  prefill = {},
}) {
  if (!amount || amount <= 0) {
    return { success: false, message: "Invalid payment amount" };
  }

  if (!bookingDetails.from || !bookingDetails.to) {
    return { success: false, message: "Pickup and drop locations are required." };
  }

  const sdkLoaded = await loadRazorpayScript();
  if (!sdkLoaded) {
    return { success: false, message: "Razorpay SDK failed to load." };
  }

  const formatScheduledAt = (date, time) => {
    if (!date || !time || date === "—" || time === "—") return null;
    const ts = Date.parse(`${date}T${time}:00`);
    return Number.isNaN(ts) ? null : new Date(ts).toISOString();
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
  if (!orderResult.success) return orderResult;

  const { keyId, orderId, amount: orderAmount, currency: orderCurrency } = orderResult.data;

  return new Promise((resolve) => {
    const options = {
      key: keyId,
      amount: orderAmount,
      currency: orderCurrency,
      order_id: orderId,
      handler: async (response) => {
        const result = await verifyAndBookPayment({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          bookingDetails,
        });
        resolve(result);
      },
      prefill: {
        name: prefill.name || "",
        email: prefill.email || "",
        contact: prefill.contact || "",
      },
      theme: { color: "#facc15" },
      modal: {
        ondismiss: () => resolve({ success: false, cancelled: true, message: "Payment closed." }),
      },
    };
    new window.Razorpay(options).open();
  });
}

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BookingDetailsMain from "../Components/BookingDetails/BookingDetailsMain";
import BookingDetailsSidebar from "../Components/BookingDetails/BookingDetailsSidebar";
import { useAuth } from "../contexts/AuthContext";
import { initiateRazorpayPayment } from "../services/paymentService";

/**
 * CabBookingDetails page
 * Receives state via navigation and shows the BookingDetailsMain and Sidebar.
 *
 * Expect state: { listing, from, to, pickupDate, pickupTime, distanceKm }
 */
export default function CabBookingDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [passengerDetails, setPassengerDetails] = React.useState({
    name: user?.name || user?.fullName || "",
    phone: user?.phone || user?.mobile || "",
    email: user?.email || "",
    remarks: ""
  });
  const [formErrors, setFormErrors] = React.useState({});

  const handleFormChange = (field, value) => {
    setPassengerDetails(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const listing = state?.listing || {};
  const from = state?.from || "Pickup location";
  const to = state?.to || "Drop location";
  const pickupDate = state?.pickupDate || "—";
  const returnDate = state?.returnDate || "—";
  const pickupTime = state?.pickupTime || "—";
  const distanceKm = state?.distanceKm ?? null;
  const rideType = state?.rideType || "oneway";
  const isRoundTrip = rideType === "roundtrip";

  const basePrice = listing.basePrice ?? 12;

  const calculatePrice = () => {
    if (!distanceKm) return 0;

    let billableDistance = 0;
    const MIN_KM_PER_DAY = 300;

    if (rideType === "oneway" || rideType === "airport") {
      // One-way: Base 300km
      billableDistance = Math.max(MIN_KM_PER_DAY, distanceKm);
    } else if (rideType === "roundtrip") {
      // Round-trip: 300km * number of days
      let days = 1;
      if (pickupDate && returnDate && pickupDate !== "—" && returnDate !== "—") {
        const start = new Date(pickupDate);
        const end = new Date(returnDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        days = diffDays + 1; // Include both start and end day
      }

      const baseKm = days * MIN_KM_PER_DAY;
      const actualKm = distanceKm * 2;
      billableDistance = Math.max(baseKm, actualKm);
    }

    const pricePerKm = basePrice;
    const total = Math.round(billableDistance * pricePerKm);
    return { total, billableDistance };
  };

  const { total: price, billableDistance } = calculatePrice();

  const goBack = () => navigate(-1);

  const onPayNow = async (amount) => {
    // Validate Form
    const errors = {};
    if (!passengerDetails.name.trim()) errors.name = "Name is required";
    if (!passengerDetails.phone.trim()) errors.phone = "Phone is required";
    else if (!/^\d{10}$/.test(passengerDetails.phone.replace(/\D/g, ''))) errors.phone = "Invalid phone number (10 digits required)";
    if (!passengerDetails.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passengerDetails.email)) errors.email = "Invalid email format";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      alert("Please correct the errors in passenger details.");
      return;
    }

    const bookingDetails = {
      amount,
      totalFare: price,
      payNowAmount: amount,
      vehicleId: listing.id,
      vehicleName: listing.name,
      vehicleType: listing.vehicleType,
      from,
      to,
      pickupDate,
      returnDate,
      pickupTime,
      distanceKm: billableDistance,
      rideType,
      passengerDetails, // Pass collected details
    };

    // Use user details from form for prefill
    const prefill = {
      name: passengerDetails.name,
      email: passengerDetails.email,
      contact: passengerDetails.phone,
    };

    const result = await initiateRazorpayPayment({
      amount,
      currency: "INR",
      bookingDetails,
      prefill,
    });

    if (result.success) {
      alert("Payment  successfuland booking confirmed!");
      navigate("/");
    } else if (!result.cancelled) {
      alert(result.message || "Payment failed. Please try again.");
    }
  };

  return (
    <div className="pt-24 pb-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-yellow-600">
              Review & confirm
            </p>
            <h1 className="mt-1 text-2xl md:text-3xl font-extrabold text-slate-900">
              Cab booking summary
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Check your trip details and choose how you want to pay.
            </p>
          </div>

          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:border-slate-300"
          >
            <span className="text-base">←</span>
            Back to cab options
          </button>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left: booking details (scrolls with page) */}
          <div className="lg:col-span-2 space-y-6">
            <BookingDetailsMain
              listing={listing}
              from={from}
              to={to}
              pickupDate={pickupDate}
              pickupTime={pickupTime}
              distanceKm={billableDistance}
              rideType={rideType}
              price={price}
              formData={passengerDetails}
              formErrors={formErrors}
              onFormChange={handleFormChange}
              onBack={goBack}
            />
          </div>

          {/* Right: payment summary (floats on large screens) */}
          <aside className="lg:sticky lg:top-28">
            <BookingDetailsSidebar price={price} onPayNow={onPayNow} />
          </aside>
        </div>
      </div>
    </div>
  );
}

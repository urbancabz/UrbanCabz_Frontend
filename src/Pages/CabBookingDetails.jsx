import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BookingDetailsMain from "../Components/BookingDetails/BookingDetailsMain";
import BookingDetailsSidebar from "../Components/BookingDetails/BookingDetailsSidebar";
import { useAuth } from "../contexts/AuthContext";
import * as yup from "yup";
import { createDirectBooking } from "../services/bookingService";
import { fetchPricingSettings } from "../services/fleetService";

/**
 * CabBookingDetails page
 * Receives state via navigation and shows the BookingDetailsMain and Sidebar.
 *
 * Expect state: { listing, from, to, pickupDate, pickupTime, distanceKm }
 */

const bookingSchema = yup.object().shape({
  name: yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .matches(/^[a-zA-Z\s]*$/, "Name can only contain alphabetic characters and spaces"),
  phone: yup.string()
    .required("Phone is required")
    .matches(/^\+?\d[\d\s]*\d$/, "Please enter a valid mobile number with an optional country code (e.g., +91 9876543210)")
    .test('len', 'Invalid phone number (10 digits required)', val => val && val.replace(/\D/g, '').length >= 10),
  email: yup.string().email("Invalid email format").required("Email is required"),
});

export default function CabBookingDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [passengerDetails, setPassengerDetails] = React.useState(() => {
    let formattedPhone = user?.phone || user?.mobile || "";
    if (formattedPhone.startsWith("+91") && formattedPhone.length > 3 && formattedPhone[3] !== ' ') {
      formattedPhone = `+91 ${formattedPhone.slice(3)}`;
    }
    return {
      name: user?.name || user?.fullName || "",
      phone: formattedPhone,
      email: user?.email || "",
      remarks: ""
    };
  });
  const [formErrors, setFormErrors] = React.useState({});
  const [pricingSettings, setPricingSettings] = React.useState(null);

  React.useEffect(() => {
    const loadSettings = async () => {
      const res = await fetchPricingSettings();
      if (res.success) setPricingSettings(res.data);
    };
    loadSettings();
  }, []);

  const handleFormChange = (field, value) => {
    let newValue = value;

    // Sync UI formatting for phone numbers like in Profile
    if (field === "phone") {
      newValue = newValue.replace(/[^\d\s+]/g, ""); // Allow only digits, space, plus
      // Auto-format spacing after country code if standard +91 is used without spaces
      if (newValue.startsWith("+91") && newValue.length > 3 && newValue[3] !== ' ') {
        newValue = newValue.slice(0, 3) + ' ' + newValue.slice(3);
      }
    }

    setPassengerDetails(prev => ({ ...prev, [field]: newValue }));
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
    if (!distanceKm || !pricingSettings) return { total: 0, billableDistance: 0 };

    let billableDistance = 0;
    const RULE_MIN_KM = 300;

    const {
      min_km_threshold,
      min_km_airport_apply,
      min_km_oneway_apply,
      min_km_roundtrip_apply
    } = pricingSettings;

    // Check if 300km rule should be applied
    let applyRule = false;
    if (distanceKm > min_km_threshold) {
      if (rideType === "airport" && min_km_airport_apply) applyRule = true;
      else if (rideType === "oneway" && min_km_oneway_apply) applyRule = true;
      else if (rideType === "roundtrip" && min_km_roundtrip_apply) applyRule = true;
    }

    const effectiveMinKmPerDay = applyRule ? RULE_MIN_KM : 0;

    if (rideType === "oneway" || rideType === "airport") {
      billableDistance = Math.max(effectiveMinKmPerDay, distanceKm);
    } else if (rideType === "roundtrip") {
      let days = 1;
      if (pickupDate && returnDate && pickupDate !== "—" && returnDate !== "—") {
        const start = new Date(pickupDate);
        const end = new Date(returnDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        days = diffDays + 1;
      }

      const baseKm = days * effectiveMinKmPerDay;
      const actualKm = distanceKm * 2;
      billableDistance = Math.max(baseKm, actualKm);
    }

    const pricePerKm = basePrice;
    const total = Math.round(billableDistance * pricePerKm);
    return { total, billableDistance };
  };

  const { total: price, billableDistance } = calculatePrice();

  const goBack = () => navigate(-1);

  const onBookNow = async () => {
    // Validate Form
    setFormErrors({});

    try {
      await bookingSchema.validate(passengerDetails, { abortEarly: false });
    } catch (err) {
      if (err.inner) {
        const errors = {};
        err.inner.forEach((error) => {
          errors[error.path] = error.message;
        });
        setFormErrors(errors);
      }
      return;
    }

    const payload = {
      pickupLocation: from,
      dropLocation: to,
      distanceKm: billableDistance,
      estimatedFare: price,
      totalAmount: price,
      carModel: listing.name,
      // Format scheduledAt to expected ISO format if provided
      scheduledAt: (pickupDate && pickupDate !== "—" && pickupTime && pickupTime !== "—")
        ? new Date(`${pickupDate}T${pickupTime}:00`).toISOString()
        : null
    };

    const result = await createDirectBooking(payload);

    if (result.success) {
      alert("Booking confirmed successfully! (Payment pending by admin)");
      navigate("/");
    } else {
      alert(result.message || "Booking failed. Please try again.");
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
            <BookingDetailsSidebar price={price} onBookNow={onBookNow} />
          </aside>
        </div>
      </div>
    </div>
  );
}

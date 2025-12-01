import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BookingDetailsMain from "../Components/BookingDetails/BookingDetailsMain";
import BookingDetailsSidebar from "../Components/BookingDetails/BookingDetailsSidebar";

/**
 * CabBookingDetails page
 * Receives state via navigation and shows the BookingDetailsMain and Sidebar.
 *
 * Expect state: { listing, from, to, pickupDate, pickupTime, distanceKm }
 */
export default function CabBookingDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const listing = state?.listing || {};
  const from = state?.from || "Pickup location";
  const to = state?.to || "Drop location";
  const pickupDate = state?.pickupDate || "—";
  const pickupTime = state?.pickupTime || "—";
  const distanceKm = state?.distanceKm ?? null;
  const rideType = state?.rideType || "oneway";
  const isRoundTrip = rideType === "roundtrip";

  const basePrice = listing.basePrice ?? 12;

  const calculatePrice = () => {
    if (!distanceKm) return 0;
    const billableDistance = distanceKm * (isRoundTrip ? 2 : 1);
    let pricePerKm = basePrice;
    if (billableDistance > 300) pricePerKm = basePrice * 0.9;
    return Math.round(billableDistance * pricePerKm);
  };

  const price = calculatePrice();

  const goBack = () => navigate(-1);
  const onPayNow = () => {
    // Replace with payment flow
    alert(`Proceed to payment for ₹${price}`);
  };

  return (
    <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BookingDetailsMain
            listing={listing}
            from={from}
            to={to}
            pickupDate={pickupDate}
            pickupTime={pickupTime}
            distanceKm={distanceKm}
            rideType={rideType}
            price={price}
            onBack={goBack}
          />
        </div>

        <aside>
          <BookingDetailsSidebar price={price} onPayNow={onPayNow} />
        </aside>
      </div>
    </div>
  );
}

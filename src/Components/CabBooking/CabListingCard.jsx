// src/Components/CabBooking/CabListingCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function CabListingCard({
  listing = {},
  from,
  to,
  distanceKm,
  rideType = "oneway",
  pickupDate,
  returnDate,
  pickupTime,
  pricingSettings,
}) {
  const {
    name,
    seats = 4,
    bags = 2,
    basePrice = 12,
    tags = [],
    rating,
    vehicleType = "Sedan",
    image,
  } = listing;

  const calculatePrice = () => {
    if (!distanceKm || !pricingSettings) return 0;

    let billableDistance = 0;
    const RULE_MIN_KM = 300;

    // Use global settings
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
      // One-way / Airport logic
      billableDistance = Math.max(effectiveMinKmPerDay, distanceKm);
    } else if (rideType === "roundtrip") {
      // Round-trip logic
      let days = 1;
      if (pickupDate && returnDate && pickupDate !== "—" && returnDate !== "—") {
        const start = new Date(pickupDate);
        const end = new Date(returnDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        days = diffDays + 1; // Include both start and end day
      }

      const baseKm = days * effectiveMinKmPerDay;
      const actualKm = distanceKm * 2; // Roundtrip distance is 2x
      billableDistance = Math.max(baseKm, actualKm);
    }

    const pricePerKm = basePrice;
    const totalPrice = Math.round(billableDistance * pricePerKm);
    return totalPrice;
  };

  // Helper to check if min charge note should be shown
  const isMinChargeApplied = () => {
    if (!pricingSettings || !distanceKm) return false;
    const { min_km_threshold, min_km_airport_apply, min_km_oneway_apply, min_km_roundtrip_apply } = pricingSettings;

    if (distanceKm <= min_km_threshold) return false;

    if (rideType === "airport" && min_km_airport_apply && distanceKm < 300) return true;
    if (rideType === "oneway" && min_km_oneway_apply && distanceKm < 300) return true;

    if (rideType === "roundtrip" && min_km_roundtrip_apply) {
      let days = 1;
      if (pickupDate && returnDate && pickupDate !== "—" && returnDate !== "—") {
        days = Math.ceil(Math.abs(new Date(returnDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24)) + 1;
      }
      return (distanceKm * 2) < (300 * days);
    }
    return false;
  };

  const isRoundTrip = rideType === "roundtrip";
  const price = calculatePrice();
  const originalPrice = price > 0 ? Math.round(price * 1.15) : 0;
  const discountPercent = 13;

  const navigate = useNavigate();

  const onBookNow = () => {
    // Validate that location and calculation are done
    if (!distanceKm || distanceKm <= 0) {
      alert("Please wait for distance calculation to complete before booking.");
      return;
    }

    if (!from || !to || from === "Pickup location" || to === "Drop location") {
      alert("Please ensure both pickup and drop locations are selected.");
      return;
    }

    navigate("/cab-booking-details", {
      state: {
        listing,
        from,
        to,
        distanceKm,
        rideType,
        pickupDate,
        returnDate,
        pickupTime,
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 border border-slate-100 transition-all duration-300 overflow-hidden group">
      <div className="p-5 sm:p-7">
        {/* Mobile: Stack vertically, Desktop: Horizontal layout */}
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-8">
          {/* CAR IMAGE */}
          <div className="w-full sm:w-40 flex-shrink-0 mx-auto sm:mx-0">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl h-36 sm:h-32 flex items-center justify-center overflow-hidden p-4 border border-slate-200 group-hover:border-yellow-400/30 transition-colors">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'block';
                    }
                  }}
                />
              ) : (
                <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                </svg>
              )}
              <svg style={{ display: 'none' }} className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
            <div className="text-center text-xs mt-3 text-slate-500 font-bold uppercase tracking-wider bg-slate-100/50 rounded-full py-1.5 px-3">
              {vehicleType}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              {/* Header: Name, Rating */}
              <div className="mb-4">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 truncate">{name}</h3>
                {rating && (
                  <div className="text-sm text-yellow-600 flex items-center gap-1.5 bg-yellow-50 w-fit px-2 py-0.5 rounded-lg border border-yellow-100">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                    <span className="font-bold">{rating}</span>
                    <span className="text-yellow-400 mx-1">|</span>
                    <span className="text-yellow-700/80 font-medium">Top Rated</span>
                  </div>
                )}
              </div>

              {/* Features: Seats, Bags, Distance */}
              <div className="flex flex-wrap gap-3 sm:gap-6 items-center text-sm text-slate-600 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-semibold">{seats} Seats</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  <span className="font-semibold">{bags} Bags</span>
                </div>

                {distanceKm && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="font-bold">
                      {isRoundTrip ? `${(distanceKm * 2).toFixed(1)} km` : `${distanceKm} km`}
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {tags.map((t, i) => (
                  <span
                    key={i}
                    className="text-[10px] uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md font-bold border border-slate-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ACTION BUTTON SECTION - Aligned with price */}
          <div className="flex flex-col items-end justify-between sm:border-l border-slate-100 sm:pl-8 sm:min-w-[180px]">
            {/* Price Section */}
            <div className="text-right w-full sm:w-auto mb-4 sm:mb-0">
              {price > 0 && originalPrice && (
                <div className="text-xs sm:text-sm line-through text-slate-400 mb-1 font-medium">
                  ₹{originalPrice.toLocaleString()}
                </div>
              )}
              <div className="text-3xl sm:text-4xl font-black text-slate-900 leading-none">
                {price > 0 ? `₹${price.toLocaleString()}` : <span className="text-slate-300 text-xl">---</span>}
              </div>
              {price > 0 && (
                <div className="flex flex-col items-end gap-1 mt-2">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md inline-block shadow-sm">
                    {discountPercent}% OFF TODAY
                  </span>
                  {isRoundTrip && (
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Roundtrip
                    </span>
                  )}
                  {isMinChargeApplied() ? (
                    <span className="text-[9px] text-amber-600 font-medium italic mt-1 text-right">
                      *Min 300km/day charge applies
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            <div className="w-full flex flex-col gap-3 items-end">
              {/* Free Cancellation Badge */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Free Cancellation</span>
              </div>

              {/* Book Now Button */}
              <button
                onClick={onBookNow}
                disabled={!price}
                className="w-full px-8 py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 rounded-xl font-bold hover:from-yellow-300 hover:to-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-yellow-400/20 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md text-sm sm:text-base whitespace-nowrap"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
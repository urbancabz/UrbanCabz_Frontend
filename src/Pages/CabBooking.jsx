// src/Pages/CabBooking.jsx
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import CabListingCard from "../Components/CabBooking/CabListingCard";
import BookingSidebar from "../Components/CabBooking/BookingSidebar";

export default function CabBooking() {
  const { state } = useLocation();
  const from = state?.from || "Pickup location";
  const to = state?.to || "Drop location";
  const pickupDate = state?.pickupDate || "—";
  const pickupTime = state?.pickupTime || "—";
  const rideType = state?.rideType || "airport";

  const [distanceKm, setDistanceKm] = useState(null);

  const handleDistanceCalculated = (metrics) => {
    setDistanceKm(metrics.distanceKm);
  };

  // Vehicle listings with car images
  const listings = [
    {
      id: 1,
      name: "Swift Dzire or Similar",
      seats: 4,
      bags: 2,
      basePrice: 12,
      tags: ["AC", "Music System", "Comfortable"],
      rating: 4.5,
      vehicleType: "Sedan",
      image: "/Dzire.avif",
    },
    {
      id: 2,
      name: "Toyota Innova or Similar",
      seats: 7,
      bags: 4,
      basePrice: 18,
      tags: ["Spacious", "AC", "Premium"],
      rating: 4.7,
      vehicleType: "SUV",
      image: "/Inova.jpg", 
    },
    {
      id: 3,
      name: "Maruti Ertiga or Similar",
      seats: 6,
      bags: 3,
      basePrice: 15,
      tags: ["Family Car", "AC", "Spacious"],
      rating: 4.4,
      vehicleType: "MUV",
      image: "Ertiga.avif",
    },
  ];

  return (
    <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="
          bg-gray-900/95 
          text-white 
          rounded-2xl 
          p-6 mb-6 
          shadow-xl 
          border border-gray-700
        ">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

    {/* Left — ride info */}
    <div className="space-y-1">
      <div className="text-sm text-gray-300 font-medium tracking-wide">
        {rideType === "airport" ? "✈️ Airport Transfer" : "🚗 " + rideType}
      </div>

      <div className="text-3xl font-extrabold flex items-center gap-2">
        <span>{from}</span>
        <span className="text-yellow-400">→</span>
        <span>{to}</span>
      </div>
    </div>

    {/* Divider (mobile only) */}
    <div className="block md:hidden border-t border-gray-700"></div>

    {/* Right — date/time */}
    <div className="text-right space-y-1">
      <div className="text-gray-300 text-sm">Pickup Date & Time</div>
      <div className="font-semibold text-xl">
        {pickupDate} • <span className="text-yellow-400">{pickupTime}</span>
      </div>
    </div>
  </div>
</div>


        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-2">Available Vehicles</h3>
              <p className="text-sm text-gray-600">
                {distanceKm 
                  ? `Prices calculated for ${distanceKm} km journey` 
                  : 'Calculating distance...'}
              </p>
            </div>

            {listings.map((listing) => (
              <CabListingCard
                key={listing.id}
                listing={listing}
                from={from}
                to={to}
                distanceKm={distanceKm}
                rideType={rideType}
                pickupDate={pickupDate}
                pickupTime={pickupTime}
              />
            ))}

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
              <div className="flex gap-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-semibold text-blue-900">Flexible Cancellation</div>
                  <div className="text-sm text-blue-800 mt-1">
                    Free cancellation up to 1 hour before pickup. No questions asked.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <BookingSidebar
              from={from}
              to={to}
              pickupDate={pickupDate}
              pickupTime={pickupTime}
              onDistanceCalculated={handleDistanceCalculated}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
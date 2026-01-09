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
  const returnDate = state?.returnDate || "—";
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
      name: "Swift Dzire",
      seats: 4,
      bags: 2,
      basePrice: 13,
      tags: ["AC", "Music System", "Comfortable"],
      rating: 4.5,
      vehicleType: "Sedan",
      image: "/Dzire.avif",
    },
    {
      id: 2,
      name: "Toyota Etios",
      seats: 4,
      bags: 2,
      basePrice: 13,
      tags: ["AC", "Music System", "Comfortable"],
      rating: 4.3,
      vehicleType: "Sedan",
      image: "/etios.jpeg",
    },
    {
      id: 3,
      name: "Toyota Innova Crysta",
      seats: 7,
      bags: 4,
      basePrice: 22,
      tags: ["Spacious", "AC", "Premium"],
      rating: 4.7,
      vehicleType: "SUV",
      image: "/Inova.jpg",
    },
    {
      id: 4,
      name: "Toyota Innova hycross",
      seats: 7,
      bags: 4,
      basePrice: 25,
      tags: ["Spacious", "AC", "Premium"],
      rating: 4.7,
      vehicleType: "SUV",
      image: "/Hycross.avif",
    },
    {
      id: 5,
      name: "Tempo traveler",
      seats: 6,
      bags: 3,
      basePrice: 30,
      tags: ["Family Car", "AC", "Spacious"],
      rating: 4.4,
      vehicleType: "LCV",
      image: "traveller.webp",
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-slate-800 mb-2 text-base sm:text-lg">Available Vehicles</h3>
              <p className="text-sm sm:text-base text-slate-600">
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
                returnDate={returnDate}
                pickupTime={pickupTime}
              />
            ))}

            <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 border border-slate-800 shadow-lg">
              <div className="flex gap-3 sm:gap-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-bold text-white text-sm sm:text-base mb-1">Flexible Cancellation</div>
                  <div className="text-xs sm:text-sm text-slate-300">
                    Free cancellation up to 1 hour before pickup. No questions asked.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-28">
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
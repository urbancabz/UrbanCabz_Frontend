// src/Components/CabBooking/CabListingCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function CabListingCard({ listing = {}, from, to, distanceKm }) {
  const {
    name,
    seats = 4,
    bags = 2,
    basePrice = 12,
    tags = [],
    rating,
    vehicleType = "Sedan",
    image, // Add image prop
  } = listing;

  // Calculate price based on distance
  const calculatePrice = () => {
    if (!distanceKm) return 0;
    
    let pricePerKm = basePrice;
    
    if (distanceKm > 300) {
      pricePerKm = basePrice * 0.9;
    }
    
    const totalPrice = Math.round(distanceKm * pricePerKm);
    return totalPrice;
  };

  const price = calculatePrice();
  const originalPrice = price > 0 ? Math.round(price * 1.15) : 0;
  const discountPercent = 13;

  const navigate = useNavigate();

  const onBookNow = () => {
    // navigate to details page with all relevant info so CabBookingDetails is fully populated
    navigate("/cab-booking-details", {
      state: {
        listing,
        from,
        to,
        distanceKm,
        // if you have pickup date/time available at parent, pass them in as well
        pickupDate: undefined,
        pickupTime: undefined,
      },
    });
  };

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 p-4 flex gap-4 items-center">
      {/* CAR IMAGE - Updated Section */}
      <div className="w-32 flex-shrink-0">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg h-24 flex items-center justify-center overflow-hidden p-2">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                // Fallback to icon if image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : (
            <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          )}
          {/* Hidden fallback icon */}
          <svg style={{ display: 'none' }} className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </div>
        <div className="text-center text-xs mt-2 text-gray-600 font-medium bg-gray-100 rounded-full py-1">
          {vehicleType}
        </div>
      </div>

      {/* Rest of the card remains the same */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-lg font-bold text-gray-800">{name}</div>
            {rating && (
              <div className="text-sm text-yellow-600 mt-1 flex items-center gap-1">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
                {rating}
              </div>
            )}
          </div>

          <div className="text-right">
            {price > 0 && originalPrice && (
              <div className="text-sm line-through text-gray-400">
                ₹{originalPrice.toLocaleString()}
              </div>
            )}
            <div className="text-2xl font-bold text-gray-900">
              {price > 0 ? `₹${price.toLocaleString()}` : 'Calculating...'}
            </div>
            {price > 0 && (
              <div className="text-sm text-green-600 font-medium">
                {discountPercent}% off
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 items-center text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {seats} Seats
          </div>

          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            {bags} Bags
          </div>
          
          {distanceKm && (
            <div className="flex items-center gap-1 text-blue-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {distanceKm} km
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((t, i) => (
            <span
              key={i}
              className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-between items-end gap-3">
        <div className="text-right">
          <div className="text-xs text-green-600 font-semibold flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Free Cancellation
          </div>
        </div>
        <button
          onClick={onBookNow}
          disabled={!price}
          className="px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-lg font-bold hover:from-yellow-500 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
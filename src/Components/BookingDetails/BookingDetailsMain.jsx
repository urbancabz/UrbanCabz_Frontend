import React from "react";
import { useAuth } from "../../context/AuthContext";

/**
 * BookingDetailsMain
 * Left column: vehicle summary, inclusions/exclusions, and passenger form.
 * This is a reusable presentational component — accepts props for all dynamic values.
 */
export default function BookingDetailsMain({
  listing = {},
  from,
  to,
  pickupDate,
  pickupTime,
  distanceKm,
  rideType = "oneway",
  price,
  onBack = () => {},
}) {
  const { user } = useAuth();
  const {
    name = "Vehicle",
    vehicleType = "Sedan",
    image = "/Dzire.avif",
    tags = [],
  } = listing;

  return (
    <div className="space-y-6">
      {/* Top card: vehicle + trip summary */}
      <div className="bg-white rounded-2xl shadow-md p-6 flex gap-6">
        <div className="w-36 flex-shrink-0">
          <div className="rounded-xl overflow-hidden bg-gray-100 p-4">
            <img src={image} alt={name} className="w-full h-28 object-contain" />
          </div>
          <div className="text-center mt-3 text-sm font-semibold bg-gray-100 rounded-full py-2">{vehicleType}</div>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-800">
                {name} <span className="text-yellow-500">★</span>
              </h2>

              <div className="mt-3 bg-indigo-50 rounded-lg p-4 text-sm text-gray-700">
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold">Pickup</div>
                    <div className="text-sm mt-1">{from}</div>
                    <div className="text-xs text-gray-500 mt-2">{pickupDate} • {pickupTime}</div>
                  </div>

                  <div className="border-l pl-6">
                    <div className="font-semibold">Drop-Off</div>
                    <div className="text-sm mt-1">{to}</div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 flex-wrap">
                  {tags && tags.length ? tags.map((t, i) => (
                    <span key={i} className="text-xs bg-white/70 px-3 py-1 rounded-full border">{t}</span>
                  )) : (
                    <>
                      <span className="text-xs bg-white/70 px-3 py-1 rounded-full border">Tissues</span>
                      <span className="text-xs bg-white/70 px-3 py-1 rounded-full border">Sanitiser</span>
                      <span className="text-xs bg-white/70 px-3 py-1 rounded-full border">Car Freshner</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-extrabold">{price > 0 ? `₹${price.toLocaleString()}` : '—'}</div>
              <div className="text-sm text-gray-500">{distanceKm ? `${distanceKm} km` : 'Calculating...'}</div>
              {rideType === "roundtrip" && (
                <div className="text-xs text-gray-500 mt-1">Includes return journey</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inclusions / Exclusions */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-xl mb-3">Inclusions <span className="text-sm text-gray-500">(included in the price)</span></h3>
            <ul className="list-disc pl-5 text-gray-700">
              <li>{distanceKm ? `${distanceKm} km` : 'Calculating...'}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-xl mb-3">Exclusions <span className="text-sm text-gray-500">(Not included in the price)</span></h3>
            <ul className="list-disc pl-5 text-gray-700">
              <li>Night Charges</li>
              <li>Toll Charges</li>
              <li>State Tax</li>
              <li>Parking Charges</li>
              <li>Waiting Charges (After 45 mins: ₹100 / 30 mins)</li>
              <li>Fare Beyond 260 Kms (₹19 / Km)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Trip Details Form */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="font-bold text-xl mb-4">Trip Details</h3>

        <form className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Pick-up Address</label>
            <input
              value={from || ""}
              readOnly
              className="w-full rounded-xl border px-4 py-3 bg-gray-50 text-gray-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Drop-off Address</label>
            <input
              value={to || ""}
              readOnly
              className="w-full rounded-xl border px-4 py-3 bg-gray-50 text-gray-700 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Name</label>
              <input
                placeholder="Your name"
                defaultValue={user?.name || ""}
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Contact No</label>
              <input
                placeholder="+91 9XXXXXXXXX"
                defaultValue={user?.phone || ""}
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Email Id</label>
              <input
                placeholder="you@example.com"
                defaultValue={user?.email || ""}
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Remark (Optional)</label>
              <input placeholder="remarks" className="w-full rounded-xl border px-4 py-3" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="agree" defaultChecked />
              <label htmlFor="agree" className="text-sm text-gray-700">By proceeding to book, I Agree to Terms</label>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

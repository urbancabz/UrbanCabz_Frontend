import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Input() {
  const [rideType, setRideType] = useState("airport");
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const cities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai",
    "Ahmedabad", "Jaipur", "Kolkata", "Surat", "Lucknow", "Indore",
    "Nagpur", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad",
    "Ludhiana", "Agra", "Nashik", "Rajkot", "Faridabad", "Meerut", "Kochi",
    "Varanasi", "Amritsar", "Coimbatore", "Vijayawada", "Mysore", "Chandigarh",
    "Guwahati", "Ranchi", "Raipur", "Jodhpur", "Noida", "Udaipur", "Dehradun"
  ];

  const airports = [
    "Indira Gandhi International Airport (Delhi)",
    "Chhatrapati Shivaji Maharaj International Airport (Mumbai)",
    "Kempegowda International Airport (Bangalore)",
    "Rajiv Gandhi International Airport (Hyderabad)",
    "Chennai International Airport (Chennai)",
    "Netaji Subhas Chandra Bose International Airport (Kolkata)",
    "Sardar Vallabhbhai Patel International Airport (Ahmedabad)",
    "Cochin International Airport (Kochi)",
    "Pune International Airport (Pune)",
    "Jaipur International Airport (Jaipur)",
    "Goa International Airport (Dabolim)",
    "Visakhapatnam International Airport (Visakhapatnam)"
  ];

  const getSuggestions = (query, type) =>
    (type === "airport" ? airports : cities).filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white/15 backdrop-blur-md border border-white/30 rounded-3xl p-8 md:p-10 shadow-2xl text-gray-900 mx-auto max-w-5xl"
    >
      {/* Ride Type Buttons */}
      <div className="flex justify-center gap-6 mb-8 flex-wrap">
        {[
          { value: "airport", label: "✈️ Airport" },
          { value: "oneway", label: "🛣️ One-Way" },
          { value: "roundtrip", label: "🔁 Round Trip" },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setRideType(option.value)}
            className={`px-5 py-2.5 rounded-full transition-all duration-300 font-semibold ${
              rideType === option.value
                ? "bg-yellow-400 text-gray-900 shadow-lg scale-105"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Form Fields */}
      <AnimatePresence mode="wait">
        <motion.form
          key={rideType}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -25 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* From */}
          <div className="relative">
            <label className="block text-sm font-semibold text-white mb-1">
              From
            </label>
            <input
              type="text"
              value={fromQuery}
              onChange={(e) => {
                setFromQuery(e.target.value);
                setShowFromSuggestions(true);
              }}
              placeholder={
                rideType === "airport"
                  ? "Select pickup airport"
                  : "Enter pickup city"
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
            {showFromSuggestions && fromQuery && (
              <ul className="absolute left-0 right-0 bg-white text-gray-800 rounded-lg shadow-lg mt-1 z-50 max-h-48 overflow-y-auto">
                {getSuggestions(fromQuery, rideType).length > 0 ? (
                  getSuggestions(fromQuery, rideType).map((s, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setFromQuery(s);
                        setShowFromSuggestions(false);
                      }}
                      className="px-4 py-2 hover:bg-yellow-100 cursor-pointer"
                    >
                      {s}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-500">No matches found</li>
                )}
              </ul>
            )}
          </div>

          {/* To */}
          <div className="relative">
            <label className="block text-sm font-semibold text-white mb-1">
              To
            </label>
            <input
              type="text"
              value={toQuery}
              onChange={(e) => {
                setToQuery(e.target.value);
                setShowToSuggestions(true);
              }}
              placeholder={
                rideType === "airport"
                  ? "Select destination airport"
                  : "Enter destination city"
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
            {showToSuggestions && toQuery && (
              <ul className="absolute left-0 right-0 bg-white text-gray-800 rounded-lg shadow-lg mt-1 z-50 max-h-48 overflow-y-auto">
                {getSuggestions(toQuery, rideType).length > 0 ? (
                  getSuggestions(toQuery, rideType).map((s, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setToQuery(s);
                        setShowToSuggestions(false);
                      }}
                      className="px-4 py-2 hover:bg-yellow-100 cursor-pointer"
                    >
                      {s}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-500">No matches found</li>
                )}
              </ul>
            )}
          </div>

          {/* Pickup Date */}
          <div>
            <label className="block text-sm font-semibold text-white mb-1">
              Pickup Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
          </div>

          {/* Pickup Time */}
          <div>
            <label className="block text-sm font-semibold text-white mb-1">
              Pickup Time
            </label>
            <input
              type="time"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
          </div>

          {/* Return fields for roundtrip */}
          {rideType === "roundtrip" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-white mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-1">
                  Drop Time
                </label>
                <input
                  type="time"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                />
              </div>
            </>
          )}
        </motion.form>
      </AnimatePresence>

      {/* Book Ride Button */}
      <div className="text-center mt-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-10 py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-300 transition duration-300 shadow-lg hover:shadow-2xl"
        >
          🚖 Book Ride
        </motion.button>
      </div>
    </motion.div>
  );
}

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Input() {
  const [rideType, setRideType] = useState("airport");
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  // ADDED: pickup date/time state (behavior only — UI unchanged)
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");

  const navigate = useNavigate();

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

  const hideWithDelay = (setter) => {
    setTimeout(() => setter(false), 150);
  };

  // ADDED: navigation handler (only logic, no UI change)
  const onBook = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!fromQuery || !toQuery) {
      return alert("Please enter both From and To");
    }

    navigate("/cab-booking", {
      state: {
        from: fromQuery,
        to: toQuery,
        pickupDate,
        pickupTime,
        rideType,
      },
    });
  };

  return (
    // Note: if your header is fixed, make sure your page wrapper (e.g. <main>) has top padding like `pt-16`
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="
        bg-white/15 backdrop-blur-md border border-white/30 
        rounded-3xl p-4 md:p-6 lg:p-8
        mx-auto max-w-2xl w-[95%] 
        relative z-40
        /* keep component from exceeding viewport - allow inner scroll */
        max-h-[calc(100vh-140px)] overflow-y-auto
      "
    >
      {/* Ride Type Buttons */}
      <div className="flex justify-center gap-3 mb-5 flex-wrap">
        {[
          { value: "airport", label: "✈️ Airport" },
          { value: "oneway", label: "🛣️ One-Way" },
          { value: "roundtrip", label: "🔁 Round Trip" },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setRideType(option.value)}
            className={`px-4 py-2 rounded-full transition-all duration-200 font-semibold text-sm ${
              rideType === option.value
                ? "bg-yellow-400 text-gray-900 shadow-md scale-105"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Form: stack on small and medium (laptop), go to 2-col only on large screens */}
      <AnimatePresence mode="wait">
        <motion.form
          key={rideType}
          layout
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
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
              onBlur={() => hideWithDelay(setShowFromSuggestions)}
              onFocus={() => fromQuery && setShowFromSuggestions(true)}
              placeholder={
                rideType === "airport"
                  ? "Select pickup airport"
                  : "Enter pickup city"
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 text-white outline-none bg-transparent text-sm"
            />
            {showFromSuggestions && fromQuery && (
              <ul className="absolute left-0 right-0 bg-white text-gray-800 rounded-lg shadow-lg mt-1 z-[120] max-h-40 overflow-y-auto">
                {getSuggestions(fromQuery, rideType).length > 0 ? (
                  getSuggestions(fromQuery, rideType).map((s, i) => (
                    <li
                      key={i}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setFromQuery(s);
                        setShowFromSuggestions(false);
                      }}
                      className="px-3 py-2 hover:bg-yellow-100 cursor-pointer text-sm"
                    >
                      {s}
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-gray-500 text-sm">No matches found</li>
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
              onBlur={() => hideWithDelay(setShowToSuggestions)}
              onFocus={() => toQuery && setShowToSuggestions(true)}
              placeholder={
                rideType === "airport"
                  ? "Select destination airport"
                  : "Enter destination city"
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none bg-transparent text-sm"
            />
            {showToSuggestions && toQuery && (
              <ul className="absolute left-0 right-0 bg-white text-gray-800 rounded-lg shadow-lg mt-1 z-[120] max-h-40 overflow-y-auto">
                {getSuggestions(toQuery, rideType).length > 0 ? (
                  getSuggestions(toQuery, rideType).map((s, i) => (
                    <li
                      key={i}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setToQuery(s);
                        setShowToSuggestions(false);
                      }}
                      className="px-3 py-2 hover:bg-yellow-100 cursor-pointer text-sm"
                    >
                      {s}
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-gray-500 text-sm">No matches found</li>
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
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-transparent text-white focus:ring-2 focus:ring-yellow-400 outline-none appearance-none text-sm"
            />
          </div>

          {/* Pickup Time */}
          <div>
            <label className="block text-sm font-semibold text-white mb-1">
              Pickup Time
            </label>
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-transparent text-white focus:ring-2 focus:ring-yellow-400 outline-none appearance-none text-sm"
            />
          </div>

          {/* Roundtrip Extra Fields
              Use lg:col-span-2 so these span both columns only on large screens;
              on laptops and smaller they will stack naturally (avoid cramped layout).
          */}
          {rideType === "roundtrip" && (
            <>
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-white mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-transparent text-white focus:ring-2 focus:ring-yellow-400 outline-none appearance-none text-sm"
                />
              </div>

            </>
          )}
        </motion.form>
      </AnimatePresence>

      {/* Book Button */}
      <div className="text-center mt-5 pb-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBook} // ADDED only this prop
          className="px-8 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition duration-200 shadow-md"
        >
          🚖 Book Ride
        </motion.button>
      </div>
    </motion.div>
  );
}

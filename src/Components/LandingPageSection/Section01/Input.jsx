import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Clock, Plane, ArrowRight, CornerDownRight, Navigation, Search } from "lucide-react";
import RoutingService from "../../../services/routingService";
import CabLoadingScreen from "../../Loading/CabLoadingScreen";

// Debounce helper
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

export default function Input() {
  const [rideType, setRideType] = useState("airport");
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  // Suggestions State
  const [fromSuggestionsList, setFromSuggestionsList] = useState([]);
  const [toSuggestionsList, setToSuggestionsList] = useState([]);
  const [isSearchingFrom, setIsSearchingFrom] = useState(false);
  const [isSearchingTo, setIsSearchingTo] = useState(false);

  // Debounced Queries
  const debouncedFromQuery = useDebounce(fromQuery, 300);
  const debouncedToQuery = useDebounce(toQuery, 300);

  // Date/Time State
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [tripMetrics, setTripMetrics] = useState(null);

  const navigate = useNavigate();

  // Real-time Validation Effect
  useEffect(() => {
    const errors = {};
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (fromQuery && toQuery && fromQuery.trim().toLowerCase() === toQuery.trim().toLowerCase()) {
      errors.to = "Pick-up and drop-off cannot be the same";
    }

    if (pickupDate && pickupDate < todayStr) {
      errors.pickupDate = "Date cannot be in the past";
    }

    if (pickupDate && pickupDate === todayStr && pickupTime) {
      const [hours, minutes] = pickupTime.split(':').map(Number);
      const pickupDateTime = new Date();
      pickupDateTime.setHours(hours, minutes, 0, 0);
      const bufferTime = new Date(now.getTime() + 60 * 60 * 1000);
      if (pickupDateTime < bufferTime) {
        errors.pickupTime = "Must be at least 1 hour from now";
      }
    }

    if (rideType === "roundtrip" && pickupDate && returnDate && returnDate <= pickupDate) {
      errors.returnDate = "Return must be after pickup";
    }

    setFieldErrors(errors);
  }, [fromQuery, toQuery, pickupDate, pickupTime, returnDate, rideType]);

  // Real-time Distance Effect
  useEffect(() => {
    const getMetrics = async () => {
      if (fromQuery && toQuery && !fieldErrors.to && fromQuery.length > 3 && toQuery.length > 3) {
        try {
          const metrics = await RoutingService.getDistanceAndDuration(fromQuery, toQuery);
          setTripMetrics(metrics);
        } catch (err) {
          setTripMetrics(null);
        }
      } else {
        setTripMetrics(null);
      }
    };

    const timer = setTimeout(getMetrics, 1000); // 1s debounce to save API calls
    return () => clearTimeout(timer);
  }, [fromQuery, toQuery, fieldErrors.to]);

  // Default Popular Cities (Fallback)
  const defaultCities = [
    "New Delhi, Delhi, India", "Mumbai, Maharashtra, India", "Bangalore, Karnataka, India",
    "Hyderabad, Telangana, India", "Pune, Maharashtra, India", "Chennai, Tamil Nadu, India",
    "Ahmedabad, Gujarat, India", "Jaipur, Rajasthan, India", "Kolkata, West Bengal, India",
    "Surat, Gujarat, India", "Lucknow, Uttar Pradesh, India", "Goa, India"
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

  // Fetch Suggestions Logic
  const fetchSuggestions = useCallback(async (query, type, setter, loaderSetter) => {
    if (!query) {
      setter(type === "airport" ? airports : defaultCities);
      return;
    }

    // If query is short, filter local defaults first to show something plausible
    if (query.length < 2) {
      const localMatches = (type === "airport" ? airports : defaultCities).filter(item =>
        item.toLowerCase().includes(query.toLowerCase())
      );
      setter(localMatches);
      return;
    }

    loaderSetter(true);
    try {
      const results = await RoutingService.getSuggestions(query);
      if (results && results.length > 0) {
        setter(results);
      } else {
        // Fallback to local filter if API returns nothing (or network error)
        const localMatches = (type === "airport" ? airports : defaultCities).filter(item =>
          item.toLowerCase().includes(query.toLowerCase())
        );
        setter(localMatches.length > 0 ? localMatches : []);
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    } finally {
      loaderSetter(false);
    }
  }, []);

  // Effect for "From" Input
  useEffect(() => {
    if (showFromSuggestions) {
      fetchSuggestions(debouncedFromQuery, rideType, setFromSuggestionsList, setIsSearchingFrom);
    }
  }, [debouncedFromQuery, rideType, showFromSuggestions, fetchSuggestions]);

  // Effect for "To" Input
  useEffect(() => {
    if (showToSuggestions) {
      fetchSuggestions(debouncedToQuery, rideType, setToSuggestionsList, setIsSearchingTo);
    }
  }, [debouncedToQuery, rideType, showToSuggestions, fetchSuggestions]);


  const hideWithDelay = (setter) => {
    setTimeout(() => setter(false), 250);
  };

  const onBook = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);

    // Final check before submission
    if (!fromQuery || !toQuery) {
      setError("Please enter both From and To locations");
      return;
    }

    if (Object.keys(fieldErrors).length > 0) {
      setError("Please fix the errors in the form first");
      return;
    }

    if (!pickupDate || !pickupTime) {
      setError("Please select pickup date and time");
      return;
    }

    if (rideType === "roundtrip" && !returnDate) {
      setError("Please select a return date");
      return;
    }

    setIsLoading(true);

    try {
      const metrics = await RoutingService.getDistanceAndDuration(fromQuery, toQuery);
      if (!metrics || !metrics.distanceKm) {
        throw new Error("Unable to calculate distance. Please check your locations.");
      }

      navigate("/cab-booking", {
        state: {
          from: fromQuery,
          to: toQuery,
          pickupDate,
          returnDate,
          pickupTime,
          rideType,
          distanceKm: metrics.distanceKm,
        },
      });
    } catch (err) {
      console.error("Location validation error:", err);
      setError(
        err.message ||
        "Unable to find or calculate route. Please try specific/different location names."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <CabLoadingScreen message="Validating locations and calculating route..." />}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="
          bg-stone-950/40 backdrop-blur-2xl border border-white/5
          rounded-3xl p-4 md:p-8
          mx-auto max-w-3xl w-[95%] 
          relative z-40 shadow-2xl shadow-black/80
        "
      >
        {/* Content Container */}
        <div className="relative z-10">
          {/* Ride Type Tabs */}
          {/* Ride Type Tabs - Mobile Grid / Desktop Flex */}
          <div className="grid grid-cols-3 md:flex md:justify-center gap-2 mb-6 md:mb-8 bg-black/20 p-1.5 rounded-2xl w-full md:w-fit mx-auto backdrop-blur-sm border border-white/5">
            {[
              { value: "airport", label: "Airport Transfer", shortLabel: "Airport", icon: Plane },
              { value: "oneway", label: "One-Way", shortLabel: "One-Way", icon: Navigation },
              { value: "roundtrip", label: "Round Trip", shortLabel: "Round Trip", icon: CornerDownRight },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setRideType(option.value)}
                className={`
                    flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-2 px-2 md:px-5 py-3 md:py-2.5 rounded-xl transition-all duration-300 font-medium
                    ${rideType === option.value
                    ? "bg-yellow-400 text-stone-950 shadow-lg shadow-yellow-400/20"
                    : "text-stone-400 hover:text-white hover:bg-white/5"
                  } 
                `}
              >
                <option.icon className="w-5 h-5 md:w-4 md:h-4 mb-0.5 md:mb-0" />
                <span className="text-[11px] leading-tight md:text-sm text-center">
                  <span className="hidden sm:inline">{option.label}</span>
                  <span className="sm:hidden">{option.shortLabel}</span>
                </span>
              </button>
            ))}
          </div>

          {/* Input Form with AnimatePresence */}
          <AnimatePresence mode="wait">
            <motion.form
              key={rideType}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* From Input */}
              <div className="relative group col-span-2 md:col-span-1">
                <label className="flex items-center gap-2 text-xs font-bold text-stone-400 mb-2 ml-1 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-yellow-400" />
                  From
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fromQuery}
                    onChange={(e) => {
                      setFromQuery(e.target.value);
                      setShowFromSuggestions(true);
                    }}
                    onBlur={() => hideWithDelay(setShowFromSuggestions)}
                    onFocus={() => setShowFromSuggestions(true)}
                    placeholder={rideType === "airport" ? "Select pickup airport" : "Enter pickup city or place"}
                    className={`w-full pl-11 pr-10 py-4 rounded-xl border bg-black/30 text-white placeholder-stone-500 outline-none transition-all duration-300 font-medium text-[15px] group-hover:border-white/20 ${fieldErrors.from ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-yellow-400/50 focus:bg-black/50'}`}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                  {isSearchingFrom && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-stone-500 border-t-yellow-400 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {fieldErrors.from && <p className="text-[12px] text-red-400 mt-2 ml-1 font-medium bg-red-500/5 py-1 px-3 rounded-lg border border-red-500/10 w-fit">{fieldErrors.from}</p>}

                {/* Suggestions */}
                <AnimatePresence>
                  {showFromSuggestions && (
                    <motion.ul
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                      className="absolute left-0 right-0 bg-stone-900/95 backdrop-blur-2xl rounded-xl shadow-2xl mt-2 z-[100] max-h-56 overflow-y-auto border border-white/10 divide-y divide-white/5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-stone-600"
                    >
                      {fromSuggestionsList.length > 0 ? (
                        fromSuggestionsList.map((s, i) => (
                          <li
                            key={i}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setFromQuery(s);
                              setShowFromSuggestions(false);
                            }}
                            className="px-4 py-3.5 hover:bg-white/10 cursor-pointer text-sm text-stone-100 transition-colors flex items-center gap-3 group/item"
                          >
                            <MapPin className="w-4 h-4 text-stone-500 group-hover/item:text-yellow-400 transition-colors shrink-0" />
                            <span className="truncate text-stone-200">{s}</span>
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-4 text-stone-500 text-sm text-center font-medium">
                          {isSearchingFrom ? "Searching..." : "No matches found"}
                        </li>
                      )}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              {/* To Input */}
              <div className="relative group col-span-2 md:col-span-1">
                <label className="flex items-center gap-2 text-xs font-bold text-stone-400 mb-2 ml-1 uppercase tracking-wider">
                  <Navigation className="w-3.5 h-3.5 text-yellow-400" />
                  To
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={toQuery}
                    onChange={(e) => {
                      setToQuery(e.target.value);
                      setShowToSuggestions(true);
                    }}
                    onBlur={() => hideWithDelay(setShowToSuggestions)}
                    onFocus={() => setShowToSuggestions(true)}
                    placeholder={rideType === "airport" ? "Select destination airport" : "Enter destination city or place"}
                    className={`w-full pl-11 pr-10 py-4 rounded-xl border bg-black/30 text-white placeholder-stone-500 outline-none transition-all duration-300 font-medium text-[15px] group-hover:border-white/20 ${fieldErrors.to ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-yellow-400/50 focus:bg-black/50'}`}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 border-2 border-yellow-400 rounded-full"></div>
                  {isSearchingTo && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-stone-500 border-t-yellow-400 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {fieldErrors.to && <p className="text-[12px] text-red-400 mt-2 ml-1 font-medium bg-red-500/5 py-1 px-3 rounded-lg border border-red-500/10 w-fit">{fieldErrors.to}</p>}

                {/* Suggestions */}
                <AnimatePresence>
                  {showToSuggestions && (
                    <motion.ul
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                      className="absolute left-0 right-0 bg-stone-900/95 backdrop-blur-2xl rounded-xl shadow-2xl mt-2 z-[100] max-h-56 overflow-y-auto border border-white/10 divide-y divide-white/5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-stone-600"
                    >
                      {toSuggestionsList.length > 0 ? (
                        toSuggestionsList.map((s, i) => (
                          <li
                            key={i}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setToQuery(s);
                              setShowToSuggestions(false);
                            }}
                            className="px-4 py-3.5 hover:bg-white/10 cursor-pointer text-sm text-stone-100 transition-colors flex items-center gap-3 group/item"
                          >
                            <Navigation className="w-4 h-4 text-stone-500 group-hover/item:text-yellow-400 transition-colors shrink-0" />
                            <span className="truncate text-stone-200">{s}</span>
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-4 text-stone-500 text-sm text-center font-medium">
                          {isSearchingTo ? "Searching..." : "No matches found"}
                        </li>
                      )}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              {/* Picking Date */}
              <div className="relative group">
                <label className="flex items-center gap-2 text-xs font-bold text-stone-400 mb-2 ml-1 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-yellow-400" />
                  Pickup Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className={`w-full pl-4 pr-4 py-4 rounded-xl border bg-black/30 text-white outline-none transition-all duration-300 font-medium text-[15px] appearance-none ${fieldErrors.pickupDate ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-yellow-400/50'}`}
                    style={{ colorScheme: "dark" }}
                  />
                </div>
                {fieldErrors.pickupDate && <p className="text-[12px] text-red-400 mt-2 ml-1 font-medium bg-red-500/5 py-1 px-3 rounded-lg border border-red-500/10 w-fit">{fieldErrors.pickupDate}</p>}
              </div>

              {/* Picking Time */}
              <div className="relative group">
                <label className="flex items-center gap-2 text-xs font-bold text-stone-400 mb-2 ml-1 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-yellow-400" />
                  Pickup Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className={`w-full pl-4 pr-4 py-4 rounded-xl border bg-black/30 text-white outline-none transition-all duration-300 font-medium text-[15px] appearance-none ${fieldErrors.pickupTime ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-yellow-400/50'}`}
                    style={{ colorScheme: "dark" }}
                  />
                </div>
                {fieldErrors.pickupTime && <p className="text-[12px] text-red-400 mt-2 ml-1 font-medium bg-red-500/5 py-1 px-3 rounded-lg border border-red-500/10 w-fit">{fieldErrors.pickupTime}</p>}
              </div>

              {/* Roundtrip Return Date */}
              {rideType === "roundtrip" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:col-span-2 relative group"
                >
                  <label className="flex items-center gap-2 text-xs font-bold text-stone-400 mb-2 ml-1 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-yellow-400" />
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className={`w-full pl-4 pr-4 py-4 rounded-xl border bg-black/30 text-white outline-none transition-all duration-300 font-medium text-[15px] appearance-none ${fieldErrors.returnDate ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-yellow-400/50'}`}
                    style={{ colorScheme: "dark" }}
                  />
                  {fieldErrors.returnDate && <p className="text-[12px] text-red-400 mt-2 ml-1 font-medium bg-red-500/5 py-1 px-3 rounded-lg border border-red-500/10 w-fit">{fieldErrors.returnDate}</p>}
                </motion.div>
              )}
            </motion.form>
          </AnimatePresence>

          {/* Action Button */}
          <div className="mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBook}
              disabled={isLoading || Object.keys(fieldErrors).length > 0}
              className="
                        relative overflow-hidden w-full py-4 rounded-xl
                        bg-gradient-to-r from-yellow-400 to-yellow-500 
                        text-stone-900 font-bold text-lg tracking-wide
                        shadow-[0_0_20px_rgba(250,204,21,0.3)]
                        hover:shadow-[0_0_30px_rgba(250,204,21,0.5)]
                        hover:from-yellow-300 hover:to-yellow-400
                        transition-all duration-300
                        disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed
                        group flex items-center justify-center gap-3
                    "
            >
              <span className="relative z-10">{isLoading ? "Validating Route..." : "Book Your Ride"}</span>
              {!isLoading && <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />}

              {/* Glossy sheen effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
            </motion.button>
          </div>

          {/* Real-time Metrics Preview */}
          <AnimatePresence>
            {tripMetrics && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-6 p-4 rounded-xl bg-yellow-400/10 border border-yellow-400/20 backdrop-blur-md flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-yellow-400 font-bold">Estimated Distance</span>
                    <span className="text-xl font-bold text-white">{tripMetrics.distanceKm} <span className="text-xs text-stone-400">km</span></span>
                  </div>
                  <div className="w-px h-8 bg-white/10 mx-2"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-yellow-400 font-bold">Duration</span>
                    <span className="text-xl font-bold text-white">{tripMetrics.durationMin} <span className="text-xs text-stone-400">min</span></span>
                  </div>
                </div>
                <Navigation className="w-6 h-6 text-yellow-400 opacity-50" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Note */}
          {error && (
            <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
              <p className="text-red-300 text-sm font-medium bg-red-500/10 py-3 px-6 rounded-xl inline-block border border-red-500/20 backdrop-blur-md">
                ⚠️ {error}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
}

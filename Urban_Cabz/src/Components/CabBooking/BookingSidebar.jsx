// src/Components/CabBooking/BookingSidebar.jsx
import React, { useState, useEffect } from "react";
import RoutingService from "../../services/routingService";
import RouteMap from "./RouteMap";

const INITIAL_METRICS = {
  distanceKm: null,
  durationMins: null,
  distanceText: null,
  durationText: null,
  fromCoords: null,
  toCoords: null,
  routeCoordinates: null,
  isEstimate: false,
};

const isPlaceholderLocation = (value) => {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return normalized === "pickup location" || normalized === "drop location";
};

export default function BookingSidebar({ from, to, pickupDate, pickupTime, onDistanceCalculated }) {
  const [tripMetrics, setTripMetrics] = useState(INITIAL_METRICS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!from || !to || isPlaceholderLocation(from) || isPlaceholderLocation(to)) {
      setTripMetrics(INITIAL_METRICS);
      setError(null);
      return;
    }

    let isMounted = true;

    const cachedMetrics = RoutingService.getCachedRouteMetrics(from, to);
    if (cachedMetrics) {
      setTripMetrics(cachedMetrics);
      onDistanceCalculated?.(cachedMetrics);
    }

    const calculateDistance = async () => {
      setLoading(!cachedMetrics);
      setError(null);

      try {
        const metrics = await RoutingService.getDistanceAndDuration(from, to);
        if (!isMounted) return;
        setTripMetrics(metrics);
        onDistanceCalculated?.(metrics);
      } catch (err) {
        console.error("Distance calculation failed:", err);
        if (!isMounted) return;
        setError("Unable to calculate distance. Please check location names.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      calculateDistance();
    }, cachedMetrics ? 200 : 400);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [from, to, onDistanceCalculated]);

  const distanceDisplay = loading
    ? "Calculating..."
    : tripMetrics.distanceText || "—";

  const durationDisplay = loading
    ? "Calculating..."
    : tripMetrics.durationText || "—";

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-5 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
      {/* Map Preview */}
      <div className="h-32 sm:h-48 rounded-xl mb-3 overflow-hidden bg-gray-100 relative border border-gray-200">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-3">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-sm text-gray-700 font-medium">Loading map...</p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50">
            <div className="text-center px-4">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          </div>
        ) : tripMetrics.fromCoords && tripMetrics.toCoords ? (
          <RouteMap
            fromCoords={tripMetrics.fromCoords}
            toCoords={tripMetrics.toCoords}
            routeCoordinates={tripMetrics.routeCoordinates}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center px-4">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-sm text-gray-500">Enter locations to see route</p>
            </div>
          </div>
        )}
      </div>

      {/* Distance & Duration Info Below Map */}
      {tripMetrics.distanceKm && (
        <div className="mb-3 p-2.5 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 text-blue-700">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="font-semibold text-sm sm:text-base">{tripMetrics.distanceText}</span>
              {tripMetrics.isEstimate && (
                <span className="text-[10px] uppercase tracking-wide text-blue-500 bg-white/70 px-2 py-0.5 rounded-full">
                  approx
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-purple-700">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-sm sm:text-base">{tripMetrics.durationText}</span>
            </div>
          </div>
        </div>
      )}

      {/* Trip Details */}
      <div className="space-y-4 sm:space-y-5">
        <div>
          <div className="font-bold text-slate-800 mb-2 sm:mb-4 flex items-center gap-2 text-sm sm:text-lg">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Your Trip</span>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {/* Pickup Location */}
            <div className="flex gap-2.5 p-2.5 sm:p-4 bg-emerald-50 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs sm:text-base shadow-sm">
                A
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-emerald-700 font-bold mb-0.5 uppercase tracking-wide">Pickup</div>
                <div className="text-xs sm:text-base text-slate-800 break-words font-medium">{from}</div>
              </div>
            </div>

            {/* Drop Location */}
            <div className="flex gap-2.5 p-2.5 sm:p-4 bg-red-50 rounded-xl border border-red-200 hover:border-red-300 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xs sm:text-base shadow-sm">
                B
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-red-700 font-bold mb-0.5 uppercase tracking-wide">Drop</div>
                <div className="text-xs sm:text-base text-slate-800 break-words font-medium">{to}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Date & Time Info */}
        <div className="border-t border-gray-100 pt-3 sm:pt-4 space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-base">
            <div className="flex items-center gap-2 text-slate-600">
              <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Date</span>
            </div>
            <div className="text-slate-900 font-semibold">{pickupDate || "—"}</div>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-base">
            <div className="flex items-center gap-2 text-slate-600">
              <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Time</span>
            </div>
            <div className="text-slate-900 font-semibold">{pickupTime || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

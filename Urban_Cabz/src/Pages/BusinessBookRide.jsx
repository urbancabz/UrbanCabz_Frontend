import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Input from "../Components/LandingPageSection/Section01/Input";
import { bookBusinessRide } from "../services/authService";
import { fetchMyFleet } from "../services/fleetService";
import BookingSidebar from "../Components/CabBooking/BookingSidebar";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function BusinessBookRide() {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState("search");
    const [searchData, setSearchData] = useState(null);
    const [fleet, setFleet] = useState([]);
    const [loadingFleet, setLoadingFleet] = useState(false);
    const [distanceKm, setDistanceKm] = useState(null);
    const [pricingSettings, setPricingSettings] = useState(null);

    // If we navigated here with state (e.g. from Input component redirecting us back), 
    // we capture it and move to selection step.
    useEffect(() => {
        if (location.state && location.state.from && location.state.to) {
            setSearchData(location.state);
            setStep("select_vehicle");
        }
    }, [location.state]);

    // Fetch real fleet data & Pricing Settings
    useEffect(() => {
        if (step === "select_vehicle") {
            const loadData = async () => {
                setLoadingFleet(true);
                try {
                    const { fetchPricingSettings } = await import("../services/fleetService");

                    const [fleetRes, pricingRes] = await Promise.all([
                        fetchMyFleet(),
                        fetchPricingSettings()
                    ]);

                    if (pricingRes.success) {
                        setPricingSettings(pricingRes.data);
                    }

                    if (fleetRes.success && fleetRes.data && fleetRes.data.vehicles) {
                        setFleet(fleetRes.data.vehicles);
                    }
                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoadingFleet(false);
                }
            };
            loadData();
        }
    }, [step]);

    const handleDistanceCalculated = (metrics) => {
        if (metrics && metrics.distanceKm) {
            setDistanceKm(metrics.distanceKm);
        }
    };

    const handleBookOnCredit = (vehicle, totalAmount) => {
        if (!searchData) {
            alert("Missing booking details. Please search again.");
            setStep("search");
            return;
        }

        navigate("/business/booking-details", {
            state: {
                listing: vehicle,
                from: searchData.from,
                to: searchData.to,
                pickupDate: searchData.pickupDate,
                pickupTime: searchData.pickupTime,
                distanceKm: distanceKm || searchData.distanceKm,
                totalAmount: totalAmount,
                rideType: "corporate"
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/business/dashboard" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                        <ArrowLeftIcon className="h-6 w-6" />
                    </Link>
                    <h1 className="text-2xl font-bold">
                        {step === "search" ? "Book a Corporate Ride" : "Select Vehicle"}
                    </h1>
                </div>

                {step === "search" && (
                    <div className="max-w-3xl mx-auto pt-10">
                        <div className="bg-neutral-900/50 p-8 rounded-3xl border border-white/10">
                            <h2 className="text-xl font-semibold mb-6 text-center text-gray-300">Enter Ride Details</h2>
                            <Input destinationPath="/business/book-ride" />
                        </div>
                    </div>
                )}

                {step === "select_vehicle" && searchData && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-400">Route</p>
                                    <p className="font-bold text-white">{searchData.from} → {searchData.to}</p>
                                </div>
                                <button
                                    onClick={() => setStep("search")}
                                    className="text-sm text-yellow-400 underline hover:text-yellow-300"
                                >
                                    Edit
                                </button>
                            </div>

                            {loadingFleet ? (
                                <div className="text-center py-10">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                                    <p className="text-gray-400">Loading available vehicles...</p>
                                </div>
                            ) : fleet.length === 0 ? (
                                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 text-center">
                                    <p className="text-gray-400">No vehicles available at the moment. Please try again later.</p>
                                </div>
                            ) : (
                                fleet.map(vehicle => {
                                    const rate = vehicle.base_price_per_km || vehicle.basePrice || 13;
                                    const dist = distanceKm || searchData.distanceKm || 0;

                                    let billableDistance = dist;
                                    const RULE_MIN_KM = 300;

                                    if (pricingSettings) {
                                        const {
                                            min_km_threshold,
                                            min_km_airport_apply,
                                            min_km_oneway_apply,
                                            min_km_roundtrip_apply
                                        } = pricingSettings;

                                        // For business, we might want a specific rideType or use 'corporate'
                                        // But usually corporate trips follow 'oneway' or 'airport' logic
                                        const isAirport = searchData.from?.toLowerCase().includes("airport") || searchData.to?.toLowerCase().includes("airport");
                                        const rideType = isAirport ? "airport" : "oneway";

                                        let applyRule = false;
                                        if (dist > min_km_threshold) {
                                            if (rideType === "airport" && min_km_airport_apply) applyRule = true;
                                            else if (rideType === "oneway" && min_km_oneway_apply) applyRule = true;
                                        }

                                        if (applyRule) {
                                            billableDistance = Math.max(RULE_MIN_KM, dist);
                                        }
                                    }

                                    const finalPrice = Math.round(billableDistance * rate);
                                    return (
                                        <div key={vehicle.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col sm:flex-row gap-6 hover:border-yellow-500/50 transition-all">
                                            <div className="w-full sm:w-48 h-32 bg-neutral-800 rounded-2xl overflow-hidden shrink-0">
                                                <img
                                                    src={vehicle.image_url || vehicle.image || "/Dzire.avif"}
                                                    alt={vehicle.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = "/Dzire.avif"; }}
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="text-xl font-bold">{vehicle.name}</h3>
                                                            <p className="text-sm text-gray-400">{vehicle.category || "Standard"} • {vehicle.seats} Seats</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold text-yellow-400">₹{finalPrice}</p>
                                                            <p className="text-xs text-gray-500">Est. Fare</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 mt-3 flex-wrap">
                                                        {(vehicle.tags || ["AC", "Corporate Standard"]).map(tag => (
                                                            <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400 border border-white/10">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="mt-6 flex justify-end">
                                                    <button
                                                        onClick={() => handleBookOnCredit(vehicle, finalPrice)}
                                                        className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 transition-colors"
                                                    >
                                                        Book on Credit
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Summary Sidebar with Map */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-8">
                                <BookingSidebar
                                    from={searchData.from}
                                    to={searchData.to}
                                    pickupCoords={searchData.pickupCoords}
                                    dropCoords={searchData.dropCoords}
                                    pickupDate={searchData.pickupDate}
                                    pickupTime={searchData.pickupTime}
                                    onDistanceCalculated={handleDistanceCalculated}
                                    isDark={true}
                                />
                                <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        * Final fare may vary based on extra kilometers, tolls, or waiting charges.
                                        Billed to company credit account.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

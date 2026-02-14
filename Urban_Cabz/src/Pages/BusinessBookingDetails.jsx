import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { bookBusinessRide } from "../services/authService";
import { ArrowLeftIcon, MapPinIcon, CalendarIcon, ClockIcon, UserIcon, PhoneIcon, EnvelopeIcon, ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";

export default function BusinessBookingDetails() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const listing = state?.listing || {};
    const from = state?.from || "Pickup location";
    const to = state?.to || "Drop location";
    const pickupDate = state?.pickupDate || "—";
    const pickupTime = state?.pickupTime || "—";
    const distanceKm = state?.distanceKm ?? 0;
    const totalAmount = state?.totalAmount || 0;

    const [passengerDetails, setPassengerDetails] = useState({
        name: user?.name || user?.fullName || "",
        phone: user?.phone || user?.mobile || "",
        email: user?.email || "",
        remarks: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const handleFormChange = (field, value) => {
        setPassengerDetails(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!passengerDetails.name.trim()) errors.name = "Name is required";
        if (!passengerDetails.phone.trim()) errors.phone = "Phone is required";
        else if (!/^\d{10}$/.test(passengerDetails.phone.replace(/\D/g, ''))) errors.phone = "Invalid phone number (10 digits required)";
        if (!passengerDetails.email.trim()) errors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passengerDetails.email)) errors.email = "Invalid email format";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleConfirmBooking = async () => {
        if (!validateForm()) {
            alert("Please check the form for errors.");
            return;
        }

        setIsSubmitting(true);
        try {
            const bookingData = {
                pickupLocation: from,
                dropLocation: to,
                distanceKm: distanceKm,
                estimatedFare: totalAmount,
                totalAmount: totalAmount,
                carModel: listing.name,
                scheduledAt: new Date().toISOString(),
                passengerDetails: passengerDetails
            };

            const result = await bookBusinessRide(bookingData);

            if (result.success) {
                alert("Booking Confirmed! Dispatching details shortly.");
                navigate("/business/dashboard");
            } else {
                alert("Booking failed: " + result.message);
            }
        } catch (error) {
            console.error("Booking error:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!state) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="text-gray-400 mb-4">No booking data found.</p>
                    <Link to="/business/book-ride" className="text-yellow-400 hover:underline">Go back to booking</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition">
                        <ArrowLeftIcon className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold">Review Your Corporate Ride</h1>
                        <p className="text-gray-400">Confirm details before booking on company credit</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Find you / Trip Summary Section */}
                        <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                <MapPinIcon className="h-32 w-32 text-yellow-500" />
                            </div>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-yellow-400 rounded-full"></span>
                                Finding You the Best Route
                            </h2>

                            <div className="space-y-6 relative z-10">
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center pt-1">
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <div className="w-0.5 h-12 border-l border-dashed border-gray-600 my-1"></div>
                                        <div className="w-3 h-3 rounded-full border-2 border-yellow-400"></div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase flex items-center gap-1">
                                                <MapPinIcon className="h-3 w-3" /> Pickup Location
                                            </p>
                                            <p className="font-semibold text-lg">{from}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase flex items-center gap-1">
                                                <MapPinIcon className="h-3 w-3" /> Drop Location
                                            </p>
                                            <p className="font-semibold text-lg">{to}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                                    <div className="bg-white/5 p-4 rounded-2xl">
                                        <p className="text-xs text-gray-500 uppercase mb-1">Date</p>
                                        <p className="font-bold flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-yellow-400" /> {pickupDate}
                                        </p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl">
                                        <p className="text-xs text-gray-500 uppercase mb-1">Time</p>
                                        <p className="font-bold flex items-center gap-2">
                                            <ClockIcon className="h-4 w-4 text-yellow-400" /> {pickupTime}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Passenger Details Form */}
                        <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-yellow-400 rounded-full"></span>
                                Passenger Information
                            </h2>
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Passenger Name</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                            <input
                                                type="text"
                                                value={passengerDetails.name}
                                                onChange={(e) => handleFormChange("name", e.target.value)}
                                                className={`w-full bg-white/5 border ${formErrors.name ? 'border-red-500' : 'border-white/10'} rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-yellow-400 transition`}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Contact Number</label>
                                        <div className="relative">
                                            <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                            <input
                                                type="tel"
                                                value={passengerDetails.phone}
                                                onChange={(e) => handleFormChange("phone", e.target.value)}
                                                className={`w-full bg-white/5 border ${formErrors.phone ? 'border-red-500' : 'border-white/10'} rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-yellow-400 transition`}
                                                placeholder="9876543210"
                                            />
                                        </div>
                                        {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Email Address</label>
                                    <div className="relative">
                                        <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                        <input
                                            type="email"
                                            value={passengerDetails.email}
                                            onChange={(e) => handleFormChange("email", e.target.value)}
                                            className={`w-full bg-white/5 border ${formErrors.email ? 'border-red-500' : 'border-white/10'} rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-yellow-400 transition`}
                                            placeholder="john@company.com"
                                        />
                                    </div>
                                    {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Remarks / Special Requests</label>
                                    <div className="relative">
                                        <ChatBubbleBottomCenterTextIcon className="absolute left-4 top-4 h-5 w-5 text-gray-500" />
                                        <textarea
                                            rows="3"
                                            value={passengerDetails.remarks}
                                            onChange={(e) => handleFormChange("remarks", e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-yellow-400 transition resize-none"
                                            placeholder="Any specific instructions for the driver..."
                                        ></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            {/* Vehicle & Price Card */}
                            <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6">
                                <div className="aspect-video rounded-2xl bg-neutral-800 overflow-hidden mb-6">
                                    <img
                                        src={listing.image_url || listing.image || "/Dzire.avif"}
                                        alt={listing.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = "/Dzire.avif"; }}
                                    />
                                </div>

                                <h3 className="text-xl font-bold mb-1">{listing.name}</h3>
                                <p className="text-sm text-gray-400 mb-6">{listing.category || "Corporate Standard"} • {listing.seats} Seats</p>

                                <div className="space-y-3 pt-6 border-t border-white/5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Distance</span>
                                        <span className="font-bold">{distanceKm} km</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xl font-bold">
                                        <span>Total Fare</span>
                                        <span className="text-yellow-400">₹{totalAmount}</span>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <button
                                        onClick={handleConfirmBooking}
                                        disabled={isSubmitting}
                                        className={`w-full py-4 bg-yellow-400 text-black font-bold rounded-2xl transition hover:bg-yellow-300 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            'Confirm & Book on Credit'
                                        )}
                                    </button>
                                </div>

                                <p className="mt-4 text-[10px] text-gray-500 text-center leading-relaxed">
                                    By clicking confirm, you agree to the corporate booking terms and conditions. The fare will be billed to your company account.
                                </p>
                            </div>

                            {/* Policy Notes */}
                            <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-3xl p-6">
                                <h4 className="text-yellow-400 font-bold text-sm mb-3">Corporate Policy</h4>
                                <ul className="space-y-3 text-xs text-gray-400">
                                    <li className="flex gap-2">
                                        <span className="text-yellow-400">•</span>
                                        SLA-backed ride assignments
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-yellow-400">•</span>
                                        24/7 Priority support access
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-yellow-400">•</span>
                                        Automated billing & GST invoices
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

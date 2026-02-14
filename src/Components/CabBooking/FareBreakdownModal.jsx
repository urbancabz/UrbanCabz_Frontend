import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, Car, Route, Clock, Fuel, Shield, Calculator } from "lucide-react";

export default function FareBreakdownModal({
    isOpen,
    onClose,
    pricing = {},
    vehicleName = "Vehicle",
    distanceKm = 0,
    rideType = "oneway"
}) {
    if (!isOpen) return null;

    const {
        baseFare = 0,
        distanceCharge = 0,
        serviceFee = 0,
        gst = 0,
        totalFare = 0,
        discount = 0,
        pricePerKm = 0
    } = pricing;

    const isRoundTrip = rideType === "roundtrip";
    const effectiveDistance = isRoundTrip ? distanceKm * 2 : distanceKm;

    const breakdown = [
        {
            icon: Car,
            label: "Base Fare",
            sublabel: `${vehicleName}`,
            amount: baseFare,
        },
        {
            icon: Route,
            label: "Distance Charge",
            sublabel: `${effectiveDistance.toFixed(1)} km × ₹${pricePerKm}/km`,
            amount: distanceCharge,
        },
        {
            icon: Shield,
            label: "Service Fee",
            sublabel: "Includes GST",
            amount: serviceFee,
        },
    ];

    const discountPercent = totalFare > 0 ? Math.round((discount / (totalFare + discount)) * 100) : 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-yellow-400 rounded-xl p-2">
                                    <Calculator className="w-5 h-5 text-slate-900" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">Fare Breakdown</h2>
                                    <p className="text-slate-300 text-xs">{vehicleName}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Trip Info */}
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Trip Distance</span>
                            <span className="font-bold text-slate-900">
                                {effectiveDistance.toFixed(1)} km
                                {isRoundTrip && (
                                    <span className="text-xs text-slate-400 ml-1">(round trip)</span>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Breakdown Items */}
                    <div className="p-5 space-y-4">
                        {breakdown.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-slate-100 rounded-lg p-2">
                                        <item.icon className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900 text-sm">{item.label}</div>
                                        <div className="text-xs text-slate-400">{item.sublabel}</div>
                                    </div>
                                </div>
                                <div className="font-semibold text-slate-900">
                                    ₹{item.amount.toLocaleString()}
                                </div>
                            </div>
                        ))}

                        {/* Discount */}
                        {discount > 0 && (
                            <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 rounded-lg p-2">
                                        <Info className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-green-600 text-sm">Discount</div>
                                        <div className="text-xs text-green-500">{discountPercent}% off applied</div>
                                    </div>
                                </div>
                                <div className="font-semibold text-green-600">
                                    -₹{discount.toLocaleString()}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Total */}
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-yellow-900 text-sm font-medium">Total Amount</div>
                                <div className="text-xs text-yellow-700">Inclusive of all taxes</div>
                            </div>
                            <div className="text-3xl font-black text-slate-900">
                                ₹{totalFare.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Footer Note */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                        <p className="text-xs text-slate-500 text-center">
                            💡 Final fare may vary based on actual distance traveled and waiting time.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

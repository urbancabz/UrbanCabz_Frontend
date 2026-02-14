import React from "react";
import { Check, Circle } from "lucide-react";

/**
 * Progress indicator for multi-step booking flow
 * @param {number} currentStep - Current step (1-indexed)
 * @param {Array} steps - Array of step objects with { label, description }
 */
export default function ProgressIndicator({
    currentStep = 1,
    steps = [
        { label: "Select Vehicle", description: "Choose your ride" },
        { label: "Enter Details", description: "Passenger info" },
        { label: "Payment", description: "Secure checkout" },
        { label: "Confirmed", description: "Ready to go" },
    ]
}) {
    return (
        <div className="w-full py-6">
            {/* Desktop view */}
            <div className="hidden md:flex items-center justify-between max-w-3xl mx-auto">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;
                    const isPending = stepNumber > currentStep;

                    return (
                        <React.Fragment key={index}>
                            {/* Step item */}
                            <div className="flex flex-col items-center relative group">
                                {/* Circle */}
                                <div
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                    transition-all duration-300 shadow-md
                    ${isCompleted
                                            ? "bg-green-500 text-white"
                                            : isCurrent
                                                ? "bg-yellow-400 text-slate-900 ring-4 ring-yellow-400/30"
                                                : "bg-slate-200 text-slate-500"
                                        }
                  `}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        stepNumber
                                    )}
                                </div>

                                {/* Label */}
                                <div className="mt-3 text-center">
                                    <div
                                        className={`text-sm font-bold transition-colors ${isCurrent ? "text-slate-900" : isCompleted ? "text-green-600" : "text-slate-400"
                                            }`}
                                    >
                                        {step.label}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-0.5 hidden lg:block">
                                        {step.description}
                                    </div>
                                </div>

                                {/* Active indicator */}
                                {isCurrent && (
                                    <div className="absolute -bottom-2 w-12 h-1 bg-yellow-400 rounded-full" />
                                )}
                            </div>

                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 h-1 mx-4 relative">
                                    <div className="absolute inset-0 bg-slate-200 rounded-full" />
                                    <div
                                        className={`absolute inset-0 rounded-full transition-all duration-500 ${isCompleted ? "bg-green-500" : "bg-transparent"
                                            }`}
                                        style={{
                                            width: isCompleted ? "100%" : "0%",
                                        }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Mobile view - simplified */}
            <div className="md:hidden">
                <div className="flex items-center justify-center gap-3 mb-3">
                    {steps.map((_, index) => {
                        const stepNumber = index + 1;
                        const isCompleted = stepNumber < currentStep;
                        const isCurrent = stepNumber === currentStep;

                        return (
                            <div
                                key={index}
                                className={`
                  w-3 h-3 rounded-full transition-all duration-300
                  ${isCompleted
                                        ? "bg-green-500"
                                        : isCurrent
                                            ? "bg-yellow-400 scale-125"
                                            : "bg-slate-200"
                                    }
                `}
                            />
                        );
                    })}
                </div>

                <div className="text-center">
                    <div className="text-sm font-bold text-slate-900">
                        Step {currentStep}: {steps[currentStep - 1]?.label}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                        {steps[currentStep - 1]?.description}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Skeleton loader for vehicle cards
 */
export function VehicleCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
            <div className="p-5 sm:p-7">
                <div className="flex flex-col sm:flex-row gap-5 sm:gap-8">
                    {/* Image skeleton */}
                    <div className="w-full sm:w-40 flex-shrink-0">
                        <div className="bg-slate-200 rounded-2xl h-36 sm:h-32" />
                        <div className="bg-slate-200 h-6 w-20 mx-auto mt-3 rounded-full" />
                    </div>

                    {/* Content skeleton */}
                    <div className="flex-1">
                        <div className="bg-slate-200 h-7 w-48 rounded mb-3" />
                        <div className="bg-slate-200 h-5 w-32 rounded mb-4" />

                        <div className="flex gap-3 mb-4">
                            <div className="bg-slate-200 h-8 w-24 rounded-lg" />
                            <div className="bg-slate-200 h-8 w-20 rounded-lg" />
                            <div className="bg-slate-200 h-8 w-24 rounded-lg" />
                        </div>

                        <div className="flex gap-2">
                            <div className="bg-slate-200 h-6 w-16 rounded" />
                            <div className="bg-slate-200 h-6 w-20 rounded" />
                            <div className="bg-slate-200 h-6 w-14 rounded" />
                        </div>
                    </div>

                    {/* Price skeleton */}
                    <div className="sm:min-w-[180px] sm:border-l border-slate-100 sm:pl-8">
                        <div className="bg-slate-200 h-5 w-16 rounded mb-2 ml-auto" />
                        <div className="bg-slate-200 h-10 w-28 rounded ml-auto mb-4" />
                        <div className="bg-slate-200 h-12 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}

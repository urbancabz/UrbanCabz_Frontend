// src/Components/BookingDetails/BookingDetailsSidebar.jsx
import React from "react";

export default function BookingDetailsSidebar({ price = 0, onBookNow = () => { } }) {
  const formatAmount = (amount) => (amount > 0 ? `₹${amount.toLocaleString()}` : "—");

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 p-6 relative overflow-hidden">
        {/* Receipt Header Decor */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500"></div>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-dashed border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Booking Summary</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Quick Book</span>
          </div>

          {/* Main Price Display */}
          <div className="text-center py-2">
            <p className="text-xs text-slate-500 mb-1">Estimated Fare</p>
            <p className="text-4xl font-black text-slate-900 font-mono tracking-tight">{formatAmount(price)}</p>
            <p className="text-xs text-slate-500 mt-2">Payment to be made after confirmation</p>
          </div>

          {/* Action Button */}
          <button
            onClick={onBookNow}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 font-bold py-4 rounded-xl shadow-lg hover:shadow-yellow-400/20 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <span>Book Taxi</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

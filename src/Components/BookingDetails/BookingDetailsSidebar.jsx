// src/Components/BookingDetails/BookingDetailsSidebar.jsx
import React from "react";

export default function BookingDetailsSidebar({ price = 0, onPayNow = () => {} }) {
  const partial = Math.round(price * 0.2 || 0);

  return (
    <div className="w-full lg:self-start">
      <div className="bg-white rounded-2xl shadow-md p-6 w-full lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto z-40">
        <div className="text-xs text-indigo-600 bg-indigo-50 p-3 rounded-lg mb-4">
          Free cancellation before <strong>ONE Hour</strong>
        </div>

        <div className="text-center mb-4">
          <div className="text-sm font-medium text-gray-700">
            Pay ₹{price > 0 ? price.toLocaleString() : "—"} Now
          </div>
          <button
            onClick={onPayNow}
            className="w-full mt-3 px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-lg font-bold"
          >
            Pay ₹{price > 0 ? price.toLocaleString() : "—"} Now
          </button>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="radio" name="payopt" defaultChecked />
            <div>Pay partial amount <span className="ml-auto">₹{partial}</span></div>
          </label>

          <label className="flex items-center gap-3">
            <input type="radio" name="payopt" />
            <div>Pay full amount <span className="ml-auto">₹{price}</span></div>
          </label>
        </div>

        <div className="border-t mt-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Total amount</div>
            <div className="text-lg font-bold">₹{price}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

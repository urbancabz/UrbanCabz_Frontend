// src/Components/BookingDetails/BookingDetailsSidebar.jsx
import React, { useMemo, useState } from "react";

export default function BookingDetailsSidebar({ price = 0, onPayNow = () => {} }) {
  const [paymentOption, setPaymentOption] = useState("partial");

  const partialAmount = useMemo(() => {
    if (!price || price <= 0) return 0;
    return Math.max(Math.round(price * 0.2), 0);
  }, [price]);

  const payableAmount = paymentOption === "partial" ? partialAmount : price;

  const formatAmount = (amount) => (amount > 0 ? `₹${amount.toLocaleString()}` : "—");

  const handlePay = () => {
    const amount = paymentOption === "partial" ? partialAmount : price;
    onPayNow(amount);
  };

  return (
    <div className="w-full lg:self-start">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto z-40 space-y-5">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Free cancellation up to <strong>1 hour</strong> before pickup.
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-center">
          <p className="text-xs uppercase tracking-wide text-gray-500">Payable now</p>
          <p className="mt-2 text-4xl font-extrabold text-gray-900">{formatAmount(payableAmount)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {paymentOption === "partial"
              ? "20% advance to confirm your ride"
              : "Secure your booking with full payment"}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-800">Choose payment option</p>

          <label
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 cursor-pointer transition ${
              paymentOption === "partial"
                ? "border-gray-900 bg-gray-900/5 shadow-sm"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="payopt"
                value="partial"
                checked={paymentOption === "partial"}
                onChange={() => setPaymentOption("partial")}
              />
              <div>
                <p className="font-semibold text-gray-900">Pay partial</p>
                <p className="text-xs text-gray-500">Fully refundable till 1 hr before trip</p>
              </div>
            </div>
            <span className="text-base font-semibold text-gray-900">{formatAmount(partialAmount)}</span>
          </label>

          <label
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 cursor-pointer transition ${
              paymentOption === "full"
                ? "border-gray-900 bg-gray-900/5 shadow-sm"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="payopt"
                value="full"
                checked={paymentOption === "full"}
                onChange={() => setPaymentOption("full")}
              />
              <div>
                <p className="font-semibold text-gray-900">Pay full</p>
                <p className="text-xs text-gray-500">Best experience, zero balance on trip day</p>
              </div>
            </div>
            <span className="text-base font-semibold text-gray-900">{formatAmount(price)}</span>
          </label>
        </div>

        <button
          onClick={handlePay}
          className="w-full rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-3 text-lg font-semibold text-gray-900 shadow-lg shadow-yellow-500/30 transition hover:brightness-105"
        >
          Pay {formatAmount(payableAmount)} now
        </button>

        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Trip fare</span>
            <span className="font-semibold text-gray-900">{formatAmount(price)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-gray-500">Amount due later</span>
            <span className="font-semibold text-gray-900">
              {paymentOption === "partial"
                ? formatAmount(Math.max(price - partialAmount, 0))
                : "₹0"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

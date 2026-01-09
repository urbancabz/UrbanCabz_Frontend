// src/Components/BookingDetails/BookingDetailsSidebar.jsx
import React, { useMemo, useState } from "react";

export default function BookingDetailsSidebar({ price = 0, onPayNow = () => { } }) {
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
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 p-6 relative overflow-hidden">
        {/* Receipt Header Decor */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500"></div>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-dashed border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Summary</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Secure Checkout</span>
          </div>

          {/* Main Price Display */}
          <div className="text-center py-2">
            <p className="text-xs text-slate-500 mb-1">Total Payable Now</p>
            <p className="text-4xl font-black text-slate-900 font-mono tracking-tight">{formatAmount(payableAmount)}</p>
          </div>

          {/* Payment Options */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">Select Payment Plan</p>

            <label className={`relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${paymentOption === "partial" ? "border-yellow-400 bg-yellow-50/30" : "border-slate-100 hover:border-slate-200"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentOption === "partial" ? "border-yellow-500" : "border-slate-300"}`}>
                  {paymentOption === "partial" && <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />}
                </div>
                <input type="radio" name="payopt" value="partial" checked={paymentOption === "partial"} onChange={() => setPaymentOption("partial")} className="hidden" />
                <div>
                  <p className="font-bold text-slate-900 text-sm">Pay 20% Advance</p>
                  <p className="text-xs text-slate-500">Refundable until 1hr before</p>
                </div>
              </div>
              <span className="font-mono font-bold text-slate-900">{formatAmount(partialAmount)}</span>
            </label>

            <label className={`relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${paymentOption === "full" ? "border-yellow-400 bg-yellow-50/30" : "border-slate-100 hover:border-slate-200"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentOption === "full" ? "border-yellow-500" : "border-slate-300"}`}>
                  {paymentOption === "full" && <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />}
                </div>
                <input type="radio" name="payopt" value="full" checked={paymentOption === "full"} onChange={() => setPaymentOption("full")} className="hidden" />
                <div>
                  <p className="font-bold text-slate-900 text-sm">Pay Full Amount</p>
                  <p className="text-xs text-slate-500">Hassle-free experience</p>
                </div>
              </div>
              <span className="font-mono font-bold text-slate-900">{formatAmount(price)}</span>
            </label>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-slate-200"></div>

          {/* Summary Lines */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Trip Fare</span>
              <span className="font-mono font-medium">{formatAmount(price)}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold">
              <span>Balance Due Later</span>
              <span className="font-mono text-emerald-600">
                {paymentOption === "partial" ? formatAmount(Math.max(price - partialAmount, 0)) : "₹0"}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handlePay}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 font-bold py-4 rounded-xl shadow-lg hover:shadow-yellow-400/20 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <span>Pay {formatAmount(payableAmount)}</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>SSL Encrypted & Secure Payment</span>
          </div>
        </div>
      </div>
    </div>
  );
}

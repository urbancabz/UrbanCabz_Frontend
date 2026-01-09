import { useAuth } from "../../contexts/AuthContext";

/**
 * BookingDetailsMain
 * Left column: vehicle summary, inclusions/exclusions, and passenger form.
 * This is a reusable presentational component — accepts props for all dynamic values.
 */
export default function BookingDetailsMain({
  listing = {},
  from,
  to,
  pickupDate,
  pickupTime,
  distanceKm,
  rideType = "oneway",
  price,
  formData,
  formErrors = {},
  onFormChange,
  onBack = () => { },
}) {
  const { user } = useAuth();
  const {
    name = "Vehicle",
    vehicleType = "Sedan",
    image = "/Dzire.avif",
    tags = [],
  } = listing;

  return (
    <div className="space-y-6">
      {/* Top card: vehicle + trip summary */}
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 p-5 sm:p-6 lg:p-7 flex flex-col md:flex-row gap-5 md:gap-7">
        {/* Vehicle block */}
        <div className="w-full md:w-40 lg:w-44 flex-shrink-0">
          <div className="relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 p-4 flex items-center justify-center">
            <img
              src={image}
              alt={name}
              className="w-full h-28 object-contain"
            />
            <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium text-slate-100">
              {rideType === "roundtrip" ? "Round trip" : "One way"}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              {vehicleType}
            </div>
            <button
              type="button"
              onClick={onBack}
              className="text-xs text-slate-500 hover:text-slate-700 underline decoration-dotted"
            >
              Change cab
            </button>
          </div>
        </div>

        {/* Trip + fare */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {name}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                AC • Verified driver • Comfortable for family travel
              </p>

              {/* Route summary */}
              <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-800">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center pt-0.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <div className="flex-1 w-px bg-slate-300 my-1" />
                    <div className="h-2 w-2 rounded-full bg-red-400" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">
                        Pickup
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-slate-900">
                        {from}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {pickupDate} • {pickupTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">
                        Drop-off
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-slate-900">
                        {to}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-slate-100">
                    Instant cab confirmation
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-slate-100">
                    Luggage included
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-slate-100">
                    Live tracking link
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-2">
                {tags && tags.length
                  ? tags.map((t, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-slate-100 px-3 py-1 rounded-full border border-slate-200 text-slate-700"
                    >
                      {t}
                    </span>
                  ))
                  : (
                    <>
                      <span className="text-[11px] bg-slate-100 px-3 py-1 rounded-full border border-slate-200 text-slate-700">
                        Tissues
                      </span>
                      <span className="text-[11px] bg-slate-100 px-3 py-1 rounded-full border border-slate-200 text-slate-700">
                        Sanitiser
                      </span>
                      <span className="text-[11px] bg-slate-100 px-3 py-1 rounded-full border border-slate-200 text-slate-700">
                        Car freshener
                      </span>
                    </>
                  )}
              </div>
            </div>

            <div className="text-right self-start">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Estimated fare
              </div>
              <div className="mt-1 text-3xl font-extrabold text-slate-900">
                {price > 0 ? `₹${price.toLocaleString()}` : "—"}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {distanceKm ? `${distanceKm} km` : "Calculating distance..."}
              </div>
              {rideType === "roundtrip" && (
                <div className="mt-1 inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-[11px] font-medium text-yellow-700 border border-yellow-200">
                  Includes return journey
                </div>
              )}
              {distanceKm === 300 || (rideType === "roundtrip" && distanceKm % 300 === 0 && distanceKm >= 300) ? (
                <div className="mt-2 text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-100 uppercase tracking-tighter text-center">
                  * Minimum 300km/day charge applies
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Inclusions / Exclusions */}
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 p-5 sm:p-6 lg:p-7">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg text-slate-900 mb-1">
              Inclusions
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Already covered in your fare.
            </p>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>
                Distance up to{" "}
                <span className="font-medium">
                  {distanceKm ? `${distanceKm} km` : "Calculating..."}
                </span>
              </li>
              <li>Driver & vehicle charges</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-slate-900 mb-1">
              Exclusions
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Pay directly to the driver if applicable.
            </p>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>Night charges</li>
              <li>Toll charges</li>
              <li>State tax</li>
              <li>Parking charges</li>
              <li>Fare beyond {distanceKm} kms (₹{listing.basePrice || 13} / km)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Trip Details Form */}
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="font-semibold text-lg text-slate-900">
              Passenger & trip details
            </h3>
            <p className="text-xs text-slate-500">
              Share who is travelling so our driver can reach you easily.
            </p>
          </div>
          <p className="text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 self-start">
            Your details are safe & used only for this trip.
          </p>
        </div>

        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Pick-up address
              </label>
              <input
                value={from || ""}
                readOnly
                className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 text-slate-700 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Drop-off address
              </label>
              <input
                value={to || ""}
                readOnly
                className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-slate-50 text-slate-700 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Name
              </label>
              <input
                placeholder="Your name"
                value={formData?.name || ""}
                onChange={(e) => onFormChange("name", e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 ${formErrors.name ? "border-red-500" : "border-slate-200"}`}
              />
              {formErrors.name && (
                <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Contact number
              </label>
              <input
                placeholder="+91 9XXXXXXXXX"
                value={formData?.phone || ""}
                onChange={(e) => onFormChange("phone", e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 ${formErrors.phone ? "border-red-500" : "border-slate-200"}`}
              />
              {formErrors.phone && (
                <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Email ID
              </label>
              <input
                placeholder="you@example.com"
                value={formData?.email || ""}
                onChange={(e) => onFormChange("email", e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 ${formErrors.email ? "border-red-500" : "border-slate-200"}`}
              />
              {formErrors.email && (
                <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Remark (optional)
              </label>
              <input
                placeholder="Eg. travelling with kids, extra luggage…"
                value={formData?.remarks || ""}
                onChange={(e) => onFormChange("remarks", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between pt-1">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="agree"
                defaultChecked
                className="mt-0.5"
              />
              <label htmlFor="agree" className="text-xs text-slate-600 leading-relaxed">
                By proceeding to book, I agree to the{" "}
                <span className="underline cursor-pointer">
                  terms & conditions
                </span>{" "}
                and cancellation policy.
              </label>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as yup from "yup";
import { useAuth } from "../../contexts/AuthContext";

const profileSchema = yup.object().shape({
  name: yup.string()
    .required("Full Name is required")
    .min(2, "Name must be at least 2 characters")
    .matches(/^[a-zA-Z\s]*$/, "Name can only contain alphabetic characters and spaces"),
  phone: yup.string()
    .required("Mobile Number is required")
    .matches(/^\+?\d[\d\s]*\d$/, "Please enter a valid mobile number with an optional country code (e.g., +91 9876543210)")
    .min(10, "Number must act least be 10 digits."),
});

export default function ProfileModal({ open, onClose }) {
  const { user, updateProfile, logout, loading } = useAuth();
  const [formValues, setFormValues] = useState({ name: "", phone: "" });
  const [status, setStatus] = useState({ type: null, message: "" });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (user && open) {
      // Auto-format loaded numbers like "+919..." to "+91 9..."
      let formattedPhone = user.phone || "";
      if (formattedPhone.startsWith("+91") && formattedPhone.length > 3 && formattedPhone[3] !== ' ') {
        formattedPhone = `+91 ${formattedPhone.slice(3)}`;
      }

      setFormValues({
        name: user.name || "",
        phone: formattedPhone,
      });
      setStatus({ type: null, message: "" });
    }
  }, [open, user]);

  const avatarText = useMemo(() => {
    if (!user) return "U";
    if (user.name) return user.name.slice(0, 1).toUpperCase();
    if (user.email) return user.email.slice(0, 1).toUpperCase();
    return "U";
  }, [user]);

  if (!open || !user) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Optional: auto-format logic for spaces
    if (name === "phone") {
      newValue = newValue.replace(/[^\d\s+]/g, ""); // Allow only digits, space, plus
    }

    setFormValues((prev) => ({ ...prev, [name]: newValue }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });
    setFieldErrors({});

    try {
      await profileSchema.validate(formValues, { abortEarly: false });
    } catch (err) {
      if (err.inner) {
        const validationErrors = {};
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
        setFieldErrors(validationErrors);
      }
      return;
    }

    const payload = {
      name: formValues.name.trim(),
      phone: formValues.phone.replace(/\s+/g, ""),
    };

    const result = await updateProfile(payload);
    if (result.success) {
      setStatus({ type: "success", message: "Profile updated successfully." });
    } else {
      setStatus({ type: "error", message: result.message || "Unable to update profile." });
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Your Profile</h2>
                <p className="text-sm text-gray-500">Manage your personal details.</p>
              </div>
              <button onClick={onClose} className="text-gray-400 transition hover:text-gray-600" aria-label="Close profile">
                ✕
              </button>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-xl font-semibold text-gray-900">
                {avatarText}
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{user.name || "Customer"}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formValues.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  placeholder="Enter your name"
                />
                {fieldErrors.name && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.name}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formValues.phone}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  placeholder="+91 9XXXXXXXXX"
                />
                {fieldErrors.phone && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.phone}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
                />
              </div>

              {status.message && (
                <p
                  className={`rounded-2xl px-4 py-3 text-sm ${status.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                    }`}
                >
                  {status.message}
                </p>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                >
                  Logout
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-2xl bg-gray-900 px-4 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


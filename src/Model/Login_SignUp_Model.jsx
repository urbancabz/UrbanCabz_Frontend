// src/Model/Login_SignUp_Model.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  customerSignup,
  businessLogin,
  businessSignup,
} from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function Login_SignUp_Model({ onClose, variant = "customer" }) {
  const [isLogin, setIsLogin] = useState(true);
  const isBusiness = variant === "business";
  const { loginCustomer } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    // Customer fields
    fullName: "",
    mobile: "",
    email: "",
    password: "",
    // Business fields
    companyId: "",
    companyName: "",
    companyEmail: "",
    gstNumber: "",
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error on input
  };

  // Handle Customer Login
  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    console.log('📝 Customer Login Form Data:', {
      email: formData.email,
      password: '***hidden***'
    });

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    const result = await loginCustomer({
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        onClose();
        // Optional: Refresh page or redirect
        // window.location.reload();
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  // Handle Customer Signup
  const handleCustomerSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    console.log('📝 Customer Signup Form Data:', {
      fullName: formData.fullName,
      mobile: formData.mobile,
      email: formData.email,
      password: '***hidden***'
    });

    if (!formData.fullName || !formData.mobile || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    // Basic mobile validation
    if (!/^[6-9]\d{9}$/.test(formData.mobile.replace(/\D/g, "").slice(-10))) {
      setError("Please enter a valid mobile number");
      return;
    }

    setLoading(true);

    const result = await customerSignup({
      fullName: formData.fullName,
      mobile: formData.mobile,
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        onClose();
        // Optional: Refresh page or redirect
        // window.location.reload();
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  // Handle Business Login
  const handleBusinessLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    console.log('📝 Business Login Form Data:', {
      companyId: formData.companyId,
      email: formData.email,
      password: '***hidden***'
    });

    if (!formData.companyId || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    const result = await businessLogin({
      companyId: formData.companyId,
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        onClose();
        // Optional: Redirect to business dashboard
        // window.location.href = "/business/dashboard";
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  // Handle Business Signup
  const handleBusinessSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    console.log('📝 Business Signup Form Data:', {
      companyName: formData.companyName,
      companyEmail: formData.companyEmail,
      gstNumber: formData.gstNumber,
      email: formData.email,
      password: '***hidden***'
    });

    if (!formData.companyName || !formData.companyEmail || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);

    const result = await businessSignup({
      companyName: formData.companyName,
      companyEmail: formData.companyEmail,
      gstNumber: formData.gstNumber,
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        onClose();
        // Optional: Redirect to business dashboard
        // window.location.href = "/business/dashboard";
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  // Switch between login/signup
  const handleTabSwitch = (loginMode) => {
    setIsLogin(loginMode);
    setError("");
    setSuccess("");
    setFormData({
      fullName: "",
      mobile: "",
      email: "",
      password: "",
      companyId: "",
      companyName: "",
      companyEmail: "",
      gstNumber: "",
    });
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 px-4"
      onClick={onClose}
    >
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white/12 backdrop-blur-2xl border border-white/25 rounded-3xl shadow-2xl text-white overflow-hidden"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-white/80 hover:text-white text-2xl z-10"
          aria-label="Close dialog"
        >
          ×
        </button>

        {/* Tabs */}
        <div className="flex justify-center gap-0 mt-4 p-2">
          <button
            onClick={() => handleTabSwitch(true)}
            disabled={loading}
            className={`px-5 py-2 rounded-l-xl font-semibold transition-colors ${
              isLogin ? "bg-yellow-400 text-gray-900 shadow-md" : "bg-white/10 text-white hover:bg-white/20"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isBusiness ? "Business Login" : "Login"}
          </button>
          <button
            onClick={() => handleTabSwitch(false)}
            disabled={loading}
            className={`px-5 py-2 rounded-r-xl font-semibold transition-colors ${
              !isLogin ? "bg-yellow-400 text-gray-900 shadow-md" : "bg-white/10 text-white hover:bg-white/20"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isBusiness ? "Business Sign Up" : "Sign Up"}
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
            {success}
          </div>
        )}

        {/* Content */}
        <motion.div
          layout
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="p-6 sm:p-8"
        >
          <AnimatePresence mode="wait">
            {isLogin ? (
              /* LOGIN */
              <motion.form
                key="login"
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.32, ease: "easeInOut" }}
                onSubmit={isBusiness ? handleBusinessLogin : handleCustomerLogin}
              >
                <h2 className="text-2xl font-semibold text-center mb-5">
                  {isBusiness ? "Business Login" : "Welcome Back"}
                </h2>

                {isBusiness && (
                  <div className="mb-4">
                    <label className="block text-sm text-white/85 mb-1">Company ID</label>
                    <input
                      type="text"
                      name="companyId"
                      value={formData.companyId}
                      onChange={handleChange}
                      placeholder="Your Company ID"
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-xl bg-white/16 border border-white/25 text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-400 outline-none disabled:opacity-50"
                    />
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm text-white/85 mb-1">
                    {isBusiness ? "Business Email" : "Email"}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl bg-white/16 border border-white/25 text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-400 outline-none disabled:opacity-50"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm text-white/85 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl bg-white/16 border border-white/25 text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-400 outline-none disabled:opacity-50"
                  />
                </div>

                <div className="flex justify-end mb-5">
                  <button type="button" className="text-sm text-yellow-300 hover:underline">
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-yellow-400 text-gray-900 font-semibold rounded-xl shadow-sm hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Logging in..." : isBusiness ? "Business Login" : "Login"}
                </button>
              </motion.form>
            ) : (
              /* SIGNUP */
              <motion.form
                key="signup"
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.32, ease: "easeInOut" }}
                onSubmit={isBusiness ? handleBusinessSignup : handleCustomerSignup}
              >
                <h2 className="text-2xl font-semibold text-center mb-5">
                  {isBusiness ? "Create Business Account" : "Create Account"}
                </h2>

                {isBusiness ? (
                  <>
                    <div className="mb-3">
                      <label className="block text-sm text-white/85 mb-1">Company Name *</label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="ACME Pvt Ltd"
                        disabled={loading}
                        className="w-full px-4 py-3 rounded-xl bg-white/16 border border-white/25 text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-400 outline-none disabled:opacity-50"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm text-white/85 mb-1">Company Email *</label>
                      <input
                        type="email"
                        name="companyEmail"
                        value={formData.companyEmail}
                        onChange={handleChange}
                        placeholder="company@example.com"
                        disabled={loading}
                        className="w-full px-4 py-3 rounded-xl bg-white/16 border border-white/25 text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-400 outline-none disabled:opacity-50"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm text-white/85 mb-1">
                        GST / Registration No. (optional)
                      </label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        placeholder="GSTIN / Reg No."
                        disabled={loading}
                        className="w-full px-4 py-3 rounded-xl bg-white/16 border border-white/25 text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-400 outline-none disabled:opacity-50"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-3">
                      <label className="block text-sm text-white/85 mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        disabled={loading}
                        className="w-full px-4 py-3 rounded-xl bg-white/16 border border-white/25 text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-400 outline-none disabled:opacity-50"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm text-white/85 mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="+91 9XXXXXXXXX"
                        disabled={loading}
                        className="w-full px-4 py-3 rounded-xl bg-white/16 border border-white/25 text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-400 outline-none disabled:opacity-50"
                      />
                    </div>
                  </>
                )}

                <div className="mb-3">
                  <label className="block text-sm text-white/85 mb-1">
                    {isBusiness ? "Admin Email *" : "Email *"}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl bg-white/16 border border-white/25 text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-400 outline-none disabled:opacity-50"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-white/85 mb-1">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl bg-white/16 border border-white/25 text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-400 outline-none disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-yellow-400 text-gray-900 font-semibold rounded-xl shadow-sm hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Creating Account..."
                    : isBusiness
                    ? "Create Business Account"
                    : "Sign Up"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
// src/Model/Login_SignUp_Model.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  customerSignup,
  businessLogin,
  businessSignup,
  b2bSetPassword,
  requestPasswordReset,
  completePasswordReset,
} from "../services/authService";
import { useAuth } from "../contexts/AuthContext";

const initialForgotState = {
  identifier: "",
  otp: "",
  newPassword: "",
  confirmPassword: "",
  resetId: null,
  step: "request",
};

export default function Login_SignUp_Model({ onClose, variant = "customer" }) {
  const [isLogin, setIsLogin] = useState(true);
  const isBusiness = variant === "business";
  const { loginCustomer } = useAuth();
  const navigate = useNavigate();
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    // Customer fields
    fullName: "",
    mobile: "",
    email: "",
    password: "",
    // Business fields
    companyName: "",
    companyEmail: "",
    gstNumber: "",
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotForm, setForgotForm] = useState(initialForgotState);
  const [forgotLoading, setForgotLoading] = useState(false);

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
      // If logged-in user is an admin, redirect to admin panel immediately
      const role = result.data?.user?.role;
      if (role && (role.toLowerCase() === "admin")) {
        // Close modal and redirect immediately (no delay for admin)
        onClose();
        navigate("/admin", { replace: true });
      } else {
        // Regular customers: show success message briefly, then close
        setTimeout(() => {
          onClose();
        }, 1500);
      }
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

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    const result = await businessLogin({
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    if (result.success) {
      if (result.data?.isFirstLogin) {
        setIsFirstLogin(true);
        setSuccess("Credentials verified! Please create your permanent password.");
        return;
      }
      setSuccess(result.message);
      setTimeout(() => {
        onClose();
        navigate("/business/dashboard");
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  // Handle B2B Set Password
  const handleB2BSetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const result = await b2bSetPassword({
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    if (result.success) {
      setSuccess("Account set up successfully! Welcome.");
      setTimeout(() => {
        onClose();
        navigate("/business/dashboard");
      }, 1500);
    } else {
      setError(result.message || "Failed to set password");
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

  const handleForgotChange = (e) => {
    setForgotForm({
      ...forgotForm,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (forgotForm.step === "request") {
      if (!forgotForm.identifier) {
        setError("Please enter your registered email or phone number");
        return;
      }

      setForgotLoading(true);
      const payload = forgotForm.identifier.includes("@")
        ? { email: forgotForm.identifier.trim() }
        : { phone: forgotForm.identifier.trim() };
      const result = await requestPasswordReset(payload);
      setForgotLoading(false);

      if (result.success) {
        setSuccess(
          `OTP sent to WhatsApp (${result.data?.destination || "registered number"})`
        );
        setForgotForm((prev) => ({
          ...prev,
          resetId: result.data?.resetId,
          step: "verify",
        }));
      } else {
        setError(result.message || "Unable to send OTP. Try again.");
      }
    } else {
      if (!forgotForm.resetId) {
        setError("Please request a new OTP.");
        return;
      }

      if (!forgotForm.otp || !forgotForm.newPassword) {
        setError("Enter OTP and new password");
        return;
      }

      if (forgotForm.newPassword.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      if (forgotForm.newPassword !== forgotForm.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      setForgotLoading(true);
      const result = await completePasswordReset({
        resetId: forgotForm.resetId,
        otp: forgotForm.otp.trim(),
        newPassword: forgotForm.newPassword,
      });
      setForgotLoading(false);

      if (result.success) {
        setSuccess("Password reset successful. Please login with your new password.");
        setShowForgotPassword(false);
        setForgotForm(initialForgotState);
      } else {
        setError(result.message || "Unable to reset password");
      }
    }
  };

  const handleForgotToggle = () => {
    setShowForgotPassword((prev) => !prev);
    setForgotForm(initialForgotState);
    setError("");
    setSuccess("");
  };

  const handleResendOtp = async () => {
    if (!forgotForm.identifier) {
      setError("Enter your email or phone to resend OTP");
      return;
    }
    setError("");
    setSuccess("");
    setForgotLoading(true);
    const payload = forgotForm.identifier.includes("@")
      ? { email: forgotForm.identifier.trim() }
      : { phone: forgotForm.identifier.trim() };
    const result = await requestPasswordReset(payload);
    setForgotLoading(false);

    if (result.success) {
      setSuccess("New OTP sent to your WhatsApp number.");
      setForgotForm((prev) => ({
        ...prev,
        resetId: result.data?.resetId,
        step: "verify",
      }));
    } else {
      setError(result.message || "Unable to resend OTP. Try again.");
    }
  };

  // Switch between login/signup
  const handleTabSwitch = (loginMode) => {
    setIsLogin(loginMode);
    setShowForgotPassword(false);
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
    setForgotForm(initialForgotState);
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
        className="relative w-full max-w-md bg-white/15 backdrop-blur-md border border-white/30 rounded-3xl shadow-2xl text-white overflow-hidden"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-white/80 hover:text-white text-2xl z-10"
          aria-label="Close dialog"
        >
          ×
        </button>

        {/* Tabs with Sliding Animation */}
        <div className="flex justify-center mt-6 mb-2">
          <div className="bg-black/20 p-1 rounded-full flex gap-1 relative border border-white/10">
            {[
              { label: isBusiness ? "Business Login" : "Login", value: true },
              (!isBusiness) && { label: "Sign Up", value: false }
            ].filter(Boolean).map((tab) => (
              <button
                key={tab.label}
                onClick={() => !loading && handleTabSwitch(tab.value)}
                className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-bold transition-colors duration-300 ${isLogin === tab.value ? "text-gray-900" : "text-white/70 hover:text-white"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loading}
              >
                {isLogin === tab.value && (
                  <motion.div
                    layoutId="loginTab"
                    className="absolute inset-0 bg-yellow-400 rounded-full shadow-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative">{tab.label}</span>
              </button>
            ))}
          </div>
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
              showForgotPassword ? (
                <motion.form
                  key="forgot-password"
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.32, ease: "easeInOut" }}
                  onSubmit={handleForgotPasswordSubmit}
                >
                  <h2 className="text-2xl font-semibold text-center mb-5">Reset Password</h2>

                  {forgotForm.step === "request" ? (
                    <div className="mb-4">
                      <label className="block text-sm text-white/85 mb-1">
                        Registered Email or Phone
                      </label>
                      <input
                        type="text"
                        name="identifier"
                        value={forgotForm.identifier}
                        onChange={handleForgotChange}
                        placeholder="you@example.com / +91XXXXXXXXXX"
                        disabled={forgotLoading}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 focus:border-yellow-400/50 focus:bg-white/20 text-white placeholder-white/50 focus:ring-4 focus:ring-yellow-400/20 backdrop-blur-sm outline-none transition-all duration-300 font-medium disabled:opacity-50"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="mb-3">
                        <label className="block text-sm text-white/85 mb-1">OTP</label>
                        <input
                          type="text"
                          name="otp"
                          value={forgotForm.otp}
                          onChange={handleForgotChange}
                          placeholder="Enter 6-digit OTP"
                          disabled={forgotLoading}
                          className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 focus:border-yellow-400/50 focus:bg-white/20 text-white placeholder-white/50 focus:ring-4 focus:ring-yellow-400/20 backdrop-blur-sm outline-none transition-all duration-300 font-medium disabled:opacity-50"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm text-white/85 mb-1">New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={forgotForm.newPassword}
                          onChange={handleForgotChange}
                          placeholder="Create a new password"
                          disabled={forgotLoading}
                          className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 focus:border-yellow-400/50 focus:bg-white/20 text-white placeholder-white/50 focus:ring-4 focus:ring-yellow-400/20 backdrop-blur-sm outline-none transition-all duration-300 font-medium disabled:opacity-50"
                        />
                      </div>
                      <div className="flex justify-end mb-2">
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={forgotLoading}
                          className="text-xs text-yellow-300 hover:underline disabled:opacity-50"
                        >
                          Resend OTP
                        </button>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm text-white/85 mb-1">Confirm Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={forgotForm.confirmPassword}
                          onChange={handleForgotChange}
                          placeholder="Re-enter new password"
                          disabled={forgotLoading}
                          className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 focus:border-yellow-400/50 focus:bg-white/20 text-white placeholder-white/50 focus:ring-4 focus:ring-yellow-400/20 backdrop-blur-sm outline-none transition-all duration-300 font-medium disabled:opacity-50"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleForgotToggle}
                      className="text-sm text-white/80 hover:text-white underline-offset-2"
                    >
                      Back to Login
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="px-5 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-yellow-400/20 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {forgotLoading
                        ? "Please wait..."
                        : forgotForm.step === "request"
                          ? "Send OTP"
                          : "Update Password"}
                    </button>
                  </div>
                </motion.form>
              ) : (
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
                    {isFirstLogin ? "Set Your Password" : isBusiness ? "Business Login" : "Welcome Back"}
                  </h2>

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
                      disabled={loading || isFirstLogin}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 focus:border-yellow-400/50 focus:bg-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-400/20 backdrop-blur-sm outline-none transition-all duration-200 disabled:opacity-50"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm text-white/85 mb-1">
                      {isFirstLogin ? "Create Permanent Password" : "Password"}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 focus:border-yellow-400/50 focus:bg-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-400/20 backdrop-blur-sm outline-none transition-all duration-200 disabled:opacity-50"
                    />
                  </div>

                  {isFirstLogin && (
                    <div className="mb-3">
                      <label className="block text-sm text-white/85 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={loading}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 focus:border-yellow-400/50 focus:bg-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-400/20 backdrop-blur-sm outline-none transition-all duration-200 disabled:opacity-50"
                      />
                    </div>
                  )}

                  {!isFirstLogin && (
                    <div className="flex justify-end mb-5">
                      <button
                        type="button"
                        onClick={handleForgotToggle}
                        className="text-sm text-yellow-300 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <button
                    onClick={isFirstLogin ? handleB2BSetPassword : (isBusiness ? handleBusinessLogin : handleCustomerLogin)}
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-yellow-400/20 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? "Processing..." : isFirstLogin ? "Set Password & Login" : isBusiness ? "Business Login" : "Login"}
                  </button>
                </motion.form>
              )
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
                        className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 focus:border-yellow-400/50 focus:bg-white/20 text-white placeholder-white/50 focus:ring-4 focus:ring-yellow-400/20 backdrop-blur-sm outline-none transition-all duration-300 font-medium disabled:opacity-50"
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
                        className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 focus:border-yellow-400/50 focus:bg-white/20 text-white placeholder-white/50 focus:ring-4 focus:ring-yellow-400/20 backdrop-blur-sm outline-none transition-all duration-300 font-medium disabled:opacity-50"
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
                        className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 focus:border-yellow-400/50 focus:bg-white/20 text-white placeholder-white/50 focus:ring-4 focus:ring-yellow-400/20 backdrop-blur-sm outline-none transition-all duration-300 font-medium disabled:opacity-50"
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
                        className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 focus:border-yellow-400/50 focus:bg-white/20 text-white placeholder-white/50 focus:ring-4 focus:ring-yellow-400/20 backdrop-blur-sm outline-none transition-all duration-300 font-medium disabled:opacity-50"
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
                        className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 focus:border-yellow-400/50 focus:bg-white/20 text-white placeholder-white/50 focus:ring-4 focus:ring-yellow-400/20 backdrop-blur-sm outline-none transition-all duration-300 font-medium disabled:opacity-50"
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
                    className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 focus:border-yellow-400/50 focus:bg-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-400/20 backdrop-blur-sm outline-none transition-all duration-200 disabled:opacity-50"
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
                    className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 focus:border-yellow-400/50 focus:bg-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-400/20 backdrop-blur-sm outline-none transition-all duration-200 disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-yellow-400/20 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
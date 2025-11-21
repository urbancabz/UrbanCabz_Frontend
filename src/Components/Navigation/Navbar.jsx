import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LoginModal from "../../Model/Login_SignUp_Model";

export default function Navbar({ variant = "customer" }) {
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();

  const isOnBusinessPage =
    location.pathname.startsWith("/b2b") ||
    location.pathname.startsWith("/business");

  const modalVariant = isOnBusinessPage ? "business" : "customer";

  return (
    <>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] md:w-[90%] z-50 bg-white/40 backdrop-blur-2xl border border-white/30 shadow-xl rounded-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">

          {/* Brand */}
          <h4 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Urban <span className="text-yellow-500">Cabz</span>
          </h4>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">

            {/* Show only Home or Business based on current page */}
            {isOnBusinessPage ? (
              <Link
                to="/"
                className="px-4 py-2 rounded-xl text-gray-800 font-semibold hover:text-gray-900 hover:bg-yellow-400/70 transition shadow-sm"
              >
                Home
              </Link>
            ) : (
              <Link
                to="/b2b"
                className="px-4 py-2 rounded-xl text-gray-800 font-semibold hover:text-gray-900 hover:bg-yellow-400/70 transition shadow-sm"
              >
                Business
              </Link>
            )}

            {/* Login */}
            <button
              onClick={() => setShowLogin(true)}
              className="px-5 py-2 rounded-xl bg-gray-900 text-white font-medium hover:bg-yellow-500 hover:text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm"
            >
              Login
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-3">

            {/* Business / Home toggle */}
            {isOnBusinessPage ? (
              <Link
                to="/"
                className="px-3 py-2 rounded-lg bg-white/40 backdrop-blur text-gray-900 font-medium border border-white/30 hover:bg-yellow-400 transition"
              >
                Home
              </Link>
            ) : (
              <Link
                to="/b2b"
                className="px-3 py-2 rounded-lg bg-white/40 backdrop-blur text-gray-900 font-medium border border-white/30 hover:bg-yellow-400 transition"
              >
                Business
              </Link>
            )}

            {/* Login */}
            <button
              onClick={() => setShowLogin(true)}
              className="px-3 py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-yellow-500 hover:text-gray-900 transition"
            >
              Login
            </button>
          </div>

        </div>
      </div>

      {/* Modal */}
      {showLogin && (
        <LoginModal variant={modalVariant} onClose={() => setShowLogin(false)} />
      )}
    </>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import LoginModal from "../../models/LoginModal";
import ProfileModal from "../Profile/ProfileModal";
import { useAuth } from "../../contexts/AuthContext";

export default function Navbar({ variant = "customer" }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isOnBusinessPage =
    location.pathname.startsWith("/b2b") ||
    location.pathname.startsWith("/business");

  const modalVariant = isOnBusinessPage ? "business" : "customer";
  const isCustomerLoggedIn = Boolean(user);

  useEffect(() => {
    if (isOnBusinessPage) {
      setShowProfile(false);
    }
  }, [isOnBusinessPage]);

  const avatarLabel = useMemo(() => {
    if (!user) return "";
    if (user.name) {
      const initials = user.name
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("");
      return initials.slice(0, 2).toUpperCase();
    }
    if (user.email) return user.email.slice(0, 1).toUpperCase();
    return "U";
  }, [user]);

  const handleProfileToggle = () => {
    setShowProfile(true);
  };

  const shouldShowLoginModal = showLogin && (isOnBusinessPage || !isCustomerLoggedIn);

  const renderAuthButton = (variantKey = "desktop") => {
    if (isOnBusinessPage) {
      const baseButton =
        "rounded-xl font-semibold transition-all duration-300 shadow-sm bg-gray-900 text-white hover:bg-yellow-500 hover:text-gray-900";
      const paddingClass = variantKey === "mobile" ? "px-3 py-2" : "px-5 py-2";
      return (
        <button
          onClick={() => setShowLogin(true)}
          className={`${baseButton} ${paddingClass}`}
        >
          Business Login
        </button>
      );
    }

    if (isCustomerLoggedIn) {
      const baseCircle = "rounded-full bg-yellow-400 text-gray-900 font-semibold shadow-md transition hover:scale-105";
      const sizeClass = variantKey === "mobile" ? "h-11 w-11" : "h-12 w-12";
      return (
        <button
          onClick={handleProfileToggle}
          className={`${baseCircle} ${sizeClass} flex items-center justify-center`}
          aria-label="Open profile"
        >
          <span className="text-lg">{avatarLabel}</span>
        </button>
      );
    }

    const baseButton =
      "rounded-xl font-medium transition-all duration-300 shadow-sm bg-gray-900 text-white hover:bg-yellow-500 hover:text-gray-900";
    const paddingClass = variantKey === "mobile" ? "px-3 py-2" : "px-5 py-2";

    return (
      <button
        onClick={() => setShowLogin(true)}
        className={`${baseButton} ${paddingClass}`}
      >
        Login
      </button>
    );
  };

  return (
    <>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] md:w-[90%] z-50 bg-white/40 backdrop-blur-2xl border border-white/30 shadow-xl rounded-2xl transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">

          {/* Brand */}
          <h4 className="text-3xl font-extrabold text-gray-900 tracking-tight transition-colors">
            Urban <span className="text-yellow-500">Cabz</span>
          </h4>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">

            {/* Show only Home or Business based on current page */}
            {!isOnBusinessPage && (
              <a
                href="/b2b"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-gray-800 font-semibold hover:text-gray-900 hover:bg-yellow-400/70 transition shadow-sm"
              >
                Business
              </a>
            )}

            {/* Auth Action */}
            {renderAuthButton("desktop")}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">

            {/* Business / Home toggle */}
            {!isOnBusinessPage && (
              <a
                href="/b2b"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-lg bg-white/40 backdrop-blur text-gray-900 font-medium border border-white/30 hover:bg-yellow-400 transition"
              >
                Business
              </a>
            )}

            {/* Auth Action */}
            {renderAuthButton("mobile")}
          </div>

        </div>
      </div>

      {/* Modal */}
      {shouldShowLoginModal && (
        <LoginModal variant={modalVariant} onClose={() => setShowLogin(false)} />
      )}
      {!isOnBusinessPage && (
        <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}

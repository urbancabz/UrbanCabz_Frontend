import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const isB2B = location.pathname === "/b2b";

  return (
    <footer
      className={`${isB2B
        ? "bg-neutral-900 text-gray-300 border-neutral-800"
        : "bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-slate-800"
        } py-10 md:py-14 px-4 md:px-16 shadow-inner border-t transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h2
              className={`text-2xl font-bold mb-4 ${isB2B ? "text-white" : "text-gray-900 dark:text-white"
                }`}
            >
              Urban <span className="text-yellow-500">Cabz</span>
            </h2>
            <p className="text-sm opacity-80 leading-relaxed mb-4">
              Fast, safe, and reliable cab service across cities and airports.
              Ride with comfort and confidence.
            </p>
            {/* App Store badges placeholder */}
            <div className="flex gap-2 mt-4">
              <a
                href="#"
                className={`${isB2B
                  ? "bg-neutral-800 text-white hover:bg-neutral-700"
                  : "bg-gray-900 text-white hover:bg-gray-800"
                  } text-xs px-3 py-2 rounded-lg flex items-center gap-2 transition-colors`}
                aria-label="Download on App Store"
              >
                <span>📱</span>
                <span>App Store</span>
              </a>
              <a
                href="#"
                className={`${isB2B
                  ? "bg-neutral-800 text-white hover:bg-neutral-700"
                  : "bg-gray-900 text-white hover:bg-gray-800"
                  } text-xs px-3 py-2 rounded-lg flex items-center gap-2 transition-colors`}
                aria-label="Get it on Play Store"
              >
                <span>📱</span>
                <span>Play Store</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 opacity-90">
              <li>
                <Link to="/" className="hover:text-yellow-500 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="hover:text-yellow-500 transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/cab-booking" className="hover:text-yellow-500 transition">
                  Book a Ride
                </Link>
              </li>
              <li>
                <Link to="/b2b" className="hover:text-yellow-500 transition">
                  For Business
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 opacity-90">
              <li>
                <Link to="/privacy-policy" className="hover:text-yellow-500 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-yellow-500 transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-yellow-500 transition">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-yellow-500 transition">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials & Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-3 mb-6">
              {[
                { Icon: FaFacebookF, label: "Facebook" },
                { Icon: FaInstagram, label: "Instagram" },
                { Icon: FaTwitter, label: "Twitter" },
                { Icon: FaLinkedinIn, label: "LinkedIn" },
              ].map(({ Icon, label }, index) => (
                <a
                  key={index}
                  href="#"
                  className={`p-2.5 rounded-full shadow hover:bg-yellow-500 hover:text-white transition group ${isB2B
                    ? "bg-neutral-800 text-white"
                    : "bg-white dark:bg-slate-800 text-gray-800 dark:text-white"
                    }`}
                  aria-label={`Follow us on ${label}`}
                >
                  <Icon className="group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <a
                href="mailto:support@urbancabz.com"
                className="flex items-center gap-2 hover:text-yellow-500 transition"
              >
                <span>✉️</span>
                <span>support@urbancabz.com</span>
              </a>
              <a
                href="tel:+919876543210"
                className="flex items-center gap-2 hover:text-yellow-500 transition"
              >
                <span>📞</span>
                <span>+91 98765 43210</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className={`border-t mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm ${isB2B
            ? "border-neutral-800 text-neutral-500"
            : "border-gray-300 dark:border-slate-800 text-gray-600 dark:text-gray-400"
            }`}
        >
          <p>
            © {currentYear}{" "}
            <span className="text-yellow-500 font-semibold">UrbanCabz</span>. All
            rights reserved.
            <br />
            <span className="text-xs opacity-80">HARSHIL KUMAR KHASOR</span>
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span>🔒</span>
              <span>Secure Payments</span>
            </span>
            <span className="flex items-center gap-1">
              <span>✅</span>
              <span>Verified Drivers</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}


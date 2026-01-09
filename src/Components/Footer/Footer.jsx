import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-800 py-8 md:py-10 px-4 md:px-16 shadow-inner border-t border-gray-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold  text-gray-900 mb-4">Urban <span className="text-yellow-500">Cabz</span></h2>
          <p className="text-sm opacity-80 leading-relaxed">
            Fast, safe, and reliable cab service across cities and airports.
            Ride with comfort and confidence.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 opacity-90">
            <li><a href="#" className="hover:text-yellow-500 transition">Home</a></li>
            <li><a href="#" className="hover:text-yellow-500 transition">About</a></li>
            <li><a href="#" className="hover:text-yellow-500 transition">Services</a></li>
            <li><a href="#" className="hover:text-yellow-500 transition">Contact</a></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Our Services</h3>
          <ul className="space-y-2 opacity-90">
            <li>Airport Transfers</li>
            <li>Outstation Rides</li>
            <li>Round Trips</li>
            <li>City Tours</li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="p-2 bg-white rounded-full shadow hover:bg-yellow-500 hover:text-white transition">
              <FaFacebookF />
            </a>
            <a href="#" className="p-2 bg-white rounded-full shadow hover:bg-yellow-500 hover:text-white transition">
              <FaInstagram />
            </a>
            <a href="#" className="p-2 bg-white rounded-full shadow hover:bg-yellow-500 hover:text-white transition">
              <FaTwitter />
            </a>
            <a href="#" className="p-2 bg-white rounded-full shadow hover:bg-yellow-500 hover:text-white transition">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-300 mt-10 pt-6 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} <span className="text-yellow-500 font-semibold">UrbanCabz</span>. All rights reserved.
      </div>
    </footer>
  );
}

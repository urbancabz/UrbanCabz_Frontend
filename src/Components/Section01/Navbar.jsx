import React from 'react'

function Navbar() {
  return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] md:w-[90%] z-50 bg-white/40 backdrop-blur-2xl border border-white/30 shadow-xl rounded-2xl">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          {/* Logo / Brand */}
          <h4 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Urban <span className="text-yellow-500">Cabz</span>
          </h4>

          {/* Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button className="px-5 py-2 rounded-xl border border-gray-800/70 text-gray-800 font-medium hover:bg-gray-900 hover:text-white hover:scale-105 transition-all duration-300 shadow-sm">
              Register Taxi
            </button>
            <button className="px-5 py-2 rounded-xl bg-gray-900 text-white font-medium hover:bg-yellow-500 hover:text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm">
              Login
            </button>
          </div>

          {/* Mobile Icon */}
          <button className="md:hidden p-2 text-gray-800 hover:text-yellow-500 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>
  
  )
}

export default Navbar
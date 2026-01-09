// src/Components/Loading/CabLoadingScreen.jsx
import React from "react";
import { motion } from "framer-motion";

export default function CabLoadingScreen({ message = "Finding your perfect ride..." }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="text-center px-4">
        {/* Animated Cab */}
        <div className="relative mb-8">
          {/* Road */}
          <div className="w-80 h-2 bg-gray-300 rounded-full mx-auto mb-4 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ width: "30%" }}
            />
          </div>

          {/* Cab Icon */}
          <motion.div
            className="relative mx-auto"
            animate={{
              x: [0, 20, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg
              className="w-24 h-24 text-yellow-500 mx-auto"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
            </svg>

            {/* Wheels Animation */}
            <motion.div
              className="absolute bottom-2 left-4 w-4 h-4 bg-gray-800 rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <motion.div
              className="absolute bottom-2 right-4 w-4 h-4 bg-gray-800 rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>

          {/* Moving Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-yellow-500 rounded-full"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>

        {/* Loading Text */}
        <motion.p
          className="text-xl font-semibold text-gray-800 mb-2"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {message}
        </motion.p>
        <p className="text-sm text-gray-600">Please wait while we calculate your route...</p>
      </div>
    </div>
  );
}





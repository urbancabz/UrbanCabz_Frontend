import React from "react";
import Input from "./Input";

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center pt-24 pb-32">
      {/* Background image */}
      <img
        src="https://images.unsplash.com/photo-1624864004706-3a154fd7a3ae?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170"
        alt="Taxi background"
        className="absolute inset-0 
        w-full h-full 
        object-cover 
        md:object-center 
        object-[center_40%]
        transition-all duration-500 ease-in-out"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30"></div>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center text-center text-white px-6 sm:px-8 md:px-12 w-full">
        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-xl">
          Book Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500">Urban Ride</span> Now
        </h1>

        {/* Subtext */}
        <p className="text-base sm:text-lg md:text-2xl max-w-3xl mx-auto font-medium text-slate-100 mb-10 drop-shadow-md">
          Fast, safe, and comfortable taxi rides — <span className="text-yellow-300 opacity-90">anytime, anywhere.</span>
        </p>

        {/* Booking form */}
        <div className="w-full max-w-6xl">
          <Input />
        </div>
      </div>
    </section>
  );
}

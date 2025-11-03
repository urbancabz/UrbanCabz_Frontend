import React from "react";
import Input from "./Input";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[calc(110vh-4rem)] flex items-center justify-center overflow-hidden pt-16 sm:pt-20">
      {/* Background image */}
      <img
        src="https://images.unsplash.com/photo-1552709607-b93cb1c5edec?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1151"
        alt="Taxi background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center text-center text-white px-6 sm:px-8 md:px-12 py-10 sm:py-16 w-full">
        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
          Book Your <span className="text-yellow-400">Urban Ride</span> Now
        </h1>

        {/* Subtext */}
        <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto opacity-90 mb-8">
          Fast, safe, and comfortable taxi rides — anytime, anywhere.
        </p>

        {/* Booking form */}
        <div className="w-full max-w-6xl">
          <Input />
        </div>
      </div>
    </section>
  );
}

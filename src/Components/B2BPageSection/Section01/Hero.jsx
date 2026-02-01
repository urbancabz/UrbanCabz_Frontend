import React from "react";
import { motion } from "framer-motion";
import b2bHeroImage from "../../../assets/b2b_hero_bg_professional.png";

export default function HeroFullCover({
  imageSrc = b2bHeroImage,
  titleLines = ["Managing Workplace Commute", "Smart Employee Transport & Fleet Solutions"],
  subtitle = "Employee pick-up & drop, airport transfers, and corporate rentals — SLA-backed and fleet-ready.",
  primaryCta = { label: "Login", href: "#contact" },
  secondaryCta = { label: "Explore Services", href: "#services" },
  minHeight = "min-h-screen", // use 'h-screen' or 'min-h-screen'
}) {
  return (
    <section
      className={`relative ${minHeight} w-full flex items-center`}
      aria-labelledby="hero-heading"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-center bg-cover -z-10"
        style={{
          backgroundImage: `url(${imageSrc})`,
        }}
        role="img"
        aria-label="Corporate shuttle in front of an office (background)"
      />

      {/* Dark gradient overlay to ensure legibility */}
      <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/35 to-black/45 -z-5" />

      {/* Optional soft vignette to focus center */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.6) 100%)]" />
      </div>

      {/* Content container */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 text-center">
        <motion.h1
          id="hero-heading"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-white font-extrabold leading-tight drop-shadow-md"
          style={{ WebkitFontSmoothing: "antialiased" }}
        >
          {/* Stack headline lines with subtle emphasis on the second line */}
          {titleLines.map((line, idx) => (
            <span
              key={idx}
              className={`block ${idx === 0 ? "text-3xl sm:text-4xl md:text-5xl" : "text-3xl sm:text-4xl md:text-5xl text-yellow-300"
                }`}
            >
              {line}
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.6 }}
          className="mt-4 max-w-2xl mx-auto text-white/85 text-base sm:text-lg"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.6 }}
          className="mt-6 flex justify-center gap-3 flex-wrap"
        >
        </motion.div>

      </div>
    </section>
  );
}

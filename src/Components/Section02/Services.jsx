import React from "react";
import { motion } from "framer-motion";

export default function Services({ services }) {
  return (
    <div className="px-6 md:px-20 lg:px-32 pb-20">
      <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-12">
        Our <span className="text-yellow-500">Services</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {services.map((service, index) => (
          <motion.div
            key={index}
            className="relative h-[520px] md:h-[580px] rounded-2xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: index * 0.2,
              ease: "easeOut",
            }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.03 }}
          >
            {/* Background Image */}
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover brightness-[60%]"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

            {/* Text content */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-3 leading-snug">
                {service.title}
              </h3>
              <p className="text-base md:text-lg opacity-90 leading-relaxed">
                {service.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

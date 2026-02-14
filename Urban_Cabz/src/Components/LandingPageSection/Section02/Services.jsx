
import React from "react";
import { motion } from "framer-motion";

export default function Services({ services }) {
  const cardVariants = {
    initial: { y: 0 },
    hover: { y: -8, transition: { duration: 0.3 } }
  };

  const imageVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1, transition: { duration: 0.6 } }
  };

  const textVariants = {
    initial: { y: 20, opacity: 0.8 },
    hover: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  };

  return (
    <div className="px-4 md:px-20 lg:px-32 pb-20 md:pb-32 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="text-center mb-10 md:mb-16">
        <h2 className="text-xs md:text-sm font-bold tracking-[0.2em] text-yellow-600 dark:text-yellow-500 uppercase mb-2 md:mb-3">Our Services</h2>
        <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
          Experiences crafted for <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">every journey.</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <motion.div
            key={index}
            className="group relative h-[380px] md:h-[450px] rounded-[1.5rem] overflow-hidden shadow-xl cursor-pointer bg-slate-900 border border-slate-200"
            initial="initial"
            whileHover="hover"
            animate="initial"
            variants={cardVariants}
            viewport={{ once: true }}
          >
            {/* Background Image */}
            <motion.div className="w-full h-full" variants={imageVariants}>
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover brightness-[0.7]"
              />
            </motion.div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              <div className="w-10 h-1 bg-yellow-400 mb-3 md:mb-4 rounded-full"></div>

              <h3 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3 leading-tight">
                {service.title}
              </h3>

              <motion.p className="text-sm md:text-base text-slate-300 leading-relaxed mb-4 max-w-sm line-clamp-3">
                {service.description}
              </motion.p>

              <div className="flex items-center gap-2 text-yellow-400 font-bold uppercase tracking-widest text-xs opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <span>View Details</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

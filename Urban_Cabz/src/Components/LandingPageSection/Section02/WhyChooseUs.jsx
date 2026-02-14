import React from "react";
import { motion } from "framer-motion";

export default function WhyChooseUs({ title, subtitle, features }) {
  return (
    <section className="w-full py-12 md:py-16 flex flex-col items-center px-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          {title} <span className="text-yellow-500">Us</span>
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 dark:border-slate-800 text-center flex flex-col items-center transition-all duration-300 hover:-translate-y-1"
          >
            <div className="mb-4 bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-full text-3xl">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

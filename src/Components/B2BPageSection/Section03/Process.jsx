import React from "react";
import { motion } from "framer-motion";

const steps = [
    {
        id: "01",
        title: "Consultation",
        description: "We analyze your company's transportation needs, shift timings, and employee distribution.",
    },
    {
        id: "02",
        title: "Planning",
        description: "Our experts design a customized route and fleet plan to optimize cost and efficiency.",
    },
    {
        id: "03",
        title: "Onboarding",
        description: "Seamless integration of our tech with your systems, including employee app onboarding.",
    },
    {
        id: "04",
        title: "Operations",
        description: "Live tracking, 24/7 support, and real-time dashboard access for your admin team.",
    },
];

export default function Process() {
    return (
        <section className="py-24 bg-black relative overflow-hidden" id="process">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-20"
                >
                    <span className="text-yellow-400 font-semibold tracking-wider uppercase text-sm">
                        How It Works
                    </span>
                    <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-white">
                        Partnership in 4 Simple Steps
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="relative p-6 pt-12 border-l border-neutral-800 hover:border-yellow-400/50 transition-colors duration-300"
                        >
                            <div className="absolute top-0 left-[-17px] w-8 h-8 rounded-full bg-neutral-900 border-2 border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-400 group-hover:border-yellow-400 group-hover:text-yellow-400 transition-colors">
                                {/* Only show circle on desktop if we want a timeline feel, but for grid, a simple number is fine. 
                     Here let's just make it a number badge on top-left */}
                                <span className="w-3 h-3 bg-yellow-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                            </div>

                            <span className="absolute top-[-1.5rem] left-0 text-6xl font-black text-neutral-800/40 select-none">
                                {step.id}
                            </span>

                            <h3 className="relative text-xl font-bold text-white mb-3 mt-4">
                                {step.title}
                            </h3>
                            <p className="relative text-neutral-400 text-sm leading-relaxed">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

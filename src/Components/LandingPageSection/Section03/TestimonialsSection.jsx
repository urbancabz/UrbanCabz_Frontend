import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
    {
        name: "Priya Sharma",
        role: "Business Manager",
        location: "Mumbai",
        rating: 5,
        text: "Urban Cabz has been our go-to for all corporate travel. Their drivers are always punctual and professional. Highly recommend for business travelers!",
        avatar: "PS",
    },
    {
        name: "Rahul Verma",
        role: "Frequent Traveler",
        location: "Delhi",
        rating: 5,
        text: "Best airport transfer service I've used. Clean cars, polite drivers, and very reasonable prices. The booking process is super smooth!",
        avatar: "RV",
    },
    {
        name: "Anita Patel",
        role: "Family Traveler",
        location: "Bangalore",
        rating: 5,
        text: "We used Urban Cabz for our family trip to Mysore. The driver was excellent, and the car was spacious and comfortable. Will definitely book again!",
        avatar: "AP",
    },
];

const StarRating = ({ rating }) => (
    <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
            />
        ))}
    </div>
);

const TestimonialCard = ({ testimonial, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl dark:hover:shadow-slate-900/50 transition-all duration-300 relative"
    >
        {/* Quote icon */}
        <div className="absolute -top-3 -left-3 bg-yellow-400 rounded-full p-2 shadow-md">
            <Quote className="w-4 h-4 text-white" />
        </div>

        {/* Rating */}
        <div className="mb-4">
            <StarRating rating={testimonial.rating} />
        </div>

        {/* Testimonial text */}
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-sm">
            "{testimonial.text}"
        </p>

        {/* Author info */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {testimonial.avatar}
            </div>
            <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{testimonial.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {testimonial.role} • {testimonial.location}
                </p>
            </div>
        </div>
    </motion.div>
);

export default function TestimonialsSection() {
    return (
        <section className="py-16 md:py-24 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
                    >
                        Testimonials
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4"
                    >
                        Loved by <span className="text-yellow-500">Thousands</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
                    >
                        Don't just take our word for it. Here's what our customers have to say about their experience with Urban Cabz.
                    </motion.p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard key={index} testimonial={testimonial} index={index} />
                    ))}
                </div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="mt-16 flex flex-wrap justify-center gap-6 md:gap-10"
                >
                    {[
                        { icon: "🔒", text: "Secure Payments" },
                        { icon: "📍", text: "GPS Tracked Rides" },
                        { icon: "🛡️", text: "Verified Drivers" },
                        { icon: "📞", text: "24/7 Support" },
                    ].map((badge, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm font-medium"
                        >
                            <span className="text-xl">{badge.icon}</span>
                            <span>{badge.text}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

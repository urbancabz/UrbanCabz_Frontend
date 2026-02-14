import React, { useState } from "react";
import { motion } from "framer-motion";

export default function Contact() {
    const [formState, setFormState] = useState({
        name: "",
        company: "",
        email: "",
        phone: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

    const handleChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api/v1";
            const response = await fetch(`${API_BASE_URL}/b2b/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formState),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSubmitStatus('success');
                setFormState({
                    name: "",
                    company: "",
                    email: "",
                    phone: "",
                    message: "",
                });
            } else {
                setSubmitStatus('error');
                console.error('Submission error:', data.message);
            }
        } catch (error) {
            setSubmitStatus('error');
            console.error('Network error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-24 bg-neutral-900 border-t border-neutral-800" id="contact">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-yellow-400 font-semibold tracking-wider uppercase text-sm">
                            Get in Touch
                        </span>
                        <h2 className="mt-2 text-4xl sm:text-5xl font-bold text-white leading-tight">
                            Ready to Optimize Your Corporate Travel?
                        </h2>
                        <p className="mt-6 text-neutral-400 text-lg leading-relaxed">
                            Partner with Urban Cabz for a seamless, transparent, and efficient employee transport solution. Let's discuss a custom plan for your organization.
                        </p>

                        <div className="mt-10 space-y-6">
                            <div className="flex items-center gap-4 text-white">
                                <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center text-yellow-400">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-sm text-neutral-400">Call Us</div>
                                    <div className="text-lg font-medium">+91 90338 77967</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-white">
                                <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center text-yellow-400">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-sm text-neutral-400">Email Us</div>
                                    <div className="text-lg font-medium">contact@urbancabz.com</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-neutral-800 p-8 sm:p-10 rounded-3xl border border-neutral-700"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-neutral-400 mb-2">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        value={formState.name}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="company" className="block text-sm font-medium text-neutral-400 mb-2">Company</label>
                                    <input
                                        type="text"
                                        id="company"
                                        name="company"
                                        required
                                        value={formState.company}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                                        placeholder="Company Ltd"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-neutral-400 mb-2">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        value={formState.email}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                                        placeholder="john@company.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-neutral-400 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        required
                                        value={formState.phone}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                                        placeholder="+91 90338 77967"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-neutral-400 mb-2">Requirements</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="4"
                                    value={formState.message}
                                    onChange={handleChange}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors resize-none"
                                    placeholder="Tell us about your transport needs..."
                                ></textarea>
                            </div>

                            {submitStatus === 'success' && (
                                <div className="p-4 bg-green-900/50 border border-green-600 rounded-xl text-green-200">
                                    ✓ Thank you for your interest! Our team will contact you shortly.
                                </div>
                            )}

                            {submitStatus === 'error' && (
                                <div className="p-4 bg-red-900/50 border border-red-600 rounded-xl text-red-200">
                                    ✗ Something went wrong. Please try again or contact us directly.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full bg-yellow-400 text-black font-bold text-lg py-4 rounded-xl transition-all transform duration-200 ${isSubmitting
                                    ? 'opacity-70 cursor-not-allowed'
                                    : 'hover:bg-yellow-300 active:scale-[0.98]'
                                    }`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Request Proposal'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

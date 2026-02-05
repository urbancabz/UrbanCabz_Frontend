import React, { useState } from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        alert("Thank you for contacting us! We will get back to you shortly.");
        setFormData({ name: "", email: "", message: "" });
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen">
            <div className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-yellow-50/80 via-white to-transparent -z-10" />
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Contact Us
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-gray-500 font-medium">
                        <span className="w-8 h-[1px] bg-yellow-400"></span>
                        <p>We're here to help you 24/7</p>
                        <span className="w-8 h-[1px] bg-yellow-400"></span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-20">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Contact Information */}
                    <div className="bg-white p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Have questions or need assistance? Reach out to us through any of the following channels. We are here to help you 24/7.
                        </p>

                        <div className="space-y-6">

                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <FaPhone className="h-6 w-6 text-yellow-500" />
                                </div>
                                <div className="ml-4 text-base text-gray-700">
                                    <p className="font-medium text-gray-900">Phone:</p>
                                    <p>+91 90338 77967</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <FaEnvelope className="h-6 w-6 text-yellow-500" />
                                </div>
                                <div className="ml-4 text-base text-gray-700">
                                    <p className="font-medium text-gray-900">Email:</p>
                                    <p>contact@urbancabz.com</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                    Message
                                </label>
                                <textarea
                                    name="message"
                                    id="message"
                                    rows="4"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-150 ease-in-out"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;

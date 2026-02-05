import React from "react";
import Navbar from "../../Components/Navigation/Navbar";
import Footer from "../../Components/Footer/Footer";

const PrivacyPolicy = () => {
    return (
        <div className="bg-[#f8fafc] min-h-screen">
            <div className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-yellow-50/80 via-white to-transparent -z-10" />
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Privacy Policy
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-gray-500 font-medium">
                        <span className="w-8 h-[1px] bg-yellow-400"></span>
                        <p>Last Updated: {new Date().toLocaleDateString()}</p>
                        <span className="w-8 h-[1px] bg-yellow-400"></span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-10 pb-20">
                <div className="bg-white p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] border border-gray-100 space-y-10 text-gray-700 leading-relaxed text-lg">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-100 text-yellow-700 text-base font-bold">1</span>
                            Introduction
                        </h2>
                        <p>
                            Welcome to Urban Cabz. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website or use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-100 text-yellow-700 text-base font-bold">2</span>
                            Information We Collect
                        </h2>
                        <p className="mb-4">
                            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                <strong className="text-gray-900 block mb-1">Identity Data:</strong>
                                <p className="text-sm">includes first name, last name, username or similar identifier.</p>
                            </div>
                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                <strong className="text-gray-900 block mb-1">Contact Data:</strong>
                                <p className="text-sm">includes billing address, delivery address, email address and telephone numbers.</p>
                            </div>
                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                <strong className="text-gray-900 block mb-1">Transaction Data:</strong>
                                <p className="text-sm">includes details about payments to and from you and other details of services you have purchased from us.</p>
                            </div>
                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                <strong className="text-gray-900 block mb-1">Technical Data:</strong>
                                <p className="text-sm">includes IP address, login data, browser type and version, time zone setting and location, etc.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-100 text-yellow-700 text-base font-bold">3</span>
                            How We Use Your Personal Data
                        </h2>
                        <p className="mb-4">
                            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        </p>
                        <ul className="space-y-3">
                            {[
                                "Where we need to perform the contract we are about to enter into or have entered into with you.",
                                "Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.",
                                "Where we need to comply with a legal or regulatory obligation."
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3">
                                    <svg className="w-6 h-6 text-yellow-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-100 text-yellow-700 text-base font-bold">4</span>
                            Data Security
                        </h2>
                        <p>
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-100 text-yellow-700 text-base font-bold">5</span>
                            Contact Details
                        </h2>
                        <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                            <p className="mb-4 font-medium text-gray-800">If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
                            <div className="space-y-2">
                                <p className="flex items-center gap-3">
                                    <strong className="text-gray-900 w-20">Email:</strong>
                                    <a href="mailto:contact@urbancabz.com" className="text-yellow-700 hover:underline">contact@urbancabz.com</a>
                                </p>
                                <p className="flex items-center gap-3">
                                    <strong className="text-gray-900 w-20">Phone:</strong>
                                    <a href="tel:+919033877967" className="text-yellow-700 hover:underline">+91 90338 77967</a>
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;

import React from "react";

const TermsAndConditions = () => {
    return (
        <div className="bg-[#f8fafc] min-h-screen">
            <div className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-yellow-50/80 via-white to-transparent -z-10" />
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Terms and Conditions
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
                            Welcome to Urban Cabz. These Website Standard Terms and Conditions written on this webpage shall manage your use of our website, Urban Cabz. These terms will be applied fully and affect to your use of this Website. By using this Website, you agreed to accept all terms and conditions written in here.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-100 text-yellow-700 text-base font-bold">2</span>
                            Intellectual Property Rights
                        </h2>
                        <p>
                            Other than the content you own, under these Terms, Urban Cabz and/or its licensors own all the intellectual property rights and materials contained in this Website. You are granted limited license only for purposes of viewing the material contained on this Website.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-100 text-yellow-700 text-base font-bold">3</span>
                            Restrictions
                        </h2>
                        <p className="mb-4">
                            You are specifically restricted from all of the following:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                "Publishing any Website material in any other media",
                                "Selling, sublicensing and/or commercializing any Website material",
                                "Publicly performing and/or showing any Website material",
                                "Using this Website in any way that is or may be damaging",
                                "Using this Website in any way that impacts user access",
                                "Using this Website contrary to applicable laws and regulations"
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <svg className="w-5 h-5 text-yellow-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span className="text-sm font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-100 text-yellow-700 text-base font-bold">4</span>
                            Limitation of Liability
                        </h2>
                        <p>
                            In no event shall Urban Cabz, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. Urban Cabz, including its officers, directors and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-100 text-yellow-700 text-base font-bold">5</span>
                            Governing Law & Jurisdiction
                        </h2>
                        <div className="bg-gray-900 text-gray-100 p-8 rounded-[2rem] shadow-xl">
                            <p className="mb-2 text-yellow-400 font-bold uppercase tracking-wider text-sm">Jurisdiction</p>
                            <p className="text-lg italic">
                                "These Terms will be governed by and interpreted in accordance with the laws of the State of India, and you submit to the non-exclusive jurisdiction of the state and federal courts located in India for the resolution of any disputes."
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;

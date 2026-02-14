import React from "react";

const RefundPolicy = () => {
    return (
        <div className="bg-[#f8fafc] min-h-screen">
            <div className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-yellow-50/80 via-white to-transparent -z-10" />
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Refund and Cancellation Policy
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
                            Cancellation Policy
                        </h2>
                        <p className="mb-6">
                            You may cancel your booking at any time before the scheduled pickup time. Cancellation charges may apply depending on when the cancellation is made:
                        </p>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { title: "More than 24 hours before pickup", detail: "No cancellation charge." },
                                { title: "Between 6 to 24 hours before pickup", detail: "10% of the advance amount will be deducted." },
                                { title: "Less than 6 hours before pickup", detail: "No refund of the advance amount." }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-yellow-200 transition-colors">
                                    <span className="font-semibold text-gray-900">{item.title}</span>
                                    <span className="text-yellow-700 font-bold bg-yellow-100 px-4 py-1 rounded-full text-sm">{item.detail}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-100 text-yellow-700 text-base font-bold">2</span>
                            Refund Policy
                        </h2>
                        <div className="space-y-4">
                            <p>
                                Refunds will be processed within <strong className="text-gray-900 border-b-2 border-yellow-200">5-7 working days</strong> of the cancellation request. The amount will be credited back to the original method of payment.
                            </p>
                            <div className="p-6 bg-yellow-50 rounded-2xl border-l-4 border-yellow-400">
                                <p className="text-yellow-800 italic">
                                    "In case of a no-show by the driver or vehicle breakdown, a full refund of the advance amount will be initiated automatically."
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-100 text-yellow-700 text-base font-bold">3</span>
                            Contact Support
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <a href="mailto:support@urbancabs.com" className="p-6 bg-white border border-gray-200 rounded-3xl flex flex-col items-center text-center hover:shadow-lg transition-all group">
                                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <span className="text-gray-900 font-bold mb-1">Email Support</span>
                                <span className="text-yellow-700">contact@urbancabz.com</span>
                            </a>
                            <a href="tel:+919033877967" className="p-6 bg-white border border-gray-200 rounded-3xl flex flex-col items-center text-center hover:shadow-lg transition-all group">
                                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <span className="text-gray-900 font-bold mb-1">Phone Support</span>
                                <span className="text-yellow-700">+91 90338 77967</span>
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default RefundPolicy;

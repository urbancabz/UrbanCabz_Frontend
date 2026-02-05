import React from "react";

const ShippingPolicy = () => {
    return (
        <div className="bg-[#f8fafc] min-h-screen">
            <div className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-yellow-50/80 via-white to-transparent -z-10" />
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Shipping and Delivery Policy
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
                            Service Delivery
                        </h2>
                        <div className="bg-yellow-50/50 p-6 rounded-3xl border border-yellow-100">
                            <p>
                                Urban Cabz provides transportation services. As such, we do not <span className="font-bold underline decoration-yellow-400 underline-offset-4">"ship"</span> physical products to your address. Our "delivery" constitutes the provision of the cab service to the pickup location specified by you at the time of booking.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-100 text-yellow-700 text-base font-bold">2</span>
                            Booking Confirmation
                        </h2>
                        <p className="mb-4">
                            Once a booking is made, you will receive a confirmation via SMS and/or Email containing the details of your ride, including:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {["Driver's Name & Photo", "Vehicle Number & Model", "Driver Contact Details", "Estimated Time of Arrival"].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    <span className="text-sm font-semibold">{item}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-gray-500 text-sm italic">
                            * This confirmation serves as the proof of delivery of your booking request.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-100 text-yellow-700 text-base font-bold">3</span>
                            Service Timelines
                        </h2>
                        <p className="relative pl-6 border-l-4 border-yellow-400 py-2">
                            We strive to ensure that our drivers arrive at the pickup location at the scheduled time. However, delays may occur due to traffic conditions, weather, or other unforeseen circumstances. We will do our best to keep you informed of any significant delays.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ShippingPolicy;

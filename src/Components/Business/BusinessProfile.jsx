import React from "react";
import {
    BuildingOfficeIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    IdentificationIcon,
    CalendarIcon
} from "@heroicons/react/24/outline";

export default function BusinessProfile({ company }) {
    if (!company) return null;

    const profileSections = [
        {
            title: "Company Information",
            items: [
                { label: "Company Name", value: company.company_name, icon: BuildingOfficeIcon },
                { label: "Phone", value: company.company_phone, icon: PhoneIcon },
                { label: "Email", value: company.company_email, icon: EnvelopeIcon },
                { label: "GST Number", value: company.gst_number || "Not Provided", icon: IdentificationIcon },
            ]
        },
        {
            title: "Location Details",
            items: [
                { label: "Address", value: company.address || "Not Provided", icon: MapPinIcon },
                { label: "City", value: company.city || "Not Provided", icon: MapPinIcon },
                { label: "State", value: company.state || "Not Provided", icon: MapPinIcon },
                { label: "Pincode", value: company.pincode || "Not Provided", icon: MapPinIcon },
            ]
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold">Company Profile</h2>
                <p className="text-gray-400">View your business account details and settings.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {profileSections.map((section, idx) => (
                    <div key={idx} className="bg-black border border-white/10 rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-white/10 bg-white/5">
                            <h3 className="font-bold text-lg">{section.title}</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            {section.items.map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                        <item.icon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">{item.label}</p>
                                        <p className="font-medium text-white">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-yellow-400 flex items-center justify-center shrink-0">
                    <CalendarIcon className="h-8 w-8 text-black" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="text-lg font-bold">Account created on</h4>
                    <p className="text-gray-400">
                        Your corporate account with Urban Cabz was initialized on
                        <span className="text-white font-medium ml-1">
                            {new Date(company.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </span>
                    </p>
                </div>
                <div className="px-6 py-2 rounded-xl bg-yellow-400 text-black font-bold text-sm">
                    Active Partner
                </div>
            </div>
        </div>
    );
}

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
        <div className="space-y-10">
            <div>
                <h2 className="text-2xl font-black tracking-tight text-white uppercase">Corporate Identity</h2>
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">View your business account details and settings.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {profileSections.map((section, idx) => (
                    <div key={idx} className="bg-neutral-950 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-white/5 bg-white/5">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">{section.title}</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            {section.items.map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                                        <item.icon className="h-5 w-5 text-zinc-400" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-1">{item.label}</p>
                                        <p className="text-sm font-bold text-white tracking-tight">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-violet-500/5 border border-violet-500/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-inner">
                <div className="h-16 w-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 shadow-lg">
                    <CalendarIcon className="h-8 w-8 text-violet-400" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Account Genesis</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed uppercase tracking-tighter">
                        Your corporate account with Urban Cabz was initialized on
                        <span className="text-violet-400 font-black ml-2">
                            {new Date(company.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </span>
                    </p>
                </div>
                <div className="px-8 py-3 rounded-2xl bg-violet-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-violet-600/20">
                    Active Partner
                </div>
            </div>
        </div>
    );
}

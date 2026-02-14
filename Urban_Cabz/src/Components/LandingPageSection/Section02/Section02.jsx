import React from "react";
import WhyChooseUs from "./WhyChooseUs";
import Services from "./Services";
import { ShieldCheck, Clock, CarFront, Users } from "lucide-react";

export default function Section02() {
  const features = [
    {
      icon: <ShieldCheck className="w-10 h-10 text-yellow-500" />,
      title: "Safe & Secure Rides",
      desc: "Our verified and trained drivers ensure every ride is safe, comfortable, and stress-free.",
    },
    {
      icon: <Clock className="w-10 h-10 text-yellow-500" />,
      title: "Always On Time",
      desc: "Your time matters. We’re committed to punctual pickups and on-time arrivals.",
    },
    {
      icon: <CarFront className="w-10 h-10 text-yellow-500" />,
      title: "Comfort Guaranteed",
      desc: "Clean interiors, smooth rides, and modern vehicles for your perfect journey.",
    },
    {
      icon: <Users className="w-10 h-10 text-yellow-500" />,
      title: "Trusted by Thousands",
      desc: "Join thousands of satisfied customers who rely on us every single day.",
    },
  ];

  const services = [
    {
      image:
        "https://images.unsplash.com/photo-1583150647472-d239652a12f5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=627",
      title: "Airport Transfers",
      description:
        "Seamless pickup and drop services to all major airports with professional drivers.",
    },
    {
      image:
        "https://plus.unsplash.com/premium_photo-1661919589683-f11880119fb7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
      title: "Outstation Rides",
      description:
        "Comfortable one-way and round-trip rides to your favorite destinations.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1583665190278-9eea4e170802?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735",
      title: "Local City Travel",
      description:
        "Quick, safe, and affordable taxi rides within your city — anytime, anywhere.",
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 transition-colors duration-300">
      <div className="pt-5 md:pt-0"> {/* Small top spacing from hero */}
        <WhyChooseUs
          title="Why Choose"
          subtitle="Experience unmatched comfort, reliability, and safety with every ride."
          features={features}
        />
      </div>

      <div className="mt-8 md:mt-0"> {/* Controlled spacing between sections */}
        <Services services={services} />
      </div>
    </div>
  );
}

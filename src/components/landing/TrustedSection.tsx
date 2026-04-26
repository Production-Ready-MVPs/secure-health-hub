import React from "react";
import Marquee from "@/components/ui/marquee";
import { Activity, ShieldPlus, HeartPulse, Database, Cloud, Stethoscope } from "lucide-react";

const logos = [
  { name: "HealthGrid", icon: Activity },
  { name: "SecureMed", icon: ShieldPlus },
  { name: "BioConnect", icon: HeartPulse },
  { name: "PulseData", icon: Database },
  { name: "CloudClinic", icon: Cloud },
  { name: "EtherHealth", icon: Stethoscope },
];

export const TrustedSection = () => {
  return (
    <section className="relative w-full bg-white py-10 pb-16 z-10 flex flex-col items-center">
      
      {/* 1. Logo Marquee - Downsized */}
      <div className="w-full mb-12 flex flex-col items-center overflow-hidden">
        <div className="relative flex h-[60px] w-full max-w-4xl flex-col items-center justify-center overflow-hidden">
          <Marquee pauseOnHover className="[--duration:40s] flex items-center">
            {logos.map((logo, idx) => {
              const Icon = logo.icon;
              return (
                <div 
                  key={idx} 
                  className="mx-10 flex items-center gap-2 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                >
                  <Icon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm md:text-base font-semibold tracking-tight text-slate-800 uppercase">
                    {logo.name}
                  </span>
                </div>
              );
            })}
          </Marquee>
          
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white to-transparent"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white to-transparent"></div>
        </div>
      </div>

      {/* 2. Collaboration CTA Banner - Downsized */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 w-full flex justify-center">
        <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden flex flex-col md:flex-row items-center h-auto md:h-[120px]">
          
          {/* Left Side: Graphic Art (Smaller) */}
          <div className="relative w-full md:w-[20%] h-24 md:h-full overflow-hidden bg-blue-50/50 flex-shrink-0">
            <div className="absolute inset-0 flex items-center justify-center transform scale-[1.1]">
               <div className="absolute w-[60%] aspect-square bg-blue-200/40 rounded-sm rotate-45 transform" />
               <div className="absolute w-[60%] aspect-square bg-blue-300/40 rounded-sm rotate-45 transform translate-y-4" />
            </div>
          </div>

          {/* Center Side: Text Content (Downsized) */}
          <div className="flex-1 flex flex-col justify-center p-6 md:pl-8">
            <h3 className="text-lg font-semibold tracking-tight text-[#0F172A] mb-1">
              Enhanced Collaboration
            </h3>
            <p className="text-xs md:text-sm font-medium text-slate-500 leading-relaxed">
              Our system makes it easy for healthcare professionals to share and collaborate on patient care.
            </p>
          </div>

          {/* Right Side: Button (Smaller) */}
          <div className="w-full md:w-auto px-6 md:px-10 flex items-center justify-center p-4">
            <button className="w-full md:w-auto bg-[#2563EB] hover:bg-blue-700 text-white rounded-full px-6 py-2.5 font-semibold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all">
              Try It Now
            </button>
          </div>

        </div>
      </div>
      
    </section>
  );
};

export default TrustedSection;

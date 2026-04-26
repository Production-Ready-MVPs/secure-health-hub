import React from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";

export const AppShowcase = () => {
  return (
    <section className="relative w-full bg-white py-12 md:py-16 z-10 flex justify-center overflow-hidden">
      
      {/* Master Container */}
      <div className="container px-4 md:px-6 max-w-7xl">
        <div className="relative w-full bg-[#111111] rounded-[2.5rem] p-8 md:p-12 lg:p-14 overflow-hidden flex flex-col lg:flex-row items-center justify-between shadow-xl">
          
          {/* Left Column: Content Block */}
          <div className="w-full lg:w-[55%] flex flex-col items-start justify-center z-10 relative lg:pr-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-white mb-6 leading-[1.15]">
              Get your health <br className="hidden md:block"/>
              journey started <br className="hidden md:block"/>
              today!
            </h2>
            
            <p className="text-sm md:text-base text-slate-400 font-normal leading-relaxed mb-8 max-w-[450px]">
              As a token of our appreciation, we're delighted to offer you a FREE consultation with one of our experienced healthcare professionals. Claim your card now to enjoy these incredible benefits.
            </p>
            
            <div className="flex flex-col gap-4 mb-10">
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-white flex-shrink-0" strokeWidth={3} />
                <span className="text-white text-sm md:text-base font-medium tracking-tight">
                  FREE Consultation with a Healthcare Expert
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-white flex-shrink-0" strokeWidth={3} />
                <span className="text-white text-sm md:text-base font-medium tracking-tight">
                  Exclusive PRICE OFF on Our Services
                </span>
              </div>
            </div>

            <div>
              <button 
                onClick={() => toast.info("Opening SECURE HEALTH HUB Advantage Portal...", { description: "Redirecting to comprehensive features list." })}
                className="bg-[#2563EB] hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-semibold text-sm transition-all active:scale-95 shadow-lg shadow-blue-500/20"
              >
                More Advantages
              </button>
            </div>
          </div>

          {/* Right Column: Vertical Image & Card Stack */}
          <div className="w-full lg:w-[45%] flex flex-col items-center lg:items-end mt-12 lg:mt-0 gap-6">
            
            {/* 1. Doctor Image */}
            <div className="w-full max-w-[360px] h-[300px] md:h-[400px] rounded-[2rem] overflow-hidden shadow-2xl">
               <img 
                 src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&q=80" 
                 alt="Healthcare Professional" 
                 className="w-full h-full object-cover object-top"
               />
            </div>

            {/* 2. White Content Card Below */}
            <div className="w-full max-w-[360px] bg-white rounded-[2rem] shadow-2xl p-6 md:p-8 flex flex-col items-center text-center">
                <h4 className="text-2xl md:text-3xl font-semibold text-[#0F172A] leading-[1.2] mb-4 uppercase tracking-tighter">
                  Real-time clinical<br />patient portal
                </h4>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed mb-6 font-medium">
                  SECURE HEALTH HUB's interoperable portal is designed for seamless clinical communication and instantaneous record access.
                </p>
               
               {/* Pagination Dots */}
               <div className="flex gap-2 justify-center">
                  <span className="w-2 h-2 rounded-full bg-blue-100"></span>
                  <span className="w-2 h-2 rounded-full bg-blue-100"></span>
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
               </div>
            </div>

          </div>
          
        </div>
      </div>
    </section>
  );
};

export default AppShowcase;

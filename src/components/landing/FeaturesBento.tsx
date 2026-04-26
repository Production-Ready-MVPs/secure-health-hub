import React from "react";
import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";

export const FeaturesBento = () => {
  return (
    <section className="w-full bg-white pb-6 pt-8">
      {/* Compact width container */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        
        {/* Strictly 3 equal columns, fixed to lower height */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:h-[220px]">
          
          {/* Card 1: The Metric */}
          <div className="bg-[#2563EB] rounded-2xl p-5 flex flex-col justify-between text-white shadow-md">
            <div>
              <p className="text-[13px] font-semibold text-white/90 mb-1 leading-none uppercase tracking-widest">
                Data Accuracy
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-semibold tracking-tighter text-white">99.9</span>
                <span className="text-3xl font-semibold">%</span>
              </div>
              <p className="text-[13px] font-semibold text-white/90 leading-none uppercase tracking-widest mt-1">
                Verified Records
              </p>
            </div>
            
            <div className="mt-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-full font-semibold text-[11px] hover:bg-slate-50 transition-colors w-fit uppercase">
                Services <MoveRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 2: The Visual */}
          <div className="rounded-2xl overflow-hidden shadow-sm relative border border-slate-100 h-[200px] md:h-auto">
            <img 
              src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop" 
              alt="Medical Consultation" 
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>

          {/* Card 3: The Service */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col justify-between shadow-sm">
            <div className="text-left">
              <h3 className="text-lg font-semibold text-[#0F172A] leading-tight mb-1 tracking-tight uppercase">
                Clinical Analytics
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-snug">
                Advanced data processing with end-to-end HIPAA compliant encryption.
              </p>
            </div>

            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-fit rounded-full px-5 py-2 h-auto border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold text-[11px] uppercase tracking-wider"
              >
                Contact Us
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesBento;

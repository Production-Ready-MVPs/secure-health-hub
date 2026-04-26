import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const DoctorsHero = () => {
  return (
    <section className="relative w-full pt-4 pb-12 px-6 md:px-12 lg:px-16 bg-white overflow-hidden mt-[90px]">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full min-h-[400px] lg:min-h-[440px] rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-500/10 flex flex-col lg:flex-row"
        >
          {/* Left Column: Blue Content Panel */}
          <div className="w-full lg:w-[55%] bg-[#2563EB] p-10 md:p-12 lg:p-14 flex flex-col justify-center items-start text-left">
            <h1 className="text-5xl md:text-6xl lg:text-[68px] font-bold tracking-tight text-white leading-[1.0] mb-8">
              Our Doctors
            </h1>
            
            <p className="text-lg md:text-xl text-blue-50 font-medium leading-relaxed mb-10 max-w-lg">
              At SECURE HEALTH HUB, our dedicated team of skilled medical professionals delivers exceptional healthcare with expertise and compassion.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Button 
                onClick={() => toast.info("Opening SECURE HEALTH HUB Staff Directory...", { description: "Loading provider schedule." })}
                className="w-full sm:w-[200px] bg-white hover:bg-slate-50 text-[#2563EB] rounded-full px-8 py-7 text-base font-semibold transition-all active:scale-95 shadow-md border-2 border-white"
              >
                View Schedule
              </Button>
              
              <Link to="/login" className="w-full sm:w-auto outline-none ring-0">
                <Button 
                  variant="outline"
                  className="w-full sm:w-[220px] bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-full px-8 py-7 text-base font-semibold transition-all active:scale-95"
                >
                  Book An Appointment
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Image Panel */}
          <div className="w-full lg:w-[45%] relative h-[400px] lg:h-auto overflow-hidden bg-white">
            <img 
              src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop" 
              alt="SECURE HEALTH HUB Medical Team" 
              className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-all duration-700"
            />
          </div>

          {/* Optional 'Made with' badge simulation matching the Ref Image */}
          <div className="absolute bottom-8 right-8 hidden md:block">
            <div className="bg-white/95 backdrop-blur-sm border border-slate-200 px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Medical Excellence</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DoctorsHero;

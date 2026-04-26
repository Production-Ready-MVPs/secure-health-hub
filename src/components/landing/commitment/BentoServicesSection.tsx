import React, { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CanvasVoxelGrid } from "@/components/ui/CanvasVoxelGrid";
import { CanvasVoxelWave } from "@/components/ui/CanvasVoxelWave";

const BentoServicesSectionComponent = () => {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 relative max-w-7xl mx-auto px-6">
      {/* Card 1: Virtual Consultations */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="group flex flex-col p-10 md:p-16 bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-[0_40px_80px_-15px_rgba(37,99,235,0.08)] transition-all duration-700 overflow-hidden relative min-h-[750px]"
      >
        <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 w-full h-[350px] opacity-80 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <CanvasVoxelGrid />
        </div>

        <div className="z-20 relative flex flex-col gap-6 text-left pointer-events-none">
          <h3 className="text-3xl md:text-4xl lg:text-4xl font-semibold tracking-tight text-[#0F172A] leading-[1.15] max-w-[450px]">
             Enjoy convenient virtual consultations
          </h3>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-[400px] leading-relaxed">
            Our secure, user-friendly platform connects you with qualified SECURE HEALTH HUB clinical partners.
          </p>
        </div>

        <div className="mt-auto z-30 relative text-left">
          <Link to="/login">
            <Button className="w-full bg-[#1A4BFF] hover:bg-blue-700 text-white rounded-full py-8 text-lg font-semibold shadow-xl shadow-blue-500/10 active:scale-95 transition-all">
              Learn More
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Card 2: Mental Health */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="group flex flex-col p-10 md:p-16 bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-[0_40px_80px_-15px_rgba(37,99,235,0.08)] transition-all duration-700 overflow-hidden relative min-h-[750px]"
      >
        <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 w-full h-[350px] opacity-60 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <CanvasVoxelWave />
        </div>

        <div className="z-20 relative flex flex-col gap-6 text-left pointer-events-none">
          <h3 className="text-3xl md:text-4xl lg:text-4xl font-semibold tracking-tight text-[#0F172A] leading-[1.15] max-w-[450px]">
             Mental health and counseling
          </h3>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-[400px] leading-relaxed">
             Our specialists provide counseling and emotional support tailored to your unique SECURE HEALTH HUB journey.
          </p>
        </div>

        <div className="mt-auto z-30 relative text-left">
          <Link to="/login">
            <Button className="w-full bg-[#1A4BFF] hover:bg-blue-700 text-white rounded-full py-8 text-lg font-semibold shadow-xl shadow-blue-500/10 active:scale-95 transition-all">
              Learn More
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export const BentoServicesSection = memo(BentoServicesSectionComponent);
BentoServicesSection.displayName = "BentoServicesSection";

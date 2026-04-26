import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "./Navbar";
import { DNAHelix } from "@/components/ui/DNAHelix";

const AbstractWave = ({ className, delay = 0, reverse = false }: { className?: string; delay?: number; reverse?: boolean }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ y: [-15, 15, -15] }}
    transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
    className={className}
  >
    {/* Abstract 3D Wave SVG Placeholder */}
    <svg 
      viewBox="0 0 400 300" 
      className={`w-full h-auto opacity-80 ${reverse ? 'scale-x-[-1]' : ''}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(50, 80)">
        {Array.from({ length: 12 }).map((_, x) => 
          Array.from({ length: 8 }).map((_, y) => {
            const distortion = Math.sin(x * 0.4 + y * 0.3) * 15 + Math.cos(x * 0.2) * 10;
            const h = 60 + distortion;
            const posX = x * 25 - y * 15;
            const posY = y * 18 + x * 8;
            
            return (
              <g key={`${x}-${y}`} transform={`translate(${posX}, ${posY})`}>
                <path d={`M -10 0 L 10 0 L 10 ${h} L -10 ${h} Z`} fill={x % 2 === 0 ? "#BFDBFE" : "#93C5FD"} opacity={0.9} />
                <ellipse cx="0" cy="0" rx="10" ry="5" fill="#DBEAFE" />
                <ellipse cx="0" cy={h} rx="10" ry="5" fill="#60A5FA" opacity={0.5} />
              </g>
            );
          })
        )}
      </g>
    </svg>
  </motion.div>
);

export const MedHero = () => {
  return (
    <section className="relative w-full bg-white flex flex-col font-sans overflow-hidden min-h-screen">
      
      <Navbar />


      {/* Hero Content */}
      <div className="relative flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-[120px] lg:pt-[140px] pb-20 flex flex-col items-center text-center z-10 min-h-[90vh]">
        
        {/* 3D Helix Graphic (internal) */}
        <div className="absolute right-[-10%] top-[15%] w-[30%] h-full pointer-events-none opacity-20 hidden lg:block">
          <DNAHelix className="w-full" />
        </div>

        {/* 3D Wave Side Graphics Placements matched from image_63.png */}
        <div className="absolute inset-0 pointer-events-none flex justify-between items-center z-0 px-0 lg:-mx-10 opacity-80 hidden md:flex xl:-mx-20 top-10">
          <AbstractWave className="w-[35%] max-w-[450px] -translate-x-[20%]" delay={0} />
          <AbstractWave className="w-[35%] max-w-[450px] translate-x-[20%]" delay={1.5} reverse />
        </div>

        {/* Text Box styled exactly as requested */}
        <div className="relative z-20 flex flex-col items-center w-full">
          <h1 className="text-5xl lg:text-6xl font-semibold tracking-tight text-[#0F172A] leading-[1.1] max-w-[950px] mx-auto flex flex-col items-center justify-center uppercase">
            The intelligent foundation for clinical data
          </h1>
          
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-slate-600 mt-8 leading-relaxed font-medium">
            Next-generation EHR system designed for secure, interoperable, and real-time patient record management across global healthcare networks.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 w-full sm:w-auto">
            {/* Button 1 (Left) Deep Blue */}
            <Link to="/about">
              <Button className="w-full sm:w-[220px] bg-[#2563EB] hover:bg-blue-700 text-white rounded-full px-10 py-6 text-[15px] font-semibold shadow-md border-2 border-transparent">
                About Us
              </Button>
            </Link>
            {/* Button 2 (Right) Outline white background */}
            <Link to="/login" className="w-full sm:w-auto">
              <Button 
                onClick={() => toast.success("Opening SECURE HEALTH HUB Appointment System...", { description: "Redirecting to portal." })}
                variant="outline" 
                className="w-full sm:w-[220px] bg-white text-[#2563EB] hover:bg-slate-50 border-2 border-[#2563EB] rounded-full px-10 py-6 text-[15px] font-semibold shadow-sm"
              >
                Book An Appointment
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MedHero;

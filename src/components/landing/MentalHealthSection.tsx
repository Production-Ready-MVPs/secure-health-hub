import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from "sonner";

export const MentalHealthSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-white py-12 lg:py-16">
      <div className="container px-6 max-w-7xl mx-auto flex flex-col items-center lg:flex-row gap-16">
         
         {/* Left Column: Voxel Wave Visual (MATCHES REFERENCE SS) */}
         <div className="w-full lg:w-1/2 flex justify-center items-center relative aspect-video lg:aspect-square max-w-[600px]">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full relative"
            >
              {/* 
                 Voxel Wave Illustration
                 Using a grid of stylized isometric cylinders to mimic the wavy 3D structure 
                 from the screenshot.
              */}
              <svg 
                viewBox="0 0 800 600" 
                className="w-full h-auto drop-shadow-xl"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g transform="translate(100, 150)">
                  {/* Generating a grid of voxel cylinders with 
                      height offsets based on a wave function */}
                  {Array.from({ length: 12 }).map((_, x) => 
                    Array.from({ length: 10 }).map((_, y) => {
                      // Calculate height based on a "wavy" pattern
                      const distortion = Math.sin(x * 0.4 + y * 0.3) * 30 + Math.cos(x * 0.2) * 20;
                      const h = 80 + distortion;
                      const posX = x * 45 - y * 15;
                      const posY = y * 25 + x * 10;
                      
                      return (
                        <motion.g 
                          key={`${x}-${y}`} 
                          transform={`translate(${posX}, ${posY})`}
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ delay: (x + y) * 0.01 }}
                        >
                          {/* Cylinder Body (Left/Right Planes) */}
                          <path 
                            d={`M -15 0 L 15 0 L 15 ${h} L -15 ${h} Z`} 
                            fill={x % 2 === 0 ? "#F1F5F9" : "#E2E8F0"} 
                          />
                          {/* Top Cap (Ellipse) */}
                          <ellipse cx="0" cy="0" rx="15" ry="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5" />
                          {/* Subtle shade for the wavy look */}
                          <ellipse cx="0" cy={h} rx="15" ry="8" fill="#CBD5E1" opacity="0.3" />
                        </motion.g>
                      );
                    })
                  )}
                </g>
              </svg>

              {/* Decorative radial glow to match the clean aesthetic */}
              <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
            </motion.div>
         </div>

         {/* Right Column: Content */}
         <div className="w-full lg:w-1/2 flex flex-col items-start justify-center text-left">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-[#0F172A] mb-6 leading-tight max-w-[500px]">
              Mental health and counseling
            </h2>
            
            <p className="text-sm md:text-base text-slate-500 mb-10 max-w-xl leading-relaxed font-medium">
              Your emotional well-being is crucial to your overall health. Our mental health specialists offer counseling and support for
            </p>
            
            <Button 
              onClick={() => toast.info("Opening SECURE HEALTH HUB Counseling Center...", { description: "Establishing secure session..." })}
              className="bg-[#2563EB] hover:bg-blue-700 text-white px-10 py-5 h-auto rounded-full font-semibold text-base shadow-lg shadow-blue-500/10"
            >
              Learn More
            </Button>
         </div>

      </div>
    </section>
  );
};

export default MentalHealthSection;

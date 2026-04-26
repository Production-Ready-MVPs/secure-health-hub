import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from "sonner";

const VoxelWave = ({ className, delay = 0, rotate = 0 }: { className?: string; delay?: number; rotate?: number }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.8, rotate: rotate - 10 }}
    animate={{ opacity: 1, scale: 1, rotate }}
    transition={{ duration: 1.2, delay, ease: "easeOut" }}
    className={className}
  >
    <svg 
      viewBox="0 0 500 400" 
      className="w-full h-auto drop-shadow-[0_20px_50px_rgba(37,99,235,0.15)] opacity-60 transition-opacity hover:opacity-80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(50, 80)">
        {Array.from({ length: 14 }).map((_, x) => 
          Array.from({ length: 12 }).map((_, y) => {
            // More fluid wave function matching the reference
            const dist = Math.sqrt(x * x + y * y);
            const distortion = Math.sin(x * 0.4 + y * 0.3 + dist * 0.2) * 25 + Math.cos(x * 0.2) * 15;
            const h = 70 + distortion;
            const posX = x * 35 - y * 18;
            const posY = y * 22 + x * 10;
            
            return (
              <motion.g 
                key={`${x}-${y}`} 
                transform={`translate(${posX}, ${posY})`}
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: (x + y) * 0.05, ease: "easeInOut" }}
              >
                {/* Cylinder/Voxel body */}
                <path 
                  d={`M -15 0 L 15 0 L 15 ${h} L -15 ${h} Z`} 
                  fill={x % 2 === 0 ? "#F1F5F9" : "#E2E8F0"} 
                  opacity={0.9}
                />
                {/* Top cap - matches the reference's white-ish gloss */}
                <ellipse cx="0" cy="0" rx="15" ry="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.5" />
                {/* Bottom shadow for the 3D depth */}
                <ellipse cx="0" cy={h} rx="15" ry="8" fill="#94A3B8" opacity="0.2" />
              </motion.g>
            );
          })
        )}
      </g>
    </svg>
  </motion.div>
);

const AmbientBackground = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Large Soft Blobs for the 'Alive' feel requested */}
    <motion.div 
      animate={{ 
        x: [0, 50, 0], 
        y: [0, -30, 0],
        scale: [1, 1.1, 1]
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-blue-50/20 blur-[100px] rounded-full"
    />
    <motion.div 
      animate={{ 
        x: [0, -40, 0], 
        y: [0, 60, 0],
        scale: [1, 1.05, 1]
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-indigo-50/30 blur-[100px] rounded-full"
    />
    {/* Clean texture overlay */}
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-overlay" />
  </div>
);

export const Hero = () => {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-white pt-24 pb-16">
      
      {/* Dynamic Ambient Background */}
      <AmbientBackground />

      {/* Side Visuals (Matched to 2nd screenshot's scale and fluid shapes) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <VoxelWave 
          className="absolute left-[-8%] top-[20%] w-[45%] hidden xl:block mix-blend-multiply" 
          delay={0.2} 
          rotate={5}
        />
        <VoxelWave 
          className="absolute right-[-8%] bottom-[10%] w-[45%] hidden xl:block rotate-[15deg] mix-blend-multiply" 
          delay={0.4} 
        />
      </div>

      <div className="container relative z-30 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[44px] md:text-[64px] lg:text-[78px] font-semibold leading-[1.05] tracking-tight text-[#0F172A] mb-8 max-w-[1050px]"
        >
          Secure your health with <span className="text-blue-600">intelligence</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base md:text-xl text-slate-500 mb-12 max-w-3xl leading-relaxed font-medium px-4"
        >
          A unified gateway to manage clinical data, access top-tier medical experts, <br className="hidden md:block" />
          and secure your wellbeing with data-driven insights.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6"
        >
          <Button 
            onClick={() => toast.info("Exploring SECURE HEALTH HUB Platform...", { description: "Redirecting to features section." })}
            className="bg-[#2563EB] hover:bg-blue-700 text-white px-10 py-4 h-auto rounded-full font-bold text-base shadow-[0_20px_40px_rgba(37,99,235,0.2)] transition-all active:scale-95"
          >
           Explore Platform
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.hash = "features"}
            className="border-2 border-slate-200 text-[#0F172A] hover:border-blue-600 hover:text-blue-600 px-10 py-4 h-auto rounded-full font-bold text-base transition-all active:scale-95"
          >
            Learn More
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

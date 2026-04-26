import React from "react";
import { motion } from "framer-motion";
import { MedicalInterface } from "@/components/ui/MedicalInterface";
import NumberTicker from "@/components/ui/number-ticker";

export const AboutHero = () => {
  const avatars = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
  ];

  return (
    <section className="relative w-full bg-white pt-14 md:pt-16 lg:pt-20 pb-20 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 container">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Left Content Column */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-start text-left z-10"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-[#0F172A] leading-[1.05] mb-8">
              Unifying the patient <br className="hidden md:block" /> data lifecycle
            </h1>

            <p className="text-lg md:text-xl text-slate-500 max-w-lg leading-relaxed mb-12 font-medium">
              Empowering clinicians with instantaneous access to longitudinal patient records and advanced clinical analytics.
            </p>

            {/* Social Proof Section */}
            <div className="flex flex-col items-start gap-3">
              <div className="flex items-center -space-x-4 mb-1">
                {avatars.map((url, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5, scale: 1.1, zIndex: 50 }}
                    className="w-14 h-14 rounded-full border-4 border-white overflow-hidden shadow-sm"
                  >
                    <img src={url} alt="User avatar" className="w-full h-full object-cover" />
                  </motion.div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-semibold text-[#0F172A]">
                    <NumberTicker value={64739} className="text-inherit" />
                  </span>
                </div>
                <p className="text-[15px] font-medium text-slate-500 tracking-wide">
                  Happy Customers
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Interface Column */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative w-full min-h-[600px] flex items-center justify-center pt-10 lg:pt-0"
          >
            <MedicalInterface />
          </motion.div>

        </div>
      </div>

    </section>
  );
};

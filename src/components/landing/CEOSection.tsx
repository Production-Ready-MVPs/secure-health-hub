import React from 'react';
import { motion } from 'framer-motion';

export const CEOSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[#2563EB] py-16 md:py-20">
      
      {/* Background World Map Pattern (Stylized Grid) */}
      <div className="absolute inset-0 opacity-10">
         <div className="absolute inset-0 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:24px_24px]" />
      </div>

      <div className="container px-6 max-w-6xl mx-auto relative z-10 flex flex-col items-start">
        
        {/* The Quote Block */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full flex flex-col items-start"
        >
          <blockquote className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white leading-[1.3] mb-12 tracking-tight">
            "In my role as CEO, my vision goes beyond merely leading a company; it is about cultivating a collective spirit that fuels innovation, fosters growth, and creates a positive impact. Together, we view challenges as opportunities for growth, failures as stepping stones towards improvement, and successes as significant milestones on our journey towards achieving greatness."
          </blockquote>

          {/* CEO Bio */}
          <div className="flex items-center gap-5">
             <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80" 
                  alt="Ronald Richards" 
                  className="w-full h-full object-cover"
                />
             </div>
             <div className="flex flex-col">
                <h4 className="text-xl font-semibold text-white tracking-tight">
                  Ronald Richards
                </h4>
                <p className="text-white/70 text-sm font-medium">
                  CEO of SECURE HEALTH HUB
                </p>
             </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default CEOSection;

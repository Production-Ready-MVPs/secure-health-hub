import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export const TestimonialsSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[#111111] py-16 md:py-24">
      <div className="container px-6 max-w-6xl mx-auto flex flex-col items-start relative z-10">
        
        {/* Label */}
        <span className="text-white text-sm font-semibold tracking-widest uppercase mb-10 opacity-80">
          Testimonials
        </span>

        <div className="w-full flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-20">
          
          {/* Left Column: Author */}
          <div className="flex flex-col items-center lg:items-start flex-shrink-0">
             <div className="w-[180px] h-[180px] rounded-[2.5rem] overflow-hidden shadow-2xl mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400&q=80" 
                  alt="Michael Turner" 
                  className="w-full h-full object-cover"
                />
             </div>
             <h4 className="text-2xl font-semibold text-white mb-2">Michael Turner</h4>
             <div className="flex gap-1 text-[#FACC15]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-current" />
                ))}
             </div>
          </div>

          {/* Right Column: Quote */}
          <div className="flex flex-col items-center lg:items-start">
             <blockquote className="text-lg md:text-xl lg:text-2xl font-semibold text-white leading-relaxed mb-10 text-center lg:text-left tracking-tight">
               "As a patient managing a chronic condition, I am incredibly grateful for the personalized care I receive from SECURE HEALTH HUB's team of specialists. With their support, I have been able to better manage my condition and improve my quality of life. I wholeheartedly recommend SECURE HEALTH HUB to anyone seeking compassionate and expert care for chronic health issues."
             </blockquote>

             {/* Pagination Dots */}
             <div className="flex gap-2.5 justify-center lg:justify-start">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-100"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-100/30"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-100/30"></span>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

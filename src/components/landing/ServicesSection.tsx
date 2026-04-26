import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export const ServicesSection = () => {
  const services = [
    {
      title: "Electronic Records",
      description: "Centralize patient data with longitudinal record management and real-time clinical documentation for optimized workflows.",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000",
    },
    {
      title: "Clinical Support",
      description: "Advanced analytics and predictive modeling to assist clinicians in providing evidence-based care and improved outcomes.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000",
    },
    {
      title: "Revenue Mgmt",
      description: "Automated billing, coding compliance, and financial analytics for optimized practice revenue and administrative efficiency.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000",
    }
  ];

  return (
    <section id="services" className="w-full bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Area - Hybrid Approach: Approachable but Professional */}
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <span className="text-blue-600 font-semibold text-sm mb-2 uppercase tracking-widest">Platform Suite</span>
          <h2 className="text-3xl md:text-5xl font-bold text-[#0F172A] tracking-tight uppercase leading-tight">
            How we empower your clinic
          </h2>
        </div>

        {/* 3-Column Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {services.map((service, index) => {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-slate-50 border border-slate-100 rounded-[2rem] overflow-hidden flex flex-col hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group"
              >
                {/* Card Image */}
                <div className="h-[220px] w-full overflow-hidden">
                   <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                   />
                </div>

                {/* Card Content */}
                <div className="p-8 flex flex-col items-start text-left flex-1">
                  <h3 className="text-xl font-semibold text-[#0F172A] mb-4">
                    {service.title}
                  </h3>
                  
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-6 font-medium">
                    {service.description}
                  </p>
                  
                  <Link 
                    to="/services" 
                    className="mt-auto inline-flex items-center gap-1.5 text-blue-600 font-semibold text-sm tracking-tight group/link"
                  >
                    Learn More 
                    <ArrowUpRight className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Button - Centered */}
        <div className="flex justify-center">
          <Link to="/login">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#5C7CFA] hover:bg-[#4C6EF5] text-white px-10 py-4 rounded-[1.2rem] font-semibold text-base transition-all shadow-lg shadow-indigo-500/10"
            >
              All Services
            </motion.button>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default ServicesSection;

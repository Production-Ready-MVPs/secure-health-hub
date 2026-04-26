import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Star, Smile, Users } from "lucide-react";
import { motion } from "framer-motion";

export const ExperienceSection = () => {
  const features = [
    {
      title: "99.99% Uptime SLA",
      description: "Enterprise-grade infrastructure ensuring your clinical data is accessible whenever and wherever care is delivered.",
      icon: Star,
    },
    {
      title: "HIPAA & SOC2 Validated",
      description: "Our system exceeds global regulatory standards for data security, patient privacy, and clinical audit trails.",
      icon: Smile,
    },
    {
      title: "Seamless Interoperability",
      description: "Integrate with existing labs, pharmacies, and imaging systems via our high-speed FHIR and HL7 APIs.",
      icon: Users,
    }
  ];

  const listContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: "easeOut" } 
    }
  };

  return (
    <section className="w-full bg-white py-12 md:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Heading & Stats */}
          <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight text-[#0F172A] leading-tight mb-5 uppercase">
              The foundations of our clinical infrastructure
            </h2>
            
            <p className="text-sm md:text-base text-slate-500 mb-8 max-w-[450px] leading-relaxed font-medium">
              At SECURE HEALTH HUB, we provide the secure, scalable environment required for mission-critical health data.
            </p>

            {/* Stats Row */}
            <div className="flex flex-row gap-10 sm:gap-14 mb-8">
              <div className="flex flex-col">
                <h3 className="text-4xl md:text-5xl font-semibold tracking-tighter text-blue-600 mb-1">
                  99.9%
                </h3>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  System Uptime
                </p>
              </div>
              
              <div className="flex flex-col">
                <h3 className="text-4xl md:text-5xl font-semibold tracking-tighter text-blue-700/90 mb-1">
                  10M+
                </h3>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Records Secured
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex items-center">
              <Link to="/about">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-4 h-auto text-sm font-semibold transition-all active:scale-95"
                >
                  About Us
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Feature List Card */}
          <motion.div 
            variants={listContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="bg-slate-50 rounded-[2rem] p-6 md:p-10 border border-slate-100 flex flex-col gap-6 md:gap-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  variants={itemVariant}
                  key={index} 
                  className="flex flex-row items-start gap-5"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex-shrink-0 flex items-center justify-center shadow-sm">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>

                  <div className="flex flex-col">
                    <h4 className="text-lg md:text-xl font-semibold text-[#0F172A] mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;

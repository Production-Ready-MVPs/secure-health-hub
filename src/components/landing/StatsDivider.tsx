import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Database, Award } from "lucide-react";

export const StatsDivider = () => {
  const stats = [
    {
      icon: ShieldCheck,
      value: "99.99%",
      label: "SYSTEM UPTIME",
      subLabel: "Global Infrastructure"
    },
    {
      icon: Database,
      value: "HL7 / FHIR",
      label: "INTEROPERABILITY",
      subLabel: "Standard Compliant"
    },
    {
      icon: Award,
      value: "SOC2 Type II",
      label: "DATA SECURITY",
      subLabel: "ISO 27001 Certified"
    }
  ];

  return (
    <section className="relative w-full bg-white py-20 overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,white_70%)]" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                whileHover={{ y: -5 }}
                className={`flex flex-col items-center text-center px-12 py-10 group relative ${
                  index !== 2 ? "md:border-r border-slate-100" : ""
                }`}
              >
                {/* Icon Enclosure */}
                <div className="mb-8 relative">
                  <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-200/60 flex items-center justify-center relative z-10 group-hover:border-blue-200 group-hover:shadow-blue-500/10 transition-all duration-500">
                    <Icon className="w-7 h-7 text-[#2563EB] group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>

                {/* Typography Stack */}
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2563EB]/80 mb-2">
                    {stat.label}
                  </span>
                  <span className="text-4xl lg:text-5xl font-bold tracking-tighter text-[#0F172A] mb-3 tabular-nums">
                    {stat.value}
                  </span>
                  <p className="text-sm font-medium text-slate-500 max-w-[200px] leading-relaxed">
                    {stat.subLabel}
                  </p>
                </div>

                {/* Subtle Bottom Accent */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-blue-500 group-hover:w-16 transition-all duration-500 ease-out" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsDivider;

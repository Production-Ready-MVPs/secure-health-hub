import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Database, ShieldCheck, Activity, FileText, Loader2 } from "lucide-react";

const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -5 }}
    className={`bg-white/40 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-2xl ${className}`}
  >
    {children}
  </motion.div>
);

export const MedicalInterface = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const dates = [
    { day: "MON", date: 9 },
    { day: "TUE", date: 10 },
    { day: "WED", date: 11, active: true },
    { day: "THU", date: 12 },
    { day: "FRI", date: 13 },
    { day: "SAT", date: 14 },
    { day: "SUN", date: 15 },
  ];

  const medicalIcons = [
    { id: "records", icon: Database, color: "text-blue-500", bg: "bg-blue-50", label: "Records" },
    { id: "security", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-100", label: "Secure" },
    { id: "vitals", icon: Activity, color: "text-blue-500", bg: "bg-blue-50", label: "Vitals" },
    { id: "reports", icon: FileText, color: "text-blue-600", bg: "bg-blue-100", label: "Forms" },
  ];

  // Mock searching effect
  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 800);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center">
      
      {/* Main Doctor Image Container */}
      <div className="relative w-full aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/20">
        <img 
          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1000&auto=format&fit=crop" 
          alt="Expert Doctor" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-transparent" />
        
        {/* Floating Widget: Search & Icons (Internal - Bottom Left) */}
        <GlassCard className="absolute bottom-8 left-8 p-2.5 w-[calc(100%-4rem)] sm:w-[270px] z-40">
          <div className="flex flex-col gap-4">
            
            {/* Category Icons */}
            <div className="flex justify-between items-center px-1">
              {medicalIcons.map((item) => {
                const Icon = item.icon;
                const isActive = activeCategory === item.id;
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveCategory(isActive ? null : item.id)}
                    className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm border transition-all cursor-pointer ${
                      isActive 
                        ? "bg-[#2563EB] border-[#2563EB] text-white scale-110 shadow-blue-500/20" 
                        : `${item.bg} border-white/50`
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-white" : item.color}`} />
                  </motion.div>
                );
              })}
            </div>

            {/* Search Bar */}
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2563EB] transition-colors">
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctor" 
                className="w-full bg-slate-100/80 border-none rounded-xl py-2.5 pl-10 pr-3 text-[13px] font-medium text-slate-800 focus:ring-2 focus:ring-[#2563EB]/20 transition-all outline-none"
              />
              
              {/* Real-time Status Pill */}
              <AnimatePresence>
                {(searchQuery || activeCategory) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -top-8 right-0 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md shadow-lg"
                  >
                    {isSearching ? "Searching..." : activeCategory ? `${activeCategory} Active` : "Finding Doctors"}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </GlassCard>
      </div>

      {/* Floating Widget: System Status (Top Left) */}
      <GlassCard className="absolute top-[8%] -left-[15%] p-5 py-6 hidden lg:block z-20">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#0F172A]">System Operational</span>
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-xl font-semibold tracking-tighter text-[#0F172A] uppercase leading-tight">
               EHR CLOUD<sub className="text-[9px] font-normal lowercase ml-0.5">v2.4</sub>
             </span>
             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Global Data Network</p>
          </div>
        </div>
      </GlassCard>

      {/* Floating Widget: Calendar (Mid Right) */}
      <GlassCard className="absolute top-[32%] -right-[5%] p-4 min-w-[260px] hidden xl:block z-30">
        <div className="flex flex-col gap-4">
          <h4 className="text-lg font-bold text-[#0F172A]">June, 2023</h4>
          <div className="flex justify-between items-center gap-1">
            {dates.map((item, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-full transition-all ${
                  item.active ? "bg-[#2563EB] text-white shadow-lg shadow-blue-500/30 scale-105" : "text-slate-500"
                }`}
              >
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                  {item.day}
                </span>
                <span className="text-sm font-bold">
                  {item.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

    </div>
  );
};

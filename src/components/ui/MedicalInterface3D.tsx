import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, Check, Phone, Plus } from 'lucide-react';

export const MedicalInterface3D = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/10 blur-[80px] rounded-full" />
      <div className="absolute top-1/4 left-1/3 w-[150px] h-[150px] bg-cyan-400/10 blur-[60px] rounded-full" />

      {/* Main Glassmorphic Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, rotateY: -10 }}
        whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative w-full max-w-[420px] aspect-[4/3] bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] flex flex-col p-8 overflow-hidden"
      >
        {/* Header Segment */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#0F172A]">Live Diagnostics</span>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Connected</span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
              <Phone className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        {/* The Animated Pulse Wave */}
        <div className="flex-1 w-full bg-slate-50/50 rounded-3xl border border-white/40 flex items-center justify-center relative overflow-hidden group">
          <svg viewBox="0 0 400 100" className="w-full h-32 px-4">
            <motion.path
              d="M 0 50 L 50 50 L 60 20 L 70 80 L 80 50 L 130 50 L 140 30 L 150 70 L 160 50 L 210 50 L 220 10 L 230 90 L 240 50 L 290 50 L 300 40 L 310 60 L 320 50 L 400 50"
              fill="none"
              stroke="#2563EB"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0.2 }}
              animate={{ 
                pathLength: [0, 1, 1],
                pathOffset: [0, 0, 1],
                opacity: [0.2, 1, 0.2] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            />
          </svg>
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <span className="block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider italic">BPM 72</span>
          </div>
        </div>

        {/* Floating Mini-Card (Video/Stat) */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-6 -right-6 w-48 h-20 bg-white shadow-[0_15px_30px_-5px_rgba(0,0,0,0.1)] rounded-2xl border border-slate-100 p-4 flex items-center gap-3 z-20"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden">
             {/* Simple user silhouette */}
             <div className="w-4 h-4 rounded-full bg-slate-200 mt-1" />
             <div className="absolute w-8 h-8 rounded-full bg-slate-100 opacity-20 -bottom-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#0F172A]">Dr. Alex Rivera</span>
            <span className="text-[9px] font-medium text-[#2563EB]">Call Encrypted</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Decorative Floating Elements (Depth) */}
      <motion.div 
        animate={{ 
          y: [-15, 10, -15],
          x: [-5, 5, -5]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-10 w-14 h-14 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white flex items-center justify-center -rotate-12 z-0"
      >
        <Shield className="w-6 h-6 text-blue-500" />
      </motion.div>

      <motion.div 
        animate={{ 
          y: [20, -10, 20],
          x: [10, -5, 10]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-10 left-0 w-12 h-12 bg-[#2563EB] rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center rotate-12 z-0"
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.div>

      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 -left-10 w-20 h-20 rounded-full bg-blue-400/10 blur-[40px] z-0"
      />
    </div>
  );
};

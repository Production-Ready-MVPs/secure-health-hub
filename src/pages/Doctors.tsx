import React from "react";
import Navbar from "@/components/landing/Navbar";
import { DoctorsHero } from "@/components/landing/DoctorsHero";
import { TeamSection } from "@/components/landing/TeamSection";
import { FooterSection } from "@/components/landing/FooterSection";
import { motion } from "framer-motion";

const Doctors = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <DoctorsHero />
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <TeamSection />
        </motion.div>
      </main>

      <FooterSection />
    </div>
  );
};

export default Doctors;

import React from "react";
import Navbar from "@/components/landing/Navbar";
import { AboutHero } from "@/components/landing/AboutHero";
import { CommitmentSection } from "@/components/landing/CommitmentSection";
import { StatsDivider } from "@/components/landing/StatsDivider";
import { BentoServicesSection } from "@/components/landing/commitment/BentoServicesSection";
import { CEOSection } from "@/components/landing/CEOSection";
import { FooterSection } from "@/components/landing/FooterSection";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow pt-0">
        <AboutHero />
        
        {/* The professional intermediary "suitable component" */}
        <StatsDivider />
        
        <CommitmentSection />
        
        {/* The 3D Bento Card pair */}
        <BentoServicesSection />
        
        {/* CEO Quote Section */}
        <CEOSection />
      </main>

      {/* Footer */}
      <FooterSection />
    </div>
  );
};

export default AboutUs;

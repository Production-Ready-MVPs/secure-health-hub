import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MedicalInterface3D } from '@/components/ui/MedicalInterface3D';

export const ConsultationSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-white py-12 lg:py-16">
      <div className="container px-6 max-w-7xl mx-auto flex flex-col items-center lg:flex-row gap-16 text-left">
         
         {/* Left Column: Content (STAYS EXACTLY THE SAME) */}
         <div className="w-full lg:w-1/2 flex flex-col items-start justify-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tighter text-slate-950 mb-6 leading-tight max-w-[500px] uppercase">
              Seamless patient data interoperability
            </h2>
            
            <p className="text-sm md:text-base text-slate-500 mb-10 max-w-xl leading-relaxed font-semibold">
              Our secure and user-friendly platform allows you to bridge the gap between patient data and clinical decision-making with high-speed FHIR and HL7 APIs.
            </p>
            
            <div className="flex flex-col gap-4 mb-10 w-full">
              {[
                "High-speed Interoperability", 
                "Real-time Patient Monitoring", 
                "Predictive Clinical Insights"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-blue-600" strokeWidth={4} />
                  </div>
                  <span className="text-[#0F172A] text-sm md:text-base font-bold tracking-tight">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <Link to="/login">
              <Button 
                className="bg-[#2563EB] hover:bg-blue-700 text-white px-10 py-5 h-auto rounded-full font-bold text-base shadow-lg shadow-blue-500/10"
              >
                Learn More
              </Button>
            </Link>
         </div>

         {/* Right Column: Code-Rendered 3D Medical Interface (REPLACED IMAGE) */}
         <div className="w-full lg:w-1/2 flex justify-center items-center relative aspect-square max-w-[550px]">
           <MedicalInterface3D />
         </div>

      </div>
    </section>
  );
};

export default ConsultationSection;

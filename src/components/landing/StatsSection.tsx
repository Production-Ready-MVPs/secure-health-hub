import React from "react";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import NumberTicker from "@/components/ui/number-ticker";
import { ShinyButton } from "@/components/ui/shiny-button";
import { MoveRight } from "lucide-react";
import { toast } from "sonner";

export const StatsSection = () => {
  return (
    <section className="relative w-full bg-white py-20 z-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 min-h-[400px]">
          
          {/* Left Column - Blue Stats Card */}
          <CardSpotlight 
            color="rgba(255, 255, 255, 0.15)" 
            className="bg-blue-600 text-white p-8 md:p-10 flex flex-col justify-between h-full"
          >
            <div>
              <p className="text-lg md:text-xl font-medium text-blue-100 mb-2">
                Top-Rated by
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <NumberTicker 
                  value={99} 
                  className="text-6xl md:text-8xl font-semibold tracking-tighter" 
                  delay={0.2}
                />
                <span className="text-4xl md:text-6xl font-semibold">%</span>
              </div>
              <p className="text-xl font-medium text-blue-100">
                of Clients
              </p>
            </div>
            
            <div className="mt-12">
              <ShinyButton 
                shineColor="via-blue-600/20"
                onClick={() => window.location.hash = "services"}
                className="bg-white hover:bg-slate-50 text-blue-600 border border-transparent shadow-xl w-fit"
              >
                Our Services <MoveRight className="w-4 h-4" />
              </ShinyButton>
            </div>
          </CardSpotlight>

          {/* Middle Column - Consultation Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-sm h-full min-h-[300px] border border-slate-100">
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop" 
              alt="Medical Consultation" 
              className="absolute inset-0 w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700 ease-in-out"
            />
            {/* Soft gradient overlay for premium look */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none" />
          </div>

          {/* Right Column - Telehealth Services Info */}
          <CardSpotlight 
            color="rgba(59, 130, 246, 0.08)" 
            className="bg-white border border-slate-200/60 p-8 md:p-10 flex flex-col justify-between shadow-sm h-full group"
          >
            <div>
              <h3 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-6 group-hover:text-blue-600 transition-colors">
                Secure Telehealth
              </h3>
              <p className="text-lg text-slate-500 leading-relaxed font-light">
                End-to-end encrypted virtual consultations with world-class specialists.
              </p>
            </div>

            <div className="mt-12">
              <ShinyButton 
                shineColor="via-blue-600/10"
                onClick={() => toast.info("Opening SECURE HEALTH HUB Telehealth Portal...", { description: "Establishing secure connection..." })}
                className="bg-transparent hover:bg-blue-50 text-blue-600 border-2 border-blue-600 shadow-none hover:shadow-sm w-fit"
              >
                Contact Us
              </ShinyButton>
            </div>
          </CardSpotlight>

        </div>
      </div>
    </section>
  );
};

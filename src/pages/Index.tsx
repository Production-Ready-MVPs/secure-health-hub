import { motion, Variants } from "framer-motion";
import { MedHero } from "@/components/landing/MedHero";
import { StatsSection } from "@/components/landing/StatsSection";
import { FeaturesBento } from "@/components/landing/FeaturesBento";
import { TrustedSection } from "@/components/landing/TrustedSection";
import { ExperienceSection } from "@/components/landing/ExperienceSection";
import { MentalHealthSection } from "@/components/landing/MentalHealthSection";
import { AppShowcase } from "@/components/landing/AppShowcase";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { ConsultationSection } from "@/components/landing/ConsultationSection";
import { CEOSection } from "@/components/landing/CEOSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { TeamSection } from "@/components/landing/TeamSection";
import { BookingSection } from "@/components/landing/BookingSection";
import { FooterSection } from "@/components/landing/FooterSection";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "circOut" }
  }
};

const Index = () => {
  return (
    <div className="min-h-screen bg-white text-foreground flex flex-col selection:bg-blue-100 selection:text-blue-900">
      <MedHero />

      {[
        <FeaturesBento key="features" />,
        <TrustedSection key="trusted" />,
        <ExperienceSection key="experience" />,
        <AppShowcase key="app" />,
        <ServicesSection key="services" />,
        <ConsultationSection key="consultation" />,
        <MentalHealthSection key="mental-health" />,
        <CEOSection key="ceo" />,
        <TestimonialsSection key="testimonials" />,
        <TeamSection key="team" />,
        <BookingSection key="booking" />,
        <FooterSection key="footer" />
      ].map((child, idx) => (
        <motion.div
          key={idx}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

export default Index;

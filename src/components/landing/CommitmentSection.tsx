import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Star, Smile, Users, ArrowRight, ArrowUpRight, ArrowLeft } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

const features = [
  {
    icon: Star,
    title: "25+ years experience",
    description: "Our system makes it easy for healthcare professionals to share and collaborate on patient care."
  },
  {
    icon: Smile,
    title: "Fast process, best result",
    description: "Our system makes it easy for healthcare professionals to share and collaborate on patient care."
  },
  {
    icon: Users,
    title: "Professional medical team",
    description: "Our system makes it easy for healthcare professionals to share and collaborate on patient care."
  }
];

const teamMembers = [
  {
    name: "Dr. Linda Anderson",
    role: "Cardiologist",
    image: "/team/linda-anderson.png"
  },
  {
    name: "Dr. Lisa Robinson",
    role: "Obstetrician-Gynecologist",
    image: "/team/lisa-robinson.png"
  },
  {
    name: "Cheyenne Levin",
    role: "Neurosurgeon",
    image: "/team/cheyenne-levin.png"
  },
  {
    name: "Maria Korsgaard",
    role: "Nutritionist",
    image: "/team/maria-korsgaard.png"
  }
];

const helpServices = [
  {
    title: "Health Care",
    description: "Welcome to healthcare center, a trusted beacon of wellness where we provide top-notch medical services, prioritizing your well-being above all.",
    image: "/services/health-care.png"
  },
  {
    title: "Pediatrician",
    description: "We deeply comprehend the distinct healthcare requirements of children, and our mission is to offer compassionate and expert medical care for your little ones.",
    image: "/services/pediatrician.png"
  },
  {
    title: "Cardiology",
    description: "Our hub provides comprehensive cardiovascular data tracking and real-time monitoring for precise heart health management.",
    image: "/services/cardiology.png"
  },
  {
    title: "Neurology",
    description: "Advanced neurological diagnostics and patient observation tools integrated directly into your clinical workflow.",
    image: "/services/neurology.png"
  },
  {
    title: "Orthopedics",
    description: "Specialized tools for musculoskeletal data management and surgical planning to streamline orthopedic practices.",
    image: "/services/orthopedics.png"
  },
  {
    title: "Dermatology",
    description: "High-resolution imaging and skin analysis integration for comprehensive dermatological patient records.",
    image: "/services/dermatology.png"
  }
];

export const CommitmentSection = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    slidesToScroll: 2
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi: any) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="w-full bg-white py-20 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 flex flex-col items-center">

        {/* Centered Header */}
        <div className="text-center max-w-3xl mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-[#0F172A] mb-8 leading-tight uppercase"
          >
            SECURE HEALTH HUB
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium"
          >
            With a team of dedicated healthcare professionals, clinical analysts, and data security experts, SECURE HEALTH HUB is committed to providing top-tier EHR services that scale with your clinical operations.
          </motion.p>
        </div>

        {/* Large Video Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full aspect-[21/9] md:aspect-[2.4/1] rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 group bg-slate-100 mb-32"
        >
          {/* Background Video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source
              src="/medical-lab.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>

          {/* Subtle Overlay to ensure readability */}
          <div className="absolute inset-0 bg-blue-900/10 pointer-events-none" />

          {/* Glassmorphic Overlay Card */}
          <div className="absolute inset-0 flex items-center px-6 md:px-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-white/40 backdrop-blur-xl border border-white/40 p-8 md:p-14 rounded-[2rem] shadow-2xl max-w-md flex flex-col gap-8"
            >
              <div className="flex flex-col gap-2">
                <span className="text-5xl md:text-6xl font-semibold tracking-tighter text-[#2563EB]">
                  99.9%
                </span>
                <p className="text-base md:text-lg font-semibold text-slate-600 tracking-tight">
                  Data Accuracy & Uptime
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-5xl md:text-6xl font-semibold tracking-tighter text-blue-700/90">
                  10M+
                </span>
                <p className="text-base md:text-lg font-semibold text-slate-600 tracking-tight">
                  Secured Patient Records
                </p>
              </div>

              <div className="mt-4">
                <Link to="/login">
                  <Button className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-full px-10 py-7 text-base font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                    Explore EHR Features
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Bottom attribution logic */}
          <div className="absolute bottom-6 right-6">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm border border-slate-100 hover:scale-105 transition-transform cursor-pointer">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">SECURE HEALTH HUB Verified</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </motion.div>

        {/* "Differences" Section */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-48">
          {/* Left Column: Features */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2 }
              }
            }}
            className="flex flex-col gap-12"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: [0.21, 0.45, 0.32, 0.9] }
                  }
                }}
                className="flex items-start gap-6"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
                  <feature.icon className="w-8 h-8 text-[#2563EB]" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-semibold text-[#0F172A]">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right Column: Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-[#0F172A] leading-[1.1]">
              Here’s what makes us different from conventional clinics
            </h2>
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium">
              At SECURE HEALTH HUB, we are passionate about improving lives through knowledge and empowerment.
            </p>
          </motion.div>
        </div>

        {/* Team Section */}
        <div className="w-full mb-48 text-left">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-[#0F172A] max-w-2xl leading-tight text-left"
            >
              Our team is a powerhouse of talent, creativity, and collaboration.
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Button className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-blue-500/10 active:scale-95 transition-all flex gap-2 items-center group">
                View More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 }
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10"
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: "easeOut" }
                  }
                }}
                className="group flex flex-col gap-6"
              >
                <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden shadow-xl border border-slate-100 bg-slate-50 transition-transform duration-500 group-hover:scale-[1.01]">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="flex flex-col gap-1 px-1 text-left">
                  <h4 className="text-xl md:text-2xl font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-[1.2]">
                    {member.name}
                  </h4>
                  <p className="text-slate-500 font-semibold tracking-tight uppercase text-xs md:text-sm">
                    {member.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* How We Can Help Section (Carousel) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
          {/* Left Column: Heading & Button */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-8 text-left h-full justify-start pt-4"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-[#0F172A] leading-tight text-left">
              How we can help
            </h2>
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium text-left">
              At SECURE HEALTH HUB, we are passionate about improving lives through knowledge and empowerment.
            </p>
            <Link to="/services">
              <Button className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-full px-10 py-7 text-base font-bold shadow-lg shadow-blue-500/10 active:scale-95 transition-all w-fit">
                All Services
              </Button>
            </Link>
          </motion.div>

          {/* Right Part: Carousel Area */}
          <div className="lg:col-span-2 flex flex-col gap-10">
            <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
              <div className="flex gap-8">
                {helpServices.map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                    className="flex-[0_0_100%] md:flex-[0_0_calc(50%-1rem)] group flex flex-col gap-8 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100/50 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500"
                  >
                    <div className="relative aspect-[16/10] rounded-[1.5rem] overflow-hidden shadow-lg border border-white/50">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex flex-col gap-4 text-left">
                      <h4 className="text-xl md:text-2xl font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-[1.2]">
                        {service.title}
                      </h4>
                      <p className="text-slate-500 font-medium leading-relaxed text-sm md:text-base">
                        {service.description}
                      </p>
                      <Link
                        to="/services"
                        className="flex items-center gap-2 text-[#2563EB] font-semibold group/link w-fit"
                      >
                        Learn More <ArrowUpRight className="w-4 h-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Carousel Navigation Arrows */}
            <div className="flex gap-4 self-start md:ml-4">
              <Button
                onClick={scrollPrev}
                variant="outline"
                size="icon"
                disabled={prevBtnDisabled}
                className={`w-14 h-14 rounded-full border-slate-200 transition-all shadow-sm ${prevBtnDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB]'}`}
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <Button
                onClick={scrollNext}
                variant="outline"
                size="icon"
                disabled={nextBtnDisabled}
                className={`w-14 h-14 rounded-full border-slate-200 transition-all shadow-sm ${nextBtnDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB]'}`}
              >
                <ArrowRight className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CommitmentSection;

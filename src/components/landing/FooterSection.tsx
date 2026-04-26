import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { toast } from "sonner";

// Using a custom X icon since lucide Twitter is the old bird logo
const XIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
  </svg>
);

export const FooterSection = () => {
  const [phone, setPhone] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.error("Please enter a phone number.", {
        description: "SECURE HEALTH HUB: Validation Error"
      });
      return;
    }
    toast.success("Request Sent!", {
      description: "SECURE HEALTH HUB: We will call you at " + phone
    });
    setPhone("");
  };

  return (
    <footer id="footer" className="w-full bg-[#2A2A2A] pt-24 pb-8 border-t border-[#333]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 container">

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 mb-20">

          {/* Left Column (Brand & CTA) */}
          <div className="flex flex-col items-start w-full max-w-lg">
            {/* Branding - matching the image's logo style but adhering to Secure Health Hub */}
            <div className="mb-14">
              <span className="text-2xl font-semibold tracking-tighter text-white uppercase">
                SECURE HEALTH HUB<sup className="text-sm font-normal">®</sup>
              </span>
            </div>

            <h2 className="text-[40px] md:text-4xl lg:text-[56px] font-semibold tracking-tight text-white leading-[1.05] mb-12">
              Get expert care <br className="hidden md:block" /> from trusted <br className="hidden md:block" /> doctors.
            </h2>

            <Button 
              onClick={() => toast.info("Redirecting to Support...", { description: "SECURE HEALTH HUB" })}
              className="bg-white hover:bg-slate-100 text-[#0F172A] rounded-full px-10 py-7 text-[15px] font-semibold shadow-sm transition-transform active:scale-95"
            >
              Contact us
            </Button>
          </div>

          {/* Right Column (Form & Navigation) */}
          <div className="flex flex-col lg:pl-10 w-full">

            {/* Inline Form Block */}
            <div className="mb-14 w-full">
              <h3 className="text-2xl md:text-[28px] font-semibold text-white tracking-tight mb-6">
                Request an Appointment
              </h3>

              <form onSubmit={handleSend} className="flex flex-col gap-2 w-full max-w-xl">
                <label className="text-white font-semibold text-sm">Phone Number*</label>
                <div className="flex items-center w-full bg-transparent border border-white/20 rounded-full p-1 focus-within:border-white transition-all">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/60 px-6 py-3.5 text-[15px]"
                  />
                  <Button type="submit" className="bg-white hover:bg-slate-100 text-[#0F172A] rounded-full px-10 py-6 h-auto text-[15px] font-semibold flex-shrink-0">
                    Send
                  </Button>
                </div>
              </form>
            </div>

            {/* Navigation Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-10 w-full max-w-xl">

              {/* Column 1 */}
              <div className="flex flex-col gap-4 text-left">
                <h4 className="text-white font-semibold text-base mb-1">Company</h4>
                <Link to="/" className="text-white/80 hover:text-white font-medium text-[15px] transition-colors">Home</Link>
                <Link to="/about" className="text-white/80 hover:text-white font-medium text-[15px] transition-colors">About Us</Link>
                <Link to="/#testimonials" className="text-white/80 hover:text-white font-medium text-[15px] transition-colors">Insights</Link>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col gap-4 text-left">
                <h4 className="text-white font-semibold text-base mb-1">Support</h4>
                <Link to="/#doctors" className="text-white/80 hover:text-white font-medium text-[15px] transition-colors">Departments</Link>
                <Link to="/#services" className="text-white/80 hover:text-white font-medium text-[15px] transition-colors">Services</Link>
                <Link to="/login" className="text-white/80 hover:text-white font-medium text-[15px] transition-colors">Pricing</Link>
                <Link to="/login" className="text-white/80 hover:text-white font-medium text-[15px] transition-colors">Careers</Link>
              </div>

              {/* Column 3 */}
              <div className="flex flex-col gap-4 text-left col-span-2 sm:col-span-1">
                <h4 className="text-white font-semibold text-base mb-1">Useful Links</h4>
                <Link to="/#doctors" className="text-white/80 hover:text-white font-medium text-[15px] transition-colors">Doctors</Link>
                <Link to="/login" className="text-white/80 hover:text-white font-medium text-[15px] transition-colors">Working Hours</Link>
                <Link to="/login" className="text-white/80 hover:text-white font-medium text-[15px] transition-colors">Schedule</Link>
                <Link to="/#booking" className="text-white/80 hover:text-white font-medium text-[15px] transition-colors">Appointments</Link>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Bar Content */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 items-center gap-8 pt-10 mt-10 border-t border-white/10">

          {/* Copyright - Left Aligned */}
          <div className="flex justify-center md:justify-start">
            <p className="text-white text-[14px] font-medium tracking-tight">
              © SECURE HEALTH HUB. All rights reserved.
            </p>
          </div>

          {/* Social Icons - Center Aligned */}
          <div className="flex items-center justify-center gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-300 text-white/90 hover:text-white outline-none ring-offset-[#2A2A2A] focus:ring-2 focus:ring-white/50">
              <Facebook className="w-4 h-4 fill-current" />
              <span className="sr-only">Facebook</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-300 text-white/90 hover:text-white outline-none ring-offset-[#2A2A2A] focus:ring-2 focus:ring-white/50">
              <Instagram className="w-4 h-4" />
              <span className="sr-only">Instagram</span>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-300 text-white/90 hover:text-white outline-none ring-offset-[#2A2A2A] focus:ring-2 focus:ring-white/50">
              <XIcon className="w-4 h-4" />
              <span className="sr-only">X (Twitter)</span>
            </a>
          </div>

          {/* Attribution - Right Aligned */}
          <div className="flex justify-center md:justify-end">
            <p className="text-white text-[14px] font-medium tracking-tight">
              Designed by fourtwelve.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default FooterSection;

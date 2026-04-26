import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", to: "/", hasDropdown: false },
    { label: "About Us", to: "/about", hasDropdown: false },
    { label: "Doctors", to: "/doctors", hasDropdown: false },
    { label: "Services", to: "/#services", hasDropdown: false },
    { label: "Insights", to: "/#testimonials", hasDropdown: false },
    { label: "All Pages", to: "/#footer", hasDropdown: true },
  ];

  return (
    <>
      <nav className="w-full bg-white/80 backdrop-blur-md z-50 fixed top-0 pt-4 border-b border-slate-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-4 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center">
            <span className="text-xl font-semibold tracking-tighter text-[#0F172A] uppercase">
              SECURE HEALTH HUB
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="text-base font-medium text-[#0F172A] hover:text-[#2563EB] transition-colors flex items-center gap-1"
              >
                {item.label}
                {item.hasDropdown && <ChevronDown className="w-4 h-4 ml-0.5 text-[#0F172A]" />}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
            <Link to="/login" className="text-base font-semibold text-[#0F172A] hover:text-[#2563EB] transition-colors">
              Login
            </Link>
            <Link to="/login">
              <Button className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-full px-8 py-6 text-[15px] font-semibold border border-[#2563EB]">
                Book An Appointment
              </Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden p-2 text-[#0F172A]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-[80px] left-0 w-full bg-white shadow-xl z-40 border-b border-slate-100 flex flex-col p-4 gap-2">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 w-full flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="text-base font-medium text-[#0F172A] p-3 hover:bg-slate-50 rounded-lg flex items-center justify-between"
              >
                {item.label}
                {item.hasDropdown && <ChevronDown className="w-4 h-4 text-slate-500" />}
              </Link>
            ))}
            <div className="flex flex-col gap-3 p-3 mt-2 border-t border-slate-100 pt-6">
              <Link
                to="/login"
                className="text-center font-semibold text-[#0F172A] p-3 hover:bg-slate-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full bg-[#2563EB] hover:bg-blue-700 text-white rounded-full py-6 font-semibold">
                  Book An Appointment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";

export const BookingSection = () => {
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    appointmentDate: "",
    specialization: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedDate = new Date(formData.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Strict Validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.appointmentDate || !formData.specialization) {
      toast.error("MISSING FIELDS", {
        description: "SECURE HEALTH HUB: Please fill in all mandatory fields."
      });
      return;
    }

    if (selectedDate < today) {
      toast.error("INVALID DATE", {
        description: "SECURE HEALTH HUB: Appointment date must be in the future."
      });
      return;
    }

    // Mock Submission
    console.log("Appointment Request:", formData);
    toast.success("APPOINTMENT RECEIVED", {
      description: "SECURE HEALTH HUB: Our team will contact you shortly."
    });

    // Reset Form
    setFormData({ fullName: "", email: "", phone: "", appointmentDate: "", specialization: "", message: "" });
  };

  return (
    <section id="booking" className="w-full bg-[#2A2A2A] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">

        {/* Main Blue Card */}
        <div className="w-full bg-[#2563EB] rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 lg:p-14 flex flex-col lg:flex-row gap-12 lg:gap-16 items-stretch relative overflow-hidden">

          {/* Left Column: Form & Text */}
          <div className="flex-1 flex flex-col z-10 w-full lg:max-w-[50%]">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-5 uppercase">
              Book an Appointment
            </h2>
            <p className="text-white/90 text-base md:text-lg font-medium leading-relaxed mb-10 max-w-md">
              SECURE HEALTH HUB: Please fill out the form below to schedule your clinical consultation.
            </p>

            {/* Form */}
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-white font-bold text-sm tracking-wide">Full name*</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/40 focus:outline-none focus:border-white focus:bg-white/20 transition-all text-[15px]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white font-bold text-sm tracking-wide">Email*</label>
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/40 focus:outline-none focus:border-white focus:bg-white/20 transition-all text-[15px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-white font-bold text-sm tracking-wide">Phone*</label>
                  <input
                    type="tel"
                    required
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/40 focus:outline-none focus:border-white focus:bg-white/20 transition-all text-[15px]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white font-bold text-sm tracking-wide">Appointment Date*</label>
                  <input
                    type="date"
                    required
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/40 focus:outline-none focus:border-white focus:bg-white/20 transition-all text-[15px] invert brightness-200 contrast-100"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white font-bold text-sm tracking-wide">Specialization*</label>
                <select
                  required
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/40 focus:outline-none focus:border-white focus:bg-white/20 transition-all text-[15px] appearance-none"
                >
                  <option value="" disabled className="bg-slate-800">Select Specialization</option>
                  <option value="cardiology" className="bg-slate-800">Cardiology</option>
                  <option value="neurology" className="bg-slate-800">Neurology</option>
                  <option value="pediatrics" className="bg-slate-800">Pediatrics</option>
                  <option value="orthopedics" className="bg-slate-800">Orthopedics</option>
                  <option value="dermatology" className="bg-slate-800">Dermatology</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white font-bold text-sm tracking-wide">Message</label>
                <textarea
                  placeholder="Your message (Optional)"
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-[2rem] px-6 py-5 text-white placeholder-white/40 focus:outline-none focus:border-white focus:bg-white/20 transition-all text-[15px] resize-none"
                ></textarea>
              </div>

              <Button
                type="submit"
                className="bg-white hover:bg-slate-50 text-[#2563EB] rounded-full px-12 py-7 mt-4 font-bold text-[15px] w-fit shadow-md transition-transform active:scale-95 uppercase"
              >
                Schedule Now
              </Button>
            </form>
          </div>

          {/* Right Column: Image */}
          <div className="flex-1 w-full lg:w-1/2 relative min-h-[400px] lg:min-h-full rounded-[2rem] overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1000&auto=format&fit=crop"
              alt="Doctor with Stethoscope"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default BookingSection;

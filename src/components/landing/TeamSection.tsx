import React from 'react';
import { Button } from '@/components/ui/button';

const teamData = [
  {
    name: "Dr. Linda Anderson",
    role: "Cardiologist",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80"
  },
  {
    name: "Dr. Lisa Robinson",
    role: "Obstetrician-Gynecologist",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Cheyenne Levin",
    role: "Neurosurgeon",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Maria Korsgaard",
    role: "Nutritionist",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "David Wilson",
    role: "Corporate Wellness Manager",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Samantha Lee",
    role: "Dental Hygienist",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Jaylon Culhane",
    role: "CEO of Curemed",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Aspen Bator",
    role: "Dentist",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=800&auto=format&fit=crop"
  }
];

export const TeamSection = () => {
  return (
    <section id="doctors" className="w-full bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        
        {/* Header Block */}
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#001741] leading-[1.2] max-w-3xl">
            Our team is a powerhouse of talent, creativity, and collaboration.
          </h2>
        </div>

        {/* Doctor Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {teamData.map((member, index) => (
            <div key={index} className="group cursor-pointer flex flex-col items-start gap-6">
              
              {/* Doctor Image */}
              <div className="w-full aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Doctor Info */}
              <div className="flex flex-col items-start text-left px-1">
                <h4 className="text-3xl font-bold tracking-tight text-[#001D4D] mb-2">
                  {member.name}
                </h4>
                <p className="text-lg font-medium text-slate-500">
                  {member.role}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TeamSection;

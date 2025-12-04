import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, ArrowRight } from 'lucide-react';
import TiltCard from '../components/ui/TiltCard';
import MagneticButton from '../components/ui/MagneticButton';
import { MOCK_PROPERTIES } from '../constants';
import { VibeType } from '../types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedVibe, setSelectedVibe] = useState<VibeType | null>(null);

  const filteredProperties = selectedVibe 
    ? MOCK_PROPERTIES.filter(p => p.vibe === selectedVibe)
    : MOCK_PROPERTIES;

  return (
    <div className="min-h-screen pt-32 px-4 md:px-12 pb-20 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="mb-24 relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-5xl md:text-8xl font-bold leading-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
        >
          CURATED SPACES <br />
          FOR THE <span className="italic font-light">MODERN NOMAD</span>
        </motion.h1>

        {/* Portal Search Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 max-w-4xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative group">
              <MapPin className="absolute left-3 top-3.5 text-white/50" size={18} />
              <input type="text" placeholder="Location" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 text-white focus:outline-none focus:bg-white/10 transition-colors" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3.5 text-white/50" size={18} />
              <input type="text" placeholder="Dates" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 text-white focus:outline-none focus:bg-white/10 transition-colors" />
            </div>
            <div className="relative">
              <Users className="absolute left-3 top-3.5 text-white/50" size={18} />
              <input type="number" placeholder="Guests" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 text-white focus:outline-none focus:bg-white/10 transition-colors" />
            </div>
            <MagneticButton className="w-full h-full">
              <button className="w-full h-full bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                SEARCH
                <Search size={18} />
              </button>
            </MagneticButton>
          </div>

          {/* Vibe Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="text-white/40 text-sm py-2 mr-2">VIBE CHECK:</span>
            {Object.values(VibeType).map((vibe) => (
              <button
                key={vibe}
                onClick={() => setSelectedVibe(selectedVibe === vibe ? null : vibe)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedVibe === vibe 
                    ? 'bg-white text-black border-white' 
                    : 'bg-transparent text-white/70 border-white/20 hover:border-white/50'
                }`}
              >
                {vibe}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Property Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {filteredProperties.map((property, index) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(`/property/${property.id}`)}
          >
            <TiltCard className="group cursor-pointer">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs border border-white/10 uppercase tracking-widest">
                  {property.vibe}
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="font-display text-2xl font-bold mb-1">{property.title}</h3>
                      <p className="text-white/60 text-sm flex items-center gap-1">
                        <MapPin size={14} /> {property.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">₹{property.price.toLocaleString()}</p>
                      <p className="text-xs text-white/50">per night</p>
                    </div>
                  </div>
                </div>
                
                {/* Spotlight hover effect (simulated with CSS) */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                     style={{ background: 'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.1), transparent 40%)' }}
                />
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

export default Home;

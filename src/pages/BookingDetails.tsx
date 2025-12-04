
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Download, Cloud, Sun, Clock, Coffee, Navigation } from 'lucide-react';
import MagneticButton from '../components/ui/MagneticButton';
import { MOCK_BOOKINGS, MOCK_PROPERTIES } from '../constants';
import { QRCodeSVG } from 'qrcode.react';

const BookingDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const booking = MOCK_BOOKINGS.find(b => b.id === id);
  const property = booking ? MOCK_PROPERTIES.find(p => p.id === booking.propertyId) : null;

  if (!booking || !property) {
    return (
      <div className="min-h-screen pt-32 px-6 text-center">
        <h2 className="text-2xl font-display">Booking Not Found</h2>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-white/50 hover:text-white underline">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors uppercase text-xs tracking-widest"
        >
          <ArrowLeft size={14} /> Back to Missions
        </button>
        <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest rounded-full">
          Status: {booking.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Dossier */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Hero Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-80 rounded-3xl overflow-hidden border border-white/10 group"
          >
            <img src={property.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-8 left-8">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">{property.title}</h1>
              <p className="flex items-center gap-2 text-white/70"><MapPin size={16} /> {property.location}</p>
            </div>
          </motion.div>

          {/* Itinerary Timeline */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md"
          >
            <h3 className="font-display text-xl mb-8 flex items-center gap-2">
              <Clock size={20} className="text-white/50" /> Mission Timeline
            </h3>
            
            <div className="space-y-8 relative before:absolute before:left-3.5 before:top-2 before:bottom-0 before:w-px before:bg-white/10">
              
              {/* Check In */}
              <div className="relative pl-12">
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center z-10">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-lg">Check-in</h4>
                    <p className="text-white/50 text-sm">Meet the host at the main gate.</p>
                  </div>
                  <div className="text-right sm:text-left">
                    <p className="font-mono text-lg">{booking.date}</p>
                    <p className="text-xs uppercase tracking-widest text-white/40">15:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Day 2 */}
              <div className="relative pl-12 opacity-50">
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center z-10">
                  <div className="w-2 h-2 bg-white/50 rounded-full" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-lg">Guided Trek (Add-on)</h4>
                    <p className="text-white/50 text-sm">Equipment provided at lobby.</p>
                  </div>
                  <div className="text-right sm:text-left">
                    <p className="font-mono text-lg">Day 2</p>
                    <p className="text-xs uppercase tracking-widest text-white/40">09:00 AM</p>
                  </div>
                </div>
              </div>

              {/* Check Out */}
              <div className="relative pl-12">
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center z-10">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-lg">Check-out</h4>
                    <p className="text-white/50 text-sm">Digital key expires automatically.</p>
                  </div>
                  <div className="text-right sm:text-left">
                    <p className="font-mono text-lg">Day 4</p>
                    <p className="text-xs uppercase tracking-widest text-white/40">11:00 AM</p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Utilities */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <h3 className="font-display text-sm uppercase tracking-widest text-white/50 mb-4">Command Center</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 flex flex-col items-center gap-2 transition-colors">
                <Navigation size={20} className="text-blue-400" />
                <span className="text-xs font-bold">Directions</span>
              </button>
              <button className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 flex flex-col items-center gap-2 transition-colors">
                <Download size={20} className="text-white" />
                <span className="text-xs font-bold">Receipt</span>
              </button>
              <button className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 flex flex-col items-center gap-2 transition-colors">
                <Coffee size={20} className="text-yellow-400" />
                <span className="text-xs font-bold">Concierge</span>
              </button>
              <button className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 flex flex-col items-center gap-2 transition-colors">
                <Calendar size={20} className="text-purple-400" />
                <span className="text-xs font-bold">Modify</span>
              </button>
            </div>
          </div>

          {/* Weather Widget */}
          <div className="bg-gradient-to-br from-blue-900/20 to-black border border-white/10 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/50 mb-1">Local Forecast</p>
                <h3 className="text-3xl font-bold font-mono">18°C</h3>
                <p className="text-sm text-white/70">Partly Cloudy</p>
              </div>
              <Cloud size={40} className="text-white/80" />
            </div>
            {/* Animated Graph Line Mockup */}
            <div className="mt-6 flex items-end justify-between gap-1 h-12 opacity-50">
              {[20, 35, 45, 30, 50, 60, 40].map((h, i) => (
                <div key={i} style={{ height: `${h}%` }} className="w-full bg-blue-400/20 rounded-t-sm" />
              ))}
            </div>
          </div>

          {/* QR Code Pass */}
          <div className="bg-white text-black rounded-3xl p-6 text-center">
            <div className="flex justify-center mb-4">
              <QRCodeSVG value={`BOOKING:${booking.id}`} size={160} />
            </div>
            <p className="font-mono text-sm font-bold tracking-widest">{booking.id}</p>
            <p className="text-xs text-black/50 uppercase mt-1">Show at Entry</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingDetails;

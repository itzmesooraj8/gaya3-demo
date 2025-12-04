
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import MagneticButton from '../components/ui/MagneticButton';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <div className="w-[800px] h-[800px] border border-white/20 rounded-full animate-pulse" />
        <div className="absolute w-[600px] h-[600px] border border-white/10 rounded-full animate-spin duration-[20s]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <div className="font-display text-[12rem] font-bold leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-transparent opacity-20 select-none">
          404
        </div>
        
        <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 -mt-12 relative z-20">
          REALITY NOT FOUND
        </h1>
        
        <p className="text-white/60 text-lg max-w-lg mx-auto mb-12 font-light leading-relaxed">
          The coordinates you requested exist outside the known grid. You seem lost in the ether.
        </p>

        <div className="flex gap-6 justify-center">
          <Link to="/">
            <MagneticButton className="px-8 py-4 bg-white text-black rounded-full font-bold flex items-center gap-3 hover:bg-gray-200 transition-colors">
              <Home size={18} />
              RETURN TO ORIGIN
            </MagneticButton>
          </Link>
          
          <Link to="/dashboard">
            <MagneticButton className="px-8 py-4 bg-white/10 border border-white/10 text-white rounded-full font-bold flex items-center gap-3 hover:bg-white/20 transition-colors">
              <Compass size={18} />
              RECALIBRATE
            </MagneticButton>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;

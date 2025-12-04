import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Zap } from 'lucide-react';

const BookingSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after animation
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black overflow-hidden relative">
      {/* Background Burst */}
      <div className="absolute inset-0 flex items-center justify-center">
         <motion.div 
           initial={{ scale: 0, opacity: 0 }}
           animate={{ scale: 2, opacity: [0, 0.5, 0] }}
           transition={{ duration: 1.5, ease: "easeOut" }}
           className="w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[100px]"
         />
      </div>

      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 bg-green-500 rounded-full mx-auto mb-8 flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.6)]"
        >
           <CheckCircle size={48} className="text-black" />
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-display text-4xl md:text-6xl font-bold mb-4"
        >
          ACCESS GRANTED
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/60 text-lg mb-8 font-light"
        >
          Your sanctuary has been secured. Minting digital key...
        </motion.p>

        {/* Loading Bar for Redirect */}
        <div className="w-64 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: "100%" }}
             transition={{ duration: 3.5, ease: "linear" }}
             className="h-full bg-white"
           />
        </div>
        
        <p className="text-[10px] uppercase tracking-widest text-white/30 mt-4 animate-pulse">
           Redirecting to Mission Control
        </p>
      </div>
    </div>
  );
};

export default BookingSuccess;
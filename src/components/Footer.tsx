import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Linkedin, ArrowRight, Send } from 'lucide-react';
import MagneticButton from './ui/MagneticButton';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-black pt-24 pb-12 overflow-hidden border-t border-white/5">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Newsletter Section */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-24 border-b border-white/10 pb-12">
          <div className="max-w-xl">
            <h3 className="font-display text-3xl md:text-5xl font-bold leading-tight mb-4">
              JOIN THE <span className="italic font-light text-white/50">INNER CIRCLE</span>
            </h3>
            <p className="text-white/60">
              Curated drops, hidden sanctuaries, and AI travel tips delivered to your digital doorstep.
            </p>
          </div>
          <div className="w-full md:w-auto flex gap-2">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-white/5 border border-white/10 rounded-full px-6 py-4 w-full md:w-80 text-white placeholder:text-white/30 focus:outline-none focus:bg-white/10 transition-colors"
            />
            <MagneticButton>
              <button className="h-full aspect-square bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors p-4">
                <ArrowRight size={20} />
              </button>
            </MagneticButton>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
          
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-1 space-y-6">
            <Link to="/" className="font-display text-2xl font-bold tracking-widest">GAYA3</Link>
            <p className="text-sm text-white/50 leading-relaxed">
              Liquid architecture for the modern nomad. Book unique stays, curated by AI, experienced by you.
            </p>
          </div>

          {/* Explore */}
          <div className="space-y-6">
            <h4 className="font-display text-xs uppercase tracking-widest text-white/40">Explore</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-white/70 hover:text-white transition-colors">Sanctuaries</Link></li>
              <li><Link to="/dashboard" className="text-white/70 hover:text-white transition-colors">My Journeys</Link></li>
              <li><Link to="/auth" className="text-white/70 hover:text-white transition-colors">Membership</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h4 className="font-display text-xs uppercase tracking-widest text-white/40">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Press</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-6">
            <h4 className="font-display text-xs uppercase tracking-widest text-white/40">Legal</h4>
            <ul className="space-y-4">
              <li><Link to="/privacy" className="text-white/70 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-white/70 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/5">
          <p className="text-xs text-white/30 uppercase tracking-widest">
            © {new Date().getFullYear()} Gaya3 Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <MagneticButton className="p-2 text-white/50 hover:text-white transition-colors"><Instagram size={20} /></MagneticButton>
            <MagneticButton className="p-2 text-white/50 hover:text-white transition-colors"><Twitter size={20} /></MagneticButton>
            <MagneticButton className="p-2 text-white/50 hover:text-white transition-colors"><Linkedin size={20} /></MagneticButton>
          </div>
        </div>
      </div>
      
      {/* Massive Watermark */}
      <div className="absolute -bottom-24 left-0 w-full overflow-hidden pointer-events-none opacity-[0.03]">
        <h1 className="font-display text-[20vw] font-bold text-white text-center leading-none tracking-tighter">
          GAYA3
        </h1>
      </div>
    </footer>
  );
};

export default Footer;
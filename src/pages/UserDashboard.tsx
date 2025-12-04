
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useQuery } from '@tanstack/react-query';
import { 
  Settings, CreditCard, 
  Heart, Star, Plane, Zap, Shield, Activity, 
  History, Plus, Lock, Unlock, Cloud, Sun, 
  MapPin, Download, Trash2, Key,
  Edit2, AlertCircle, Smartphone, CheckCircle, Sparkles, XCircle, Globe, Laptop
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TiltCard from '../components/ui/TiltCard';
import MagneticButton from '../components/ui/MagneticButton';
import { MOCK_PROPERTIES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

// --- TYPES & MOCKS ---
type Tab = 'journeys' | 'wishlist' | 'vault' | 'settings';
type SettingsSubTab = 'profile' | 'neural' | 'wallet';

const DREAM_KEYWORDS = ["Velvet", "Silence", "Saltwater", "Neon", "Moss", "Adrenaline", "Void", "Gold", "Petrichor", "Basalt"];

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('journeys');
  const [privacyMode, setPrivacyMode] = useState(false);
  
  // Settings State
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsSubTab>('profile');
  
  // Vault Interaction States
  const [activeVaultItem, setActiveVaultItem] = useState<string | null>(null);
  const [summonProgress, setSummonProgress] = useState(0);
  const summonInterval = useRef<any>(null);

  // AI Calibration State
  const [aiSliders, setAiSliders] = useState({
    social: 50,
    pacing: 30,
    nature: 80,
    luxury: 60
  });

  const [dreamWords, setDreamWords] = useState<string[]>([]);
  const [bioSyncActive, setBioSyncActive] = useState(false);
  
  // Profile Form State
  const [twoFactor, setTwoFactor] = useState(true);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  // --- QUERY HOOKS ---
  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => api.bookings.getMyBookings(user?.id || ''),
    enabled: !!user
  });

  const upcomingBookings = bookings?.filter(b => b.status === 'UPCOMING') || [];
  const pastBookings = bookings?.filter(b => b.status === 'COMPLETED') || [];
  const wishlistProperties = [MOCK_PROPERTIES[1], MOCK_PROPERTIES[3], MOCK_PROPERTIES[0]];

  // Fallback display user
  const displayUser = user || {
    id: 'mock-1',
    name: 'Elena Fisher',
    email: 'elena@nomad.com',
    role: 'user',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Elena',
    memberStatus: 'Platinum',
    vibeScore: 4.92
  };

  // Summoning Logic
  const startSummoning = () => {
    if (summonProgress >= 100) return;
    summonInterval.current = setInterval(() => {
      setSummonProgress(prev => {
        if (prev >= 100) {
          clearInterval(summonInterval.current);
          return 100;
        }
        return prev + 2;
      });
    }, 20);
  };

  const stopSummoning = () => {
    clearInterval(summonInterval.current);
    if (summonProgress < 100) {
      setSummonProgress(0);
    }
  };

  const toggleDreamWord = (word: string) => {
    setDreamWords(prev => prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]);
  };

  // --- ANIMATION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.05, delayChildren: 0.1 } 
    },
    exit: { opacity: 0, y: 10, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen pt-32 px-4 md:px-12 max-w-7xl mx-auto pb-24 font-body text-white">
      
      {/* --- HUD HEADER --- */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-12"
      >
        <div className="relative bg-[#080808]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 overflow-hidden shadow-2xl">
          {/* Decorative Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            
            {/* Identity Cluster */}
            <div className="flex items-center gap-6">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-white/20 to-transparent">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-black relative">
                    <img src={displayUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full border border-black">
                  LVL 4
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-display text-3xl font-bold tracking-tight">
                    {displayUser.name}
                  </h1>
                  {privacyMode ? (
                    <button onClick={() => setPrivacyMode(false)} className="text-white/30 hover:text-white"><Lock size={14}/></button>
                  ) : (
                    <button onClick={() => setPrivacyMode(true)} className="text-white/30 hover:text-white"><Unlock size={14}/></button>
                  )}
                </div>
                <p className="text-white/40 font-mono text-xs mb-2">
                  {privacyMode ? '••••••••••••••••' : displayUser.email}
                </p>
                <div className="flex gap-2">
                   <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-white/70 flex items-center gap-1">
                     <Shield size={10} className="text-purple-400" /> {displayUser.memberStatus}
                   </span>
                   <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-white/70 flex items-center gap-1">
                     <MapPin size={10} className="text-blue-400" /> Global Citizen
                   </span>
                </div>
              </div>
            </div>

            {/* Stats Cluster */}
            <div className="flex items-center gap-8 bg-black/20 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 0.98 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="3" 
                      strokeDasharray="100, 100" 
                    />
                  </svg>
                  <div className="absolute font-display text-xs font-bold">4.9</div>
                </div>
                <div>
                   <p className="text-[10px] uppercase tracking-widest text-white/40">Vibe Score</p>
                   <p className="text-xs text-green-400">Top 1% Traveler</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- LIQUID NAVIGATION --- */}
      <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-8 mb-10 border-b border-white/5 px-2">
        {[
          { id: 'journeys', icon: Plane, label: 'Mission Control' },
          { id: 'wishlist', icon: Heart, label: 'Wishlist' },
          { id: 'vault', icon: Star, label: 'The Vault' },
          { id: 'settings', icon: Settings, label: 'Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`relative px-4 py-4 group flex items-center gap-2 transition-all ${activeTab === tab.id ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
          >
            <tab.icon size={16} className={activeTab === tab.id ? 'text-white' : 'opacity-50'} />
            <span className="font-display text-xs md:text-sm tracking-widest uppercase">
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_10px_white]" 
              />
            )}
          </button>
        ))}
      </div>

      {/* --- CONTENT AREA --- */}
      <AnimatePresence mode="wait">
        
        {/* 1. MISSION CONTROL (JOURNEYS) */}
        {activeTab === 'journeys' && (
          <motion.div
            key="journeys"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-12"
          >
            {isLoadingBookings ? (
               // LIQUID SKELETON LOADER
               <div className="space-y-8">
                  <div className="w-full h-48 bg-white/5 rounded-3xl animate-pulse" />
                  <div className="w-full h-48 bg-white/5 rounded-3xl animate-pulse delay-75" />
               </div>
            ) : (
               <>
                 <div className="space-y-8">
                  {upcomingBookings.map((booking) => (
                    <motion.div key={booking.id} variants={itemVariants} onClick={() => navigate(`/booking/${booking.id}`)}>
                      <DigitalBoardingPass booking={booking} />
                    </motion.div>
                  ))}
                  
                  {upcomingBookings.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-white/30">
                      <Plane size={48} className="mb-4 opacity-50" />
                      <p className="font-display text-lg">No Active Missions</p>
                    </div>
                  )}
                </div>

                {/* Past Missions */}
                <div className="pt-12 border-t border-white/5">
                  <h3 className="font-display text-sm text-white/40 mb-6 flex items-center gap-2">
                    <History size={14} /> Archived Logs
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70">
                    {pastBookings.map((booking) => (
                      <motion.div key={booking.id} variants={itemVariants} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors">
                        <div className="w-12 h-12 rounded bg-white/10 overflow-hidden grayscale">
                          <img src={MOCK_PROPERTIES.find(p=>p.id === booking.propertyId)?.image} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{MOCK_PROPERTIES.find(p=>p.id === booking.propertyId)?.title}</p>
                          <p className="text-xs text-white/40 font-mono">{booking.date}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
               </>
            )}
          </motion.div>
        )}

        {/* 2. THE VAULT */}
        {activeTab === 'vault' && (
          <motion.div
            key="vault"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
             {/* Status Card */}
             <div className="md:col-span-1 bg-gradient-to-b from-yellow-900/20 to-black border border-yellow-500/20 rounded-3xl p-8 relative overflow-hidden">
                <Star size={32} className="text-yellow-400 mb-6" fill="currentColor" />
                <h3 className="font-display text-2xl font-bold mb-1">PLATINUM</h3>
                <p className="text-sm text-white/50 mb-8">Elite Tier Member</p>
             </div>
             {/* Interaction Areas */}
             <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
                    <Lock size={20} className="text-purple-400" />
                    <p className="font-display text-sm">Exclusive Drops</p>
                 </div>
                 <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
                    <Zap size={20} className="text-amber-400" />
                    <p className="font-display text-sm">Priority Neural Link</p>
                 </div>
             </div>
          </motion.div>
        )}

        {/* 3. WISHLIST */}
        {activeTab === 'wishlist' && (
          <motion.div
            key="wishlist"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
             {wishlistProperties.map((property) => (
                <motion.div key={property.id} variants={itemVariants}>
                   <TiltCard>
                      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden cursor-pointer group" onClick={() => navigate(`/property/${property.id}`)}>
                         <div className="relative aspect-[4/3]">
                            <img src={property.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur rounded-full text-white">
                               <Heart size={16} fill="currentColor" className="text-red-500" />
                            </div>
                         </div>
                         <div className="p-4">
                            <h3 className="font-display font-bold">{property.title}</h3>
                            <p className="text-xs text-white/50">{property.location}</p>
                         </div>
                      </div>
                   </TiltCard>
                </motion.div>
             ))}
          </motion.div>
        )}

        {/* 4. SETTINGS */}
        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col lg:flex-row gap-8"
          >
            <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-2">
              <button onClick={() => setActiveSettingsTab('profile')} className={`px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${activeSettingsTab === 'profile' ? 'bg-white text-black' : 'bg-white/5 text-white/50'}`}>Profile</button>
              <button onClick={() => setActiveSettingsTab('neural')} className={`px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${activeSettingsTab === 'neural' ? 'bg-white text-black' : 'bg-white/5 text-white/50'}`}>AI Preferences</button>
              <button onClick={() => setActiveSettingsTab('wallet')} className={`px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${activeSettingsTab === 'wallet' ? 'bg-white text-black' : 'bg-white/5 text-white/50'}`}>Wallet</button>
            </div>

            <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md min-h-[400px]">
               {activeSettingsTab === 'profile' && (
                  <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2"><Edit2 size={10} /> Display Name</label>
                            <input type="text" defaultValue={displayUser.name} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-white/30 transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2"><Smartphone size={10} /> Phone</label>
                            <input type="text" defaultValue="+1 (555) 000-0000" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-white/30 transition-colors" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2"><Globe size={10} /> Email Address</label>
                            <input type="text" defaultValue={displayUser.email} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-white/30 transition-colors" />
                        </div>
                     </div>

                     <div className="pt-8 border-t border-white/5 space-y-4">
                        <h4 className="font-display text-sm text-white/50 mb-4">SECURITY PROTOCOLS</h4>
                        
                        {/* 2FA Toggle */}
                        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                    <Shield size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Secure Enclave (2FA)</p>
                                    <p className="text-[10px] text-white/50">Biometric or Authenticator App</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setTwoFactor(!twoFactor)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${twoFactor ? 'bg-green-500' : 'bg-white/20'}`}
                            >
                                <motion.div 
                                    animate={{ x: twoFactor ? 24 : 0 }}
                                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                                />
                            </button>
                        </div>

                        {/* Session Manager */}
                        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                    <Globe size={18} />
                                </div>
                                <div>
                                     <p className="font-bold text-sm">Active Neural Links</p>
                                     <p className="text-[10px] text-white/50">2 Devices Connected</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsSessionModalOpen(true)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold uppercase transition-colors"
                            >
                                Manage
                            </button>
                        </div>
                     </div>
                  </div>
               )}
               {activeSettingsTab === 'neural' && (
                  <div className="space-y-6">
                     <p className="text-sm text-white/60">Adjust how Gaya interprets your vibe.</p>
                     {/* Sliders Mockup */}
                     <input type="range" className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                  </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* --- SESSION MANAGEMENT MODAL --- */}
      <AnimatePresence>
          {isSessionModalOpen && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                  <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      onClick={() => setIsSessionModalOpen(false)}
                      className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                  />
                  <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="relative z-10 w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl"
                  >
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="font-display text-lg">Active Sessions</h3>
                          <button onClick={() => setIsSessionModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                              <XCircle size={20} className="text-white/50" />
                          </button>
                      </div>
                      
                      <div className="space-y-3">
                          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-white/10 rounded-lg">
                                      <Laptop size={18} className="text-green-400" />
                                  </div>
                                  <div>
                                      <p className="font-bold text-sm">Quantum Mainframe (This Device)</p>
                                      <p className="text-[10px] text-white/50">Chrome • Tokyo, JP • Active Now</p>
                                  </div>
                              </div>
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          </div>

                          <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between opacity-60">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-white/10 rounded-lg">
                                      <Smartphone size={18} />
                                  </div>
                                  <div>
                                      <p className="font-bold text-sm">Mobile Uplink</p>
                                      <p className="text-[10px] text-white/50">iOS • Osaka, JP • 2h ago</p>
                                  </div>
                              </div>
                              <button className="text-xs text-red-400 hover:text-red-300 font-bold uppercase">Revoke</button>
                          </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-white/10">
                          <button className="w-full py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">
                              Terminate All Sessions
                          </button>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

    </div>
  );
};

// --- DIGITAL BOARDING PASS COMPONENT ---
const DigitalBoardingPass: React.FC<{ booking: any }> = ({ booking }) => {
  const property = MOCK_PROPERTIES.find(p => p.id === booking.propertyId);
  
  const handleDownloadReceipt = (e: React.MouseEvent) => {
    e.stopPropagation();
    const receiptContent = `
GAYA3 OFFICIAL RECEIPT
--------------------------------
Booking ID: ${booking.id}
Property: ${property?.title}
Date: ${booking.date}
Guests: ${booking.guests}

Total Amount: ₹${booking.totalPrice?.toLocaleString()}
Status: Paid

Thank you for choosing Gaya3.
    `;
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt-${booking.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!property) return null;

  return (
    <div className="group relative w-full flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.01] duration-500 cursor-pointer">
       
       <div className="absolute inset-0 z-0">
          <img src={property.image} className="w-full h-full object-cover opacity-30 blur-xl scale-125" />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
       </div>

       <div className="relative z-10 flex-1 p-8 border-b md:border-b-0 md:border-r border-dashed border-white/20 bg-white/5 backdrop-blur-md flex flex-col justify-between">
          
          <div className="flex justify-between items-start mb-8">
             <div>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold uppercase tracking-widest rounded mb-3 inline-block">
                   Confirmed
                </span>
                <h3 className="font-display text-2xl md:text-4xl font-bold text-white mb-2">{property.title}</h3>
                <p className="text-white/60 flex items-center gap-2 text-sm"><MapPin size={14} /> {property.location}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-black/20 p-6 rounded-2xl border border-white/5">
             <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Check In</p>
                <p className="font-mono text-lg">{booking.date}</p>
             </div>
             <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Guests</p>
                <p className="font-mono text-lg">{booking.guests} Adults</p>
             </div>
             <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Total</p>
                <p className="font-mono text-lg text-green-400">₹{booking.totalPrice?.toLocaleString()}</p>
             </div>
          </div>

          <div className="flex items-center gap-4 mt-8">
             <button className="px-5 py-2.5 bg-white text-black rounded-xl text-xs font-bold uppercase hover:bg-gray-200 transition-colors">
                View Itinerary
             </button>
             <button onClick={handleDownloadReceipt} className="px-5 py-2.5 bg-white/10 text-white rounded-xl text-xs font-bold uppercase hover:bg-white/20 transition-colors flex items-center gap-2">
                <Download size={14} /> Receipt
             </button>
          </div>

          <div className="absolute -bottom-3 md:bottom-auto md:top-1/2 md:-translate-y-1/2 -left-3 w-6 h-6 bg-[#050505] rounded-full z-20" />
          <div className="absolute -bottom-3 md:bottom-auto md:top-1/2 md:-translate-y-1/2 -right-3 w-6 h-6 bg-[#050505] rounded-full z-20" />

       </div>

       <div className="relative z-10 w-full md:w-80 p-8 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md border-l border-white/5">
          <div className="p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all duration-500">
             <QRCodeSVG value={`GAYA-BOOKING:${booking.id}`} size={140} />
          </div>
          
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-6 mb-2">Scan for Access</p>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <p className="font-mono text-xs text-white/30 mt-2">{booking.id}</p>
       </div>
    </div>
  );
}

export default UserDashboard;

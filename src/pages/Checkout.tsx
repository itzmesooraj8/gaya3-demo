
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  MapPin, Calendar, Users, ShieldCheck, Lock, CreditCard, 
  Smartphone, CheckCircle, Zap, AlertCircle, ChevronRight, Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';

// --- ZOD SCHEMAS ---
const cardSchema = z.object({
  cardNumber: z.string().regex(/^\d{4} \d{4} \d{4} \d{4}$/, "Must be 16 digits (0000 0000 0000 0000)"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid date (MM/YY)"),
  cvc: z.string().regex(/^\d{3}$/, "Must be 3 digits"),
  name: z.string().min(2, "Full name is required")
});

const upiSchema = z.object({
  vpa: z.string().email("Invalid VPA format (e.g. user@upi)")
});

type CardFormValues = z.infer<typeof cardSchema>;
type UpiFormValues = z.infer<typeof upiSchema>;

const Checkout: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Logic State
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [upiMode, setUpiMode] = useState<'scan' | 'vpa'>('scan');
  const [zenProtection, setZenProtection] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  
  // Interaction State
  const [progress, setProgress] = useState(0);
  const [isVerifyingVpa, setIsVerifyingVpa] = useState(false);
  const [vpaVerified, setVpaVerified] = useState(false);
  
  // Modal States
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const intervalRef = useRef<any>(null);

  // Forms
  const { register: regCard, formState: { errors: cardErrors, isValid: isCardValid } } = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    mode: 'onChange'
  });

  const { register: regUpi, formState: { errors: upiErrors, isValid: isUpiValid }, trigger: triggerUpi } = useForm<UpiFormValues>({
    resolver: zodResolver(upiSchema),
    mode: 'onChange'
  });

  useEffect(() => {
    if (!state || !user) {
      navigate('/');
    }
  }, [state, user, navigate]);

  if (!state) return null;
  const { property, totalPrice: baseTotalPrice, date, guests } = state;

  // --- CALCULATIONS ---
  const TAX_RATE = 0.12;
  const SERVICE_FEE = 2500;
  const PROTECTION_FEE = 1500;

  const calculateFinalTotal = () => {
    let total = baseTotalPrice;
    total += baseTotalPrice * TAX_RATE;
    total += SERVICE_FEE;
    if (zenProtection) total += PROTECTION_FEE;
    return Math.floor(total);
  };

  const finalAmount = calculateFinalTotal();

  // --- HANDLERS ---
  const handleVerifyVpa = async () => {
    const valid = await triggerUpi('vpa');
    if (!valid) return;

    setIsVerifyingVpa(true);
    // Simulate API Check
    setTimeout(() => {
      setIsVerifyingVpa(false);
      setVpaVerified(true);
    }, 1500);
  };

  const startHold = () => {
    if (progress >= 100) return;
    
    // Validation Blocks
    if (paymentMethod === 'card' && !isCardValid) return;
    if (paymentMethod === 'upi' && upiMode === 'vpa' && !vpaVerified) return;

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          handleCheckoutSubmit();
          return 100;
        }
        return prev + 2;
      });
    }, 20);
  };

  const stopHold = () => {
    clearInterval(intervalRef.current);
    if (progress < 100) {
      setProgress(0);
    }
  };

  const handleCheckoutSubmit = async () => {
    try {
      // Simulate sporadic failure for demonstration if needed, 
      // but relying on api catch block primarily.
      const result = await api.bookings.create({
        propertyId: property.id,
        date: date,
        guests: guests,
        totalPrice: finalAmount,
        status: 'UPCOMING'
      });

      if (result.success) {
        setConfirmedBookingId(result.id);
        setShowConfirmation(true);
      } else {
        throw new Error("Payment authorization failed.");
      }
    } catch (e) {
      console.error("Booking failed", e);
      setErrorMessage("The neural link encountered a disturbance. Payment gateway rejected the transaction. Please verify your credentials.");
      setShowError(true);
      setProgress(0);
    }
  };

  const handleDownloadReceipt = () => {
    if (!confirmedBookingId) return;
    const receiptContent = `
GAYA3 RECEIPT
------------------
ID: ${confirmedBookingId}
Amount: ₹${finalAmount.toLocaleString()}
Property: ${property.title}
Date: ${date}

Payment Method: ${paymentMethod === 'card' ? 'Credit Card' : 'UPI'}
Status: Verified
    `;
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt-${confirmedBookingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 relative">
      
      {/* --- CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              
              <h2 className="font-display text-2xl font-bold mb-2">TRANSACTION VERIFIED</h2>
              <p className="text-white/50 text-sm mb-4">Booking ID: <span className="font-mono text-white">{confirmedBookingId}</span></p>

              <p className="text-green-400/90 text-sm mb-8 px-4 font-light">
                Your sanctuary is secured! An email with your digital key has been sent.
              </p>

              <div className="bg-white p-4 rounded-xl w-fit mx-auto mb-8">
                <QRCodeSVG value={`GAYA-BOOKING:${confirmedBookingId}`} size={160} />
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDownloadReceipt}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold uppercase text-xs hover:bg-white/10 transition-colors"
                >
                  Download Receipt
                </button>
                <button 
                  onClick={() => navigate('/booking-success')}
                  className="w-full py-4 bg-white text-black rounded-xl font-bold uppercase text-xs hover:bg-gray-200 transition-colors"
                >
                  Proceed to Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- ERROR MODAL --- */}
      <AnimatePresence>
        {showError && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowError(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-red-500/30 rounded-3xl p-8 shadow-2xl text-center z-10"
            >
              <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              
              <h2 className="font-display text-2xl font-bold mb-2 text-white">TRANSACTION FAILED</h2>
              <p className="text-white/60 text-sm mb-8 leading-relaxed">
                {errorMessage || "Payment declined. Please check your details."}
              </p>

              <button 
                onClick={() => setShowError(false)}
                className="w-full py-4 bg-white/10 border border-white/10 hover:bg-white/20 text-white rounded-xl font-bold uppercase text-xs transition-colors"
              >
                Dismiss & Retry
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEFT: TRIP SUMMARY & UPSELLS */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-1/2 space-y-6"
      >
        <h1 className="font-display text-4xl">SECURE YOUR SANCTUARY</h1>
        
        {/* Property Card */}
        <div className="relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden p-6 md:p-8 backdrop-blur-xl">
           <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
           <div className="relative z-10">
              <div className="flex gap-6 mb-6">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                   <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="font-display text-xl md:text-2xl font-bold leading-tight mb-1">{property.title}</h2>
                  <p className="text-white/60 flex items-center gap-2 text-sm"><MapPin size={14}/> {property.location}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1 flex items-center gap-1"><Calendar size={10}/> Dates</p>
                    <p className="font-mono text-sm">{date}</p>
                 </div>
                 <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1 flex items-center gap-1"><Users size={10}/> Guests</p>
                    <p className="font-mono text-sm">{guests} Adults</p>
                 </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t border-white/5 pt-6 text-sm">
                 <div className="flex justify-between text-white/60">
                    <span>Base Fare & Add-ons</span>
                    <span>₹{baseTotalPrice.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-white/60">
                    <span>Taxes & Fees (12%)</span>
                    <span>₹{(baseTotalPrice * TAX_RATE).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-white/60">
                    <span>Concierge Fee</span>
                    <span>₹{SERVICE_FEE.toLocaleString()}</span>
                 </div>
                 {zenProtection && (
                    <div className="flex justify-between text-green-400">
                      <span className="flex items-center gap-1"><ShieldCheck size={12}/> Zen Protection</span>
                      <span>₹{PROTECTION_FEE.toLocaleString()}</span>
                    </div>
                 )}
              </div>

              <div className="border-t border-dashed border-white/20 pt-4 mt-4 flex justify-between items-end">
                 <span className="text-white/50 text-sm">Total Due</span>
                 <span className="font-display text-3xl font-bold">₹{finalAmount.toLocaleString()}</span>
              </div>
           </div>
        </div>

        {/* Zen Protection Toggle */}
        <div 
          onClick={() => setZenProtection(!zenProtection)}
          className={`relative p-6 rounded-3xl border transition-all cursor-pointer overflow-hidden group ${zenProtection ? 'bg-green-500/10 border-green-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
        >
           <div className="flex items-start gap-4 relative z-10">
              <div className={`p-3 rounded-full ${zenProtection ? 'bg-green-500 text-black' : 'bg-white/10 text-white/50'}`}>
                 <Shield size={24} />
              </div>
              <div className="flex-1">
                 <div className="flex justify-between items-center mb-1">
                    <h3 className={`font-display text-sm font-bold ${zenProtection ? 'text-green-400' : 'text-white'}`}>ADD ZEN PROTECTION</h3>
                    <span className="font-mono text-sm">₹1,500</span>
                 </div>
                 <p className="text-xs text-white/60 leading-relaxed">
                    Flexible cancellation up to 24h before arrival, medical coverage, and lost baggage insurance.
                 </p>
              </div>
              <div className={`w-6 h-6 rounded-full border border-white/20 flex items-center justify-center ${zenProtection ? 'bg-green-500 border-green-500' : ''}`}>
                 {zenProtection && <CheckCircle size={14} className="text-black" />}
              </div>
           </div>
        </div>
      </motion.div>

      {/* RIGHT: PAYMENT TERMINAL */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full lg:w-1/2 flex flex-col justify-center"
      >
        <div className="bg-[#050505] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
           <div className="flex items-center justify-between mb-8 text-white/30 text-[10px] uppercase tracking-widest border-b border-white/5 pb-4">
              <span className="flex items-center gap-2"><Lock size={12} /> 256-Bit SSL Encrypted</span>
              <span className="flex items-center gap-2"><Zap size={12} /> Instant Confirmation</span>
           </div>

           {/* Payment Method Selector */}
           <div className="grid grid-cols-2 gap-3 mb-8">
              <button 
                 onClick={() => setPaymentMethod('card')}
                 className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'card' ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'}`}
              >
                 <CreditCard size={20} />
                 <span className="text-xs font-bold uppercase tracking-wider">Card</span>
              </button>
              <button 
                 onClick={() => setPaymentMethod('upi')}
                 className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'upi' ? 'bg-blue-500 text-white border-blue-400' : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'}`}
              >
                 <Smartphone size={20} />
                 <span className="text-xs font-bold uppercase tracking-wider">UPI / VPA</span>
              </button>
           </div>

           <div className="min-h-[280px]">
             <AnimatePresence mode="wait">
               {paymentMethod === 'card' ? (
                 <motion.div key="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-widest text-white/40">Name on Card</label>
                       <input 
                         {...regCard('name')}
                         className={`w-full bg-white/5 border rounded-xl p-4 font-mono text-white outline-none transition-colors ${cardErrors.name ? 'border-red-500/50' : 'border-white/10 focus:border-white/40'}`} 
                       />
                       {cardErrors.name && (
                         <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1">
                           <AlertCircle size={10} /> {cardErrors.name.message}
                         </p>
                       )}
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-widest text-white/40">Card Number</label>
                       <div className="relative">
                          <input 
                             type="text" placeholder="0000 0000 0000 0000" 
                             {...regCard('cardNumber')}
                             className={`w-full bg-white/5 border rounded-xl p-4 font-mono text-white outline-none transition-colors ${cardErrors.cardNumber ? 'border-red-500/50' : 'border-white/10 focus:border-white/40'}`}
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 opacity-50">
                             <div className="w-8 h-5 bg-white/20 rounded-sm" />
                          </div>
                       </div>
                       {cardErrors.cardNumber && (
                         <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1">
                           <AlertCircle size={10} /> {cardErrors.cardNumber.message}
                         </p>
                       )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-white/40">Expiry (MM/YY)</label>
                          <input 
                            {...regCard('expiry')}
                            placeholder="MM/YY" 
                            className={`w-full bg-white/5 border rounded-xl p-4 font-mono text-white outline-none transition-colors ${cardErrors.expiry ? 'border-red-500/50' : 'border-white/10 focus:border-white/40'}`}
                          />
                          {cardErrors.expiry && (
                            <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1">
                              <AlertCircle size={10} /> {cardErrors.expiry.message}
                            </p>
                          )}
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-white/40">CVC</label>
                          <input 
                            {...regCard('cvc')}
                            placeholder="123" 
                            className={`w-full bg-white/5 border rounded-xl p-4 font-mono text-white outline-none transition-colors ${cardErrors.cvc ? 'border-red-500/50' : 'border-white/10 focus:border-white/40'}`}
                          />
                          {cardErrors.cvc && (
                            <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1">
                              <AlertCircle size={10} /> {cardErrors.cvc.message}
                            </p>
                          )}
                       </div>
                    </div>
                 </motion.div>
               ) : (
                 <motion.div key="upi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    <div className="flex gap-4 border-b border-white/10 pb-4 relative">
                      <button onClick={() => setUpiMode('scan')} className={`text-xs uppercase tracking-widest pb-1 transition-all ${upiMode === 'scan' ? 'text-white' : 'text-white/30'}`}>Scan QR</button>
                      <button onClick={() => setUpiMode('vpa')} className={`text-xs uppercase tracking-widest pb-1 transition-all ${upiMode === 'vpa' ? 'text-white' : 'text-white/30'}`}>Enter VPA</button>
                      
                      {/* Sliding indicator */}
                      <motion.div 
                        animate={{ x: upiMode === 'scan' ? 0 : 85, width: upiMode === 'scan' ? 60 : 70 }}
                        className="absolute bottom-0 left-0 h-0.5 bg-blue-500"
                      />
                    </div>

                    {upiMode === 'scan' ? (
                       <div className="flex flex-col items-center justify-center py-4 space-y-4">
                          <div className="relative p-4 bg-white rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.2)] overflow-hidden">
                             <QRCodeSVG value={`upi://pay?pa=gaya3@luxury&pn=Gaya3&am=${finalAmount}&cu=INR`} size={140} />
                             
                             {/* Scanning Laser Animation */}
                             <motion.div 
                                className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_10px_#3b82f6]"
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                             />
                          </div>
                          <p className="text-xs text-white/40 text-center max-w-[200px]">Scan with Google Pay, PhonePe, or Paytm</p>
                       </div>
                    ) : (
                       <div className="space-y-4 pt-4">
                          <div className="relative">
                             <input 
                               type="text" 
                               placeholder="username@upi" 
                               disabled={vpaVerified}
                               {...regUpi('vpa')}
                               className={`w-full bg-white/5 border rounded-xl p-4 font-mono text-white outline-none transition-all ${
                                  vpaVerified ? 'border-green-500/50 text-green-400' : 
                                  upiErrors.vpa ? 'border-red-500/50' : 'border-white/10 focus:border-blue-500'
                               }`} 
                             />
                             {vpaVerified && <CheckCircle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />}
                          </div>
                          {upiErrors.vpa && (
                            <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1">
                              <AlertCircle size={10} /> {upiErrors.vpa.message}
                            </p>
                          )}
                          {!vpaVerified ? (
                             <button 
                               onClick={handleVerifyVpa}
                               disabled={isVerifyingVpa}
                               className="w-full py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2"
                             >
                                {isVerifyingVpa ? 'Verifying Node...' : 'Verify VPA'}
                             </button>
                          ) : (
                             <div className="text-center text-xs text-green-400 font-mono flex items-center justify-center gap-2">
                               <CheckCircle size={12}/> Verified: {user.name} (HDFC)
                             </div>
                          )}
                       </div>
                    )}
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
           
           <div className="my-6">
              <div className="relative">
                <input 
                   type="text" 
                   value={promoCode}
                   onChange={(e) => setPromoCode(e.target.value)}
                   placeholder="DECRYPT ACCESS KEY (PROMO)" 
                   className="w-full bg-black border border-white/10 rounded-lg py-2 px-3 text-[10px] font-mono text-white/70 tracking-widest focus:border-white/30 outline-none"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                   <ChevronRight size={14} />
                </button>
              </div>
           </div>

           <div className="mt-2">
              <div 
                 className={`relative w-full h-16 rounded-xl border overflow-hidden select-none group transition-all ${
                    (paymentMethod === 'card' && !isCardValid) || (paymentMethod === 'upi' && upiMode === 'vpa' && !vpaVerified) 
                    ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed' 
                    : 'bg-white/5 border-white/10 cursor-pointer hover:border-white/30'
                 }`}
                 onMouseDown={startHold}
                 onMouseUp={stopHold}
                 onMouseLeave={stopHold}
                 onTouchStart={startHold}
                 onTouchEnd={stopHold}
              >
                 <motion.div 
                    className="absolute inset-0 bg-white"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear", duration: 0 }}
                 />
                 <div className="absolute inset-0 flex items-center justify-center gap-3 mix-blend-difference text-white">
                    {progress >= 100 ? (
                       <span className="font-display font-bold tracking-widest flex items-center gap-2">
                          PROCESSING <motion.span animate={{ opacity: [0,1,0] }} transition={{ repeat: Infinity }}>...</motion.span>
                       </span>
                    ) : (
                       <>
                          <div className={`p-2 rounded-full border-2 border-white transition-all duration-300 ${progress > 0 ? 'scale-110' : ''}`}>
                             <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                          <span className="font-display font-bold tracking-widest text-sm">HOLD TO CONFIRM</span>
                       </>
                    )}
                 </div>
              </div>
              <p className="text-center text-[10px] text-white/30 mt-3 uppercase tracking-wider flex items-center justify-center gap-2">
                 {(paymentMethod === 'card' && !isCardValid) ? (
                   <span className="text-red-400">Complete Payment Details</span>
                 ) : (paymentMethod === 'upi' && upiMode === 'vpa' && !vpaVerified) ? (
                    <span className="text-red-400 flex items-center gap-1"><AlertCircle size={10} /> Verify VPA to Proceed</span>
                 ) : (
                    <span>{progress > 0 ? 'Initiating Neural Link...' : 'Press and hold to authorize'}</span>
                 )}
              </p>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Checkout;

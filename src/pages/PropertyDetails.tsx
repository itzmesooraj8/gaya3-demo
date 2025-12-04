
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, ShieldCheck, Check, Info, MapPin, User, MessageCircle, Image as ImageIcon, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import MagneticButton from '../components/ui/MagneticButton';
import { MOCK_PROPERTIES, ADDONS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { calculateBookingTotal } from '../utils/pricing';
// @ts-ignore
import * as L from 'leaflet';

const PropertyDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const property = MOCK_PROPERTIES.find(p => p.id === id) || MOCK_PROPERTIES[0];
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { scrollY } = useScroll();
  const imageScale = useTransform(scrollY, [0, 500], [1, 0.8]);
  const imageOpacity = useTransform(scrollY, [0, 500], [1, 0.5]);
  const textY = useTransform(scrollY, [0, 400], [100, -50]);

  // Mock Reviews
  const REVIEWS = [
    { id: 1, user: "Alex Chen", date: "Oct 2023", rating: 5, text: "The most surreal experience of my life. The silence is deafening in the best way possible.", verified: true },
    { id: 2, user: "Sarah Jenkins", date: "Sep 2023", rating: 4.8, text: "Incredible architecture. The heated floors were a lifesaver.", verified: true },
  ];

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  const { total } = calculateBookingTotal(
    property.price, 
    selectedAddons, 
    ADDONS, 
    false
  );

  const handleReserve = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const bookingData = {
      property,
      addons: selectedAddons,
      totalPrice: total,
      date: '2024-06-15', // Mock date for MVP
      guests: 2 // Mock guest count
    };

    navigate('/checkout', { state: bookingData });
  };

  const showNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null && property.gallery) {
      setLightboxIndex((prev) => (prev! + 1) % property.gallery!.length);
    }
  }, [lightboxIndex, property.gallery]);

  const showPrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null && property.gallery) {
      setLightboxIndex((prev) => (prev! - 1 + property.gallery!.length) % property.gallery!.length);
    }
  }, [lightboxIndex, property.gallery]);

  // Keyboard Navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'Escape') setLightboxIndex(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, showNext, showPrev]);

  return (
    <div className="min-h-screen pb-20 bg-[#050505]">
      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && property.gallery && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-50">
              <X size={32} />
            </button>
            
            {/* Navigation Buttons */}
            <button 
              onClick={showPrev}
              className="absolute left-4 md:left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button 
              onClick={showNext}
              className="absolute right-4 md:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
            >
              <ChevronRight size={24} />
            </button>

            <motion.div 
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-7xl max-h-[85vh] w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={property.gallery[lightboxIndex]} 
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
                alt={`Gallery image ${lightboxIndex + 1}`}
              />
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/60 font-mono text-sm">
                {lightboxIndex + 1} / {property.gallery.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => navigate(-1)}
        className="fixed top-8 left-8 z-40 p-3 bg-black/20 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/20 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Scrollytelling Hero */}
      <div className="h-[80vh] w-full relative overflow-hidden flex items-center justify-center">
        <motion.div 
          style={{ scale: imageScale, opacity: imageOpacity }}
          className="absolute inset-0 z-0"
        >
           <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-black/40" />
        </motion.div>
        
        <motion.div 
          style={{ y: textY }}
          className="relative z-10 text-center px-4"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-8xl font-bold tracking-tighter mb-4 text-white"
          >
            {property.title}
          </motion.h1>
          <div className="flex justify-center gap-4 text-white/80">
            <span className="px-3 py-1 border border-white/30 rounded-full text-sm backdrop-blur-sm">{property.location}</span>
            <span className="px-3 py-1 border border-white/30 rounded-full text-sm backdrop-blur-sm flex items-center gap-1"><Star size={12} fill="currentColor" /> {property.rating}</span>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 -mt-20 relative z-20">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Description */}
          <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
            <h2 className="font-display text-2xl mb-6">THE EXPERIENCE</h2>
            <p className="text-lg text-white/70 leading-relaxed font-light mb-8">
              {property.description}
            </p>
            
            <h3 className="font-bold text-sm text-white/50 uppercase tracking-widest mb-4">Features</h3>
            <div className="flex flex-wrap gap-3">
              {property.features.map(feat => (
                <div key={feat} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/5">
                  <ShieldCheck size={16} className="text-green-400" />
                  <span className="text-sm">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CINEMATIC GALLERY GRID */}
          {property.gallery && property.gallery.length > 0 && (
            <div className="space-y-4">
               <h3 className="font-display text-xl flex items-center gap-2">
                 <ImageIcon size={20} /> VISUAL JOURNAL
               </h3>
               
               {/* Bento Grid (First 3) */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-96">
                  {/* First item is large */}
                  <div 
                    onClick={() => setLightboxIndex(0)}
                    className="col-span-1 md:col-span-2 md:row-span-2 relative rounded-2xl overflow-hidden cursor-pointer group border border-white/10"
                  >
                     <img src={property.gallery[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gallery 1" />
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </div>
                  {/* Items 2 and 3 */}
                  <div className="hidden md:flex flex-col gap-4 h-full">
                     {property.gallery.slice(1, 3).map((img, i) => (
                       <div 
                         key={i}
                         onClick={() => setLightboxIndex(i + 1)}
                         className="flex-1 relative rounded-2xl overflow-hidden cursor-pointer group border border-white/10"
                       >
                          <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={`Gallery ${i + 2}`} />
                       </div>
                     ))}
                  </div>
               </div>

               {/* Remaining Images Strip (Desktop) */}
               {property.gallery.length > 3 && (
                 <div className="hidden md:grid grid-cols-5 gap-4">
                    {property.gallery.slice(3).map((img, i) => (
                      <div 
                         key={i}
                         onClick={() => setLightboxIndex(i + 3)}
                         className="aspect-square rounded-xl overflow-hidden cursor-pointer group border border-white/10 opacity-70 hover:opacity-100 transition-opacity"
                      >
                         <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={`Gallery ${i + 4}`} />
                      </div>
                    ))}
                 </div>
               )}

               {/* Mobile Horizontal Scroll (All images except first which is hero above) */}
               <div className="flex gap-4 overflow-x-auto pb-4 md:hidden snap-x">
                 {property.gallery.slice(1).map((img, i) => (
                   <div 
                      key={i}
                      onClick={() => setLightboxIndex(i + 1)}
                      className="min-w-[200px] h-[150px] rounded-xl overflow-hidden border border-white/10 snap-center"
                   >
                     <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i + 2}`} />
                   </div>
                 ))}
               </div>
            </div>
          )}

          {/* 360 Viewer Placeholder */}
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 group">
             <div className="absolute inset-0 bg-white/5 flex items-center justify-center pointer-events-none z-10">
                <p className="text-white/50 group-hover:text-white transition-colors flex items-center gap-2">
                  <Maximize2 size={18} /> Interactive View Available
                </p>
             </div>
             {/* Simulate a panoramic strip */}
             <div className="absolute inset-0 bg-[url('https://picsum.photos/1200/400')] opacity-30 bg-cover bg-center" />
          </div>

          {/* Reviews Section */}
          <div className="space-y-6">
            <h3 className="font-display text-xl flex items-center gap-2">
              <MessageCircle size={20} /> GUEST IMPRESSIONS
            </h3>
            <div className="grid gap-4">
              {REVIEWS.map(review => (
                <div key={review.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{review.user}</p>
                        <p className="text-xs text-white/40">{review.date}</p>
                      </div>
                    </div>
                    {review.verified && (
                      <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-green-400 bg-green-500/10 px-2 py-1 rounded">
                        <Check size={10} /> Verified Stay
                      </span>
                    )}
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">"{review.text}"</p>
                  <div className="flex gap-1 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < Math.floor(review.rating) ? "white" : "none"} className="text-white" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location Map */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl">LOCATION</h3>
              {property.coordinates && <span className="text-xs text-white/40 font-mono uppercase">{property.coordinates.lat.toFixed(4)}, {property.coordinates.lng.toFixed(4)}</span>}
            </div>
            
            {property.coordinates ? (
              <div className="h-80 w-full rounded-3xl border border-white/10 overflow-hidden relative z-0">
                 <PropertyMap lat={property.coordinates.lat} lng={property.coordinates.lng} title={property.title} />
              </div>
            ) : (
              <div className="h-64 w-full bg-[#111] rounded-3xl border border-white/10 relative overflow-hidden flex items-center justify-center">
                {/* Abstract Map UI for Missing Coords */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#333_1px,transparent_1px)] bg-[size:20px_20px]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-4 h-4 bg-white rounded-full animate-ping absolute top-0 left-0" />
                    <div className="w-4 h-4 bg-white rounded-full relative z-10" />
                  </div>
                </div>
                <p className="relative z-10 mt-16 text-xs uppercase tracking-widest text-white/50">Coordinates Protected</p>
              </div>
            )}
          </div>

        </div>

        {/* Checkout Flow */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl shadow-2xl">
            <h3 className="font-display text-xl mb-6">CURATE YOUR STAY</h3>
            
            {/* Add-ons */}
            <div className="space-y-3 mb-8">
              {ADDONS.map(addon => (
                <div 
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedAddons.includes(addon.id) 
                      ? 'bg-white/10 border-white/40' 
                      : 'bg-transparent border-white/5 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{addon.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold">{addon.name}</p>
                      <p className="text-xs text-white/50">₹{addon.price}</p>
                    </div>
                  </div>
                  {selectedAddons.includes(addon.id) && <Check size={16} className="text-green-400" />}
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-6 mb-6 space-y-2">
              <div className="flex justify-between text-white/60">
                <span>Base Price</span>
                <span>₹{property.price.toLocaleString()}</span>
              </div>
              {selectedAddons.length > 0 && (
                 <div className="flex justify-between text-green-400 text-sm">
                   <span>Add-ons</span>
                   <span>+ ₹{(total - property.price).toLocaleString()}</span>
                 </div>
              )}
              <div className="flex justify-between text-2xl font-bold mt-4">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            <MagneticButton className="w-full">
              <button 
                onClick={handleReserve}
                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                RESERVE NOW
              </button>
            </MagneticButton>
            
            <button className="w-full py-3 mt-3 text-white/50 text-sm hover:text-white transition-colors flex items-center justify-center gap-2">
               Request Custom Quote <Info size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal Map Component to handle Leaflet lifecycle
const PropertyMap: React.FC<{ lat: number, lng: number, title: string }> = ({ lat, lng, title }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // cleanup previous map if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Init Map
    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 14,
      scrollWheelZoom: false,
      zoomControl: false
    });

    // Dark Matter Tiles (Gaya Style)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Custom Icon Construction
    const customIcon = L.divIcon({
      className: 'bg-transparent',
      html: `<div class="relative flex items-center justify-center w-6 h-6">
               <div class="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
               <div class="relative w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]"></div>
             </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    // Marker
    L.marker([lat, lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(title)
      .openPopup();

    // Zoom Control Bottom Right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, title]);

  return <div ref={mapContainerRef} className="w-full h-full bg-[#111]" />;
};

export default PropertyDetails;

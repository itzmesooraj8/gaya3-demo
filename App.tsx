
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FluidBackground from './src/components/canvas/FluidBackground';
import Navbar from './src/components/Navbar';
import Footer from './src/components/Footer';
import GayaChat from './src/components/GayaChat';
import Home from './src/pages/Home';
import PropertyDetails from './src/pages/PropertyDetails';
import Auth from './src/pages/Auth';
import Admin from './src/pages/Admin';
import HostDashboard from './src/pages/HostDashboard';
import UserDashboard from './src/pages/UserDashboard';
import BookingDetails from './src/pages/BookingDetails';
import Checkout from './src/pages/Checkout';
import BookingSuccess from './src/pages/BookingSuccess';
import Privacy from './src/pages/Privacy';
import Terms from './src/pages/Terms';
import NotFound from './src/pages/NotFound';
import { AuthProvider } from './src/contexts/AuthContext';
import { supabaseIsStub } from './src/services/supabaseClient';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="relative min-h-screen text-white overflow-hidden selection:bg-white/30">
            {/* Banner shown when Supabase envs are not configured and stub is active */}
            {supabaseIsStub && (
              <div className="supabase-stub-banner">Supabase not configured — running in demo read-only mode</div>
            )}

            <FluidBackground />
            
            <Navbar />
            
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/property/:id" element={<PropertyDetails />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/booking-success" element={<BookingSuccess />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/host" element={<HostDashboard />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/booking/:id" element={<BookingDetails />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

            <Footer />

            <GayaChat />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
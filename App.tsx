
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FluidBackground from './components/canvas/FluidBackground';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GayaChat from './components/GayaChat';
import Home from './pages/Home';
import PropertyDetails from './pages/PropertyDetails';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import HostDashboard from './pages/HostDashboard';
import UserDashboard from './pages/UserDashboard';
import BookingDetails from './pages/BookingDetails';
import Checkout from './pages/Checkout';
import BookingSuccess from './pages/BookingSuccess';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';

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
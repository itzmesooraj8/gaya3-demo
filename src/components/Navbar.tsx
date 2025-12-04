
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, User, LayoutDashboard, LogIn, LogOut } from 'lucide-react';
import MagneticButton from './ui/MagneticButton';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-white/60 hover:text-white';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-2 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
      <Link to="/">
        <MagneticButton className={`p-3 rounded-full transition-all ${isActive('/')}`}>
          <Home size={20} />
        </MagneticButton>
      </Link>
      
      {user && (
        <>
          <div className="w-[1px] h-6 bg-white/10 mx-1" />
          
          {user.role === 'user' && (
            <Link to="/dashboard">
              <MagneticButton className={`p-3 rounded-full transition-all ${isActive('/dashboard')}`}>
                <User size={20} />
              </MagneticButton>
            </Link>
          )}
          
          {user.role === 'admin' && (
            <Link to="/admin">
              <MagneticButton className={`p-3 rounded-full transition-all ${isActive('/admin')}`}>
                <LayoutDashboard size={20} />
              </MagneticButton>
            </Link>
          )}
        </>
      )}

      <div className="w-[1px] h-6 bg-white/10 mx-1" />

      {user ? (
        <MagneticButton onClick={handleLogout} className={`px-4 py-2 rounded-full bg-white/10 text-white font-semibold text-sm flex items-center gap-2 hover:bg-white/20 transition-colors`}>
          <span>Logout</span>
          <LogOut size={16} />
        </MagneticButton>
      ) : (
        <Link to="/auth">
          <MagneticButton className={`px-4 py-2 rounded-full bg-white text-black font-semibold text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors`}>
            <span>Join</span>
            <LogIn size={16} />
          </MagneticButton>
        </Link>
      )}
    </nav>
  );
};

export default Navbar;

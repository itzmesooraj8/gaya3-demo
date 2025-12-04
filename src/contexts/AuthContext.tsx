
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (role: 'user' | 'admin', customData?: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Check local storage on mount for persistence
  useEffect(() => {
    const stored = localStorage.getItem('gaya_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = (role: 'user' | 'admin', customData?: Partial<User>) => {
    // Default Mock Data
    const defaultUser: User = role === 'admin' 
      ? {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@gaya3.com',
          role: 'admin',
          avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Admin',
          memberStatus: 'Platinum'
        }
      : {
          id: 'user-1',
          name: 'Elena Fisher',
          email: 'elena@nomad.com',
          role: 'user',
          avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Elena',
          memberStatus: 'Gold'
        };
    
    // Merge custom data (e.g., from Google) with default structure
    const newUser: User = { ...defaultUser, ...customData };
    
    setUser(newUser);
    localStorage.setItem('gaya_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gaya_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

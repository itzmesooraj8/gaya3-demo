
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  login: (role: 'user' | 'admin', customData?: Partial<User>) => void;
  signInWithGoogle: () => Promise<void>;
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

  // Subscribe to Supabase auth changes and create profile on sign-in
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const u = session.user;
        // create or upsert profile in public.profiles
        try {
          await supabase.from('profiles').upsert({
            id: u.id,
            email: u.email,
            full_name: (u.user_metadata as any)?.name || (u.user_metadata as any)?.full_name || null,
            avatar_url: (u.user_metadata as any)?.picture || null,
            role: 'user',
            member_status: 'Silver',
            vibe_score: 5.0
          }, { onConflict: 'id' });
        } catch (err) {
          console.error('Failed to upsert profile', err);
        }

        const newUser: User = {
          id: u.id,
          name: (u.user_metadata as any)?.name || (u.user_metadata as any)?.full_name || 'Guest',
          email: u.email || '',
          role: 'user',
          avatar: (u.user_metadata as any)?.picture || '',
          memberStatus: 'Silver'
        };

        setUser(newUser);
        localStorage.setItem('gaya_user', JSON.stringify(newUser));
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('gaya_user');
      }
    });

    return () => listener.subscription.unsubscribe();
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

  const signInWithGoogle = async () => {
    // Opens Supabase OAuth flow (redirect)
    // Force the OAuth redirect to use the canonical production origin so providers
    // (Google) and Supabase see the same redirect URI. This prevents codes being
    // issued for preview domains which later fail during exchange.
    const redirectTo = `${CANONICAL_HOST}/auth/callback`;
    await supabase.auth.signInWithOAuth({ provider: 'google' }, { redirectTo });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gaya_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signInWithGoogle, logout }}>
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

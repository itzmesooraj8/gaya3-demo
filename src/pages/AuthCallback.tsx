import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

// Ensure your tsconfig.json has "jsx": "react-jsx" or "react" under "compilerOptions"
// If using React 17+, you do not need to import React for JSX, but some setups still require it.

const AuthCallback: React.FC = () => {
  const [message, setMessage] = useState<string>('Processing sign-in...');
  const navigate = useNavigate();

  useEffect(() => {
    // If Supabase handles the OAuth exchange automatically, the auth listener will fire
    // and the app will redirect. Here we just show status and handle error query params.
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error') || params.get('error_description');
    if (error) {
      setMessage(`Sign-in failed: ${error}`);
      return;
    }

    // If no error, wait a short time for the auth state listener to update.
    const t = setTimeout(() => {
      // If user is present in Supabase client session, redirect to dashboard
      supabase.auth.getUser().then(res => {
        if (res?.data?.user) {
          navigate('/dashboard');
        } else {
          setMessage('Sign-in completed. Redirecting...');
          // fallback to home
          navigate('/');
        }
      }).catch(() => {
        setMessage('Sign-in completed (no session found). Redirecting to home...');
        navigate('/');
      });
    }, 800);

    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="max-w-xl p-8 bg-white/5 rounded-xl border border-white/10 text-center">
        <h2 className="text-xl font-bold mb-4">Authentication</h2>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default AuthCallback;

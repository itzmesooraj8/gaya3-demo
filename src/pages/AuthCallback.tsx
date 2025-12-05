import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

// Ensure your tsconfig.json has "jsx": "react-jsx" or "react" under "compilerOptions"
// If using React 17+, you do not need to import React for JSX, but some setups still require it.

const AuthCallback: React.FC = () => {
  const [message, setMessage] = useState<string>('Processing sign-in...');
  const [debug, setDebug] = useState<boolean>(false);
  const [queryDump, setQueryDump] = useState<Record<string, string | null>>({});
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If Supabase handles the OAuth exchange automatically, the auth listener will fire
    // and the app will redirect. Here we just show status and handle error query params.
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error') || params.get('error_description');
    // prepare a masked dump for debugging
    const dump: Record<string, string | null> = {};
    params.forEach((v, k) => {
      if (!v) {
        dump[k] = null;
        return;
      }
      // mask commonly sensitive fields partially
      if (k.toLowerCase().includes('token') || k.toLowerCase().includes('code') || k.toLowerCase().includes('access')) {
        dump[k] = v.length > 12 ? `${v.slice(0, 6)}...${v.slice(-6)}` : '***';
      } else {
        dump[k] = v;
      }
    });
    setQueryDump(dump);
    if (error) {
      setMessage(`Sign-in failed: ${error}`);
      return;
    }

    // If no error, wait a short time for the auth state listener to update.
    const t = setTimeout(() => {
      // If user is present in Supabase client session, redirect to dashboard
      supabase.auth.getUser().then(res => {
        setSessionInfo(res?.data ?? null);
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

        <div className="mt-6 text-left text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={debug} onChange={() => setDebug(d => !d)} />
            <span>Show debug info (masked)</span>
          </label>
        </div>

        {debug && (
          <div className="mt-4 text-xs text-left bg-black/30 p-3 rounded">
            <div className="mb-2 font-medium">Query parameters (masked):</div>
            <pre className="whitespace-pre-wrap">{JSON.stringify(queryDump, null, 2)}</pre>

            <div className="mt-3 font-medium">Supabase getUser() result (partial):</div>
            <pre className="whitespace-pre-wrap">{JSON.stringify(sessionInfo ? sessionInfo : 'no session', null, 2)}</pre>

            <div className="mt-3">
              <button
                className="px-3 py-1 bg-white/10 rounded text-xs"
                onClick={() => navigator.clipboard?.writeText(JSON.stringify({ query: queryDump, session: sessionInfo }))}
              >
                Copy debug JSON
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;

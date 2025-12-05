import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Optional lightweight observability: use `@sentry/browser` when `VITE_SENTRY_DSN` is set.
// Loaded dynamically so the package is optional.
let Sentry: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Sentry = require('@sentry/browser');
  const dsn = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SENTRY_DSN : process.env.SENTRY_DSN;
  if (Sentry && dsn) {
    Sentry.init({ dsn: String(dsn), release: process.env.npm_package_version || undefined });
  }
} catch (e) {
  // If @sentry/browser is not installed, ignore — observability is optional.
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Canonical host redirect: if the app is accessed via a preview or alternate domain,
// redirect users to the canonical production hostname so OAuth redirect URIs and
// origins align (preserves path and query). Skip on localhost and in non-browser environments.
try {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const canonical = 'gaya3-henna.vercel.app';
    const host = window.location.hostname;
    if (host !== canonical && host !== 'localhost' && !host.includes('127.0.0.1')) {
      const proto = window.location.protocol || 'https:';
      const newUrl = `${proto}//${canonical}${window.location.pathname}${window.location.search}${window.location.hash}`;
      // Replace current history entry to avoid back-button loops
      window.location.replace(newUrl);
    }
  }
} catch (e) {
  // ignore in non-browser environments
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
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

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // We map the variable user provided (GEMINI_API_KEY) to the one the app expects (API_KEY)
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.GEMINI_API_KEY),
    },
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('three') || id.includes('@react-three')) return 'three-vendor';
              if (id.includes('framer-motion')) return 'framer-motion';
              if (id.includes('recharts')) return 'recharts';
              if (id.includes('@tanstack')) return 'react-query';
            }
          }
        }
      }
    },
    server: {
      port: 5173,
      host: true
    }
  };
});
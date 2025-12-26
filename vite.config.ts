import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    // 🔒 SECURITY FIX: Removed "define" block that injected process.env.API_KEY
    define: {
      // This block has been removed for security reasons
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
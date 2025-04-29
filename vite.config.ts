import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables based on mode (development, production)
  // Using 'REACT_APP_' prefix for compatibility with existing code
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');

  return {
    plugins: [react()],
    server: {
      port: 3000, // Run dev server on port 3000
      open: true, // Automatically open browser
    },
    build: {
      outDir: 'public', // Output build to 'public' directory for Firebase Hosting
      emptyOutDir: true, // Clear the output directory before building
    },
    // Define environment variables to be exposed to the client-side code
    // Vite uses import.meta.env, so we need to map REACT_APP_ vars
    define: {
      // We need to JSON.stringify the values
      'process.env.REACT_APP_FIREBASE_API_KEY': JSON.stringify(env.REACT_APP_FIREBASE_API_KEY),
      'process.env.REACT_APP_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.REACT_APP_FIREBASE_AUTH_DOMAIN),
      'process.env.REACT_APP_FIREBASE_PROJECT_ID': JSON.stringify(env.REACT_APP_FIREBASE_PROJECT_ID),
      'process.env.REACT_APP_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.REACT_APP_FIREBASE_STORAGE_BUCKET),
      'process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID),
      'process.env.REACT_APP_FIREBASE_APP_ID': JSON.stringify(env.REACT_APP_FIREBASE_APP_ID),
      'process.env.REACT_APP_FIREBASE_MEASUREMENT_ID': JSON.stringify(env.REACT_APP_FIREBASE_MEASUREMENT_ID),
      'process.env.REACT_APP_USE_FIREBASE_EMULATORS': JSON.stringify(env.REACT_APP_USE_FIREBASE_EMULATORS),
      'process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY': JSON.stringify(env.REACT_APP_STRIPE_PUBLISHABLE_KEY),
      // Vite also exposes VITE_ variables by default, but we define process.env for CRA compatibility
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
  };
});


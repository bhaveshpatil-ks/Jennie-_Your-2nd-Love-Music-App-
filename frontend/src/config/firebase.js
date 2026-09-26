import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const defaultApiKey = 'AIzaSyDMxiEN8S5bTcfDZ81OZNNxOQXklBPn05k';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultApiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'jeenie-2026.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'jeenie-2026',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'jeenie-2026.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '212082605572',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:212082605572:web:88ff68331f1f7422f4ff51',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-PXQEJ72PXG',
};

let app = null;
let auth = null;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
} catch (err) {
  console.warn('[Firebase] Initialization error (auth might be unavailable):', err);
}

export { auth };
export default app;

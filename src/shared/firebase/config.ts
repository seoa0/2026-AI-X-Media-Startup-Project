import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyBB_oMuCog2uX0UoiGejl9i37qDQJcq05Q',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'ai-x-media-team6.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'ai-x-media-team6',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'ai-x-media-team6.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '343156876847',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:343156876847:web:18b3f3aacf8de709c4c8da',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

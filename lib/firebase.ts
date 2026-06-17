import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

let app;
let db: ReturnType<typeof getFirestore>;

try {
  const firebaseConfig = require('../firebase-applet-config.json');
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
} catch (error) {
  console.warn('Firebase config not found or invalid. Firebase will not be initialized.');
  app = null as any;
  db = null as any;
}

export { app, db };

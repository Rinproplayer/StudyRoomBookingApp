import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyBWPB4obOmDHIBhwgSQenqdfQibZ5YLFI0",
  authDomain: "studyroombookingapp-5dbc7.firebaseapp.com",
  projectId: "studyroombookingapp-5dbc7",
  storageBucket: "studyroombookingapp-5dbc7.firebasestorage.app",
  messagingSenderId: "501686531347",
  appId: "1:501686531347:web:88a47dcc9593f9c7b896e6"
};

// Khởi tạo app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Khởi tạo Auth
export const auth = getAuth(app);

// Khởi tạo Cloud Firestore Database
export const db = getFirestore(app);

export default app;

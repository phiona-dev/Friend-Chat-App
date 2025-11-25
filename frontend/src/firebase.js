// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCj2gWyPf68spusfshk47rjY6k86ZLIPw0",
  authDomain: "usiu-connect-539f5.firebaseapp.com",
  projectId: "usiu-connect-539f5",
  storageBucket: "usiu-connect-539f5.firebasestorage.app",
  messagingSenderId: "612927917472",
  appId: "1:612927917472:web:0068c332c5e01527bf68c5",
  measurementId: "G-XRQ629E741"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
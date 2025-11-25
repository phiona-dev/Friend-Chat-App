// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBG7gmBNT409PinvKQ2TrNMdp4UxmaksCs",
  authDomain: "friend-chat-app-77edb.firebaseapp.com",
  databaseURL: "https://friend-chat-app-77edb-default-rtdb.firebaseio.com",
  projectId: "friend-chat-app-77edb",
  storageBucket: "friend-chat-app-77edb.firebasestorage.app",
  messagingSenderId: "600149677370",
  appId: "1:600149677370:web:6b7d93949a9cdc98b42c03",
  measurementId: "G-Q4YFWNPCLL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { firebaseConfig };
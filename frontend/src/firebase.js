// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-45JB2ZZqrZBJoEmQLS7MLn046D7oX5o",
  authDomain: "friend-chat-app-fb2d3.firebaseapp.com",
  projectId: "friend-chat-app-fb2d3",
  storageBucket: "friend-chat-app-fb2d3.firebasestorage.app",
  messagingSenderId: "153139453442",
  appId: "1:153139453442:web:57db82446443573725511b",
  measurementId: "G-0WYJRQ0LGZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);
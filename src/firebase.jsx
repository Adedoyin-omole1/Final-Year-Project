// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAEd8nOM-Gn75zVIqNOWa3ckZrGxA6xLzs",
  authDomain: "login-e14d6.firebaseapp.com",
  projectId: "login-e14d6",
  storageBucket: "login-e14d6.firebasestorage.app",
  messagingSenderId: "940563073228",
  appId: "1:940563073228:web:aed5eee47adf7df8bdda69"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get auth instance
const auth = getAuth(app);

// Set persistence to maintain auth state across tabs
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Authentication state persistence enabled");
  })
  .catch((error) => {
    console.error("Error enabling persistence:", error);
  });

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
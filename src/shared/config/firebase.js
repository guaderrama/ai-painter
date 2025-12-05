/**
 * Firebase Configuration
 * Centralizes Firebase initialization and exports services
 */

const firebaseConfig = {
    apiKey: "AIzaSyDZCMT5thdYHncvaOE5xkElcklOR170_BA",
    authDomain: "ai-painter-app.firebaseapp.com",
    projectId: "ai-painter-app",
    storageBucket: "ai-painter-app-uploads-2025",
    messagingSenderId: "255643153942",
    appId: "1:255643153942:web:3cfbb628ad25e1d799a737",
    measurementId: "G-CF49C1YKNX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export Firebase services
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
export const googleProvider = new firebase.auth.GoogleAuthProvider();

export { firebaseConfig };

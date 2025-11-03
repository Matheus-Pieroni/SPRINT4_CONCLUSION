// scripts/firebaseconf.js
// Firebase configuration - using compat version (compatible with the scripts you included)
const firebaseConfig = {
    apiKey: "AIzaSyCh_AwSMS30E23wpUl9drP9HzpoTvghNq8",
    authDomain: "fast4u---app.firebaseapp.com",
    projectId: "fast4u---app",
    storageBucket: "fast4u---app.firebasestorage.app",
    messagingSenderId: "149287078485",
    appId: "1:149287078485:web:036fd6d1f8aabae169e2dc",
    measurementId: "G-G6G3JWPMFG"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
console.log("Firebase initialized successfully!");
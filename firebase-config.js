
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAyue6f2DxitwROj17_1proL5tbpHZCS6w",
  authDomain: "calendar-and-to-do-list-3c259.firebaseapp.com",
  projectId: "calendar-and-to-do-list-3c259",
  storageBucket: "calendar-and-to-do-list-3c259.firebasestorage.app",
  messagingSenderId: "646469824544",
  appId: "1:646469824544:web:05cb2e0fe46827bad8cc45"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

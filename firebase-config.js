// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAyue6f2DxitwROj17_1proL5tbpHZCS6w",
  authDomain: "calendar-and-to-do-list-3c259.firebaseapp.com",
  projectId: "calendar-and-to-do-list-3c259",
  storageBucket: "calendar-and-to-do-list-3c259.firebasestorage.app",
  messagingSenderId: "646469824544",
  appId: "1:646469824544:web:05cb2e0fe46827bad8cc45"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
import{auth} from `./firebase-config.js`;

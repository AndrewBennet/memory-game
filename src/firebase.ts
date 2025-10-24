import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// Firebase configuration
// Replace these with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyDJUlS_JiaN47i0cFpHrnVPf0IgChXRPK0",
  authDomain: "promptmatch-ec9a1.firebaseapp.com",
  databaseURL: "https://promptmatch-ec9a1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "promptmatch-ec9a1",
  storageBucket: "promptmatch-ec9a1.firebasestorage.app",
  messagingSenderId: "785123111073",
  appId: "1:785123111073:web:1b3b806d5576b3ec8ac0e0",
  measurementId: "G-LW97M6W154"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)

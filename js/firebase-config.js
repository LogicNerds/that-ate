import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCOp-EQx0tRjuapMLuFcq9uoVL_HsbgSCs",
  authDomain: "that-ate.firebaseapp.com",
  projectId: "that-ate",
  storageBucket: "that-ate.firebasestorage.app",
  messagingSenderId: "717484773256",
  appId: "1:717484773256:web:292b3d1560cbd3ad5ef43d",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

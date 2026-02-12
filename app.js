import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyArm-Nrr571Sd7i9_uYcYEXd4YZ-4DTgig",
  authDomain: "romanzza-b1e66.firebaseapp.com",
  projectId: "romanzza-b1e66",
  storageBucket: "romanzza-b1e66.firebasestorage.app",
  messagingSenderId: "699222370360",
  appId: "1:699222370360:web:a0e3dd49adca842f539ecd"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

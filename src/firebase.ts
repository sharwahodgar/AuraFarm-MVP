import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDm5y6Hrhm3BWYjNHnQQ7KPG51eAOIYZhk",
  authDomain: "aurafarm-2674.firebaseapp.com",
  projectId: "aurafarm-2674",
  storageBucket: "aurafarm-2674.firebasestorage.app",
  messagingSenderId: "117566488946",
  appId: "1:117566488946:web:c1fdb8c492619422899deb",
};

const app = initializeApp(firebaseConfig);

// 🔑 Auth for Login/Register
export const auth = getAuth(app);

// 🗄️ Firestore for Posts & Listings
export const db = getFirestore(app);

// 📦 Storage for Photos & Videos
export const storage = getStorage(app);

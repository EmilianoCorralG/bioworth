import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDJNry_H8hFenzJqF3SVRviwMasnOSYmCM",
  authDomain: "bioworth-252c5.firebaseapp.com",
  projectId: "bioworth-252c5",
  storageBucket: "bioworth-252c5.appspot.com",
  messagingSenderId: "889519759918",
  appId: "1:889519759918:web:1ba6991f454778db77b5bf",
  measurementId: "G-MLR65XG63R"
};

const app = initializeApp(firebaseConfig);

console.log("🔥 Firebase inicializado:", app.name);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
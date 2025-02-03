// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2NtZ3lJoG9d0O0D9xqBE7wAaWvE_dLW8",
  authDomain: "thestudyspot-3de7d.firebaseapp.com",
  projectId: "thestudyspot-3de7d",
  storageBucket: "thestudyspot-3de7d.firebasestorage.app",
  messagingSenderId: "815750926757",
  appId: "1:815750926757:web:5896e32ced59ed3463984c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

console.log("🔥 Firebase initialized in React:", app);

export default app;

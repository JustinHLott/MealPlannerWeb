// Import Firebase from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence, signInWithEmailAndPassword  } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// to deploy this website to firebase ensure all updates are reflected in the "build" folder then in the Terminal (powerbash) type "firebase deploy --only hosting"

// Your Firebase config (from Firebase Console)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
    apiKey: "AIzaSyCGPk_F8na-N39UxeZLtFUFLXwiqlq30So",
    authDomain: "justinhlottcapstone.firebaseapp.com",
    databaseURL: "https://justinhlottcapstone-default-rtdb.firebaseio.com",
    projectId: "justinhlottcapstone",
    storageBucket: "justinhlottcapstone.firebasestorage.app",
    messagingSenderId: "424168235133",
    appId: "1:424168235133:web:0aed02e23884fc7ef8d114",
    measurementId: "G-H14R0PRW39"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// Export initialized services
export const auth = getAuth(app);
//export const db = getDatabase(app);
//const analytics = getAnalytics(app);

// Keep users logged in even after closing browser
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // This ensures persistence across browser restarts
    const savedEmail = localStorage.getItem("email");
    let savedPassword;
    if(savedEmail){
      savedPassword = localStorage.getItem(savedEmail.toLowerCase()+"_"+"password"); // ⚠️ only if you’re okay with this
    }
    
    
    if (savedEmail && savedPassword) {
      signInWithEmailAndPassword(auth, savedEmail, savedPassword);
    }
  })
  .catch((error) => {
    console.error("Persistence error:", error);
  });


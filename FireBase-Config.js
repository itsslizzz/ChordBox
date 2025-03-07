import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


  
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBf6pH4qUfoQNmHN4mFDYywE4_ORRo7z4w",
  authDomain: "chordbox-360a3.firebaseapp.com",
  databaseURL: "https://chordbox-360a3-default-rtdb.firebaseio.com",
  projectId: "chordbox-360a3",
  storageBucket: "chordbox-360a3.firebasestorage.app",
  messagingSenderId: "25066021446",
  appId: "1:25066021446:web:579891ee2c9f159589a047"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
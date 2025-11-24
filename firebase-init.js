// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAs_LBouq2njfy0cJHJjuiUfASC3RqVKkM",
  authDomain: "practicas-comunitario.firebaseapp.com",
  projectId: "practicas-comunitario",
  storageBucket: "practicas-comunitario.firebasestorage.app",
  messagingSenderId: "874017448238",
  appId: "1:874017448238:web:03928054e98441838d1abf",
  measurementId: "G-XF0GC0DZY4"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


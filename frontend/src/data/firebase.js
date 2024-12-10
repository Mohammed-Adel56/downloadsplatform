// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCK82GNopPkVk8HW184wRjcp4QK0JgyEsI",
  authDomain: "downloader-874df.firebaseapp.com",
  projectId: "downloader-874df",
  storageBucket: "downloader-874df.firebasestorage.app",
  messagingSenderId: "714082612352",
  appId: "1:714082612352:web:7b36fa4569d40108eda265",
  measurementId: "G-CKHMDEDC3J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
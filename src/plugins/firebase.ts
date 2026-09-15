// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBy2rbqdUFyBKtndxPlfb-twbsa3LaqzDo",
  authDomain: "zenslam-bd781.firebaseapp.com",
  projectId: "zenslam-bd781",
  storageBucket: "zenslam-bd781.firebasestorage.app",
  messagingSenderId: "653935955079",
  appId: "1:653935955079:web:72be271b28592694d2fc22",
  measurementId: "G-LLCEVK8M8K",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
export const auth = getAuth(app);

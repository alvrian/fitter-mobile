// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth, getReactNativePersistence  } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
//name: fitter-mobile
const firebaseConfig = {
  apiKey: "AIzaSyDfFY1dP2yWVy2AapRPlRyF1s8ZLf8ymYE",
  authDomain: "fitter-mobile.firebaseapp.com",
  projectId: "fitter-mobile",
  storageBucket: "fitter-mobile.firebasestorage.app",
  messagingSenderId: "28356813933",
  appId: "1:28356813933:web:42724af678445cd469cb64",
  measurementId: "G-ZTHHS89QXD"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage), // Use local persistence for auth
})
const analytics = getAnalytics(app);
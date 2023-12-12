// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBB4BwnEs8iFCNMBpS49h846ofPBmJi5G8",
  authDomain: "lively-5824e.firebaseapp.com",
  projectId: "lively-5824e",
  storageBucket: "lively-5824e.appspot.com",
  messagingSenderId: "673209507632",
  appId: "1:673209507632:web:c92a39a69f1df730a632f5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// export const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(ReactNativeAsyncStorage),
// });

// export const storage = getStorage(app);

export const db = getFirestore(app);

export default app;

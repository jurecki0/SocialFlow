import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/analytics";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBSjbHXx0SCNO0URc45CoVw5KbWojLmGNI",
  authDomain: "socialflow-64d23.firebaseapp.com",
  projectId: "socialflow-64d23",
  storageBucket: "socialflow-64d23.firebasestorage.app",
  messagingSenderId: "722709406659",
  appId: "1:722709406659:web:bb38815b749fa5f6e81376",
  measurementId: "G-YW3LKP38QG",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
}

export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const firestore = firebase.firestore();

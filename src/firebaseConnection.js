import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyBYRRwESeaXs2WMbjca_LvfCQY8LcwaTDo",
    authDomain: "curso-reactjs-32916.firebaseapp.com",
    projectId: "curso-reactjs-32916",
    storageBucket: "curso-reactjs-32916.appspot.com",
    messagingSenderId: "1033186548980",
    appId: "1:1033186548980:web:0091164a68f386e29412a1",
    measurementId: "G-3HFB04P252"
  };

  const firebaseApp =  initializeApp(firebaseConfig);

  const db = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  export { db, auth };
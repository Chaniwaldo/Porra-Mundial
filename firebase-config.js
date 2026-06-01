// firebase-config.js

const firebaseConfig = {
  apiKey:            "AIzaSyAwh1b5JD1Avyj1OAH0xtT1bvYfQDv8G_Y",
  authDomain:        "porra-mundial-2026-2aad4.firebaseapp.com",
  projectId:         "porra-mundial-2026-2aad4",
  storageBucket:     "porra-mundial-2026-2aad4.firebasestorage.app",
  messagingSenderId: "711705352616",
  appId:             "1:711705352616:web:39c75c9dc09c3b7401e59d"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

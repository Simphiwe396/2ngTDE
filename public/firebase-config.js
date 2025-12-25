// YOUR FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyD_YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  
  // Initialize services
  if (typeof firebase.firestore !== 'undefined') {
    firebase.firestore();
  }
  if (typeof firebase.auth !== 'undefined') {
    firebase.auth();
  }
  if (typeof firebase.functions !== 'undefined') {
    firebase.functions();
  }
  if (typeof firebase.storage !== 'undefined') {
    firebase.storage();
  }
}

// Export for use in other files
window.firebaseApp = firebase.app();
window.db = firebase.firestore ? firebase.firestore() : null;
window.auth = firebase.auth ? firebase.auth() : null;
window.functions = firebase.functions ? firebase.functions() : null;
window.storage = firebase.storage ? firebase.storage() : null;
const admin = require('firebase-admin');
const path = require('path');

let firebaseApp;

const initializeFirebaseAdmin = () => {
  try {
    // Check if Firebase Admin is already initialized
    if (!firebaseApp) {
      let serviceAccount;
      
      // Try method 1: Load from file
      try {
        const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');
        serviceAccount = require(serviceAccountPath);
        console.log('✅ Firebase loaded from file');
      } catch (fileError) {
        console.log('⚠️  File not found, trying environment variables...');
        
        // Method 2: Individual environment variables (BEST for Render)
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
          serviceAccount = {
            type: "service_account",
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL
          };
          console.log('✅ Firebase loaded from individual env vars');
        }
        // Method 3: JSON string environment variable
        else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
          try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            console.log('✅ Firebase loaded from JSON env var');
          } catch (jsonError) {
            console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON');
          }
        }
      }

      if (!serviceAccount || !serviceAccount.project_id) {
        throw new Error('No valid Firebase credentials found!');
      }

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });

      console.log('✅ Firebase Admin initialized successfully');
    }
    return firebaseApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    throw error;
  }
};

const getFirestore = () => {
  if (!firebaseApp) {
    initializeFirebaseAdmin();
  }
  return admin.firestore();
};

const getAuth = () => {
  if (!firebaseApp) {
    initializeFirebaseAdmin();
  }
  return admin.auth();
};

const getStorage = () => {
  if (!firebaseApp) {
    initializeFirebaseAdmin();
  }
  return admin.storage();
};

module.exports = {
  initializeFirebaseAdmin,
  getFirestore,
  getAuth,
  getStorage,
  admin
};

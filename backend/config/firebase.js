const admin = require('firebase-admin');
const path = require('path');

let firebaseApp;

const initializeFirebaseAdmin = () => {
  try {
    // Check if Firebase Admin is already initialized
    if (!firebaseApp) {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
                                 path.join(__dirname, '..', 'firebase-service-account.json');
      
      // Try to load service account
      let serviceAccount;
      try {
        serviceAccount = require(serviceAccountPath);
      } catch (error) {
        console.warn('⚠️  Firebase service account file not found. Using environment variables.');
        // Fallback to environment variables if service account file not found
        serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        };
      }

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
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

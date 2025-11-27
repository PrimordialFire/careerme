const { getAuth, getFirestore } = require('../config/firebase');

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, name, role, ...additionalData } = req.body;

    // Create user in Firebase Auth
    const userRecord = await getAuth().createUser({
      email,
      password,
      displayName: name,
      emailVerified: false
    });

    // Store additional user data in Firestore
    const db = getFirestore();
    await db.collection('users').doc(userRecord.uid).set({
      email,
      name,
      role,
      ...additionalData,
      createdAt: new Date().toISOString(),
      emailVerified: false,
      status: role === 'company' ? 'pending' : 'active' // Companies need admin approval
    });

    res.status(201).json({
      message: 'User registered successfully',
      userId: userRecord.uid,
      email: userRecord.email
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      error: 'Registration failed', 
      message: error.message 
    });
  }
};

// Login user (verify credentials)
exports.login = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Get user by email
    const userRecord = await getAuth().getUserByEmail(email);
    
    // Get user data from Firestore
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User data not found' });
    }

    const userData = userDoc.data();

    // Check if company account is approved
    if (userData.role === 'company' && userData.status === 'pending') {
      return res.status(403).json({ 
        error: 'Account pending approval', 
        message: 'Your company account is awaiting admin approval' 
      });
    }

    if (userData.status === 'suspended') {
      return res.status(403).json({ 
        error: 'Account suspended', 
        message: 'Your account has been suspended. Contact admin.' 
      });
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userData.name,
        role: userData.role,
        emailVerified: userRecord.emailVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ 
      error: 'Login failed', 
      message: 'Invalid credentials' 
    });
  }
};

// Send email verification
exports.sendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await getAuth().getUserByEmail(email);
    const link = await getAuth().generateEmailVerificationLink(email);

    // In production, send this link via email service
    res.status(200).json({
      message: 'Verification email sent',
      verificationLink: link // Remove in production
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({ 
      error: 'Failed to send verification email', 
      message: error.message 
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      uid: decodedToken.uid,
      ...userDoc.data()
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

const { getAuth } = require('../config/firebase');

// Verify Firebase ID token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Check if user has specific role
const checkRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized', message: 'No user found' });
      }

      const { getFirestore } = require('../config/firebase');
      const db = getFirestore();
      
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();
      
      if (!allowedRoles.includes(userData.role)) {
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: 'Insufficient permissions' 
        });
      }

      req.userData = userData;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Combine verification and role check
const authenticate = (req, res, next) => {
  return verifyToken(req, res, next);
};

module.exports = {
  verifyToken,
  checkRole,
  authenticate
};

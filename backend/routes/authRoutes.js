const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');
const authController = require('../controllers/authController');

// Register new user
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').notEmpty().trim(),
    body('role').isIn(['student', 'institute', 'company', 'admin']),
    validate
  ],
  authController.register
);

// Login user
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validate
  ],
  authController.login
);

// Verify email
router.post('/verify-email',
  [
    body('email').isEmail().normalizeEmail(),
    validate
  ],
  authController.sendVerificationEmail
);

// Get current user profile
router.get('/me', authController.getCurrentUser);

module.exports = router;

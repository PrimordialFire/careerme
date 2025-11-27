const express = require('express');
const router = express.Router();
const { authenticate, checkRole } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const userController = require('../controllers/userController');

// Get all users (Admin only)
router.get('/',
  authenticate,
  checkRole('admin'),
  userController.getAllUsers
);

// Get user by ID
router.get('/:id',
  authenticate,
  userController.getUserById
);

// Update user profile
router.put('/:id',
  authenticate,
  userController.updateUser
);

// Upload documents (Student only)
router.post('/documents',
  authenticate,
  checkRole('student'),
  userController.uploadDocument
);

// Get user documents
router.get('/:id/documents',
  authenticate,
  userController.getUserDocuments
);

module.exports = router;

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate, checkRole } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const adminController = require('../controllers/adminController');

// Admin routes - all require admin role

// Get dashboard statistics
router.get('/stats',
  authenticate,
  checkRole('admin'),
  adminController.getDashboardStats
);

// Manage companies
router.put('/companies/:id/status',
  authenticate,
  checkRole('admin'),
  [
    body('status').isIn(['active', 'suspended', 'pending']),
    validate
  ],
  adminController.updateCompanyStatus
);

// Get system reports
router.get('/reports',
  authenticate,
  checkRole('admin'),
  adminController.getSystemReports
);

// Publish admissions
router.post('/admissions/publish',
  authenticate,
  checkRole('admin'),
  [
    body('institutionId').notEmpty(),
    body('courses').isArray(),
    validate
  ],
  adminController.publishAdmissions
);

module.exports = router;

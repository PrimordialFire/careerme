const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate, checkRole } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const applicationController = require('../controllers/applicationController');

// Get all applications (filtered by role)
router.get('/',
  authenticate,
  applicationController.getApplications
);

// Get application by ID
router.get('/:id',
  authenticate,
  applicationController.getApplicationById
);

// Submit new application (Student only)
router.post('/',
  authenticate,
  checkRole('student'),
  [
    body('institutionId').notEmpty(),
    body('courseId').notEmpty(),
    body('course').notEmpty(),
    body('level').isIn(['Undergraduate', 'Masters', 'PhD']),
    body('previousEducation').notEmpty(),
    validate
  ],
  applicationController.submitApplication
);

// Update application status (Institute or Admin)
router.put('/:id/status',
  authenticate,
  checkRole('institute', 'admin'),
  [
    body('status').isIn(['pending', 'admitted', 'rejected', 'waiting', 'confirmed', 'declined']),
    validate
  ],
  applicationController.updateApplicationStatus
);

// Select institution (Student with multiple admissions)
router.post('/select-institution',
  authenticate,
  checkRole('student'),
  [
    body('selectedApplicationId').notEmpty(),
    validate
  ],
  applicationController.selectInstitution
);

module.exports = router;

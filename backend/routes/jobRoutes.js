const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate, checkRole } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const jobController = require('../controllers/jobController');

// Get all jobs (filtered for students by qualifications)
router.get('/',
  authenticate,
  jobController.getJobs
);

// Get job by ID
router.get('/:id',
  authenticate,
  jobController.getJobById
);

// Create new job (Company only)
router.post('/',
  authenticate,
  checkRole('company'),
  [
    body('title').notEmpty().trim(),
    body('description').notEmpty(),
    body('requirements').notEmpty(),
    body('location').notEmpty(),
    validate
  ],
  jobController.createJob
);

// Update job
router.put('/:id',
  authenticate,
  checkRole('company'),
  jobController.updateJob
);

// Delete job
router.delete('/:id',
  authenticate,
  checkRole('company'),
  jobController.deleteJob
);

// Get qualified candidates for a job (Company only)
router.get('/:id/candidates',
  authenticate,
  checkRole('company'),
  jobController.getQualifiedCandidates
);

// Apply for job (Student only)
router.post('/:id/apply',
  authenticate,
  checkRole('student'),
  jobController.applyForJob
);

module.exports = router;
